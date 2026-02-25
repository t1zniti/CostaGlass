# Costa Glass - Image Optimization - Quick Start

## 📦 Installation

```bash
npm install -D vite vite-plugin-image-optimizer sharp svgo
```

## 🚀 Usage

### Development
```bash
npm run dev
```
Open browser to `http://localhost:5173`

### Production Build
```bash
npm run build
```
Output will be in the `dist/` folder

### Preview Build
```bash
npm run preview
```

---

## 📊 Performance Metrics

### Large Files to Manually Resize
| File | Size | Action |
|------|------|--------|
| perfiles.jpg | 19 MB | 🔴 Reduce first |
| c2.jpg | 13 MB | 🔴 Reduce first |
| v1.jpg | 3.4 MB | 🟡 Resize needed |
| p4.jpg | 2.6 MB | 🟡 Resize needed |
| g1.jpg | 1.7 MB | 🟡 Resize needed |
| c3.jpg | 1.3 MB | 🟡 Resize needed |

---

## ✅ Setup Checklist

- ✅ Package.json created
- ✅ Vite 5.0 configured
- ✅ Image optimizer plugin installed
- ✅ 86 HTML files updated with lazy loading
- ✅ WebP conversion enabled
- ✅ Quality set to 80% for JPG/PNG/GIF
- ✅ .gitignore updated

---

## 📌 Key Features

- **Image Optimization**: Automatic compression to 80% quality
- **WebP Support**: Automatic WebP generation for modern browsers
- **Lazy Loading**: All below-fold images load on-demand
- **Hero Preservation**: Above-fold images load eagerly
- **SVG Optimization**: Automatic SVG compression with svgo

---

## 🎯 Next Steps

1. Install dependencies
2. Manually compress the 19MB and 13MB files
3. Run `npm run build`
4. Deploy the `dist/` folder
