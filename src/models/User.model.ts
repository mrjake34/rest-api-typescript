import mongoose, { Document, Model, Schema } from 'mongoose';

import { User } from '../library/Interfaces.lib';

import { UserRole } from '../library/enums.lib';

export interface IUserModel extends User, Document {}

const UserSchema: Schema<IUserModel> = new Schema<IUserModel>(
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

export const UserModel: Model<IUserModel> = mongoose.model<IUserModel>('User', UserSchema);

export const userGetOne = (values: Partial<User>): Promise<IUserModel | null> => UserModel.findOne(values).exec();

export const userGetById = (id: string): Promise<IUserModel | null> => UserModel.findById(id).exec();

export const userGetAll = (): Promise<IUserModel[]> => UserModel.find().exec();

export const userCreate = (values: Partial<User>): Promise<User> => new UserModel(values).save().then((user: IUserModel) => user.toObject() as User);

export const userUpdate = (id: string, values: Partial<User>): Promise<IUserModel | null> => UserModel.findByIdAndUpdate(id, values, { new: true }).exec();

export const userDelete = (id: string): Promise<IUserModel | null> => UserModel.findByIdAndDelete(id).exec();
