import User from '../../models/User';
import RefreshToken from '../../models/RefreshToken';
import PasswordResetToken from '../../models/PasswordResetToken';
import { hashPassword, comparePassword, issueTokensAndSetCookie, generatePasswordResetToken } from '../../utils/authFunctions';
import { GraphQLError } from 'graphql';
import { Role } from '../../models/Role';
import { MyContext } from '../../types';
import transporter from '../../config/nodemailer';

interface AuthPayload {
  token: string;
  user: {
    id: string;
    email: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
  };
}

interface UserWithId {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

const Mutation = {
  signup: async (
    parent: any,
    { email, password }: any,
    context: MyContext
  ): Promise<AuthPayload> => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new GraphQLError('Email already in use.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: Role.REGISTERED,
    });
    const userWithId: UserWithId = {
      id: (newUser._id as any).toString(),
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    };
    const accessToken = await issueTokensAndSetCookie(userWithId, context);
    return { token: accessToken, user: userWithId };
  },

  login: async (
    parent: any,
    { email, password }: any,
    context: MyContext
  ): Promise<AuthPayload> => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new GraphQLError('Invalid credentials.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new GraphQLError('Invalid credentials.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    const userWithId: UserWithId = {
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
    const accessToken = await issueTokensAndSetCookie(userWithId, context);
    return { token: accessToken, user: userWithId };
  },

  updateUser: async (
    parent: any,
    { id, email, role }: any,
    context: MyContext
  ): Promise<any> => {
    if (!context.user) {
      throw new GraphQLError('Unauthorized: You must be logged in to update a user.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    if (context.user.id !== id && context.user.role !== Role.SUPERADMIN) {
      throw new GraphQLError('Forbidden: You can only update your own profile.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    if (role && context.user.role !== Role.SUPERADMIN) {
      throw new GraphQLError('Forbidden: Only superadmins can change user roles.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    const dataToUpdate: { email?: string; role?: Role } = {};
    if (email !== undefined) dataToUpdate.email = email;
    if (role !== undefined) dataToUpdate.role = role;
    if (Object.keys(dataToUpdate).length === 0) {
      throw new GraphQLError('No data provided for update.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    return User.findByIdAndUpdate(id, dataToUpdate, { new: true });
  },

  deleteUser: async (
    parent: any,
    { id }: any,
    context: MyContext
  ): Promise<any> => {
    if (!context.user) {
      throw new GraphQLError('Unauthorized: You must be logged in to delete a user.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    if (context.user.id !== id && context.user.role !== Role.SUPERADMIN) {
      throw new GraphQLError('Forbidden: You can only delete your own profile.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    await RefreshToken.deleteMany({ user: id });
    return User.findByIdAndDelete(id);
  },

  requestPasswordReset: async (
    parent: any,
    { email }: { email: string },
    context: MyContext
  ): Promise<string> => {
    const user = await User.findOne({ email });
    if (!user) {
      return 'If your email exists, a password reset link has been sent.';
    }
    await PasswordResetToken.deleteMany({ user: user._id, used: false });
    const { plainTextToken, hashedToken } = generatePasswordResetToken();
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
    await PasswordResetToken.create({
      tokenHash: hashedToken,
      user: user._id,
      expiresAt,
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${plainTextToken}&email=${encodeURIComponent(email)}`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset for your account. Click the link below to reset your password:</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
        `,
      });
    } catch (error) {
      console.error(`Error sending password reset email to ${user.email}:`, error);
    }
    return 'If your email exists, a password reset link has been sent.';
  },
};

export default Mutation;