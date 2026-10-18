const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.site-header');
const toggle = document.getElementById('nav-toggle');

const closeMenu = () => {
  if (!header || !toggle) return;
  header.classList.remove('nav-open');
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir navegación');
};

toggle?.addEventListener('click', () => {
  const isOpen = header?.classList.toggle('nav-open') ?? false;
  toggle.classList.toggle('open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Cerrar navegación' : 'Abrir navegación');
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const gallery = document.querySelector('[data-vehicle-gallery]');
const dialog = document.getElementById('lightbox');
const dialogImage = document.getElementById('lightbox-img');
const dialogStatus = document.getElementById('lightbox-status');
const dialogPrev = document.getElementById('lightbox-prev');
const dialogNext = document.getElementById('lightbox-next');
const stageButton = gallery?.querySelector('[data-stage-open]');
const currentImage = gallery?.querySelector('[data-stage-current]');
const status = gallery?.querySelector('[data-stage-status]');
const thumbs = gallery ? [...gallery.querySelectorAll('[data-stage-thumb]')] : [];

const photos = thumbs.length
  ? thumbs.map((thumb) => ({
      src: thumb.querySelector('img')?.getAttribute('src') ?? '',
      alt: thumb.getAttribute('data-alt') ?? '',
    }))
  : currentImage
    ? [{ src: currentImage.getAttribute('src') ?? '', alt: currentImage.getAttribute('alt') ?? '' }]
    : [];

let photoIndex = 0;

const setPhoto = (nextIndex) => {
  if (!photos.length || !currentImage) return;
  photoIndex = (nextIndex + photos.length) % photos.length;
  const photo = photos[photoIndex];
  currentImage.setAttribute('src', photo.src);
  currentImage.setAttribute('alt', photo.alt);
  if (status) status.textContent = `${photoIndex + 1} de ${photos.length}`;
  thumbs.forEach((thumb, index) => {
    const active = index === photoIndex;
    thumb.classList.toggle('is-active', active);
    thumb.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  if (dialog?.open && dialogImage) {
    dialogImage.setAttribute('src', photo.src);
    dialogImage.setAttribute('alt', photo.alt);
    if (dialogStatus) dialogStatus.textContent = photos.length > 1 ? `${photoIndex + 1} de ${photos.length}` : '';
  }
};

gallery?.querySelector('[data-stage-prev]')?.addEventListener('click', () => setPhoto(photoIndex - 1));
gallery?.querySelector('[data-stage-next]')?.addEventListener('click', () => setPhoto(photoIndex + 1));
thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => setPhoto(Number(thumb.getAttribute('data-stage-thumb'))));
});

const openLightbox = () => {
  if (!dialog || !dialogImage || !photos.length) return;
  const photo = photos[photoIndex];
  dialogImage.setAttribute('src', photo.src);
  dialogImage.setAttribute('alt', photo.alt);
  if (dialogStatus) dialogStatus.textContent = photos.length > 1 ? `${photoIndex + 1} de ${photos.length}` : '';
  if (dialogPrev) dialogPrev.hidden = photos.length < 2;
  if (dialogNext) dialogNext.hidden = photos.length < 2;
  dialog.showModal();
};

stageButton?.addEventListener('click', openLightbox);
document.getElementById('lightbox-close')?.addEventListener('click', () => dialog?.close());
dialogPrev?.addEventListener('click', () => setPhoto(photoIndex - 1));
dialogNext?.addEventListener('click', () => setPhoto(photoIndex + 1));
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog?.addEventListener('close', () => stageButton?.focus());
document.addEventListener('keydown', (event) => {
  if (!dialog?.open) return;
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    setPhoto(photoIndex + 1);
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    setPhoto(photoIndex - 1);
  }
});

const dock = document.getElementById('dock');
const actions = document.querySelector('.actions');
if (dock && actions && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    dock.classList.toggle('is-visible', !entry.isIntersecting);
  });
  observer.observe(actions);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});
