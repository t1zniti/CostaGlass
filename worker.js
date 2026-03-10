export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Dictionary of all old WordPress URLs mapped to the new Astro routes
    const redirects = {
      // General / Homepage aliases
      '/home/': '/',
      '/home2/': '/',
      '/inicio/': '/',
      '/Inicio': '/',

      // Contact
      '/contacto': '/contact/',
      '/contacto/': '/contact/',
      '/contact.html': '/contact/',

      // Company
      '/empresa/': '/company/',
      '/empresa-old/': '/company/',
      '/servicios/': '/company/',
      '/distribuidores': '/company/',
      '/blog/distribuidores/': '/company/',

      // Products: Cortinas de Cristal
      '/cortina-de-cristal/': '/cortinas-de-cristal/',
      '/cortina-de-cristal-corredera/': '/cortinas-de-cristal/',
      '/cortinas-de-cristal-sin-perfiles/': '/cortinas-de-cristal/',
      '/cortinas-de-cristal-fotos/': '/cortinas-de-cristal/',
      '/cortinas-de-cristal-para-balcones/': '/cortinas-de-cristal/',
      '/cortinas-de-cristal-problemas/': '/cortinas-de-cristal/',
      '/cortinas-de-cristal/corredera/': '/cortinas-de-cristal/',
      '/cortinas-de-cristal/plegable/': '/cortinas-de-cristal/',
      '/cortinas-de-cristal/terrazas/': '/cortinas-de-cristal/',
      '/cortinas-de-cristal/sabinillas/': '/cortinas-de-cristal/',
      '/cortinas-para-cristales-de-ventanas/': '/cortinas-de-cristal/',
      '/cortinas-vidrio-una-gran-vista/': '/cortinas-de-cristal/',
      '/cortinas-de-': '/cortinas-de-cristal/',
      '/tipos-de-cortinas-de-cristal/': '/cortinas-de-cristal/',
      '/tipos-instalacion-cortinas': '/cortinas-de-cristal/',
      '/empresas-de-cortinas-de-cristal/': '/cortinas-de-cristal/',
      '/accesorios-cortinas-cristal/': '/cortinas-de-cristal/',
      '/comprar-juntas-de-cristal/': '/cortinas-de-cristal/',
      '/mantenimiento-cortinas-cristal/': '/cortinas-de-cristal/',
      '/problemas-comunes-instalacion-cortinas-vidrio/': '/cortinas-de-cristal/',
      '/beneficios-las-cortinas-cristal/': '/cortinas-de-cristal/',
      '/opiniones-de-las-cortinas-de-cristal': '/cortinas-de-cristal/',
      '/opiniones-de-las-cortinas-de-cristal/': '/cortinas-de-cristal/',
      '/acristalamiento-sin-perfiles-piscina/': '/cortinas-de-cristal/',
      '/acristalamientos-en-chalets-y-villas/': '/cortinas-de-cristal/',
      '/cortina-zip/': '/toldo-zip/',
      '/la-luz-cristal/': '/cortinas-de-cristal/',

      // Products: Cerramientos → Cortinas
      '/cerramientos-de-terrazas/': '/cortinas-de-cristal/',
      '/cerramientos-de-terrazas-cristal/': '/cortinas-de-cristal/',
      '/cerramientos-para-balcones/': '/cortinas-de-cristal/',
      '/cerramientos-para-balconess/': '/cortinas-de-cristal/',
      '/cerramientos-de-balcones-de-cristal/': '/cortinas-de-cristal/',
      '/cerramientos-de-cristal/cerramientos-de-terrazas/': '/cortinas-de-cristal/',
      '/cerramientos-de-jardin-baratos/': '/cortinas-de-cristal/',
      '/cerramientos-de-jardines/': '/cortinas-de-cristal/',
      '/cerramientos-de-aluminio-para-balcones-precios/': '/blog-posts/precios-de-cerramientos-de-aluminio/',
      '/fotos-de-cerramientos-de-terrazas/': '/cortinas-de-cristal/',
      '/tipos-de-cerramientos-para-jardines/': '/cortinas-de-cristal/',
      '/los-cerramientos-terraza-adecuados/': '/cortinas-de-cristal/',
      '/seguridad-en-cerramientos-para-terrazas-y-espacios-abiertos/': '/cortinas-de-cristal/',
      '/que-son-los-cerramientos-interiores-de-cristal/': '/cortinas-de-cristal/',
      '/como-cerrar-un-balcon-sin-obra/': '/blog-posts/como-cerrar-una-terraza-sin-obra/',

      // Products: Guillotina
      '/guillotina-de-cristal-old/': '/guillotina-de-cristal/',
      '/guillotine/': '/guillotina-de-cristal/',
      '/magnifico-guillotina-fotos/': '/guillotina-de-cristal/',
      '/guillotina-de-cristal/san-pedro/': '/guillotina-de-cristal/',

      // Products: Pérgolas
      '/bioclimatico/': '/pergolas-bioclimaticas/',
      '/pergola-bioclimatica/': '/pergolas-bioclimaticas/',
      '/pergola-bioclimatica-precio': '/pergolas-bioclimaticas/',
      '/pergola-bioclimatica-precio/': '/pergolas-bioclimaticas/',
      '/pergola-bioclimatica-retractil/': '/retractable-pvc-roof/',
      '/pergola-motorizada/': '/pergolas-bioclimaticas/',
      '/pergola-rail-awing/': '/retractable-pvc-roof/',
      '/pergola-toldo-corredero/': '/retractable-pvc-roof/',
      '/pergolas-bioclimaticas/san-pedro/': '/pergolas-bioclimaticas/',
      '/8-inconvenientes-de-las-pergolas-bioclimaticas': '/pergolas-bioclimaticas/',
      '/8-inconvenientes-de-las-pergolas-bioclimaticas/': '/pergolas-bioclimaticas/',
      '/techos-costaglass/': '/retractable-pvc-roof/',
      '/ideas-techos-para-terrazas/': '/retractable-pvc-roof/',

      // Products: Paraviento
      '/paraviento-de-cristal/san-pedro/': '/paraviento-de-cristal/',

      // Products: Barandillas
      '/barandillas-de-acero-inoxidable-y-cristal': '/',
      '/barandillas-de-acero-inoxidable-y-cristal/': '/',
      '/barandillas-de-acero-inoxidable-y-cristal-precio/': '/',
      '/barandillas-y-escaleras/': '/',
      '/balaustradas-de-acero-y-cristal-en-interiores-y-exteriores/': '/',
      '/glass-balustrades/': '/',

      // Blog posts
      '/cerramientos-de-terrazas-cristal-precio-m2': '/blog-posts/cerramientos-de-terrazas-cristal-precio-m2/',
      '/cerramientos-de-terrazas-cristal-precio-m2/': '/blog-posts/cerramientos-de-terrazas-cristal-precio-m2/',
      '/como-cerrar-una-terraza-sin-obra/': '/blog-posts/como-cerrar-una-terraza-sin-obra/',
      '/cortinas-de-cristal-inconvenientes': '/blog-posts/cortinas-de-cristal-inconvenientes/',
      '/cortinas-de-cristal-inconvenientes/': '/blog-posts/cortinas-de-cristal-inconvenientes/',
      '/precios-de-cerramientos-de-aluminio/': '/blog-posts/precios-de-cerramientos-de-aluminio/',
      '/recambios-para-cortinas-de-cristal/': '/blog-posts/recambios-para-cortinas-de-cristal/',
      '/ideas-para-decorar-terrazas-barato/': '/blog/',
      '/12-ideas-de-decoracion-para-tu-terraza-en-navidad/': '/blog/',
      '/12-ideas-para-balcones-pequenos/': '/blog/',
      '/reducir-los-problemas-salud-la-oficina-usando-cortinas-vidrio/': '/blog/',

      // Blog archive / date URLs
      '/2017/05/08/': '/blog/',
      '/2017/06/': '/blog/',
      '/2018/01/09/': '/blog/',
      '/2018/03/': '/blog/',
      '/2018/10/': '/blog/',
      '/2019/05/': '/blog/',
      '/2019/08/': '/blog/',
      '/2019/09/': '/blog/',
      '/2019/11/': '/blog/',
      '/2024/03/11/': '/blog/',
      '/2024/08/28/': '/blog/',
      '/2026/01/31/': '/blog/',
      '/blogs/page2/': '/blog/',
      '/blogs/page3/': '/blog/',
      '/blogs/page5/': '/blog/',
      '/author/ahmed/': '/blog/',

      // WordPress categories
      '/category/cerramientos-para-empresas/': '/blog/',
      '/category/cerramientos-para-particulares/': '/blog/',
      '/category/home/': '/',
      '/category/products/': '/',
      '/category/services/': '/company/',
      '/category/servicios/': '/company/',

      // Legal
      '/politica-de-cookies': '/politica-de-cookies/',

      // English /en/ URLs
      '/en': '/',
      '/en/': '/',
      '/en/home': '/',
      '/en/home/': '/',
      '/en/home2/': '/',
      '/en/contact-us': '/contact/',
      '/en/contact-us/': '/contact/',
      '/en/en/contact-us/': '/contact/',
      '/en/distributors/': '/company/',
      '/en/glass-curtain-walls/': '/cortinas-de-cristal/',
      '/en/glass-curtain-for-great-view/': '/cortinas-de-cristal/',
      '/en/glass-curtain-inconveniences/': '/blog-posts/cortinas-de-cristal-inconvenientes/',
      '/en/glass-curtains-cost/': '/cortinas-de-cristal/',
      '/en/glass-seals/': '/cortinas-de-cristal/',
      '/en/glass-terrace-enclosures-price-per-m2/': '/blog-posts/cerramientos-de-terrazas-cristal-precio-m2/',
      '/en/cortina-de-cristal-corredera/': '/cortinas-de-cristal/',
      '/en/cortinas-de-cristal-para-balcones/': '/cortinas-de-cristal/',
      '/en/cerramientos-de-terrazas/': '/cortinas-de-cristal/',
      '/en/cerramientos-de-terrazas-cristal-precio-m2/': '/blog-posts/cerramientos-de-terrazas-cristal-precio-m2/',
      '/en/cerramientos-de-aluminio-para-balcones-precios/': '/blog-posts/precios-de-cerramientos-de-aluminio/',
      '/en/accesorios-cortinas-cristal/': '/cortinas-de-cristal/',
      '/en/opiniones-de-las-cortinas-de-cristal/': '/cortinas-de-cristal/',
      '/en/guillotine-style-glass/': '/guillotina-de-cristal/',
      '/en/guillotine/': '/guillotina-de-cristal/',
      '/en/ventanas-de-guillotina/': '/guillotina-de-cristal/',
      '/en/ventanas-de-guillotina-precio/': '/guillotina-de-cristal/',
      '/en/bioclimatic/': '/pergolas-bioclimaticas/',
      '/en/pergola-bioclimatica/': '/pergolas-bioclimaticas/',
      '/en/pergola-bioclimatica-retractil/': '/retractable-pvc-roof/',
      '/en/pergola-toldo-corredero/': '/retractable-pvc-roof/',
      '/en/retractable-pvc-roof/': '/retractable-pvc-roof/',
      '/en/zip-screen/': '/toldo-zip/',
      '/en/barandillas-de-acero-inoxidable-y-cristal/': '/',
      '/en/barandillas-de-acero-inoxidable-y-cristal-precio/': '/',
      '/en/balaustradas-de-acero-y-cristal-en-interiores-y-exteriores/': '/',
      '/en/uncategorized-en/': '/blog/',

      // English /en-eu/ URLs
      '/en-eu/home': '/',
      '/en-eu/home/': '/',
      '/en-eu/contact-us/': '/contact/',
      '/en-eu/company/': '/company/',
      '/en-eu/distributors/': '/company/',
      '/en-eu/glass-curtain-walls/': '/cortinas-de-cristal/',
      '/en-eu/glass-curtains-sophistication/': '/cortinas-de-cristal/',
      '/en-eu/accesorios-cortinas-cristal/': '/cortinas-de-cristal/',
      '/en-eu/guillotine-style-glass/': '/guillotina-de-cristal/',
      '/en-eu/bioclimatic/': '/pergolas-bioclimaticas/',
      '/en-eu/retractable-pvc-roof/': '/retractable-pvc-roof/',
      '/en-eu/zip-screen/': '/toldo-zip/',

      // English root-level slugs
      '/glass-curtain-for-great-view/': '/cortinas-de-cristal/',
      '/frameless-glazing-for-your-pool-side/': '/cortinas-de-cristal/',
      '/frameless-glazing-partitioning-systems-for-offices/': '/cortinas-de-cristal/',
      '/the-advantages-of-frameless-glazing-system/': '/cortinas-de-cristal/'
    };

    // 1. Try to find an exact match for the pathname first
    let target = redirects[pathname];

    // 2. If no exact match, try checking if the version with a trailing slash matches
    if (!target && !pathname.endsWith('/')) {
      target = redirects[pathname + '/'];
    }

    // 3. If a redirect exists for this path, send a 301
    if (target) {
      const targetUrl = new URL(target, url.origin);
      return Response.redirect(targetUrl.toString(), 301);
    }

    // 4. Otherwise, continue loading the normal site normally
    return fetch(request);
  },
};
