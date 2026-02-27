import { Client, Databases, Query } from "node-appwrite";
import fs from "fs";
import path from "path";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("fra-69a0e0b60033a0acf1de")
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = "database-69a0e0f0001ee13c325d";
const CITIES_TABLE = "cities";
const PRODUCTS_TABLE = "products";

async function generatePages() {
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
      const descEN = product.seoDescriptionEnglish;

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${titleES} | CostaGlass</title>
  <meta name="description" content="${descES}"/>
  //costaglass.com/${product.slug}/${city.slug}/"/>
</head>
<body>
  <h1>${titleES}</h1>
  <p>${descES}</p>
  <p>${descEN}</p>
</body>
</html>`;

      const pageDir = path.join(outDir, product.slug, city.slug);
      fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, "index.html"), html);
      console.log(`Generated: /${product.slug}/${city.slug}/`);
    }
  }

  console.log(`\n✅ ${cities.length * products.length} pages generated (${cities.length} cities × ${products.length} products)`);
}

generatePages().catch(console.error);
