<!-- Reusable Breadcrumb Navigation Component -->
<!-- Usage: Include this in product pages, blog pages, and landing pages -->

<!-- Add this in your <head> section -->
<script type="application/ld+json" id="breadcrumb-schema">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://costaglass.es/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{PAGE_NAME}",
      "item": "{PAGE_URL}"
    }
  ]
}
</script>

<!-- Add this in your <body> section, after navigation -->
<div class="breadcrumb-nav" style="background: #f8fafc; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
  <div class="container" style="max-width: 1280px; margin: 0 auto; padding: 0 24px;">
    <nav aria-label="Breadcrumb">
      <ol style="list-style: none; padding: 0; margin: 0; display: flex; gap: 8px; font-size: 0.9rem; color: #64748b;">
        <li><a href="/" style="color: #0ea5e9; text-decoration: none;">Costa Glass</a></li>
        <li>/</li>
        <li><span style="color: #475569;">{PAGE_NAME}</span></li>
      </ol>
    </nav>
  </div>
</div>

<!-- IMPLEMENTATION GUIDE -->

## Product Pages (Fast Implementation)

For: `/cortinas-de-cristal/`, `/pergolas-bioclimaticas/`, etc.

### 1. Cortinas de Cristal Page
Add this after opening <head> tag and update the position:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://costaglass.es/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Cortinas de Cristal",
      "item": "https://costaglass.es/cortinas-de-cristal/"
    }
  ]
}
</script>
```

And add this breadcrumb nav HTML after the <nav> element:

```html
<div class="breadcrumb-nav" style="background: #f8fafc; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
  <div class="container" style="max-width: 1280px; margin: 0 auto; padding: 0 24px;">
    <nav aria-label="Breadcrumb">
      <ol style="list-style: none; padding: 0; margin: 0; display: flex; gap: 8px; font-size: 0.9rem; color: #64748b;">
        <li><a href="/" style="color: #0ea5e9; text-decoration: none;">Costa Glass</a></li>
        <li>/</li>
        <li><span style="color: #475569;">Cortinas de Cristal</span></li>
      </ol>
    </nav>
  </div>
</div>
```

## For Each Page Type:

### Product Pages (6 pages)
- Cortinas de Cristal
- Pérgolas Bioclimáticas  
- Guillotina de Cristal
- Toldo Zip
- Sistemas de Techo Retráctil
- Paravientos de Cristal

### Location Pages (8 pages)
- Cerramientos Terrazas Cristal Precio
- Cómo Cerrar Terraza sin Obra
- Ideas Porche Invierno
- And 5 more blog posts

### Main Pages (3 pages)
- Blog (Breadcrumb: Inicio > Blog)
- Empresa (Breadcrumb: Inicio > Empresa)
- Contact (Breadcrumb: Inicio > Contacto)

## SEO Impact of Breadcrumbs

✅ Improves crawlability
✅ Better internal linking structure
✅ Rich snippets in search results (breadcrumb trail shown)
✅ Reduces bounce rate (easier navigation)
✅ Helps with site structure understanding

## CSS Styling (Optional)

Add to your styles.css if you want custom styling:

```css
.breadcrumb-nav {
  background: #f8fafc;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.breadcrumb-nav ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.breadcrumb-nav a {
  color: #0ea5e9;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-nav a:hover {
  color: #0284c7;
  text-decoration: underline;
}
```

## Implementation Checklist

- [ ] Add breadcrumb schema to all 6 product pages
- [ ] Add breadcrumb HTML nav to all 6 product pages  
- [ ] Add breadcrumb schema to 3 main pages (blog, empresa, contact)
- [ ] Add breadcrumb HTML nav to 3 main pages
- [ ] Test breadcrumbs display correctly
- [ ] Test breadcrumb schema in Google Rich Results Test
- [ ] Verify links work correctly
- [ ] Deploy and monitor in GSC

---
File: /src/components/Breadcrumb.astro (recommended for Astro components)
