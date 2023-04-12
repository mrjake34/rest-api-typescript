import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_LINK = process.env.MONGO_LINK || '';
const MONGO_DBNAME = process.env.MONGO_DBNAME ? String(process.env.MONGO_DBNAME) : 'test';
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_LINK}/${MONGO_DBNAME}?retryWrites=true&w=majority`;

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3002;

const JWT_SECRET = process.env.JWT_SECRET ? String(process.env.JWT_SECRET) : 'high-level-secret';

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    },
    secret: {
        jwtSecret: JWT_SECRET
    }
};
