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

      // Cache headers ekle
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error:', error);
        throw error;
      }
      res.json(data || null);
    } catch (error) {
      console.error('Error fetching about content:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .insert([req.body])
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, id: data.id });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { data, error } = await supabase
        .from('about_content')
        .update({
          ...req.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const { error } = await supabase
        .from('about_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}