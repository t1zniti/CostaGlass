import fs from 'fs';
import path from 'path';

// 1. Define your high-value Costa del Sol targets and products
const cities = ['Marbella', 'Estepona', 'Sotogrande', 'Mijas', 'Fuengirola'];
const products = [
  { id: 'cerramientos-de-cristal', name: 'Cerramientos de Cristal' },
  { id: 'pergolas-bioclimaticas', name: 'Pérgolas Bioclimáticas' },
  { id: 'paraviento-de-cristal', name: 'Paraviento de Cristal' }
];

// Product descriptions in Spanish, tailored to each city
const productDescriptions = {
  'cerramientos-de-cristal': (city) =>
    `Instalación profesional de cerramientos de cristal en ${city}. Ampliamos y protegemos tu terraza o balcón con sistemas de alta calidad adaptados al clima de la Costa del Sol.`,
  'pergolas-bioclimaticas': (city) =>
    `Pérgolas bioclimáticas de aluminio y cristal en ${city}. Disfruta de tu espacio exterior durante todo el año con lamas orientables y diseño moderno.`,
  'paraviento-de-cristal': (city) =>
    `Paravientos de cristal a medida en ${city}. Protección elegante contra el viento para terrazas y espacios exteriores sin alterar las vistas.`,
};

// FAQ questions and answers in Spanish, unique to each product type
const productFAQs = {
  'cerramientos-de-cristal': (city) => [
    {
      question: `¿Necesito licencia para instalar cerramientos de cristal en ${city}?`,
      answer: `En ${city} generalmente se requiere comunicación previa al ayuntamiento. Si la instalación no altera la estructura del edificio y es desmontable, suele ser suficiente. CostaGlass te asesora en todos los trámites necesarios.`,
    },
    {
      question: `¿Cuánto cuesta instalar cerramientos de cristal en ${city}?`,
      answer: `El precio de los cerramientos de cristal en ${city} varía según el tamaño, tipo de vidrio y sistema elegido. Solicita un presupuesto sin compromiso a CostaGlass para obtener un precio exacto a medida.`,
    },
    {
      question: `¿Qué tipos de cerramientos de cristal ofrece CostaGlass en ${city}?`,
      answer: `En ${city} instalamos cortinas de cristal sin perfiles (panorámicas), cerramientos con perfiles de aluminio y sistemas combinados. Todos nuestros productos cuentan con vidrio de seguridad templado o laminado.`,
    },
  ],
  'pergolas-bioclimaticas': (city) => [
    {
      question: `¿Qué ventajas tiene una pérgola bioclimática en ${city}?`,
      answer: `Una pérgola bioclimática en ${city} te permite disfrutar de tu terraza en cualquier época del año. Sus lamas orientables regulan la entrada de luz y ventilación, y pueden equiparse con cerramiento lateral, calefacción y iluminación LED.`,
    },
    {
      question: `¿Necesito permiso para instalar una pérgola bioclimática en ${city}?`,
      answer: `En la mayoría de los casos en ${city} es necesaria una licencia de obra menor. CostaGlass gestiona los trámites administrativos y garantiza que la instalación cumpla la normativa urbanística local.`,
    },
    {
      question: `¿Cuánto tiempo tarda la instalación de una pérgola bioclimática en ${city}?`,
      answer: `El tiempo de instalación en ${city} depende del tamaño del proyecto, pero habitualmente oscila entre 1 y 3 días laborables para una pérgola estándar. Nuestro equipo trabaja con mínimas molestias para el cliente.`,
    },
  ],
  'paraviento-de-cristal': (city) => [
    {
      question: `¿Qué es un paraviento de cristal y para qué sirve en ${city}?`,
      answer: `Un paraviento de cristal en ${city} es una mampara de vidrio templado que protege terrazas y espacios exteriores del viento sin bloquear las vistas. Es ideal para el clima de la Costa del Sol, donde las brisas pueden ser intensas.`,
    },
    {
      question: `¿Se puede instalar un paraviento de cristal en cualquier terraza en ${city}?`,
      answer: `Sí, los paravientos de cristal de CostaGlass se fabrican a medida para adaptarse a cualquier geometría de terraza en ${city}, tanto en viviendas particulares como en establecimientos hosteleros.`,
    },
    {
      question: `¿Qué mantenimiento requiere un paraviento de cristal en ${city}?`,
      answer: `Los paravientos de cristal son muy fáciles de mantener en ${city}. Basta con una limpieza periódica con agua y limpiacristales. Los herrajes de acero inoxidable y aluminio son resistentes a la corrosión marina.`,
    },
  ],
};

// Build the JSON-LD script block for a given city and product
function buildSchemaMarkup(city, product) {
  const pageUrl = `https://costaglass.com/${product.id}-${city.toLowerCase()}/`;

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'CostaGlass',
    url: 'https://costaglass.com',
    telephone: '+34 951 074 067',
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: 'Málaga',
      addressCountry: 'ES',
    },
    areaServed: city,
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: productDescriptions[product.id](city),
    brand: {
      '@type': 'Brand',
      name: 'CostaGlass',
    },
    url: pageUrl,
  };

  const faqs = productFAQs[product.id](city);
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const schemas = [localBusiness, productSchema, faqPage];
  return `\n<script type="application/ld+json">\n${JSON.stringify(schemas, null, 2)}\n</script>`;
}

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

    // Inject JSON-LD schema markup just before </head>
    const schemaBlock = buildSchemaMarkup(city, product);
    newHTML = newHTML.replace('</head>', `${schemaBlock}\n</head>`);

    // Save the physical index.html file
    const filePath = path.join(folderPath, 'index.html');
    fs.writeFileSync(filePath, newHTML);

    console.log(`✅ Generated: /${slug}`);
  });
});
