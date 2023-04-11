/**
 * shopName: string;
 * name: string;
 * phone: number;
 * adress: string;
 *
 * longitude: number; //number contain also double variable
 * latitude: number; //number contain also double variable
 *
 * orders?
 */

import mongoose, { Document, Schema } from 'mongoose';

// Customer interface
export interface Customer {
    shopName?: string;
    name?: string;
    phone?: string;
    adress?: string;

    longitude?: number;
    latitude?: number;

    orders?: Array<string>;
}

export interface CustomerModel extends Customer, Document {}

// Courier MongoDB Schema
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

// Courier Model
export const CustomerModel = mongoose.model<Customer>('Customer', CustomerSchema);

export const getCustomersByValues = (values: Record<string, string>) => CustomerModel.find(values);

export const getCustomerByValues = (values: Record<string, string>) => CustomerModel.findOne(values);

export const createCustomer = (values: Partial<Customer>) => new CustomerModel(values).save().then((customer) => customer.toObject());

export const updateCustomer = (id: string, values: Partial<Customer>) => CustomerModel.findByIdAndUpdate(id, values);

export const deleteCustomer = (id: string) => CustomerModel.findByIdAndDelete(id).exec();
