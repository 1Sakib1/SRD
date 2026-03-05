# 🚀 Quick Start - Add Your Images

**3 Simple Steps to Get Your Images Working**

---

## Step 1️⃣: Create Folders

```bash
# In your project directory
mkdir -p public/images/team
mkdir -p public/images/partners
```

---

## Step 2️⃣: Add Your Images

Copy your images to these locations with **exact file names**:

### Team Photos (4 images)
```
public/images/team/nazmus.jpg       ← Nazmus Sakib
public/images/team/niloy.jpg        ← Md Abudozana Niloy
public/images/team/suvekshya.jpg    ← Suvekshya Shrestha
public/images/team/bisesta.jpg      ← Bisesta Shah
```

### Hero Image (1 image)
```
public/images/hero.jpg              ← Sydney/City skyline
```

### Partner Logos (3 images)
```
public/images/partners/city-of-sydney.png    ← City of Sydney
public/images/partners/nsw-epa.png           ← NSW EPA
public/images/partners/planet-ark.png        ← Planet Ark
```

---

## Step 3️⃣: Done! 🎉

That's it! Your images will now appear in:
- ✅ Development (local)
- ✅ Production (Vercel)
- ✅ Anywhere you deploy

### Can't Use .jpg or .png Format?

No problem! Supported formats:
- ✅ `.jpg` or `.jpeg`
- ✅ `.png`
- ✅ `.webp`

Just use the correct extension in the filename.

---

## ⚡ What Happens If Images Are Missing?

The app will automatically show fallback images:
- **Team photos** → Professional avatar placeholders
- **Hero image** → Beautiful Sydney skyline from Unsplash
- **Partner logos** → Clean colored placeholder boxes

---

## 📦 Export Images from Figma

1. Open your Figma file
2. Select the image/frame
3. Click "Export" (bottom-right panel)
4. Choose format:
   - Photos → JPG (smaller size)
   - Logos → PNG (transparency support)
5. Click "Export [name]"
6. Rename file according to the guide above
7. Move to correct folder

---

## ✅ Verify Your Setup

Your folder structure should look like this:

```
Smart-Rubbish-Detection/
├── public/
│   └── images/
│       ├── hero.jpg
│       ├── team/
│       │   ├── nazmus.jpg
│       │   ├── niloy.jpg
│       │   ├── suvekshya.jpg
│       │   └── bisesta.jpg
│       └── partners/
│           ├── city-of-sydney.png
│           ├── nsw-epa.png
│           └── planet-ark.png
├── src/
└── package.json
```

---

## 🚀 Deploy to Vercel

Once images are added:

```bash
# Commit everything
git add .
git commit -m "Add team photos and brand assets"
git push origin main

# Deploy will work perfectly!
```

No need to change any code - it's already configured to work! ✅

---

**Need more details?** See [IMAGE_UPLOAD_GUIDE.md](IMAGE_UPLOAD_GUIDE.md)
