import { getSupabaseClient } from '../_helpers/supabase';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseClient();
    
    // Temp klasöründeki tüm dosyaları listele
    const { data: files, error: listError } = await supabase.storage
      .from('uploads')
      .list('temp', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      });

    if (listError) {
      console.error('List temp files error:', listError);
      return res.status(500).json({ error: listError.message });
    }

    if (!files || files.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No temp files to clean up',
        deletedCount: 0
      });
    }

    // 2 hafta öncesini hesapla (14 gün = 14 * 24 * 60 * 60 * 1000 ms)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const filesToDelete = [];
    const errors = [];
    let deletedCount = 0;

    for (const file of files) {
      try {
        // Dosya oluşturulma tarihini kontrol et
        const fileCreatedAt = new Date(file.created_at);
        
        if (fileCreatedAt < twoWeeksAgo) {
          const filePath = `temp/${file.name}`;
          
          // Dosyayı sil
          const { error: deleteError } = await supabase.storage
            .from('uploads')
            .remove([filePath]);

          if (deleteError) {
            errors.push({ file: file.name, error: deleteError.message });
          } else {
            deletedCount++;
            filesToDelete.push(file.name);
          }
        }
      } catch (err) {
        errors.push({ file: file.name, error: err.message });
      }
    }

    res.status(200).json({ 
      success: true,
      deletedCount,
      deletedFiles: filesToDelete,
      errors,
      message: `Deleted ${deletedCount} old temp files`
    });
  } catch (error) {
    console.error('Cleanup temp images error:', error);
    res.status(500).json({ error: error.message });
  }
}
