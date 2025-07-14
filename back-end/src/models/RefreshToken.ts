import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface IRefreshToken extends Document {
  tokenHash: string;
  user: Types.ObjectId | IUser;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  tokenHash: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RefreshTokenSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
export default RefreshToken; 