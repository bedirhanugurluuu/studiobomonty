# 🚀 GitHub'a Push Etme Komutları

Bu dosya GitHub'a push etmek için gereken komutları içerir.

## 📋 Adımlar

### 1. GitHub'da Repository Oluştur
- https://github.com/new adresine gidin
- Repository name: `studiobomonty`
- Create repository butonuna tıklayın

### 2. Lokal Komutlar

Terminal'de şu komutları sırayla çalıştırın:

```bash
# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: StudioBomonty portfolio website"

# Branch'i main olarak ayarla
git branch -M main

# GitHub repository'yi remote olarak ekle
# NOT: YOUR_USERNAME'i kendi GitHub kullanıcı adınızla değiştirin
git remote add origin https://github.com/YOUR_USERNAME/studiobomonty.git

# GitHub'a push et
git push -u origin main
```

### 3. Authentication

İlk push'ta GitHub kullanıcı adı ve şifre isteyecektir:
- **Username**: GitHub kullanıcı adınız
- **Password**: GitHub şifreniz (veya Personal Access Token)

**Personal Access Token Oluşturma:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. İsim: `studiobomonty-push`
4. Expiration: 90 days (veya istediğiniz süre)
5. Scopes: `repo` seçin
6. "Generate token" → Token'ı kopyalayın
7. Şifre yerine bu token'ı kullanın

## ✅ Başarılı Push Sonrası

GitHub repository sayfanızda tüm dosyaları göreceksiniz:
- ✅ README.md
- ✅ DEPLOYMENT.md
- ✅ VERCEL_SETUP.md
- ✅ GITHUB_SETUP.md
- ✅ Tüm proje dosyaları

## 🔄 Sonraki Güncellemeler

Kod değişikliklerinden sonra:

```bash
git add .
git commit -m "Açıklayıcı commit mesajı"
git push
```

