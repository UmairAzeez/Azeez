const { supabase } = require('./utils/supabase');
const { rateLimit } = require('./utils/rateLimit');

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
        // Rate limiting
        const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
        const rateLimitResult = rateLimit(ip);

        if (!rateLimitResult.allowed) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                    error: 'Too many messages sent. Please try again later.',
                    retryAfter: rateLimitResult.retryAfter
                })
            };
        }

        // Parse body
        const { session_id, name, content } = JSON.parse(event.body);

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

        // Insert into database
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                session_id,
                name: name ? name.trim() : 'Anonymous',
                content: content.trim(),
                sender_type: 'user',
                is_read: false
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to save message' })
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
