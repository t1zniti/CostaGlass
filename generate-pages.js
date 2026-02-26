import fs from 'fs';
import path from 'path';

// 1. Define your high-value Costa del Sol targets and products
const cities = ['Marbella', 'Estepona', 'Sotogrande', 'Mijas', 'Fuengirola'];
const products = [
  { id: 'cerramientos-de-cristal', name: 'Cerramientos de Cristal' },
  { id: 'pergolas-bioclimaticas', name: 'Pérgolas Bioclimáticas' },
  { id: 'paraviento-de-cristal', name: 'Paraviento de Cristal' }
];

// 2. Read the SEO template
const templatePath = path.join(process.cwd(), 'seo-generator', 'template.html');

// Create the seo-generator folder if it doesn't exist
if (!fs.existsSync(path.join(process.cwd(), 'seo-generator'))) {
  fs.mkdirSync(path.join(process.cwd(), 'seo-generator'));
  // Create a dummy template just so it doesn't crash on first run
  fs.writeFileSync(templatePath, '<!DOCTYPE html><html><head><title>{{PRODUCT}} en {{CITY}}</title></head><body><h1>Especialistas en {{PRODUCT}} en {{CITY}}</h1></body></html>');
}

const templateHTML = fs.readFileSync(templatePath, 'utf-8');

// 3. Generate the static pages
cities.forEach(city => {
  products.forEach(product => {
    // URL slug: e.g., "cerramientos-de-cristal-marbella"
    const slug = `${product.id}-${city.toLowerCase()}`;
    const folderPath = path.join(process.cwd(), slug);
    
    // Create the directory
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    // Inject keywords into the template
    let newHTML = templateHTML
      .replace(/{{CITY}}/g, city)
      .replace(/{{PRODUCT}}/g, product.name);

    // Save the physical index.html file
    const filePath = path.join(folderPath, 'index.html');
    fs.writeFileSync(filePath, newHTML);

    console.log(`✅ Generated: /${slug}`);
  });
});
