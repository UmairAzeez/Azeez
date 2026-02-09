const { supabase } = require('./utils/supabase');
const { verifyToken, extractToken } = require('./utils/auth');

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

        // Parse body
        const { session_id, content } = JSON.parse(event.body);

        // Validate input
        if (!session_id || !content) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Session ID and content are required' })
            };
        }

        if (content.length > 2000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message must be 2000 characters or less' })
            };
        }

        // Insert manager message
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([{
                session_id,
                name: 'Manager',
                content: content.trim(),
                sender_type: 'manager'
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to send message' })
            };
        }

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Message sent successfully',
                data: data[0]
            })
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
