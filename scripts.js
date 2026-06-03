const DEFAULT_GALLERY_CATEGORIES = [
  {
    name: 'Music & Singing',
    icon: 'fa-microphone-alt',
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    name: 'Traditional Dance',
    icon: 'fa-drumstick-bite',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515165562835-c2c4f0f36ca3?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    name: 'Fashion & Modeling',
    icon: 'fa-tshirt',
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    name: 'Environmental Action',
    icon: 'fa-leaf',
    images: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    name: 'Poetry & Spoken Word',
    icon: 'fa-feather-alt',
    images: [
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1496318447583-f524534e9ce1?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    name: 'Community Service',
    icon: 'fa-hand-holding-heart',
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

const STORAGE_KEY = 'izubaGalleryData';
const ADMIN_PASSWORD = 'izuba2026';
const AUTH_KEY = 'izubaAdminAuthenticated';
const API_BASE = '/api/gallery';
let adminGalleryData = [];

function isAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function setAdminAuthenticated(value) {
  sessionStorage.setItem(AUTH_KEY, value ? 'true' : 'false');
}

function showAdminLogin() {
  document.getElementById('adminLoginSection')?.classList.remove('hidden');
  document.getElementById('adminHeaderSection')?.classList.add('hidden');
  document.getElementById('adminPanelSection')?.classList.add('hidden');
}

function showAdminPanel() {
  document.getElementById('adminLoginSection')?.classList.add('hidden');
  document.getElementById('adminHeaderSection')?.classList.remove('hidden');
  document.getElementById('adminPanelSection')?.classList.remove('hidden');
}

function handleAdminLogin(event) {
  event.preventDefault();
  const password = document.getElementById('adminPassword')?.value.trim();
  if (password === ADMIN_PASSWORD) {
    setAdminAuthenticated(true);
    showAdminPanel();
    initGalleryAdmin();
    return;
  }
  alert('Incorrect password. Please try again.');
}

function handleAdminLogout() {
  setAdminAuthenticated(false);
  showAdminLogin();
}

function getStoredGalleryData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Unable to parse saved gallery data', error);
  }
  return DEFAULT_GALLERY_CATEGORIES;
}

function storeGalleryData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Unable to save gallery data locally', error);
    return false;
  }
}

async function fetchServerGalleryData() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data.categories)) {
      return data.categories;
    }
  } catch (error) {
    console.warn('Server gallery fetch failed:', error);
  }
  return null;
}

async function postServerGalleryData(data) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: data })
    });
    return response.ok;
  } catch (error) {
    console.warn('Server gallery save failed:', error);
    return false;
  }
}

async function loadGalleryData() {
  const serverData = await fetchServerGalleryData();
  if (serverData) {
    storeGalleryData(serverData);
    return serverData;
  }
  return getStoredGalleryData();
}

async function saveGalleryData(data) {
  const serverSaved = await postServerGalleryData(data);
  if (serverSaved) {
    storeGalleryData(data);
    return true;
  }
  return storeGalleryData(data);
}

async function resetGalleryData() {
  localStorage.removeItem(STORAGE_KEY);
  const serverSaved = await postServerGalleryData(DEFAULT_GALLERY_CATEGORIES);
  if (!serverSaved) {
    console.warn('Could not reset server data, local data reset only.');
  }
  return DEFAULT_GALLERY_CATEGORIES;
}

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  }, 800);
});

let secretLogoClickCount = 0;
let secretLogoTimer = null;
const SECRET_LOGO_CLICK_LIMIT = 5;

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}

function setupSecretPassage() {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  logo.addEventListener('click', () => {
    secretLogoClickCount += 1;
    clearTimeout(secretLogoTimer);
    secretLogoTimer = setTimeout(() => { secretLogoClickCount = 0; }, 5000);
    if (secretLogoClickCount >= SECRET_LOGO_CLICK_LIMIT) {
      secretLogoClickCount = 0;
      if (confirm('Secret passage unlocked. Open admin panel?')) {
        window.location.href = 'admin.html';
      }
    }
  });
}

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('active');
  });
});

