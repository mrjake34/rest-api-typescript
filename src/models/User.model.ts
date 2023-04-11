import mongoose, { Document, Schema } from 'mongoose';

import { UserRole } from '../library/Interfaces.lib';

export interface User {
    name: string;
    email: string;
    password: string;
    phone: string;
    shopName: string;

    role?: UserRole;
    refreshToken?: string;
    ip?: string;

    paymentStatus?: boolean;
    paymentDate?: Date;
    endDate?: Date;
}

export interface UserModel extends User, Document {}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        shopName: { type: String, required: true, unique: true },

        role: { type: String, enum: Object.values(UserRole), default: UserRole.user },
        refreshToken: { type: String },
        ip: { type: String },

        paymentStatus: { type: Boolean, default: false },
        paymentDate: { type: Date },
        endDate: { type: Date }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export const UserModel = mongoose.model<UserModel>('User', UserSchema);

export const getUserById = (id: string) => UserModel.findById(id).select('-refreshToken');
export const getUserByIdWithoutPassword = (id: string) => UserModel.findById(id).select('-refreshToken -password');

export const getRefreshTokenById = (id: string) => UserModel.findById(id).select('-password');

export const getUserByShopName = (shopName: string) => UserModel.findOne({ shopName: shopName }).select('-password');

export const getUserByEmail = (email: string) => UserModel.findOne({ email: email });

export const getUserByPhone = (phone: string) => UserModel.findOne({ phone: phone });

export const createUser = (values: Record<string, unknown>) => new UserModel(values).save().then((user) => user.toObject());

export const deleteUserById = (id: string) => UserModel.findByIdAndDelete({ _id: id }).exec();

export const updateUserById = (id: string, values: Record<string, unknown>) => UserModel.findByIdAndUpdate(id, values);

export const getUserByRefreshToken = (refreshToken: string) => UserModel.findOne({ refreshToken: refreshToken });

export const getUserByIp = (ip: string) => UserModel.findOne({ ip: ip });
