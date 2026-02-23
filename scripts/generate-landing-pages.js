const fs = require('fs');
const path = require('path');

const cities = [
    'Marbella',
    'Estepona',
    'Fuengirola',
    'Mijas',
    'Benalmádena',
    'Sotogrande',
    'Manilva',
    'Torremolinos',
    'Nerja',
    'Málaga'
];

const products = [
    {
        id: 'pergolas-bioclimaticas',
        name: 'Pérgolas Bioclimáticas',
        sourceFile: 'bioclimatic.html',
        complementary: { name: 'Cortinas de Cristal', url: '../../cortinas-de-cristal/index.html' }
    },
    {
        id: 'cortinas-de-cristal',
        name: 'Cortinas de Cristal',
        sourceFile: 'glass-curtain-walls.html',
        complementary: { name: 'Pérgolas Bioclimáticas', url: '../../pergolas-bioclimaticas/index.html' }
    },
    {
        id: 'guillotina-de-cristal',
        name: 'Guillotina de Cristal',
        sourceFile: 'guillotine-glass.html',
        complementary: { name: 'Techos Retráctiles', url: '../../techos-retractiles/index.html' }
    },
    {
        id: 'toldos-zip',
        name: 'Toldos Zip',
        sourceFile: 'zip-screen.html',
        complementary: { name: 'Pérgolas Bioclimáticas', url: '../../pergolas-bioclimaticas/index.html' }
    },
    {
        id: 'techos-retractiles',
        name: 'Sistemas de Techo Retráctil',
        sourceFile: 'retractable-pvc-roof.html',
        complementary: { name: 'Cortinas de Cristal', url: '../../cortinas-de-cristal/index.html' }
    },
    {
        id: 'paravientos-de-cristal',
        name: 'Paravientos de Cristal',
        sourceFile: 'paravientos-de-cristal.html',
        complementary: { name: 'Toldos Zip', url: '../../toldos-zip/index.html' }
    }
];