const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 150) {
      current = section.getAttribute('id');
    }
  });
  document.querySelectorAll('.nav-links a').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === `#${current}`) {
      item.classList.add('active');
    }
  });
});

const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (!backToTop) return;
  if (window.scrollY > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

if (backToTop) {
  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const message = document.getElementById('message')?.value.trim();
  if (!name || !email || !message) {
    alert('Please fill in all required fields.');
    return;
  }
  alert(`Thank you ${name}! We'll get back to you within 24 hours.`);
  e.target.reset();
});

document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const emailInput = e.target.querySelector('input');
  if (!emailInput) return;
  const email = emailInput.value.trim();
  if (!email) {
    alert('Please enter a valid email address.');
    return;
  }
  alert('Thank you for subscribing to our newsletter!');
  e.target.reset();
});

const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .stat-box, .team-card, .testimonial-card, .gallery-item, .value-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

let currentImages = [];
let currentIndex = 0;

function renderGallery(categories) {
  const container = document.getElementById('dynamicGalleryGrid');
  if (!container) return;
  container.innerHTML = '';
  categories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    const firstImage = category.images?.[0] || '';
    if (firstImage) {
      card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${firstImage}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    }
    card.innerHTML = `
      <i class="fas ${category.icon || 'fa-image'}"></i>
      <span>${category.name}</span>
      <div class="gallery-overlay">${category.images.length} ${category.images.length === 1 ? 'image' : 'images'} · Click to view</div>
    `;
    card.addEventListener('click', () => {
      if (category.images.length) {
        openLightbox(category.images, category.name);
      } else {
        alert('No images available yet.');
      }
    });
    container.appendChild(card);
  });
}

