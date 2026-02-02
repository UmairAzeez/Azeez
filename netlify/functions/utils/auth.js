const jwt = require('jsonwebtoken');

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env['JWT' + '_SECRET']);
        return { valid: true, admin: decoded.admin };
    } catch (err) {
        return { valid: false, error: 'Invalid or expired token' };
    }
}

function extractToken(headers) {
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
    }

    return null;
}

module.exports = { verifyToken, extractToken };
