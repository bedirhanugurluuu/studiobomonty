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

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
