import { getSupabaseClient } from '../_helpers/supabase';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseClient();
    const { file, fileName } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ error: 'File and fileName are required' });
    }

    // Base64'ten buffer'a çevir
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    
    // Temp klasörüne yükle: uploads/temp/{fileName}
    const tempPath = `temp/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(tempPath, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Temp image upload error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Public URL oluştur
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(tempPath);

    res.status(200).json({ 
      success: true, 
      data,
      path: tempPath,
      publicUrl: urlData.publicUrl
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
}
