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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Public form submission
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ 
          error: 'Server configuration error',
          details: 'Missing Supabase credentials. Please check Vercel environment variables.'
        });
      }

      const { name, email, message } = req.body;

      // Validation
      if (!name || !email || !message) {
        return res.status(400).json({ 
          error: 'Validation error',
          details: 'Name, email, and message are required'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Validation error',
          details: 'Invalid email format'
        });
      }

      // Message length validation (max 5000 characters)
      const trimmedMessage = message.trim();
      if (trimmedMessage.length > 5000) {
        return res.status(400).json({ 
          error: 'Validation error',
          details: 'Message is too long. Maximum 5000 characters allowed.'
        });
      }

      if (trimmedMessage.length < 10) {
        return res.status(400).json({ 
          error: 'Validation error',
          details: 'Message is too short. Minimum 10 characters required.'
        });
      }

      // Get client IP
      const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.headers['x-real-ip'] || 
                      req.connection?.remoteAddress || 
                      'unknown';

      const supabase = getSupabaseClient();
      
      // Rate limiting: Check recent submissions from same IP (last 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentIPSubmissions } = await supabase
        .from('contact_submissions')
        .select('id, created_at')
        .gte('created_at', oneHourAgo)
        .limit(10);
      
      // IP bazlı rate limiting: 1 saatte maksimum 5 istek
      const ipSubmissionCount = recentIPSubmissions?.length || 0;
      if (ipSubmissionCount >= 5) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          details: 'Too many requests from this IP. Please try again later.'
        });
      }

      // Email bazlı rate limiting: Aynı email'den 1 saatte maksimum 3 istek
      const { data: recentEmailSubmissions } = await supabase
        .from('contact_submissions')
        .select('id, created_at')
        .eq('email', email.trim().toLowerCase())
        .gte('created_at', oneHourAgo)
        .limit(5);
      
      const emailSubmissionCount = recentEmailSubmissions?.length || 0;
      if (emailSubmissionCount >= 3) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          details: 'Too many requests from this email address. Please try again later.'
        });
      }
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error inserting contact submission:', error);
        throw error;
      }

      res.status(201).json({ 
        success: true,
        message: 'Your message has been sent successfully!',
        id: data.id
      });
    } catch (error) {
      console.error('Error processing contact submission:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      res.status(500).json({ 
        error: 'Internal server error',
        details: errorMessage
      });
    }
  } else if (req.method === 'GET') {
    // Admin: Get all submissions
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ 
          error: 'Server configuration error',
          details: 'Missing Supabase credentials'
        });
      }

      const supabase = getSupabaseClient();
      const isRead = req.query.is_read;
      const limit = parseInt(req.query.limit || '50');
      const offset = parseInt(req.query.offset || '0');

      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (isRead !== null) {
        query = query.eq('is_read', isRead === 'true');
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching contact submissions:', error);
        throw error;
      }

      res.json({
        data: data || [],
        count: count || 0,
        limit,
        offset
      });
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      res.status(500).json({ 
        error: 'Internal server error',
        details: errorMessage
      });
    }
  } else if (req.method === 'PUT') {
    // Admin: Update submission (mark as read/unread)
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ 
          error: 'Server configuration error',
          details: 'Missing Supabase credentials'
        });
      }

      const { id } = req.query;
      const { is_read } = req.body;

      if (!id) {
        return res.status(400).json({ 
          error: 'Validation error',
          details: 'Submission ID is required'
        });
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('contact_submissions')
        .update({ 
          is_read: is_read !== undefined ? is_read : true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact submission:', error);
        throw error;
      }

      res.json({ 
        success: true,
        data
      });
    } catch (error) {
      console.error('Error updating contact submission:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      res.status(500).json({ 
        error: 'Internal server error',
        details: errorMessage
      });
    }
  } else if (req.method === 'DELETE') {
    // Admin: Delete submission
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ 
          error: 'Server configuration error',
          details: 'Missing Supabase credentials'
        });
      }

      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ 
          error: 'Validation error',
          details: 'Submission ID is required'
        });
      }

      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact submission:', error);
        throw error;
      }

      res.json({ 
        success: true,
        message: 'Submission deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting contact submission:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      res.status(500).json({ 
        error: 'Internal server error',
        details: errorMessage
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

