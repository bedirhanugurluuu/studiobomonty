import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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

  try {
    if (req.method === 'GET') {
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase environment variables');
        return res.status(500).json({ 
          error: 'Server configuration error',
          details: 'Missing Supabase credentials'
        });
      }

      const { data, error } = await supabase
        .from('intro_banners')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error:', error);
        throw error;
      }
      res.json(data ?? null);
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const payload = { ...req.body };
      if (!payload.id) {
        payload.id = randomUUID();
      }
      payload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('intro_banners')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, data });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        res.status(400).json({ error: 'id parametresi gerekli' });
        return;
      }

      const { error } = await supabase
        .from('intro_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Intro banner API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}