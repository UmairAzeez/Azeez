const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        // Validate input
        if (!username || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Username and password are required' })
            };
        }

        // Check credentials
        if (username !== process.env.ADMIN_USERNAME) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (!isMatch) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        // Create JWT
        const token = jwt.sign(
            { admin: { username } },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ token })
        };

    } catch (err) {
        console.error('Error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error' })
        };
    }
};
