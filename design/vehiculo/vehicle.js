const phone = "584126916722";

const vehicles = [
  {
    id: "santa-fe-2017",
    name: "Hyundai Santa Fe 2017",
    year: 2017,
    price: 33000,
    status: "available",
    featured: true,
    badge: "",
    description:
      "De único dueño, con 44 mil km, color blanco, motor 3.3 L, seis cilindros y tracción 4x4. Está como nueva por dentro y por fuera, con equipamiento completo.",
    facts: [
      ["Kilometraje", "44 mil km"],
      ["Color", "Blanco"],
      ["Motor", "3.3 L, seis cilindros"],
      ["Tracción", "4x4"],
      ["Dueño", "Único dueño"],
    ],
    images: [
      {
        src: "../../public/assets/autos/santa-fe-2017.jpg",
        alt: "Hyundai Santa Fe 2017 blanca, vista de frente en el showroom de Autos La 15",
      },
    ],
  },
  {
    id: "jac-t8-2026",
    name: "JAC T8 2026",
    year: 2026,
    price: 37000,
    status: "available",
    featured: true,
    badge: "0 KM",
    description:
      "Pickup 0 km, fuerte y completa de fábrica. Ofrece garantía full, interior amplio y tecnología actual para trabajo o paseo.",
    facts: [
      ["Tipo", "Pickup"],
      ["Condición", "0 km"],
      ["Garantía", "Full"],
    ],
    images: [
      {
        src: "../../public/assets/autos/jac-t8-2026.jpg",
        alt: "JAC T8 2026, pickup 0 km en el showroom de Autos La 15",
      },
    ],
  },
  {
    id: "cruze-2014",
    name: "Chevrolet Cruze 2014",
    year: 2014,
    price: 10500,
    status: "available",
    featured: false,
    badge: "",
    description:
      "Sedán negro con motor 1.8 L y 107 mil km. Cuenta con servicio reciente al cuerpo de aceleración y bujías, batería reemplazada, cauchos en muy buen estado, pintura de hace un año y tren delantero nuevo. Título 3-1.",
    facts: [
      ["Kilometraje", "107 mil km"],
      ["Color", "Negro"],
      ["Motor", "1.8 L"],
      ["Título", "3-1"],
    ],
    images: [
      {
        src: "../../public/assets/autos/cruze-2014.jpg",
        alt: "Chevrolet Cruze 2014 negro en el showroom de Autos La 15",
      },
    ],
  },
  {
    id: "outlander-2025",
    name: "Mitsubishi Outlander GLS 2025",
    year: 2025,
    price: 60000,
    status: "available",
    featured: true,
    badge: "",
    description:
      "SUV premium blanca, con motor 2.5 L, tres filas para siete pasajeros y 32 mil km. Es de único dueño y combina comodidad, seguridad y tecnología actual.",
    facts: [
      ["Kilometraje", "32 mil km"],
      ["Color", "Blanco"],
      ["Motor", "2.5 L"],
      ["Pasajeros", "7, tres filas"],
      ["Dueño", "Único dueño"],
    ],
    images: [
      {
        src: "../../public/assets/autos/outlander-2025.jpg",
        alt: "Mitsubishi Outlander GLS 2025 blanca en el showroom de Autos La 15",
      },
    ],
  },
];

const byId = Object.fromEntries(vehicles.map((car) => [car.id, car]));
let currentId = "santa-fe-2017";
let photoIndex = 0;
let focusAfterRender = false;

const $ = (selector) => document.querySelector(selector);

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

const money = (value) => `$${value.toLocaleString("en-US")}`;

const statusLabel = (status) => {
  if (status === "reserved") return "Reservado";
  if (status === "sold") return "Vendido";
  if (status === "archived") return "Archivado";
  return "Disponible";
};

const current = () => byId[currentId];

