import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase environment variables');
        return res.status(500).json({ 
          error: 'Server configuration error',
          details: 'Missing Supabase credentials'
        });
      }

      // Try to fetch featured news, but if column doesn't exist, return all news
      let { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_featured', true)
        .order('featured_order', { ascending: true, nullsFirst: false });

      // If column doesn't exist (error code 42703), fetch all news instead
      if (error && error.code === '42703') {
        console.warn('is_featured column does not exist, returning all news');
        const result = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ 
          error: 'Database error',
          details: error.message,
          code: error.code
        });
      }

      res.json(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
