import mongoose, { Schema, Document, Types } from 'mongoose';
import { Role } from './Role';

export interface IUser extends Document {
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  refreshTokens: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), default: Role.REGISTERED },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  refreshTokens: [{ type: Schema.Types.ObjectId, ref: 'RefreshToken' }],
});

UserSchema.virtual('id').get(function(this: IUser) {
  return (this._id as Types.ObjectId).toHexString();
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User; 