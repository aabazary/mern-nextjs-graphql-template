import { Request, Response } from "express";
import { Role } from "../models/Role";

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface MyContext {
  req: Request;
  res: Response;
  user?: AuthUser;
}

interface JWTSigningPayload {
  userId: string;
  role: string;
}

interface TokenPayload extends JWTSigningPayload {
  exp: number;
  iat: number;
}
