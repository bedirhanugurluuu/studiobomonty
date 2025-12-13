import { getSupabaseClient } from '../_helpers/supabase';

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
    const { content, journalId } = req.body;

    if (!content || !journalId) {
      return res.status(400).json({ error: 'Content and journalId are required' });
    }

    // İçerikten temp görselleri bul
    const tempImageRegex = /<img[^>]+src=["']([^"']*\/temp\/[^"']+)["'][^>]*>/gi;
    const tempImages = [];
    let match;
    
    while ((match = tempImageRegex.exec(content)) !== null) {
      const fullUrl = match[1];
      // URL'den path'i çıkar
      const urlParts = fullUrl.split('/');
      const tempIndex = urlParts.findIndex(part => part === 'temp');
      if (tempIndex !== -1 && tempIndex < urlParts.length - 1) {
        const fileName = urlParts.slice(tempIndex + 1).join('/');
        tempImages.push({
          fullUrl,
          tempPath: `temp/${fileName}`,
          fileName
        });
      }
    }

    if (tempImages.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No temp images to move',
        updatedContent: content
      });
    }

    let updatedContent = content;
    const movedImages = [];
    const errors = [];

    // Her temp görseli kalıcı klasöre taşı
    for (const image of tempImages) {
      try {
        const permanentPath = `journals/${journalId}/${image.fileName}`;
        
        // Dosyayı oku (blob olarak)
        const { data: fileBlob, error: readError } = await supabase.storage
          .from('uploads')
          .download(image.tempPath);

        if (readError) {
          console.error(`Error reading temp file ${image.tempPath}:`, readError);
          errors.push({ path: image.tempPath, error: readError.message });
          continue;
        }

        // Blob'u ArrayBuffer'a çevir
        const arrayBuffer = await fileBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Kalıcı klasöre yükle
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(permanentPath, buffer, {
            contentType: fileBlob.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error(`Error uploading to ${permanentPath}:`, uploadError);
          errors.push({ path: image.tempPath, error: uploadError.message });
          continue;
        }

        // Public URL oluştur
        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(permanentPath);

        // İçerikteki URL'yi güncelle (tüm olası formatları değiştir)
        // Hem tam URL hem de relative path'leri değiştir
        const urlVariations = [
          image.fullUrl,
          image.fullUrl.split('?')[0], // Query params olmadan
          image.fullUrl.replace(/^https?:\/\/[^\/]+/, ''), // Domain olmadan
        ];

        urlVariations.forEach(urlVar => {
          if (updatedContent.includes(urlVar)) {
            updatedContent = updatedContent.replace(
              new RegExp(urlVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
              urlData.publicUrl
            );
          }
        });

        // Temp dosyayı sil
        const { error: deleteError } = await supabase.storage
          .from('uploads')
          .remove([image.tempPath]);

        if (deleteError) {
          console.warn(`Warning: Could not delete temp file ${image.tempPath}:`, deleteError);
          // Hata olsa bile devam et
        }

        movedImages.push({
          from: image.tempPath,
          to: permanentPath,
          publicUrl: urlData.publicUrl
        });
      } catch (err) {
        console.error(`Error processing image ${image.tempPath}:`, err);
        errors.push({ path: image.tempPath, error: err.message });
      }
    }

    res.status(200).json({ 
      success: true,
      movedCount: movedImages.length,
      movedImages,
      errors,
      updatedContent
    });
  } catch (error) {
    console.error('Move temp images error:', error);
    res.status(500).json({ error: error.message });
  }
}
