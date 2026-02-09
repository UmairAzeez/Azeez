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

        const { valid, error: authError } = verifyToken(token);
        if (!valid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: authError || 'Invalid token' })
            };
        }

        // Get all unique sessions with their latest message
        const { data, error } = await supabase
            .from('chat_messages')
            .select('session_id, name, content, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to fetch sessions' })
            };
        }

        // Group by session_id and get the latest message for each
        const sessionsMap = new Map();
        data.forEach(msg => {
            if (!sessionsMap.has(msg.session_id)) {
                sessionsMap.set(msg.session_id, {
                    session_id: msg.session_id,
                    name: msg.name,
                    last_message: msg.content,
                    last_message_time: msg.created_at
                });
            }
        });

        const sessions = Array.from(sessionsMap.values());

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(sessions)
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
