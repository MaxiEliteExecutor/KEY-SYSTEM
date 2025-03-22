const { v4: uuidv4 } = require('uuid');

// In-memory storage (resets on function cold start, see notes below)
let keyStore = {};

exports.handler = async (event, context) => {
    const ip = event.headers['client-ip'] || context.clientContext?.identity?.ip || 'unknown';
    const existingKey = Object.values(keyStore).find(entry => entry.ip === ip && entry.expires > Date.now());

    if (existingKey) {
        return {
            statusCode: 200,
            body: JSON.stringify({ key: existingKey.key, message: 'Existing key found' })
        };
    }

    const key = uuidv4();
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    keyStore[key] = { ip, expires };

    // Cleanup expired keys (in-memory only)
    for (const k in keyStore) {
        if (keyStore[k].expires <= Date.now()) {
            delete keyStore[k];
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ key })
    };
};