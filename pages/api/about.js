import { createClient } from '@supabase/supabase-js';

// Helper function to get Supabase client
function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
      },
    }
);
}

const REFINED_IMAGE_FIELDS = [
  'refined_value_image_1',
  'refined_value_image_2',
  'refined_value_image_3',
  'refined_value_image_4',
  'refined_value_image_5',
  'refined_value_image_6',
];

function getBucketAndPath(value) {
  if (!value || typeof value !== 'string') return null;
  const cleaned = value.trim();
  if (!cleaned) return null;

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    const marker = '/storage/v1/object/public/';
    const markerIndex = cleaned.indexOf(marker);
    if (markerIndex === -1) return null;
    const fullPath = cleaned.slice(markerIndex + marker.length);
    const [bucket, ...pathParts] = fullPath.split('/');
    const filePath = pathParts.join('/');
    if (!bucket || !filePath) return null;
    return { bucket, path: filePath };
  }

  const normalized = cleaned.replace(/^\/+/, '');
  const [bucket, ...pathParts] = normalized.split('/');
  const filePath = pathParts.join('/');
  if (!bucket || !filePath) return null;
  return { bucket, path: filePath };
}

async function deleteStorageIfNeeded(supabase, previousValue, nextValue) {
  const before = getBucketAndPath(previousValue);
  if (!before) return;

  const after = getBucketAndPath(nextValue);
  if (after && before.bucket === after.bucket && before.path === after.path) return;

  await supabase.storage.from(before.bucket).remove([before.path]);
}

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
          details: 'Missing Supabase credentials. Please check Vercel environment variables.'
        });
      }

      const supabase = getSupabaseClient();

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
      const errorMessage = error.message || 'Unknown error occurred';
      const errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined;
      
      res.status(500).json({ 
        error: 'Internal server error',
        details: errorMessage,
        ...(errorDetails && { stack: errorDetails })
      });
    }
  } else if (req.method === 'POST') {
    try {
      const supabase = getSupabaseClient();
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
      const supabase = getSupabaseClient();

      const { data: existing, error: existingError } = await supabase
        .from('about_content')
        .select(`id, ${REFINED_IMAGE_FIELDS.join(',')}`)
        .eq('id', id)
        .single();

      if (existingError) throw existingError;

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

      await Promise.all(
        REFINED_IMAGE_FIELDS.map((field) =>
          deleteStorageIfNeeded(supabase, existing?.[field], data?.[field])
        )
      );

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const supabase = getSupabaseClient();
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