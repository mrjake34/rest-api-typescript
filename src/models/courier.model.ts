/**
 * shopName: string;
 * name: string;
 * phone: number;
 * email: string;
 * password: string;
 *
 * orders?
 */
import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../library/Interfaces.lib';

// Courier interface
export interface Courier {
    name: string;
    phone: string;
    email: string;
    password: string;
    shopName?: string;

    role?: UserRole;
    refreshToken?: string;
    ip?: string;

    orders?: Array<string>;
}

export interface CourierModel extends Courier, Document {}

// Courier MongoDB Schema
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

// Courier Model
export const CourierModel = mongoose.model<CourierModel>('Courier', CourierSchema);

export const createCourier = (values: Courier) => new CourierModel(values).save().then((courier) => courier.toObject());

export const updateCourierById = (id: string, values: Partial<Courier>) => CourierModel.findByIdAndUpdate(id, values);

export const deleteCourierById = (id: string) => CourierModel.findByIdAndDelete({ _id: id }).exec();

//get courier with password
export const getCourierById = (id: string) => CourierModel.findById(id);

//get courier without password
export const getCourierByIdWithoutPassword = (id: string) => CourierModel.findById(id).select('-password');

export const getCourierNameAndShopName = (name: string, shopName: string) => CourierModel.findOne({ name: name, shopName: shopName }).select('-password');

export const getCourierShopName = (shopName: string) => CourierModel.find({ shopName: shopName }).select('-password');

//get just shopName for checking existing courier
export const getCourierByPhone = (phone: string) => CourierModel.findOne({ phone: phone }).select('shopName');

//get courier for existing courier and login
export const getCourierByEmail = (email: string) => CourierModel.findOne({ email: email });

//get refresh token
export const getCourierRefreshTokenById = (id: string) => CourierModel.findById(id).select('_id refreshToken');
