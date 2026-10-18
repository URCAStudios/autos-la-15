import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { assignCarPresentationOrder } from './lib/assign-car-presentation-order.mjs';

const requiredEnv = ['SANITY_PROJECT_ID', 'SANITY_TOKEN', 'SANITY_DATASET', 'SANITY_API_VERSION'];

for (const name of requiredEnv) {
  if (!process.env[name]?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION,
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

const vehicles = [
  {
    id: 'car-chevrolet-cruze-2014',
    name: 'Chevrolet Cruze 2014',
    image: 'cruze-2014.jpg',
    year: 2014,
    price: 10500,
    description:
      'Sedán negro con motor 1.8 L y 107 mil km. Cuenta con servicio reciente al cuerpo de aceleración y bujías, batería reemplazada, cauchos en muy buen estado, pintura de hace un año y tren delantero nuevo. Título 3–1.',
    featured: false,
  },
  {
    id: 'car-chevrolet-cruze-2015',
    name: 'Chevrolet Cruze 2015',
    image: 'cruze-2015.jpg',
    year: 2015,
    price: 13000,
    description:
      'Sedán negro con motor 1.8 L y 129 mil km. Está muy conservado, con pintura, cauchos, aire acondicionado y tapicería en excelentes condiciones. Incluye caucho de repuesto y herramientas. Título 3–1.',
    featured: false,
  },
  {
    id: 'car-ford-fiesta-titanium-2015',
    name: 'Ford Fiesta Titanium 2015',
    image: 'fiesta-2015.jpg',
    year: 2015,
    price: 12500,
    description:
      'Una alternativa económica y bien cuidada, con motor 1.6 L y 97 mil km. Conserva en muy buen estado la pintura, tapicería, aire acondicionado y cauchos. Título 3–1.',
    featured: false,
  },
  {
    id: 'car-ford-fiesta-titanium-2016',
    name: 'Ford Fiesta Titanium 2016',
    image: 'fiesta-2016.jpg',
    year: 2016,
    price: 14000,
    description:
      'De único dueño, con motor 1.6 L y 119 mil km. Fue recién pintado y se encuentra muy conservado. Incluye certificado de origen, factura de compra, caucho de repuesto y herramientas.',
    featured: false,
  },
  {
    id: 'car-ford-explorer-xlt-2011',
    name: 'Ford Explorer XLT 2011',
    image: 'explorer-xlt-2011.jpg',
    year: 2011,
    price: 13700,
    description:
      'Camioneta 4x2 con 137 mil km, cuatro cauchos nuevos y buena pintura. Mantiene su tapicería original en muy buen estado. Título 2–1.',
    featured: false,
  },
  {
    id: 'car-ford-explorer-limited-2016',
    name: 'Ford Explorer Limited 2016',
    image: 'explorer-limited-2016.jpg',
    year: 2016,
    price: 27000,
    description:
      'SUV amplia y potente con 165 mil km. Su versión Limited ofrece comodidad, espacio para la familia y un equipamiento completo.',
    featured: false,
  },
  {
    id: 'car-jac-t8-2026',
    name: 'JAC T8 2026',
    image: 'jac-t8-2026.jpg',
    year: 2026,
    price: 37000,
    description:
      'Pickup 0 km, fuerte y completa de fábrica. Ofrece garantía full, interior amplio y tecnología actual para trabajo o paseo.',
    badge: '0 KM',
    featured: true,
    order: 1,
  },
  {
    id: 'car-hyundai-grand-i10-2026',
    name: 'Hyundai Grand i10 2026',
    image: 'hyundai-i10-2026.jpg',
    year: 2026,
    price: 23800,
    description:
      'Con solo 1.000 km, ofrece una experiencia casi nueva, bajo consumo y facilidad para moverse y estacionar. Título 1–1 y más de un año de garantía.',
    featured: false,
  },
  {
    id: 'car-toyota-agya-2025',
    name: 'Toyota Agya 2025',
    image: 'toyota-agya-2025.jpg',
    year: 2025,
    price: 25300,
    description:
      'Compacto por fuera y cómodo por dentro, con consumo eficiente. Es blanco, está 0 km y cuenta con garantía de fábrica.',
    badge: '0 KM',
    featured: true,
    order: 2,
  },
  {
    id: 'car-hyundai-santa-fe-2017',
    name: 'Hyundai Santa Fe 2017',
    image: 'santa-fe-2017.jpg',
    year: 2017,
    price: 33000,
    description:
      'De único dueño, con 44 mil km, color blanco, motor 3.3 L, seis cilindros y tracción 4x4. Está como nueva por dentro y por fuera, con equipamiento completo.',
    featured: true,
    order: 3,
  },
  {
    id: 'car-toyota-hiace-2009',
    name: 'Toyota Hiace 2009',
    image: 'toyota-hiace-2009.jpg',
    year: 2009,
    price: 22000,
    description:
      'Van de carga con 433 mil km y motor recién hecho. Es una opción rentable y fácil de mantener, con buena reventa. Título 2–1.',
    featured: false,
  },
  {
    id: 'car-mitsubishi-outlander-gls-2025',
    name: 'Mitsubishi Outlander GLS 2025',
    image: 'outlander-2025.jpg',
    year: 2025,
    price: 60000,
    description:
      'SUV premium blanca, con motor 2.5 L, tres filas para siete pasajeros y 32 mil km. Es de único dueño y combina comodidad, seguridad y tecnología actual.',
    featured: true,
    order: 4,
  },
];

const editorialAssets = [
  {
    key: 'heroImage',
    image: 'hero.jpg',
    alt: 'Fachada de Autos La 15 con vehículos en exhibición al atardecer',
  },
  {
    key: 'historyImage',
    image: 'who-are-we-section.jpg',
    alt: 'Fachada de Autos La 15 en Maracaibo con vehículos en exhibición',
  },
  {
    key: 'logoImage',
    image: 'logo.png',
    alt: 'Logo de AUTOS LA 15',
    contentType: 'image/png',
  },
];

const formatPrice = (price) => `$${price.toLocaleString('en-US')}`;

const loadAssets = async () => {
  const loaded = [];

  for (const vehicle of vehicles) {
    const sourcePath = fileURLToPath(new URL(`../provisional/assets/autos/${vehicle.image}`, import.meta.url));
    let buffer;

    try {
      buffer = await readFile(sourcePath);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Missing required provisional image: ${sourcePath}`);
      }
      throw error;
    }

    loaded.push({
      ...vehicle,
      sourcePath,
      buffer,
      sha1: createHash('sha1').update(buffer).digest('hex'),
    });
  }

  return loaded;
};

const loadEditorialAssets = async () => {
  const loaded = [];

  for (const editorialAsset of editorialAssets) {
    const sourcePath = fileURLToPath(new URL(`../provisional/assets/img/${editorialAsset.image}`, import.meta.url));
    let buffer;

    try {
      buffer = await readFile(sourcePath);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Missing required provisional image: ${sourcePath}`);
      }
      throw error;
    }

    loaded.push({
      ...editorialAsset,
      sourcePath,
      buffer,
      sha1: createHash('sha1').update(buffer).digest('hex'),
    });
  }

  return loaded;
};

