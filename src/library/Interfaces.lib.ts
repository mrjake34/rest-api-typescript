import { Request } from 'express';

export enum UserRole {
    user = 'user',
    courier = 'courier',
    admin = 'admin'
}

export interface DecodedUser {
    Id: string;
    email: string;
    shopName: string;
    role: string;
}

export interface userProps {
    propName: 'name' | 'email' | 'password' | 'phone' | 'shopName';
    value: string;
}

export type productProps = {
    propName: 'name' | 'price';
    value: string | number;
};

export type customerProps = {
    propName: 'name' | 'phone' | 'adress' | 'longitude' | 'latitude' | 'orders';
    value: string | number | Array<string>;
};

export type courierProps = {
    propName: 'name' | 'phone' | 'email' | 'password';
    value: string;
};

export type orderProps = {
    propName: 'customerId' | 'products' | 'orderStatus' | 'courierId';
    value: string | number | Array<any>;
};

export interface RequestWithInterfaces extends Request {
    user?: DecodedUser;
}
