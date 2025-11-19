# 🚀 Vercel Deployment Kurulum Rehberi

Bu rehber, StudioBomonty projesini iki ayrı Vercel projesi olarak deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

1. GitHub repository'nizi hazırlayın
2. Vercel hesabınızda giriş yapın
3. Her iki proje için environment variable'ları hazırlayın

## 🔧 Adım 1: Frontend Projesi (Ana Website)

### 1.1 Vercel'de Yeni Proje Oluştur

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. **"Add New..."** → **"Project"** tıklayın
3. GitHub repository'nizi seçin veya import edin
4. Proje adını girin: `studiobomonty` (veya istediğiniz isim)

### 1.2 Proje Ayarlarını Yapılandır

**Framework Preset**: Next.js (otomatik algılanır)

**Root Directory**: `.` (nokta - ana dizin)

**Build and Output Settings**:
- Build Command: `npm run build` (otomatik)
- Output Directory: `.next` (otomatik)
- Install Command: `npm install` (otomatik)

### 1.3 Environment Variables Ekle

**Environment Variables** bölümüne şunları ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 1.4 Deploy Et

**"Deploy"** butonuna tıklayın. İlk deployment tamamlandıktan sonra URL'iniz hazır olacak:
`https://studiobomonty.vercel.app`

---

## 🔧 Adım 2: Admin Panel Projesi

### 2.1 Vercel'de Yeni Proje Oluştur

1. Vercel Dashboard'da tekrar **"Add New..."** → **"Project"** tıklayın
2. **Aynı GitHub repository'yi** seçin (monorepo)
3. Proje adını girin: `studiobomonty-admin` (veya istediğiniz isim)

### 2.2 Proje Ayarlarını Yapılandır

**Framework Preset**: Vite

**Root Directory**: `temp-admin-panel` ⚠️ **ÖNEMLİ: Bu mutlaka ayarlanmalı**

**Build and Output Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2.3 Environment Variables Ekle

**Environment Variables** bölümüne şunları ekleyin:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://studiobomonty.vercel.app
```

> **Not**: `VITE_API_BASE_URL` frontend URL'inizi içermelidir.

### 2.4 Deploy Et

**"Deploy"** butonuna tıklayın. İlk deployment tamamlandıktan sonra URL'iniz hazır olacak:
`https://studiobomonty-admin.vercel.app`

---

## ✅ Doğrulama

### Frontend Kontrolü

1. Frontend URL'inizi açın: `https://studiobomonty.vercel.app`
2. Ana sayfa yükleniyor mu kontrol edin
3. Console'da hata var mı kontrol edin

### Admin Panel Kontrolü

1. Admin panel URL'inizi açın: `https://studiobomonty-admin.vercel.app`
2. Login sayfası görünüyor mu kontrol edin
3. Console'da hata var mı kontrol edin

---

## 🔄 Güncelleme Süreci

### Frontend Güncellemesi

Ana dizindeki dosyalarda değişiklik yaptığınızda:
1. GitHub'a push edin
2. Frontend Vercel projesi otomatik deploy edilir
3. Admin panel etkilenmez

### Admin Panel Güncellemesi

`temp-admin-panel/` klasöründeki dosyalarda değişiklik yaptığınızda:
1. GitHub'a push edin
2. Admin panel Vercel projesi otomatik deploy edilir
3. Frontend etkilenmez

---

## 🐛 Sorun Giderme

### Admin Panel Build Hatası: "Cannot find module"

**Sorun**: Root directory yanlış ayarlanmış.

**Çözüm**: 
- Vercel proje ayarlarına gidin
- Root Directory'nin `temp-admin-panel` olduğundan emin olun
- Redeploy edin

### Frontend Build Hatası: Admin panel dosyaları dahil ediliyor

**Sorun**: `.vercelignore` çalışmıyor.

**Çözüm**:
- Ana dizindeki `.vercelignore` dosyasını kontrol edin
- `temp-admin-panel/` satırının olduğundan emin olun
- Redeploy edin

### Environment Variables Çalışmıyor

**Sorun**: Variable'lar yanlış isimlendirilmiş veya eksik.

**Çözüm**:
- Frontend için: `NEXT_PUBLIC_` prefix'i olmalı
- Admin panel için: `VITE_` prefix'i olmalı
- Vercel dashboard'da variable'ları kontrol edin
- Redeploy edin

---

## 📝 Özet

✅ **Frontend Projesi**:
- Root Directory: `.` (ana dizin)
- Framework: Next.js
- URL: `https://studiobomonty.vercel.app`

✅ **Admin Panel Projesi**:
- Root Directory: `temp-admin-panel`
- Framework: Vite
- URL: `https://studiobomonty-admin.vercel.app`

Her iki proje de aynı GitHub repository'den deploy edilir ama birbirinden bağımsızdır.