const getOrUploadImage = async ({ image, buffer, sha1, contentType }) => {
  const existingAssetId = await client.fetch(
    '*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]._id',
    { sha1 },
  );

  if (existingAssetId) {
    return { assetId: existingAssetId, uploaded: false };
  }

  const asset = await client.assets.upload('image', buffer, {
    filename: image,
    contentType: contentType ?? 'image/jpeg',
  });

  return { assetId: asset._id, uploaded: true };
};

const seedCar = async (vehicle, assetId) => {
  const document = {
    _id: vehicle.id,
    _type: 'car',
    title: vehicle.name,
    name: vehicle.name,
    year: vehicle.year,
    price: vehicle.price,
    description: vehicle.description,
    images: [
      {
        _key: 'primary',
        _type: 'image',
        asset: { _type: 'reference', _ref: assetId },
        alt: `${vehicle.name}, vehículo disponible en Autos La 15`,
      },
    ],
    status: 'available',
    featured: vehicle.featured,
    whatsappMessage: `Hola Autos La 15, me interesa el ${vehicle.name} (${formatPrice(vehicle.price)}). ¿Me comparten más información?`,
  };

  if (vehicle.badge) {
    document.badge = vehicle.badge;
  }

  if (typeof vehicle.order === 'number') {
    document.order = vehicle.order;
  }

  await client.createOrReplace(document);
};

