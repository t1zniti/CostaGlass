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

function escapeXML(str) {
return String(str)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&apos;");
}

function generateSitemap(cities, products) {
const baseUrl = "https://costaglass.com";
const urls = [
{ loc: baseUrl, lastmod: new Date().toISOString().split("T")[0], priority: "1.0" },
];

// Add all dynamic pages
for (const product of products) {
for (const city of cities) {
if (!product.slug || !city.slug) continue;
urls.push({
loc: `${baseUrl}/${product.slug}/${city.slug}/`,
lastmod: new Date().toISOString().split("T")[0],
priority: "0.8",
});
}
}

// Generate XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

for (const url of urls) {
xml += "  <url>\n";
xml += `    <loc>${escapeXML(url.loc)}</loc>\n`;
xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
xml += `    <priority>${url.priority}</priority>\n`;
xml += "  </url>\n";
}

xml += "</urlset>";
return xml;
}

async function generatePages() {
const outDir = path.resolve("dist");

// Use the Vite-built index.html as template (has correct hashed asset paths)
const builtIndexPath = path.join(outDir, "index.html");

// Check if template exists
if (!fs.existsSync(builtIndexPath)) {
throw new Error(`Template file not found: ${builtIndexPath}`);
}

let template = fs.readFileSync(builtIndexPath, "utf-8");

const [citiesRes, productsRes] = await Promise.all([
databases.listDocuments(DB_ID, CITIES_TABLE, [Query.limit(100)]),
databases.listDocuments(DB_ID, PRODUCTS_TABLE, [Query.limit(100)]),
]);

const cities = citiesRes.documents;
const products = productsRes.documents;

for (const city of cities) {
for (const product of products) {
// Validate required fields
if (!product.slug || !city.slug) {
console.warn(
`Skipping: missing slug for product "${product.productName}" or city "${city.cityName}"`
);
continue;
}

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
/(<span class="hero-accent">)([^<]*)(\/?>)/,
`$1en ${city.cityName}$3`
);

// Update hero subtitle
html = html.replace(
/(<p class="hero-subtitle">)([^<]*)(\/?>)/,
`$1Líderes en diseño e instalación de ${product.productName} para terrazas y jardines en toda la zona de ${city.cityName}.$3`
);

const pageDir = path.join(outDir, product.slug, city.slug);
fs.mkdirSync(pageDir, { recursive: true });
fs.writeFileSync(path.join(pageDir, "index.html"), html);
console.log(`Generated: /${product.slug}/${city.slug}/`);
}
}

// Generate sitemap
const sitemap = generateSitemap(cities, products);
fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
console.log("Generated: /sitemap.xml");

console.log(
`\n✅ ${cities.length * products.length} pages generated (${cities.length} cities × ${products.length} products)`
);
}

generatePages().catch(console.error);