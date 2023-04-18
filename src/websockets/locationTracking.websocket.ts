import WebSocket from 'ws';
import jwt from 'jsonwebtoken';

import { config } from '../config/config';

const serverOptions: WebSocket.ServerOptions = {
    port: config.websocket.port
};

const server = new WebSocket.Server(serverOptions);
console.log(`WebSocket Server is running at url:ws://host:${config.websocket.port}/`);
// defined an interface to define a type to be reused.
interface ConnectionInfo {
    shopName: string;
}
interface ShopConnections {
    sockets: Set<WebSocket>;
}

const connections = new Map<WebSocket, ConnectionInfo>();
const shops = new Map<string, ShopConnections>();

server.on('connection', (socket, request) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);

    const userId = url.searchParams.get('userId');
    const shopName = url.searchParams.get('shopName');

    const token = url.searchParams.get('token');

    if (userId && shopName && token) {
        isTokenValid(token).then((result) => {
            if (!result) {
                console.log(`Client disconnected! Token not valid`);
                socket.close();
            }
        });
        connections.set(socket, { shopName });
        console.log(`Client connected for shop:${shopName} with ID:${userId}`);

        let shop = shops.get(shopName);
        if (!shop) {
            shop = { sockets: new Set<WebSocket>() }; // created an object of type ShopConnections.
            shops.set(shopName, shop);
        }
        shop.sockets.add(socket);

        socket.on('message', (message) => {
            const sockets = shops.get(shopName)?.sockets; // added control with ? operator.
            if (sockets) {
                try {
                    const data = JSON.parse(message.toString()) as Data; // converted the JSON data to Data type.
                    if (isValidData(data)) {
                        sockets.forEach((client) => {
                            if (client !== socket) {
                                const jsonData = JSON.stringify(data); // converted the data back to JSON.
                                client.send(jsonData);
                            }
                        });
                    } else {
                        throw new Error('Data values or types wrong!');
                    }
                } catch (error: any) {
                    console.log(error.message);
                    socket.close();
                }
            }
        });

        socket.on('close', () => {
            const { shopName } = connections.get(socket) || {};
            console.log(`Client disconnected for shop:${shopName} with ID:${userId}`);
            connections.delete(socket);
            if (shopName) {
                const shop = shops.get(shopName);
                if (shop) {
                    shop.sockets.delete(socket);
                }
            }
            socket.terminate();
        });
    } else {
        console.log(`Client disconnected! Missing data`);
        socket.close();
    }
});

interface Location {
    type: string;
    coordinates: [number, number];
}

interface Data {
    userId: string;
    shopName: string;
    location: Location;
}

// function that checks the types of incoming data and whether they are defined
function isValidData(data: any): data is Data {
    const { userId, shopName, location } = data;
    if (!userId || !shopName || !location || typeof userId !== 'string' || typeof shopName !== 'string') {
        return false;
    }
    const { type, coordinates } = location;
    if (!type || !coordinates || typeof type !== 'string' || !Array.isArray(coordinates)) {
        return false;
    }
    const [long, lat] = coordinates;
    if (!long || !lat || typeof long !== 'number' || typeof lat !== 'number') {
        return false;
    }
    return true;
}

// function check the validity of the incoming token
async function isTokenValid(token: string): Promise<boolean> {
    try {
        const test = await jwt.verify(token, config.secret.jwtSecret);
        return true;
    } catch (error) {
        return false;
    }
}
