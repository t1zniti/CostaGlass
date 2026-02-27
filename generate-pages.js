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
  // Read the template file
  const templatePath = path.resolve("seo-generator/template.html");
  let template = fs.readFileSync(templatePath, "utf-8");

  const [citiesRes, productsRes] = await Promise.all([
    databases.listDocuments(DB_ID, CITIES_TABLE, [Query.limit(100)]),
    databases.listDocuments(DB_ID, PRODUCTS_TABLE, [Query.limit(100)]),
  ]);

  const cities = citiesRes.documents;
  const products = productsRes.documents;

  const outDir = path.resolve("dist");
  fs.mkdirSync(outDir, { recursive: true });

  for (const city of cities) {
    for (const product of products) {
      const titleES = `${product.productName} en ${city.cityName}`;
      const descES = product.seoDescriptionSpanish;

      // Replace template placeholders with actual values
      let html = template.replace(/\{\{CITY\}\}/g, city.cityName);
      html = html.replace(/\{\{PRODUCT\}\}/g, product.productName);
      
      // Update title and meta description
      html = html.replace(
        /<title>.*?<\/title>/,
        `<title>${titleES} | CostaGlass</title>`
      );
      html = html.replace(
        /(<meta name="description" content=")([^"]*)/,
        `$1${descES}`
      );

      const pageDir = path.join(outDir, product.slug, city.slug);
      fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, "index.html"), html);
      console.log(`Generated: /${product.slug}/${city.slug}/`);
    }
  }

  console.log(`\n✅ ${cities.length * products.length} pages generated (${cities.length} cities × ${products.length} products)`);
}

generatePages().catch(console.error);
