# 📦 GitHub Repository Kurulum Rehberi

Bu rehber StudioBomonty projesini GitHub'a eklemek için adım adım talimatlar içerir.

## 🚀 Hızlı Başlangıç

### 1. GitHub'da Repository Oluştur

1. [GitHub](https://github.com) hesabınıza giriş yapın
2. Sağ üstteki **"+"** butonuna tıklayın → **"New repository"**
3. Repository bilgilerini doldurun:
   - **Repository name**: `studiobomonty` (veya istediğiniz isim)
   - **Description**: `StudioBomonty - Creative Portfolio & Design Studio Website`
   - **Visibility**: 
     - ✅ **Public** (açık kaynak için)
     - ✅ **Private** (özel proje için)
   - **Initialize this repository with**: 
     - ❌ README (bizim zaten var)
     - ❌ .gitignore (bizim zaten var)
     - ❌ license (opsiyonel)
4. **"Create repository"** butonuna tıklayın

### 2. Lokal Projeyi Git'e Bağla

Terminal'de proje dizinine gidin ve şu komutları çalıştırın:

```bash
# Git repository'yi başlat (eğer yapılmadıysa)
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: StudioBomonty portfolio website"

# GitHub repository'yi remote olarak ekle
# NOT: YOUR_USERNAME ve YOUR_REPO_NAME'i kendi bilgilerinizle değiştirin
git remote add origin https://github.com/YOUR_USERNAME/studiobomonty.git

# Ana branch'i main olarak ayarla
git branch -M main

# GitHub'a push et
git push -u origin main
```

## 📝 Detaylı Adımlar

### Adım 1: Git Repository Başlatma

```bash
cd "C:\Users\raunc\OneDrive\Masaüstü\StudioBomonty"
git init
```

### Adım 2: Dosyaları Stage'e Ekleme

```bash
# Tüm dosyaları ekle
git add .

# Veya belirli dosyaları kontrol etmek için
git status
```

### Adım 3: İlk Commit

```bash
git commit -m "Initial commit: StudioBomonty portfolio website with admin panel"
```

### Adım 4: GitHub Repository URL'ini Ekleme

GitHub'da oluşturduğunuz repository'nin URL'ini kopyalayın:
- HTTPS: `https://github.com/YOUR_USERNAME/studiobomonty.git`
- SSH: `git@github.com:YOUR_USERNAME/studiobomonty.git`

```bash
# HTTPS kullanıyorsanız
git remote add origin https://github.com/YOUR_USERNAME/studiobomonty.git

# SSH kullanıyorsanız
git remote add origin git@github.com:YOUR_USERNAME/studiobomonty.git
```

### Adım 5: Branch İsmini Ayarlama

```bash
git branch -M main
```

### Adım 6: GitHub'a Push Etme

```bash
git push -u origin main
```

## 🔐 GitHub Authentication

### HTTPS Kullanıyorsanız

İlk push'ta GitHub kullanıcı adı ve şifre (veya Personal Access Token) isteyecektir.

**Personal Access Token Oluşturma:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. İsim verin ve gerekli izinleri seçin (repo)
4. Token'ı kopyalayın ve şifre yerine kullanın

### SSH Kullanıyorsanız

SSH key'inizin GitHub'a eklenmiş olması gerekir. Eğer yoksa:

```bash
# SSH key oluştur (eğer yoksa)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Public key'i kopyala
cat ~/.ssh/id_ed25519.pub

# GitHub → Settings → SSH and GPG keys → New SSH key
# Kopyaladığınız key'i yapıştırın
```

## ✅ Kontrol

Push işlemi başarılı olduktan sonra:

1. GitHub repository sayfanızı açın
2. Tüm dosyaların yüklendiğini kontrol edin
3. README.md dosyasının göründüğünü kontrol edin

## 📁 Repository Yapısı

GitHub'a yüklenecek dosyalar:

```
studiobomonty/
├── pages/              # Next.js pages
├── components/         # React components
├── lib/               # Utilities
├── public/            # Static assets
├── temp-admin-panel/  # Admin panel (ayrı Vercel projesi)
├── package.json       # Frontend dependencies
├── README.md          # Proje dokümantasyonu
├── DEPLOYMENT.md      # Deployment rehberi
├── VERCEL_SETUP.md    # Vercel kurulum rehberi
└── .gitignore         # Git ignore kuralları
```

## 🚫 Gitignore Edilen Dosyalar

Şu dosyalar GitHub'a yüklenmez:

- `node_modules/` - Dependencies
- `.env*` - Environment variables
- `.next/` - Next.js build dosyaları
- `.vercel/` - Vercel config
- `*.tsbuildinfo` - TypeScript build info
- `dist/` - Build output
- `temp-admin-panel/dist/` - Admin panel build output

## 🔄 Sonraki Adımlar

1. ✅ GitHub repository oluşturuldu
2. ✅ Kod push edildi
3. 🔜 Vercel'de frontend projesi oluştur
4. 🔜 Vercel'de admin panel projesi oluştur
5. 🔜 Environment variables'ları ekle

Detaylı Vercel kurulumu için `VERCEL_SETUP.md` dosyasına bakın.

## 🐛 Sorun Giderme

### "fatal: not a git repository"

```bash
git init
```

### "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/studiobomonty.git
```

### "Permission denied"

- HTTPS kullanıyorsanız: Personal Access Token kullanın
- SSH kullanıyorsanız: SSH key'inizin GitHub'a eklendiğinden emin olun

### Büyük dosya hatası

`.gitignore` dosyasını kontrol edin ve gereksiz dosyaları ekleyin.

