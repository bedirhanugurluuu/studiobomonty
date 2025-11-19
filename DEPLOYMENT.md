# 🚀 StudioBomonty Deployment Guide

Bu proje iki ayrı Vercel projesi olarak deploy edilir:

1. **Frontend (Next.js)** - Ana website
2. **Admin Panel (React + Vite)** - İçerik yönetim sistemi

## 📋 Genel Bakış

- **Frontend URL**: `https://studiobomonty.vercel.app`
- **Admin Panel URL**: `https://studiobomonty-admin.vercel.app` (veya istediğiniz domain)

## 🔧 Frontend Deployment (Ana Proje)

### Vercel Projesi Ayarları

1. Vercel Dashboard'da yeni proje oluşturun
2. GitHub repository'yi bağlayın
3. **Önemli Ayarlar**:
   - **Root Directory**: `.` (ana dizin)
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (otomatik)
   - **Install Command**: `npm install`

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### .vercelignore

Ana proje `.vercelignore` dosyası `temp-admin-panel/` klasörünü hariç tutar, bu yüzden admin panel dosyaları frontend build'ine dahil edilmez.

## 🔧 Admin Panel Deployment

### Vercel Projesi Ayarları

1. Vercel Dashboard'da **yeni bir proje** oluşturun
2. **Aynı GitHub repository'yi** bağlayın (monorepo)
3. **Önemli Ayarlar**:
   - **Root Directory**: `temp-admin-panel`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://studiobomonty.vercel.app
```

### .vercelignore

Admin panel kendi `.vercelignore` dosyasına sahiptir ve ana proje dosyalarını hariç tutar.

## 📝 GitHub Repository Yapısı

```
StudioBomonty/
├── pages/              # Frontend (Next.js)
├── components/         # Frontend components
├── lib/               # Frontend utilities
├── public/            # Frontend assets
├── package.json       # Frontend dependencies
├── vercel.json        # Frontend Vercel config
├── .vercelignore      # Frontend ignore rules
│
└── temp-admin-panel/  # Admin Panel (React + Vite)
    ├── src/
    ├── package.json
    ├── vercel.json
    └── .vercelignore
```

## ✅ Deployment Checklist

### Frontend
- [ ] Vercel projesi oluşturuldu
- [ ] Root directory: `.` (ana dizin)
- [ ] Framework: Next.js
- [ ] Environment variables eklendi
- [ ] GitHub branch bağlandı
- [ ] İlk deployment başarılı

### Admin Panel
- [ ] Vercel projesi oluşturuldu (ayrı proje)
- [ ] Root directory: `temp-admin-panel`
- [ ] Framework: Vite
- [ ] Environment variables eklendi
- [ ] Aynı GitHub repo bağlandı
- [ ] İlk deployment başarılı

## 🔄 Güncelleme Süreci

Her iki proje de aynı GitHub repository'den deploy edilir:

1. **Frontend güncellemesi**: Ana dizindeki değişiklikler otomatik deploy edilir
2. **Admin panel güncellemesi**: `temp-admin-panel/` içindeki değişiklikler otomatik deploy edilir

## 🐛 Sorun Giderme

### Admin Panel Build Hatası

Eğer admin panel build ederken ana proje dosyaları dahil ediliyorsa:
- `temp-admin-panel/.vercelignore` dosyasını kontrol edin
- Root directory'nin `temp-admin-panel` olduğundan emin olun

### Frontend Build Hatası

Eğer frontend build ederken admin panel dosyaları dahil ediliyorsa:
- Ana dizindeki `.vercelignore` dosyasını kontrol edin
- `temp-admin-panel/` klasörünün ignore edildiğinden emin olun

## 📞 Destek

Herhangi bir sorun için GitHub Issues kullanın.

