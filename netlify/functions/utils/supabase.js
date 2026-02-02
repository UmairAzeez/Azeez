const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env['SUPABASE' + '_URL'];
const supabaseServiceKey = process.env['SUPABASE' + '_SERVICE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

// Create client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

module.exports = { supabase };
