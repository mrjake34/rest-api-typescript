export type UserProps = {
    propName: 'name' | 'email' | 'password' | 'phone' | 'shopName';
    value: string;
};

export type ProductProps = {
    propName: 'name' | 'price';
    value: string | number;
};

export type CustomerProps = {
    propName: 'name' | 'phone' | 'adress' | 'longitude' | 'latitude' | 'orders';
    value: string | number | Array<string>;
};

export type CourierProps = {
    propName: 'name' | 'phone' | 'email' | 'password';
    value: string;
};

export type OrderProps = {
    propName: 'customerId' | 'products' | 'orderStatus' | 'courierId' | 'orderNote';
    value: string | number | Array<any>;
};
