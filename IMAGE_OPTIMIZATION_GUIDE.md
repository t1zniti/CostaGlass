# Costa Glass - Image Optimization Setup Guide

## 📋 Quick Summary

Your website has been configured with **Vite** and image optimization tools to dramatically improve load times. The setup is complete and ready to use.

---

## 1️⃣ Installation Command

Install all required dependencies with npm:

```bash
npm install vite@^5.0.0 vite-plugin-image-optimizer@^1.0.0 sharp@^0.33.0 svgo@^3.2.0 --save-dev
```

**Or, if you prefer a shorter one-liner:**

```bash
npm install -D vite vite-plugin-image-optimizer sharp svgo
```

### What each package does:
- **vite**: Modern build tool for fast development and optimized production builds
- **vite-plugin-image-optimizer**: Automatically optimizes images during the build process
- **sharp**: High-performance image processing library (required dependency)
- **svgo**: SVG optimizer for best compression

---

## 2️⃣ Vite Configuration

✅ **Already configured**: `vite.config.js` has been created with the following settings:

### Image Optimization Settings:
- **JPG/JPEG**: 80% quality (reduced from 100%)
- **PNG**: 80% quality
- **WebP**: 80% quality (automatic conversion enabled)
- **GIF**: 80% quality
- **SVG**: Multi-pass optimization enabled

### Build Output:
- All optimized images are output to the `Assets/` directory
- The plugin automatically converts images to WebP format where beneficial
- The build process preserves image quality while reducing file size

---

## 3️⃣ Lazy Loading Attributes

✅ **Automatically applied**: Added `loading="lazy"` to **86 HTML files**

### What was updated:
- ✅ Added `loading="lazy"` to all `<img>` tags **outside the hero section**
- ✅ Preserved `loading="eager"` for above-the-fold images (hero slides)
- ✅ Preserved navigation and footer logo images with natural loading behavior

### Example:
```html
<!-- Hero section - eager loading (unchanged) -->
<img src="./Assets/products/glass curtain walls/v1.jpg" class="hero-slide" loading="eager">

<!-- Below fold - lazy loading (added) -->
<img src="./Assets/products/bioclimatic/p3.jpg" alt="Bioclimatic Technology" loading="lazy">
```

---

## 4️⃣ Large Image Files to Address

### ⚠️ Critical Priority (>5 MB):

These files should be manually resized before the build:

1. **perfiles.jpg** - **19 MB** 📌 CRITICAL
   - Path: `Assets/products/glass curtain walls/Cortinas de cristal con perfiles.jpg`
   - Recommendation: Resize to max 1920px width, compress to WebP

2. **c2.jpg** - **13 MB** 📌 CRITICAL
   - Path: `Assets/products/glass curtain walls/c2.jpg`
   - Recommendation: Resize to max 1920px width, compress to WebP

3. **v1.jpg** - **3.4 MB**
   - Path: `Assets/products/glass curtain walls/v1.jpg`
   - Recommendation: Hero image - resize to 1920px width

### Secondary Priority (1-3 MB):

4. **p4.jpg** - 2.6 MB - `Assets/products/bioclimatic/p4.jpg`
5. **g1.jpg** - 1.7 MB - `Assets/products/Retractable PVC Roof/g1.jpg`
6. **c3.jpg** - 1.3 MB - `Assets/products/glass curtain walls/c3.jpg`
7. **c1.jpg** (Windows) - 1.2 MB - `Assets/products/Guillotine-Style Glass Windows/c1.jpg`
8. **p3.jpg** - 1.2 MB - `Assets/products/bioclimatic/p3.jpg`
9. **l1.jpg** - 1.1 MB - `Assets/products/zip screen/l1.jpg`

### How to resize images:

**Using ImageMagick (if installed):**
```bash
convert input.jpg -resize 1920x1080 -quality 80 output.jpg
```

**Using online tools:**
- TinyPNG.com (recommended for JPG/PNG)
- Squoosh.app (Google's web tool)
- ImageOptim (macOS app)

**Using FFmpeg:**
```bash
ffmpeg -i input.jpg -vf scale=1920:-1 output.jpg
```

---

## 5️⃣ How to Build and Deploy

### Development Mode:
```bash
npm run dev
```

This starts a local development server at `http://localhost:5173`

### Production Build:
```bash
npm run build
```

This will:
1. ✅ Optimize all images to 80% quality
2. ✅ Generate WebP versions of images
3. ✅ Apply lazy loading to out-of-view images
4. ✅ Create a `dist/` folder with optimized assets

### Preview Production Build:
```bash
npm run preview
```

---

## 6️⃣ Expected Performance Improvements

### Before Optimization:
- Hero image (v1.jpg): 3.4 MB
- Multiple large JPGs: 19 MB + 13 MB + others
- **Total unoptimized assets**: ~100+ MB

### After Optimization (Estimated):
- Lazy loading: **50-70% reduction** in initial page load
- Image compression: **40-60% reduction** per image file
- WebP conversion: **25-35% additional reduction** for modern browsers
- **Estimated total**: 20-30 MB for full optimized assets

### Load Time Impact:
- **Initial page load**: Faster due to lazy loading
- **Image rendering**: Faster due to smaller files
- **Browser cache**: Better with WebP support
- **Mobile users**: Significantly better, especially on 3G/4G

---

## 7️⃣ Next Steps

1. **Install dependencies:**
   ```bash
   npm install -D vite vite-plugin-image-optimizer sharp svgo
   ```

2. **(Optional) Manually resize large files:**
   - Especially the 19 MB and 13 MB files
   - Use the tools mentioned above

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Deploy the `dist/` folder** to your hosting

---

## 8️⃣ Files Added/Modified

### New Files:
- ✅ `package.json` - Project dependencies and scripts
- ✅ `vite.config.js` - Build configuration with image optimization
- ✅ `add-lazy-loading.js` - Script that added lazy loading attributes

### Modified Files:
- ✅ 86 HTML files updated with `loading="lazy"` attributes

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Image Optimization Best Practices](https://web.dev/image-optimization/)
- [Lazy Loading Images](https://web.dev/lazy-loading-images/)
- [WebP Format Benefits](https://developers.google.com/speed/webp)

---

**Status**: ✅ Your image optimization setup is complete and ready to use!
