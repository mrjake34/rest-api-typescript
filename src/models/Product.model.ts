import mongoose, { Document, Schema } from 'mongoose';

export interface Product {
    name?: string;
    shopName?: string;
    price?: number;
}

export interface ProductModel extends Product, Document {}

const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        shopName: { type: String, required: true },
        price: { type: Number, required: true }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export const ProductModel = mongoose.model<ProductModel>('Product', ProductSchema);

export const getProductsByValues = (values: Partial<Product>) => ProductModel.find(values);

export const getProductsByShopName = (shopName: string) => ProductModel.find({ shopName: shopName });

export const getProductsByShopNameAndName = (name: string, shopName: string) => ProductModel.findOne({ name: name, shopName: shopName });

export const getProductById = (id: string, shopName: string) => ProductModel.findOne({ _id: id, shopName: shopName });

export const createProduct = (values: Partial<Product>) => new ProductModel(values).save().then((product) => product.toObject());

export const updateProductById = (id: string, values: Partial<Product>) => ProductModel.findByIdAndUpdate(id, values);

export const deleteProductById = (id: string) => ProductModel.findByIdAndDelete(id).exec();