const seedSiteSettings = async ({ logoAssetId }) => {
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    identity: {
      brandName: 'AUTOS LA 15',
      tagline: 'Compra con claridad. Vende con confianza.',
      logo: {
        _type: 'image',
        asset: { _type: 'reference', _ref: logoAssetId },
        alt: 'Logo de AUTOS LA 15',
      },
    },
    contact: {
      phone: '+58 412-6916722',
      whatsapp: '+584126916722',
      email: 'autosla15ca@gmail.com',
    },
    hours: [
      { _key: 'weekdays', label: 'Lunes a viernes', opening: '8:30 a. m.', closing: '5:00 p. m.' },
      { _key: 'saturday', label: 'Sábados', opening: '9:00 a. m.', closing: '1:00 p. m.' },
    ],
    locations: [
      {
        _key: 'maracaibo',
        city: 'Maracaibo',
        address: 'Av. 15 Las Delicias con Calle 88A',
        mapUrl: 'https://www.google.com/maps?q=10.6533428,-71.6195227',
      },
      {
        _key: 'ciudad-ojeda',
        city: 'Ciudad Ojeda',
        address: 'Atención en Ciudad Ojeda. Consulta la ubicación al coordinar tu visita.',
      },
    ],
    socialLinks: {
      instagram: 'https://instagram.com/autosla15/',
    },
    navigation: {
      mainLinks: [
        { _key: 'nav-history', label: 'Nuestra historia', href: '#nosotros' },
        { _key: 'nav-catalog', label: 'Vehículos', href: '#catalogo' },
        { _key: 'nav-testimonials', label: 'Opiniones', href: '#testimonios' },
        { _key: 'nav-faq', label: 'Preguntas', href: '#faq' },
        { _key: 'nav-contact', label: 'Contacto', href: '#contacto' },
      ],
      whatsappButtonLabel: 'Hablar por WhatsApp',
    },
    footer: {
      links: [
        { _key: 'footer-history', label: 'Nuestra historia', href: '#nosotros' },
        { _key: 'footer-catalog', label: 'Vehículos', href: '#catalogo' },
        { _key: 'footer-testimonials', label: 'Opiniones', href: '#testimonios' },
        { _key: 'footer-faq', label: 'Preguntas', href: '#faq' },
        { _key: 'footer-contact', label: 'Contacto', href: '#contacto' },
      ],
      whatsappActionLabel: 'Hablar por WhatsApp',
      instagramActionLabel: 'Ver Instagram',
      copyright: '© {year} {brand}. Todos los derechos reservados.',
    },
    messaging: {
      defaultWhatsappMessage: 'Hola AUTOS LA 15, quiero más información',
      whatsappFabLabel: 'Hablar con {brand} por WhatsApp',
    },
    seo: {
      metaDescription:
        'Desde Maracaibo y Ciudad Ojeda, te acompañamos a comprar o vender tu vehículo con información clara y atención cercana.',
    },
  });
};

