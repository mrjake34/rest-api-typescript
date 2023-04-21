import mongoose, { Document, Schema } from 'mongoose';
import { Order } from '../library/Interfaces.lib';
import { OrderStatus } from '../library/enums.lib';
import { IUserModel } from './User.model';

export interface IOrderModel extends Order, Document {}

const OrderSchema: Schema = new Schema(
    {
        shopName: { type: String, required: true },
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },

        products: [
            {
                productId: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: String,
                    required: true
                },
                productNote: {
                    type: String
                }
            }
        ],
        orderNote: {
            type: String
        },
        totalPrice: { type: Number, required: true },
        orderStatus: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.waiting
        },
        courierId: { type: Schema.Types.ObjectId, ref: 'Courier' }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export const OrderModel = mongoose.model<Order>('Order', OrderSchema);

export const createOrder = (values: Partial<Order>): Promise<Order> => new OrderModel(values).save().then((order: IOrderModel) => order.toObject() as Order);

export const updateOrder = (id: string, values: Partial<Order>): Promise<IOrderModel | null> => OrderModel.findByIdAndUpdate(id, values, { new: true }).exec();

export const deleteOrder = (id: string): Promise<IOrderModel | null> => OrderModel.findByIdAndDelete(id).exec();

export const getOrdersByValues = (values: Partial<Order>): Promise<IOrderModel[]> => OrderModel.find(values).exec();

export const getOrderDetailByValues = (id: string, shopName: string): Promise<IUserModel | null> => OrderModel.findOne({ _id: id, shopName: shopName }).exec();

export const getOrderDetailByValuesForCourier = (id: string, shopName: string, courierId: string): Promise<IUserModel | null> =>
    OrderModel.findOne({ _id: id, shopName: shopName, courierId: courierId }).exec();
