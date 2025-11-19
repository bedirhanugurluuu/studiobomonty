# 🔗 Vercel Repository Bağlantısı Rehberi

## ❓ Sorun: Vercel Farklı Repository Oluşturmuş

Vercel bazen otomatik olarak yeni bir repository oluşturabilir. Bu durumda doğru repository'yi bağlamanız gerekir.

## ✅ Doğru Yaklaşım

**Vercel projelerinizi GitHub'daki ana repository'nize (`studiobomonty`) bağlamalısınız.**

Yeni oluşturulan repository'ye kod push etmenize gerek yok. Bunun yerine Vercel'de proje ayarlarını düzeltin.

## 🔧 Adım Adım Çözüm

### 1. Vercel Dashboard'da Proje Ayarlarını Kontrol Edin

#### Frontend Projesi İçin:
1. Vercel Dashboard → Frontend projenizi seçin (`studiobomonty`)
2. **Settings** → **Git** sekmesine gidin
3. **"Connected Git Repository"** bölümünü kontrol edin
4. Repository'nin `YOUR_USERNAME/studiobomonty` olduğundan emin olun

#### Admin Panel Projesi İçin:
1. Vercel Dashboard → Admin panel projenizi seçin (`studiobomonty-admin`)
2. **Settings** → **Git** sekmesine gidin
3. **"Connected Git Repository"** bölümünü kontrol edin
4. Repository'nin `YOUR_USERNAME/studiobomonty` olduğundan emin olun (aynı repo!)

### 2. Yanlış Repository Bağlıysa Düzeltin

Eğer yanlış repository bağlıysa:

1. **"Disconnect"** butonuna tıklayın
2. **"Connect Git Repository"** butonuna tıklayın
3. GitHub repository'nizi seçin: `studiobomonty`
4. **"Connect"** butonuna tıklayın

### 3. Root Directory Ayarlarını Kontrol Edin

#### Frontend Projesi:
- **Root Directory**: `.` (nokta - ana dizin)
- **Framework**: Next.js

#### Admin Panel Projesi:
- **Root Directory**: `temp-admin-panel`
- **Framework**: Vite

## 📋 Doğru Yapılandırma

### Frontend Projesi
```
Repository: YOUR_USERNAME/studiobomonty
Root Directory: . (ana dizin)
Branch: main
```

### Admin Panel Projesi
```
Repository: YOUR_USERNAME/studiobomonty (AYNI REPO!)
Root Directory: temp-admin-panel
Branch: main
```

## ✅ Kontrol Listesi

- [ ] Frontend projesi `studiobomonty` repository'sine bağlı
- [ ] Admin panel projesi `studiobomonty` repository'sine bağlı (aynı repo)
- [ ] Root Directory'ler doğru ayarlanmış
- [ ] Her iki proje de `main` branch'ini kullanıyor

## 🚀 Sonuç

Doğru repository'ye bağladıktan sonra:

1. ✅ GitHub'a push yaptığınızda Vercel otomatik deploy edecek
2. ✅ Ayrı bir repository'ye kod push etmenize gerek yok
3. ✅ Her iki proje de aynı repository'den deploy edilecek
4. ✅ Monorepo yapısı korunacak

## ⚠️ Önemli Notlar

- **Aynı repository'yi kullanın**: Her iki Vercel projesi de aynı GitHub repository'sine bağlı olmalı
- **Root Directory farklı**: Frontend `.` (ana dizin), Admin panel `temp-admin-panel`
- **Otomatik deploy**: GitHub'a push yaptığınızda her iki proje de otomatik deploy edilir
- **Yeni repository'ye push gerekmez**: Vercel'in oluşturduğu repository'yi kullanmayın

## 🐛 Sorun Giderme

### "Repository not found" Hatası

1. GitHub'da repository'nizin public olduğundan emin olun
2. Veya Vercel'in GitHub hesabınıza erişim izni olduğundan emin olun
3. Settings → Git → "Reconnect" deneyin

### Deploy Çalışmıyor

1. Settings → Git → "Connected Repository" kontrol edin
2. Doğru branch'i seçtiğinizden emin olun (`main`)
3. Root Directory'nin doğru olduğundan emin olun

