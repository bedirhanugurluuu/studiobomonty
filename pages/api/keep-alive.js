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

/**
 * Keep-alive endpoint to prevent Supabase free tier from pausing
 * This endpoint performs a simple query to keep the project active
 * Should be called via Vercel Cron Jobs every 6 days
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: Add a secret token for security (optional but recommended)
  const secretToken = req.query.token || req.headers['x-keep-alive-token'];
  const expectedToken = process.env.KEEP_ALIVE_SECRET_TOKEN;

  if (expectedToken && secretToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = getSupabaseClient();
    
    // Perform a simple, lightweight query to keep the project active
    // This query is very fast and doesn't consume much resources
    const { data, error } = await supabase
      .from('intro_banners')
      .select('id')
      .limit(1)
      .maybeSingle();

    // Even if there's no data, the query itself keeps the project active
    if (error && error.code !== 'PGRST116') {
      console.error('Keep-alive query error:', error);
      // Don't fail - the connection attempt itself helps
    }

    const timestamp = new Date().toISOString();
    
    return res.status(200).json({
      success: true,
      message: 'Keep-alive ping successful',
      timestamp,
      supabase_connected: !error || error.code === 'PGRST116',
    });
  } catch (err) {
    console.error('Keep-alive error:', err);
    // Still return success - the attempt itself is valuable
    return res.status(200).json({
      success: true,
      message: 'Keep-alive attempt completed',
      timestamp: new Date().toISOString(),
      note: 'Connection attempt logged even if query failed',
    });
  }
}

