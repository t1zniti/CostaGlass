import { Client, Databases, Query } from "node-appwrite";
import fs from "fs";
import path from "path";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69a0e0b60033a0acf1de")
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = "69a0e0f0001ee13c325d";
const CITIES_TABLE = "cities";
const PRODUCTS_TABLE = "products";

async function generatePages() {
  const outDir = path.resolve("dist");

  // Use the Vite-built index.html as template (has correct hashed asset paths)
  const builtIndexPath = path.join(outDir, "index.html");
  let template = fs.readFileSync(builtIndexPath, "utf-8");

  const [citiesRes, productsRes] = await Promise.all([
    databases.listDocuments(DB_ID, CITIES_TABLE, [Query.limit(100)]),
    databases.listDocuments(DB_ID, PRODUCTS_TABLE, [Query.limit(100)]),
  ]);

  const cities = citiesRes.documents;
  const products = productsRes.documents;

  for (const city of cities) {
    for (const product of products) {
      const titleES = `${product.productName} en ${city.cityName}`;
      const descES = product.seoDescriptionSpanish;

      let html = template;

      // Update title
      html = html.replace(
        /<title>.*?<\/title>/,
        `<title>${titleES} | CostaGlass</title>`
      );

      // Update meta description
      html = html.replace(
        /(<meta name="description" content=")([^"]*)/,
        `$1${descES}`
      );

      // Update hero heading — replace the accent span content with city name
      html = html.replace(
        /(<span class="hero-accent">)([^<]*)(<\/span>)/,
        `$1en ${city.cityName}$3`
      );

      // Update hero subtitle
      html = html.replace(
        /(<p class="hero-subtitle">)([^<]*)(<\/p>)/,
        `$1Líderes en diseño e instalación de ${product.productName} para terrazas y jardines en toda la zona de ${city.cityName}.$3`
      );

      const pageDir = path.join(outDir, product.slug, city.slug);
      fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, "index.html"), html);
      console.log(`Generated: /${product.slug}/${city.slug}/`);
    }
  }

  // Generate sitemap.xml
  const sitemapUrls = [];
  for (const city of cities) {
    for (const product of products) {
      sitemapUrls.push(`https://costaglass.com/${product.slug}/${city.slug}/`);
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>oc>${url}</loc></url>`).join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
  console.log("✅ sitemap.xml generated");

  console.log(`\n✅ ${cities.length * products.length} pages generated (${cities.length} cities × ${products.length} products)`);
}

generatePages().catch(console.error);
