const { v4: uuidv4 } = require('uuid');

// In-memory storage (resets on cold start, see notes)
let keyStore = {};

exports.handler = async (event, context) => {
    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || context.clientContext?.identity?.ip || 'unknown';
    const { key } = JSON.parse(event.body || '{}');

    if (!key) {
        return {
            statusCode: 400,
            body: JSON.stringify({ valid: false, message: 'No key provided' })
        };
    }

    if (keyStore[key] && keyStore[key].ip === ip && keyStore[key].expires > Date.now()) {
        return {
            statusCode: 200,
            body: JSON.stringify({ valid: true })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ valid: false, message: 'Invalid or expired key' })
    };
};