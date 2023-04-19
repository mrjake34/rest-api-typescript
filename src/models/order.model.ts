/**
 * shopName: string;
 * customerId: string
 * products: products array
 * totalPrice: number
 * orderStatus: enum(0,1,2)(waiting, inDistribution, completed)
 * courierId?: courierId
 *
 */
import mongoose, { Document, Schema } from 'mongoose';

export enum OrderStatus {
    waiting = 'waiting',
    inProcess = 'inProcess',
    inDistribution = 'inDistribution',
    completed = 'completed'
}

export interface Order {
    shopName?: string;
    totalPrice?: number;

    customerId?: string;
    products?: Array<any>;
    orderStatus?: OrderStatus;
    courierId?: string;
    orderNote?: string;
}

export interface OrderModel extends Order, Document {}

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

export const createOrder = (values: Partial<Order>) => new OrderModel(values).save().then((order) => order.toObject());

export const updateOrder = (id: string, values: Partial<OrderModel>) => OrderModel.findByIdAndUpdate(id, values);

export const deleteOrder = (id: string) => OrderModel.findByIdAndDelete(id).exec();

export const getOrdersByValues = (values: Partial<Order>) => OrderModel.find(values);

export const getOrderDetailByValues = (id: string, shopName: string) => OrderModel.findOne({ _id: id, shopName: shopName });

export const getOrderDetailByValuesForCourier = (id: string, shopName: string, courierId: string) => OrderModel.findOne({ _id: id, shopName: shopName, courierId: courierId });
