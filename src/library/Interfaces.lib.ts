import { Request } from 'express';
import { UserRole } from './enums.lib';
import { OrderStatus } from '../library/enums.lib';

export interface User {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    shopName?: string;

    role?: UserRole;
    refreshToken?: string;
    ip?: string;

    paymentStatus?: boolean;
    paymentDate?: Date;
    endDate?: Date;
}

export interface DecodedUser {
    Id: string;
    email: string;
    shopName: string;
    role: string;
}

export interface RequestWithInterfaces extends Request {
    user?: DecodedUser;
}

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

export interface Customer {
    shopName?: string;
    name?: string;
    phone?: string;
    adress?: string;

    longitude?: number;
    latitude?: number;

    orders?: Array<string>;
}

export interface Product {
    name?: string;
    shopName?: string;
    price?: number;
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
