import mongoose, { Document, Schema } from 'mongoose';
import { Customer } from '../library/Interfaces.lib';

export interface ICustomerModel extends Customer, Document {}

const CustomerSchema = new Schema<Customer>(
    {
        shopName: { type: String, required: true },
        name: { type: String, required: true, unique: true },
        phone: { type: String, required: true, unique: true },
        adress: { type: String, required: true, unique: true },
        longitude: { type: Number },
        latitude: { type: Number },
        orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export const CustomerModel = mongoose.model<ICustomerModel>('Customer', CustomerSchema);

export const getCustomersByValues = (values: Record<string, string>) => CustomerModel.find(values);

export const getCustomerByValues = (values: Record<string, string>) => CustomerModel.findOne(values);

export const createCustomer = (values: Partial<Customer>) => new CustomerModel(values).save().then((customer) => customer.toObject());

export const updateCustomer = (id: string, values: Partial<Customer>) => CustomerModel.findByIdAndUpdate(id, values);

export const deleteCustomer = (id: string) => CustomerModel.findByIdAndDelete(id).exec();
