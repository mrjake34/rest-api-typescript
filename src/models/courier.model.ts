import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../library/enums.lib';

import { Courier } from '../library/Interfaces.lib';

export interface ICourierModel extends Courier, Document {}

const CourierSchema: Schema = new Schema(
    {
        shopName: { type: String, required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        role: { type: String, enum: Object.values(UserRole), default: UserRole.courier },
        refreshToken: { type: String },
        ip: { type: String },

        orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export const CourierModel = mongoose.model<ICourierModel>('Courier', CourierSchema);

export const courierGetOne = (values: Partial<Courier>): Promise<ICourierModel | null> => CourierModel.findOne(values).exec();

export const courierGetAll = (values: Partial<Courier>): Promise<ICourierModel[] | null> => CourierModel.find(values).exec();

export const courierGetById = (id: string): Promise<ICourierModel | null> => CourierModel.findById(id).exec();

export const courierCreate = (values: Partial<Courier>): Promise<Courier> => new CourierModel(values).save().then((courier: ICourierModel) => courier.toObject() as Courier);

export const courierUpdate = (id: string, values: Partial<Courier>): Promise<ICourierModel | null> => CourierModel.findByIdAndUpdate(id, values, { new: true }).exec();

export const courierDelete = (id: string): Promise<ICourierModel | null> => CourierModel.findByIdAndDelete(id).exec();