function openLightbox(images, categoryName) {
  currentImages = images;
  currentIndex = 0;
  let modal = document.getElementById('galleryLightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'galleryLightbox';
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <div class="close-lightbox" id="closeLightboxBtn">&times;</div>
      <div class="lightbox-nav prev-btn" id="galleryPrev"><i class="fas fa-chevron-left"></i></div>
      <div class="lightbox-nav next-btn" id="galleryNext"><i class="fas fa-chevron-right"></i></div>
      <div class="lightbox-content"><img id="lightboxImg" class="lightbox-img" alt="gallery image"></div>
      <div class="lightbox-caption" id="lightboxCaption"></div>
    `;
    document.body.appendChild(modal);
    document.getElementById('closeLightboxBtn').addEventListener('click', () => closeLightbox());
    document.getElementById('galleryPrev').addEventListener('click', () => changeLightboxIndex(-1, categoryName));
    document.getElementById('galleryNext').addEventListener('click', () => changeLightboxIndex(1, categoryName));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (modal.classList.contains('active')) {
        if (e.key === 'ArrowRight') changeLightboxIndex(1, categoryName);
        if (e.key === 'ArrowLeft') changeLightboxIndex(-1, categoryName);
        if (e.key === 'Escape') closeLightbox();
      }
    });
  }
  updateLightbox(categoryName);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('galleryLightbox');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function changeLightboxIndex(direction, categoryName) {
  if (!currentImages.length) return;
  currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
  updateLightbox(categoryName);
}

function updateLightbox(categoryName) {
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if (!img || !cap || !currentImages.length) return;
  img.src = currentImages[currentIndex];
  cap.innerText = `${categoryName} - ${currentIndex + 1} / ${currentImages.length}`;
}

function initGalleryAdmin() {
  adminGalleryData = getStoredGalleryData().map(category => ({ ...category, images: [...category.images] }));
  renderAdminPanel(adminGalleryData);
  bindAdminControls();
}

function renderAdminPanel(categories) {
  const container = document.getElementById('adminCategories');
  if (!container) return;

  container.innerHTML = categories.map((category, idx) => {
    const previews = category.images.map((src, imageIdx) => `
      <div class="admin-thumbnail">
        <img src="${src}" alt="${category.name} image">
        <button class="admin-remove-image" data-cat-idx="${idx}" data-img-idx="${imageIdx}" aria-label="Remove image">&times;</button>
      </div>
    `).join('');

    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <h3>${category.name}</h3>
          <span>${category.images.length} image${category.images.length === 1 ? '' : 's'}</span>
        </div>
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="imageUrlInput-${idx}">Add image URL</label>
            <input type="url" id="imageUrlInput-${idx}" placeholder="https://example.com/image.jpg">
          </div>
          <button class="btn btn-secondary admin-add-url" data-cat-idx="${idx}">Add URL</button>
        </div>
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="imageFileInput-${idx}">Upload local image</label>
            <input type="file" id="imageFileInput-${idx}" accept="image/*">
          </div>
          <button class="btn btn-secondary admin-add-file" data-cat-idx="${idx}">Upload</button>
        </div>
        <div class="admin-thumbnail-grid">
          ${previews || '<p class="admin-empty">No images yet for this category.</p>'}
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.admin-add-url').forEach(button => {
    button.addEventListener('click', handleAdminAddUrl);
  });

  document.querySelectorAll('.admin-add-file').forEach(button => {
    button.addEventListener('click', handleAdminAddFile);
  });

  document.querySelectorAll('.admin-remove-image').forEach(button => {
    button.addEventListener('click', handleAdminRemoveImage);
  });
}

async function handleAdminAddUrl(event) {
  const categoryIndex = parseInt(event.target.dataset.catIdx, 10);
  const input = document.getElementById(`imageUrlInput-${categoryIndex}`);
  const url = input?.value.trim();
  if (!url) {
    alert('Enter a valid image URL before adding.');
    return;
  }
  adminGalleryData[categoryIndex].images.push(url);
  if (await saveGalleryData(adminGalleryData)) {
    renderAdminPanel(adminGalleryData);
    input.value = '';
  }
}

async function handleAdminAddFile(event) {
  const categoryIndex = parseInt(event.target.dataset.catIdx, 10);
  const input = document.getElementById(`imageFileInput-${categoryIndex}`);
  if (!input?.files?.length) {
    alert('Choose a local image file to upload.');
    return;
  }
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async () => {
    adminGalleryData[categoryIndex].images.push(reader.result);
    if (await saveGalleryData(adminGalleryData)) {
      renderAdminPanel(adminGalleryData);
      input.value = '';
    }
  };
  reader.readAsDataURL(file);
}

async function handleAdminRemoveImage(event) {
  const categoryIndex = parseInt(event.target.dataset.catIdx, 10);
  const imageIndex = parseInt(event.target.dataset.imgIdx, 10);
  adminGalleryData[categoryIndex].images.splice(imageIndex, 1);
  if (await saveGalleryData(adminGalleryData)) {
    renderAdminPanel(adminGalleryData);
  }
}

function bindAdminControls() {
  document.getElementById('refreshAdminBtn')?.addEventListener('click', async () => {
    adminGalleryData = await loadGalleryData();
    renderAdminPanel(adminGalleryData);
    alert('Admin data refreshed.');
  });

  document.getElementById('saveAdminBtn')?.addEventListener('click', async () => {
    if (await saveGalleryData(adminGalleryData)) {
      alert('Gallery changes saved. Refresh the public page to see updates.');
    }
  });

  document.getElementById('resetAdminBtn')?.addEventListener('click', async () => {
    if (!confirm('Reset gallery to default sample data?')) return;
    adminGalleryData = await resetGalleryData();
    renderAdminPanel(adminGalleryData.map(category => ({ ...category, images: [...category.images] })));
    alert('Gallery reset to default data.');
  });

  document.getElementById('logoutAdminBtn')?.addEventListener('click', handleAdminLogout);
}

document.addEventListener('DOMContentLoaded', async () => {
  setupSecretPassage();
  const data = await loadGalleryData();
  renderGallery(data);
  if (document.getElementById('adminCategories')) {
    if (isAdminAuthenticated()) {
      showAdminPanel();
      await initGalleryAdmin();
    } else {
      showAdminLogin();
      document.getElementById('adminLoginForm')?.addEventListener('submit', handleAdminLogin);
    }
  }
});