function slugify(text) {
    return text.toString().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function generateFAQ(productName, city) {
    const faqs = [
        {
            question: `¿Cuánto cuesta instalar ${productName.toLowerCase()} en ${city}?`,
            answer: `El precio de instalar ${productName.toLowerCase()} en ${city} depende de las medidas, el tipo de cristal o material y las características específicas de su terraza o negocio. Como fabricantes e instaladores directos en la Costa del Sol, ofrecemos presupuestos a medida sin compromiso y con la mejor relación calidad-precio.`
        },
        {
            question: `¿Son resistentes al viento y al clima de la Costa del Sol?`,
            answer: `Sí, nuestros sistemas están diseñados específicamente para soportar las condiciones climáticas de la Costa del Sol, incluyendo la brisa marina, la humedad y los fuertes vientos. Utilizamos materiales de alta resistencia y aluminio con tratamientos especiales anticorrosión.`
        },
        {
            question: `¿Necesito permiso de la comunidad en ${city} para la instalación?`,
            answer: `En la mayoría de los casos, al ser sistemas sin perfiles verticales (como las cortinas de cristal) o estructuras desmontables, no alteran la estética de la fachada y suelen ser aprobados fácilmente. No obstante, siempre recomendamos consultar los estatutos de su comunidad en ${city}.`
        }
    ];

    const faqHtml = `
    <section class="faq-section" style="padding: 4rem 0; background-color: #f9fafb;">
        <div class="container">
            <div class="section-header text-center fade-up" style="margin-bottom: 3rem;">
                <span class="section-tag">Preguntas Frecuentes</span>
                <h2>Dudas sobre ${productName} en ${city}</h2>
            </div>
            <div class="faq-grid" style="max-width: 800px; margin: 0 auto;">
                ${faqs.map(faq => `
                <div class="faq-item fade-up" style="background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: #1f2937;">${faq.question}</h3>
                    <p style="color: #4b5563; line-height: 1.6;">${faq.answer}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return { faqHtml, faqSchema: JSON.stringify(faqSchema) };
}

function generateLocalizedBlock(productName, city, product) {
    return `
    <section class="localized-seo-block" style="padding: 4rem 0; background-color: #ffffff;">
        <div class="container">
            <div class="product-content-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;">
                <div class="localized-text fade-left">
                    <span class="section-tag">Servicio Local en ${city}</span>
                    <h2>Fabricantes de ${productName} en ${city} y la Costa del Sol</h2>
                    <p>En CostaGlass somos <strong>fabricantes e instaladores directos</strong> de ${productName.toLowerCase()} en ${city}. Entendemos perfectamente el clima de la Costa del Sol: el sol intenso, la brisa marina y los días de viento. Por eso, nuestras soluciones están fabricadas a medida con materiales de <strong>alta resistencia para zonas costeras</strong>.</p>
                    <p>Aprovecha tu terraza, porche o balcón durante todo el año. Ya sea para tu hogar o para tu negocio de hostelería en ${city}, te ofrecemos un servicio integral sin intermediarios.</p>
                    <ul style="list-style: none; padding: 0; margin-top: 1.5rem;">
                        <li style="margin-bottom: 0.5rem;">✓ Instalación rápida y profesional en ${city}</li>
                        <li style="margin-bottom: 0.5rem;">✓ Materiales resistentes a la corrosión marina</li>
                        <li style="margin-bottom: 0.5rem;">✓ Presupuesto a medida sin compromiso</li>
                    </ul>
                    <div style="margin-top: 2rem;">
                        <a href="../../contact.html" class="btn btn-primary" style="margin-right: 1rem;">Solicitar Presupuesto</a>
                        <a href="../../${product.sourceFile}" class="btn btn-outline">Ver detalles del producto</a>
                    </div>
                    <p style="margin-top: 1.5rem; font-size: 0.9rem; color: #6b7280;">
                        ¿Buscas otra solución? Descubre también nuestras <a href="${product.complementary.url}" style="color: #2563eb; text-decoration: underline;">${product.complementary.name}</a>.
                    </p>
                </div>
                <div class="localized-image fade-right" style="border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <!-- Using a generic high-quality placeholder or reusing an existing image -->
                    <img src="../../Assets/products/glass curtain walls/5-1-768x436.jpg" alt="Instalación de ${productName} en ${city} por CostaGlass" style="width: 100%; height: auto; display: block;">
                </div>
            </div>
        </div>
    </section>`;
}

function processTemplate(html, product, city) {
    const citySlug = slugify(city);
    
    // 1. Update lang attribute
    html = html.replace(/<html lang="[^"]*"/, '<html lang="es-ES"');
    
    // 2. Update Title
    html = html.replace(/<title>.*?<\/title>/, `<title>${product.name} en ${city} | CostaGlass Costa del Sol</title>`);
    
    // 3. Update Meta Description
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="Fabricante e instalador de ${product.name.toLowerCase()} en ${city}, Costa del Sol. Soluciones a medida de alta resistencia para disfrutar de tu terraza todo el año.">`);
    
    // 4. Update H1
    html = html.replace(/<h1>.*?<\/h1>/, `<h1>${product.name} en ${city} – CostaGlass</h1>`);
    
    // 5. Fix relative paths (since we are 2 levels deep: /product-slug/city-slug/index.html)
    // Replace ./Assets/ with ../../Assets/
    html = html.replace(/(href|src)="(\.\/)?Assets\//g, '$1="../../Assets/');
    // Replace ./css/ with ../../css/
    html = html.replace(/(href|src)="(\.\/)?css\//g, '$1="../../css/');
    // Replace ./js/ with ../../js/
    html = html.replace(/(href|src)="(\.\/)?js\//g, '$1="../../js/');
    // Replace links to root html files
    html = html.replace(/href="([a-zA-Z0-9-]+\.html)"/g, 'href="../../$1"');
    
    // 6. Inject Localized Block and FAQ
    const localizedBlock = generateLocalizedBlock(product.name, city, product);
    const { faqHtml, faqSchema } = generateFAQ(product.name, city);
    
    // Inject before CTA section
    if (html.includes('<!-- CTA -->')) {
        html = html.replace('<!-- CTA -->', `${localizedBlock}\n${faqHtml}\n<!-- CTA -->`);
    } else if (html.includes('</main>')) {
        html = html.replace('</main>', `${localizedBlock}\n${faqHtml}\n</main>`);
    } else {
        // Fallback: inject before footer
        html = html.replace('<!-- Footer -->', `${localizedBlock}\n${faqHtml}\n<!-- Footer -->`);
    }
    
    // 7. Inject JSON-LD Schema
    const schemaScript = `\n    <script type="application/ld+json">\n    ${faqSchema}\n    </script>\n</head>`;
    html = html.replace('</head>', schemaScript);
    
    return html;
}

async function main() {
    const rootDir = path.join(__dirname, '..');
    
    for (const product of products) {
        const sourcePath = path.join(rootDir, product.sourceFile);
        
        if (!fs.existsSync(sourcePath)) {
            console.warn(`Source file not found: ${sourcePath}`);
            continue;
        }
        
        const sourceHtml = fs.readFileSync(sourcePath, 'utf-8');
        
        for (const city of cities) {
            const citySlug = slugify(city);
            const targetDir = path.join(rootDir, product.id, citySlug);
            
            // Create directory if it doesn't exist
            fs.mkdirSync(targetDir, { recursive: true });
            
            const targetHtml = processTemplate(sourceHtml, product, city);
            const targetPath = path.join(targetDir, 'index.html');
            
            fs.writeFileSync(targetPath, targetHtml);
            console.log(`Created: ${product.id}/${citySlug}/index.html`);
        }
    }
    
    console.log('All landing pages generated successfully!');
}

main().catch(console.error);
