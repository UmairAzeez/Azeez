const { supabase } = require('./utils/supabase');
const { verifyToken, extractToken } = require('./utils/auth');

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Verify JWT
        const token = extractToken(event.headers);
        if (!token) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'No token provided' })
            };
        }

        const { valid, error } = verifyToken(token);
        if (!valid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: error || 'Invalid token' })
            };
        }

        // Fetch all messages
        const { data, error: dbError } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (dbError) {
            console.error('Supabase error:', dbError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to fetch messages' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
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
