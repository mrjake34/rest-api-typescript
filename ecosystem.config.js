module.exports = {
    apps: [
        {
            name: 'restApi',
            script: './build/server.js',
            watch: true
        },
        {
            name: 'locationTracking',
            script: './build/websockets/locationTracking.websocket.js',
            watch: true
        }
    ]
};