const seedHomePage = async ({ heroAssetId, historyAssetId }) => {
  await client.createOrReplace({
    _id: 'homePage',
    _type: 'homePage',
    hero: {
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: heroAssetId },
        alt: 'Fachada de Autos La 15 con vehículos en exhibición al atardecer',
      },
      intro: {
        eyebrow: 'Familia zuliana desde 2005',
        title: 'Compra con claridad. Vende con confianza.',
        lead: 'Desde Maracaibo y Ciudad Ojeda, te acompañamos a comprar o vender tu vehículo con información clara y atención cercana.',
      },
      primaryCta: { label: 'Ver vehículos', href: '#catalogo' },
      secondaryCta: { label: 'Hablar por WhatsApp', href: 'whatsapp', openInNewTab: true },
      scrollHint: 'Ver vehículos disponibles ↓',
    },
    stats: {
      intro: {
        eyebrow: 'Una trayectoria que conoces',
        lead: 'Datos concretos de una familia que trabaja en el Zulia desde 2005.',
      },
      items: [
        { _key: 'stat-year', value: 2005, label: 'Año en que comenzamos' },
        { _key: 'stat-years', value: 20, suffix: '+', label: 'Más de 20 años de trayectoria' },
        { _key: 'stat-cities', value: 2, label: 'Ciudades: Maracaibo y Ciudad Ojeda' },
        { _key: 'stat-papers', value: 100, suffix: '%', label: 'Papeles originales' },
      ],
    },
    history: {
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: historyAssetId },
        alt: 'Fachada de Autos La 15 en Maracaibo con vehículos en exhibición',
      },
      eyebrow: 'Nuestra historia',
      title: 'Una familia que conoce el camino',
      paragraphs: [
        'Somos una empresa familiar que atiende a la comunidad del Zulia desde 2005. Trabajamos en Maracaibo y Ciudad Ojeda, donde hemos visto pasar miles de vehículos y, sobre todo, hemos construido la confianza de miles de familias zulianas.',
        'Empezamos con una idea sencilla: comprar y vender como nos gustaría que nos atendieran, con un proceso claro, opciones atractivas y papeles 100% originales. Esa forma de trabajar sigue guiándonos. Hoy reunimos más de 20 años de experiencia, trato honesto y orientación práctica para que tomes una decisión bien informada.',
      ],
    },
    catalog: {
      intro: {
        eyebrow: 'Vehículos disponibles',
        title: 'Revisa el inventario con calma',
        lead: 'Conoce nuestra selección de vehículos nuevos y usados. Los precios mostrados corresponden a la actualización de septiembre.',
      },
      emptyMessage: 'En este momento no hay vehículos publicados. Escríbenos y te contamos qué está por llegar.',
      note: '¿Quieres vender o dejar tu vehículo en consignación?',
      noteLinkLabel: 'Conoce el proceso',
      noteLinkHref: '#faq',
      vehiclePrimaryButton: 'Consultar vehículo',
      vehicleSecondaryButton: 'Agendar visita',
    },
    testimonials: {
      intro: {
        eyebrow: 'Experiencias de quienes nos eligieron',
        title: 'La confianza también se cuenta',
      },
      featured: {
        quote:
          'Excelente atención en este concesionario. Compré mi Super Duty y el trato fue impecable de inicio a fin. Rápidos, claros y muy profesionales. Sin duda, volvería a comprar aquí. Totalmente recomendados.',
        author: 'Alfredo Gutiérrez',
        dateLabel: 'Mayo 2026',
        rating: 5,
      },
      supporting: [
        {
          _key: 't1',
          quote: 'Encontré el auto perfecto para mi familia. El equipo fue muy paciente y amable con todas mis dudas.',
          author: 'Cliente de Autos LA 15',
          rating: 5,
        },
        {
          _key: 't2',
          quote: 'Vendí mi usado y me dieron un precio justo. La transacción fue rápida y segura. Gracias por todo.',
          author: 'Cliente de Autos LA 15',
          rating: 5,
        },
        {
          _key: 't3',
          quote: 'Amplia variedad de modelos y con opciones de financiamiento. Logré comprar mi primer auto con facilidades.',
          author: 'Cliente de Autos LA 15',
          rating: 5,
        },
      ],
    },
    faq: {
      intro: {
        eyebrow: 'Información para decidir',
        title: 'Antes de comprar o vender',
        lead: 'Aquí tienes respuestas claras sobre financiamiento, garantías, visitas y consignación.',
      },
      sidebarLink: { label: 'Hablar con el equipo', href: '#contacto' },
      items: [
        {
          _key: 'faq-finance',
          question: '¿Tienen opciones de financiamiento?',
          defaultOpen: true,
          answerParagraphs: [
            'Sí. Trabajamos con una financiadora externa al concesionario. Esta financiadora exige una cuota inicial del 60% del monto total y hasta 1 año para pagar el 40% restante. Los principales requisitos son los últimos 6 movimientos bancarios de la cuenta desde donde se financiaría el vehículo, 2 referencias bancarias, 1 referencia personal, la hoja de vida del aplicante y el registro mercantil, solo si el cliente lo posee.',
            'Para financiar, primero debes asegurar el vehículo contra todo riesgo. Nosotros cotizamos la póliza y asistimos en el proceso. También debes instalar un dispositivo GPS durante el tiempo que el vehículo sea financiado, con un costo de $300 al año. Por último, debes asumir el documento de compraventa, con un costo aproximado de $400 que incluye revisión INTT y notaría.',
          ],
        },
        {
          _key: 'faq-warranty',
          question: '¿Qué garantía tiene cada vehículo?',
          answerParagraphs: [
            'El inventario incluye opciones nuevas, seminuevas y usadas. Los carros nuevos tienen garantía, pero los años y el kilometraje varían según cada opción. Las seminuevas pueden conservar una garantía vigente, así que conviene consultar el caso puntual. Las opciones usadas no cuentan con garantía. Recomendamos venir con un mecánico de confianza y hacer una prueba de manejo antes de decidir.',
          ],
        },
        {
          _key: 'faq-visit',
          question: '¿Cómo agendo una visita?',
          answerParagraphs: [
            'Puedes reservar una cita por Instagram o WhatsApp para ver los modelos. Estamos abiertos de lunes a viernes de 8:30am a 5pm y sábados de 9am a 1pm.',
          ],
        },
        {
          _key: 'faq-consign',
          question: '¿Puedo vender o consignar mi vehículo?',
          answerParagraphs: [
            'Sí, manejamos 2 opciones. Puedes traernos tu vehículo y, si nos interesa después de verlo y probarlo, conversamos. Si lo valoramos a un precio justo para ambos, te hacemos una oferta directa. La segunda opción es dejarlo a consignación: lo exhibimos como parte del inventario y cobramos una comisión al venderlo. La comisión varía según el monto del vehículo y se coordina al firmar el contrato.',
          ],
        },
      ],
    },
    contact: {
      title: 'Tu próximo vehículo\nempieza aquí',
      eyebrow: 'Solicita información',
      lead: 'Cuéntanos qué estás buscando, visítanos en Maracaibo o Ciudad Ojeda, o escríbenos directamente por WhatsApp.',
      cards: [
        {
          _key: 'c1',
          number: '01',
          title: 'Compra o vende',
          body: 'Revisa opciones nuevas, seminuevas y usadas, o conversemos sobre tu vehículo.',
          linkLabel: 'Ver vehículos',
          linkHref: '#catalogo',
        },
        {
          _key: 'c2',
          number: '02',
          title: 'Visítanos',
          body: 'Estamos en Maracaibo y Ciudad Ojeda para atenderte durante nuestro horario de atención.',
          showHours: true,
        },
        {
          _key: 'c3',
          number: '03',
          title: 'Consulta al equipo',
          body: 'Pregúntanos sobre vehículos, financiamiento, garantías o consignación.',
          showContactChannels: true,
        },
      ],
      locationHeading: 'Dónde encontrarnos',
      whatsappCtaLabel: 'Hablar por WhatsApp',
      instagramHandle: '@autosla15',
    },
  });
};