const whatsappHref = (car) => {
  const text = `Hola Autos La 15, me interesa el ${car.name} (${money(car.price)}). ¿Me comparten más información?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

const recordRows = (car) => {
  const rows = [
    ["Nombre", car.name],
    ["Año", String(car.year)],
    ["Precio", money(car.price)],
    ["Estado", statusLabel(car.status)],
  ];
  if (car.badge) rows.push(["Insignia", car.badge]);
  if (car.featured) rows.push(["Destacado", "Sí"]);
  rows.push(["Fotos", String(car.images.length)]);
  rows.push(["Modelo 3D", "No incluido"]);
  return rows;
};

const render = () => {
  const car = current();
  photoIndex = 0;
  if ($("#lightbox").open) $("#lightbox").close();
  document.title = `${car.name} | AUTOS LA 15`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", car.description);
  $("#crumb").textContent = car.name;
  $("#description-body").textContent = car.description;
  $("#visit-lead").textContent = `${car.name} se ve en Maracaibo.`;
  $("#header-whatsapp").href = whatsappHref(car);

  const photo = car.images[0];
  const multi = car.images.length > 1;
  const arrows = multi
    ? `<button class="stage-arrow stage-arrow-prev" id="photo-prev" type="button" aria-label="Foto anterior">‹</button>
       <button class="stage-arrow stage-arrow-next" id="photo-next" type="button" aria-label="Foto siguiente">›</button>`
    : "";
  const thumbs = car.images
    .map(
      (item, index) => `<li>
        <button class="${index === 0 ? "is-active" : ""}" type="button" role="tab" data-photo="${index}" aria-label="Foto ${index + 1}: ${esc(item.alt)}" aria-selected="${index === 0 ? "true" : "false"}">
          <img src="${esc(item.src)}" alt="" width="1080" height="1080" />
        </button>
      </li>`,
    )
    .join("");
  const facts = car.facts
    .map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
    .join("");
  const chips = [
    `<span class="chip">${esc(statusLabel(car.status))}</span>`,
    car.badge ? `<span class="chip chip-badge">${esc(car.badge)}</span>` : "",
  ].join("");

  $("#dossier").innerHTML = `
    <div class="gallery">
      <div class="stage">
        <button class="stage-open" id="stage-open" type="button" aria-label="Ampliar foto">
          <img id="stage-img" src="${esc(photo.src)}" alt="${esc(photo.alt)}" width="1080" height="1080" />
        </button>
        ${multi ? `<p class="stage-count" id="photo-status" aria-live="polite">1 de ${car.images.length}</p>` : ""}
        ${arrows}
      </div>
      ${multi ? `<ul class="film" role="tablist" aria-label="Fotos de ${esc(car.name)}">${thumbs}</ul>` : ""}
    </div>
    <div class="sheet">
      <div class="chip-row">${chips}</div>
      <h1 id="dossier-title" tabindex="-1">${esc(car.name)}</h1>
      <p class="price">${money(car.price)}</p>
      <div class="actions">
        <a class="btn btn-primary" href="${esc(whatsappHref(car))}" target="_blank" rel="noopener">Consultar vehículo</a>
        <a class="btn btn-ghost" href="#visita">Agendar visita</a>
      </div>
      <h2 class="visually-hidden">Datos en corto</h2>
      <dl class="facts">${facts}</dl>
    </div>`;

  $("#record-table").innerHTML = recordRows(car)
    .map(([label, value]) => `<div class="record-row"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
    .join("");

  $("#lote-list").innerHTML = vehicles
    .filter((item) => item.id !== car.id)
    .map(
      (item) => `<li>
        <button class="lote-card" type="button" data-car="${esc(item.id)}">
          <img src="${esc(item.images[0].src)}" alt="${esc(item.images[0].alt)}" width="1080" height="1080" />
          <span class="lote-copy">
            ${item.badge ? `<span class="lote-mark">${esc(item.badge)}</span>` : ""}
            <strong>${esc(item.name)}</strong>
            <span>${money(item.price)}</span>
          </span>
        </button>
      </li>`,
    )
    .join("");

  $("#dock").innerHTML = `<strong>${money(car.price)}</strong><a class="btn btn-primary" href="${esc(whatsappHref(car))}" target="_blank" rel="noopener">Consultar vehículo</a>`;

  $("#stage-open").addEventListener("click", openLightbox);
  document.querySelectorAll("[data-photo]").forEach((button) => {
    button.addEventListener("click", () => setPhoto(Number(button.dataset.photo)));
  });
  $("#photo-prev")?.addEventListener("click", () => step(-1));
  $("#photo-next")?.addEventListener("click", () => step(1));

  const multiButtons = car.images.length > 1;
  $("#lightbox-prev").hidden = !multiButtons;
  $("#lightbox-next").hidden = !multiButtons;

  if (focusAfterRender) {
    focusAfterRender = false;
    $("#dossier").scrollIntoView({ block: "start" });
    $("#dossier-title").focus();
  }
  watchDock();
};

let dockObserver;

const watchDock = () => {
  dockObserver?.disconnect();
  const actions = document.querySelector(".actions");
  const dock = $("#dock");
  if (!actions || !dock) return;
  dockObserver = new IntersectionObserver(([entry]) => {
    dock.classList.toggle("is-visible", !entry.isIntersecting);
  });
  dockObserver.observe(actions);
};

const setPhoto = (index) => {
  const car = current();
  const count = car.images.length;
  photoIndex = (index + count) % count;
  const photo = car.images[photoIndex];
  const image = $("#stage-img");
  image.src = photo.src;
  image.alt = photo.alt;
  const status = $("#photo-status");
  if (status) status.textContent = `${photoIndex + 1} de ${count}`;
  document.querySelectorAll("[data-photo]").forEach((button) => {
    const active = Number(button.dataset.photo) === photoIndex;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  if ($("#lightbox").open) {
    $("#lightbox-img").src = photo.src;
    $("#lightbox-img").alt = photo.alt;
    $("#lightbox-status").textContent = count > 1 ? `${photoIndex + 1} de ${count}` : "";
  }
};

const step = (delta) => setPhoto(photoIndex + delta);

const openLightbox = () => {
  const car = current();
  const photo = car.images[photoIndex];
  $("#lightbox-img").src = photo.src;
  $("#lightbox-img").alt = photo.alt;
  $("#lightbox-status").textContent = car.images.length > 1 ? `${photoIndex + 1} de ${car.images.length}` : "";
  $("#lightbox").showModal();
};

const show = (id) => {
  if (!byId[id] || id === currentId) return;
  focusAfterRender = true;
  location.hash = id;
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-car]");
  if (!button) return;
  show(button.dataset.car);
});

window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (!byId[id] || id === currentId) return;
  currentId = id;
  render();
});

$("#lightbox-close").addEventListener("click", () => $("#lightbox").close());
$("#lightbox-prev").addEventListener("click", () => step(-1));
$("#lightbox-next").addEventListener("click", () => step(1));
$("#lightbox").addEventListener("click", (event) => {
  if (event.target === $("#lightbox")) $("#lightbox").close();
});
$("#lightbox").addEventListener("close", () => $("#stage-open")?.focus());

document.addEventListener("keydown", (event) => {
  if (!$("#lightbox").open) return;
  if (event.key === "ArrowRight") {
    event.preventDefault();
    step(1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    step(-1);
  }
});

const header = $(".site-header");
const navToggle = $("#nav-toggle");
navToggle.addEventListener("click", () => {
  const open = header.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Cerrar navegación" : "Abrir navegación");
});
document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir navegación");
  });
});

const initial = location.hash.slice(1);
if (byId[initial]) currentId = initial;
render();
