import { Router, Request, Response, RequestHandler } from "express";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyPasswordResetToken,
  hashPassword,
} from "../utils/authFunctions";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import PasswordResetToken from "../models/PasswordResetToken";
import { TokenPayload, JWTSigningPayload } from "../types";

const authRouter = Router();

authRouter.post("/refresh-token", (async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken) {
    res.status(401).json({ message: "No refresh token provided." });
    return;
  }

  try {
    const payload = verifyRefreshToken(oldRefreshToken) as TokenPayload;
    const userId = payload.userId;

    const hashedOldRefreshToken = await hashToken(oldRefreshToken);

    const refreshTokenRecord = await RefreshToken.findOne({
      tokenHash: hashedOldRefreshToken,
    }).populate('user');

    // Check if the record exists and belongs to the correct user
    if (!refreshTokenRecord || refreshTokenRecord.user.toString() !== userId) {
      console.warn(
        "Refresh token not found or mismatch in DB. Potential reuse or invalid token."
      );
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });
      res.status(403).json({
        message: "Invalid or revoked refresh token. Please log in again.",
      });
      return;
    }

    // --- Refresh Token Rotation ---
    const newAccessToken = generateAccessToken({
      userId: userId,
      role: (refreshTokenRecord.user as any).role,
    } as JWTSigningPayload);
    const newRefreshToken = generateRefreshToken({
      userId: userId,
      role: (refreshTokenRecord.user as any).role,
    } as JWTSigningPayload);

    const hashedNewRefreshToken = await hashToken(newRefreshToken);
    const newRefreshTokenPayload = verifyRefreshToken(
      newRefreshToken
    ) as TokenPayload;
    const newExpiresAt = new Date(newRefreshTokenPayload.exp * 1000);

    await RefreshToken.findByIdAndUpdate(refreshTokenRecord._id, {
      tokenHash: hashedNewRefreshToken,
      expiresAt: newExpiresAt,
      userAgent:
        (req.headers["user-agent"] as string) ||
        refreshTokenRecord.userAgent ||
        "Unknown",
      ipAddress: req.ip || refreshTokenRecord.ipAddress || "Unknown",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      sameSite: "lax",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
      sameSite: "lax",
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error("Unknown error type:", error);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.status(403).json({
      message: "Invalid or expired refresh token. Please log in again.",
    });
  }
}) as RequestHandler);

authRouter.post("/logout", (async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken) as TokenPayload;
      const userId = payload.userId;

      const hashedIncomingToken = await hashToken(refreshToken);

      await RefreshToken.deleteMany({
        tokenHash: hashedIncomingToken,
        user: userId,
      });
      console.log(`User ${userId} specific refresh token revoked (via hash).`);
    } catch (error) {
      console.warn(
        "Logout: Invalid refresh token during revocation attempt or token already revoked."
      );
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully." });
}) as RequestHandler);

authRouter.post("/reset-password", (async (req: Request, res: Response) => {
  const { token, email, newPassword } = req.body;

  if (!token || !email || !newPassword) {
    res.status(400).json({ message: "Missing token, email, or new password." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Log for monitoring, but return generic error for security
      // Will potentially remove in production
      console.warn(`Password reset attempt for non-existent email: ${email}`);
      res
        .status(400)
        .json({ message: "Invalid or expired token. Please try again." });
      return;
    }

    const passwordResetRecord = await PasswordResetToken.findOne({
      user: user._id,
      expiresAt: {
        $gt: new Date(),
      },
      used: false,
    }).sort({ createdAt: -1 });

    if (
      !passwordResetRecord ||
      !verifyPasswordResetToken(token, passwordResetRecord.tokenHash)
    ) {
      console.warn(
        `Invalid or expired password reset token for user ${user._id}`
      );
      res
        .status(400)
        .json({ message: "Invalid or expired token. Please try again." });
      return;
    }

    // Mark the token as used immediately to prevent replay attacks
    await PasswordResetToken.findByIdAndUpdate(passwordResetRecord._id, {
      used: true,
    });

    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    // Delete all refresh tokens associated with the user
    await RefreshToken.deleteMany({
      user: user._id,
    });
    console.log(
      `All refresh tokens revoked for user ${user._id} after password reset.`
    );

    res.status(200).json({
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res
      .status(500)
      .json({ message: "An error occurred during password reset." });
  }
}) as RequestHandler);

export default authRouter;
