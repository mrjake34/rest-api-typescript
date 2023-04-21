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

export const getCustomersByValues = (values: Record<string, string>): Promise<ICustomerModel[]> => CustomerModel.find(values).exec();

export const getCustomerByValues = (values: Record<string, string>): Promise<ICustomerModel | null> => CustomerModel.findOne(values).exec();

export const createCustomer = (values: Partial<Customer>): Promise<Customer> => new CustomerModel(values).save().then((customer: ICustomerModel) => customer.toObject() as Customer);

export const updateCustomer = (id: string, values: Partial<Customer>): Promise<ICustomerModel | null> => CustomerModel.findByIdAndUpdate(id, values, { new: true }).exec();

export const deleteCustomer = (id: string): Promise<ICustomerModel | null> => CustomerModel.findByIdAndDelete(id).exec();
