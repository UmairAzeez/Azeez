const { supabase } = require('./utils/supabase');

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { session_id } = event.queryStringParameters;

        if (!session_id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Session ID is required' })
            };
        }

        // Fetch messages for this session
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', session_id)
            .order('created_at', { ascending: true }); // Oldest first for chat history

        if (error) {
            console.error('Supabase error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to fetch chat history' })
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