const main = async () => {
  const loadedVehicles = await loadAssets();
  const loadedEditorialAssets = await loadEditorialAssets();
  let uploadedCount = 0;

  for (const vehicle of loadedVehicles) {
    const result = await getOrUploadImage(vehicle);
    uploadedCount += result.uploaded ? 1 : 0;
    await seedCar(vehicle, result.assetId);
  }

  const editorialAssetIds = {};
  for (const editorialAsset of loadedEditorialAssets) {
    const result = await getOrUploadImage(editorialAsset);
    uploadedCount += result.uploaded ? 1 : 0;
    editorialAssetIds[editorialAsset.key] = result.assetId;
  }

  await seedSiteSettings({ logoAssetId: editorialAssetIds.logoImage });
  await seedHomePage({
    heroAssetId: editorialAssetIds.heroImage,
    historyAssetId: editorialAssetIds.historyImage,
  });

  const orderedCars = await assignCarPresentationOrder(client);
  console.log(`Presentation order assigned for ${orderedCars} vehicle(s).`);

  console.log(`Seed complete: ${loadedVehicles.length} cars, 1 siteSettings document, 1 homePage document.`);
  const totalImages = loadedVehicles.length + loadedEditorialAssets.length;
  console.log(`Images uploaded or reused: ${totalImages} total (${uploadedCount} uploaded, ${totalImages - uploadedCount} reused).`);
};

main().catch((error) => {
  console.error(`Sanity seed failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
