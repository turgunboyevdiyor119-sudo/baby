import './style.css';
import { translations } from './translations.js';
import {
  getWorkers, saveWorkers, getBookings,
  getCurrentUser, setCurrentUser, login, addBooking,
  getCourseEndDate, getCourseRemaining, createWorker, createClient, formatDate
} from './store.js';

// ── state ──────────────────────────────────────────────────────────────────
let lang = localStorage.getItem('lang') || 'uz';
let page = 'home';
let currentUser = getCurrentUser();

function t(key) { return translations[lang][key] || key; }
function setLang(l) { lang = l; localStorage.setItem('lang', l); render(); }
function setPage(p) { page = p; window.scrollTo(0, 0); render(); }

// ── helpers ────────────────────────────────────────────────────────────────
function workerInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
function avatarColors(id) {
  const palette = [
    ['#5BA8D0', '#E8F4FD'],
    ['#67B99A', '#E8F6F1'],
    ['#7ECFC0', '#E5F8F5'],
    ['#5B8DD0', '#EBF2FD'],
    ['#9B8AC4', '#F0EDF9'],
    ['#D08B5B', '#FDF1E8'],
  ];
  return palette[id % palette.length];
}

// ── NAVBAR ─────────────────────────────────────────────────────────────────
function renderNavbar() {
  const navLinks = [
    { key: 'home',     label: t('nav_home') },
    { key: 'services', label: t('nav_services') },
    { key: 'prices',   label: t('nav_prices') },
    { key: 'staff',    label: t('nav_staff') },
    { key: 'booking',  label: t('nav_booking') },
  ];
  return `
  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <div class="nav-brand" data-page="home">
        <div class="brand-icon">✦</div>
        <span>BabyTouch</span>
      </div>
      <button class="burger" id="burgerBtn" aria-label="menu">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-links" id="navLinks">
        ${navLinks.map(l => `
          <a class="nav-link ${page === l.key ? 'active' : ''}" data-page="${l.key}" href="#">${l.label}</a>
        `).join('')}
        ${currentUser?.role === 'admin' ? `<a class="nav-link ${page === 'admin' ? 'active' : ''}" data-page="admin" href="#">${t('nav_admin')}</a>` : ''}
        ${currentUser ? `
          <a class="nav-link ${page === 'profile' ? 'active' : ''}" data-page="profile" href="#">${t('nav_profile')}</a>
          <button class="btn-nav-logout" id="logoutBtn">${t('nav_logout')}</button>
        ` : `
          <a class="nav-link ${page === 'login' ? 'active' : ''}" data-page="login" href="#">${t('nav_login')}</a>
        `}
        <div class="lang-switcher">
          ${['uz', 'ru', 'en'].map(l => `<button class="lang-btn ${lang === l ? 'active' : ''}" data-lang="${l}">${l.toUpperCase()}</button>`).join('')}
        </div>
      </div>
    </div>
  </nav>`;
}

// ── HOME ────────────────────────────────────────────────────────────────────
function renderHome() {
  return `
  <section class="hero" id="home">
    <div class="hero-bg">
      <div class="hero-blob blob1"></div>
      <div class="hero-blob blob2"></div>
      <div class="hero-blob blob3"></div>
    </div>
    <div class="hero-content">
      <div class="hero-badge animate-fade-in">🌿 Professional Massaj Markazi</div>
      <h1 class="hero-title animate-fade-in-up">
        ${t('hero_title')}<br/>
        <span class="gradient-text">${t('hero_title2')}</span>
      </h1>
      <p class="hero-subtitle animate-fade-in-up">${t('hero_subtitle')}</p>
      <div class="hero-actions animate-fade-in-up">
        <button class="btn-primary" data-page="booking">${t('hero_btn_book')}</button>
        <button class="btn-secondary" data-page="services">${t('hero_btn_services')}</button>
      </div>
      <div class="hero-stats animate-fade-in-up">
        <div class="stat-item">
          <span class="stat-number">500+</span>
          <span class="stat-label">${t('hero_stat_clients')}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">6</span>
          <span class="stat-label">${t('hero_stat_workers')}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">5+</span>
          <span class="stat-label">${t('hero_stat_years')}</span>
        </div>
      </div>
    </div>
    <div class="hero-image animate-slide-in">
      <div class="hero-img-frame">
        <img src="/hero_massage.png" alt="Massaj markazi" />
        <div class="hero-img-badge">
          <span>✓</span> Sertifikatlangan
        </div>
      </div>
    </div>
  </section>

  <section class="section services-section" id="services">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Xizmatlar</span>
        <h2 class="section-title">${t('services_title')}</h2>
        <p class="section-sub">${t('services_subtitle')}</p>
      </div>
      <div class="services-grid">
        <div class="service-card animate-card">
          <div class="service-img-wrap">
            <img src="/baby_massage.png" alt="Baby massage" class="service-img"/>
            <div class="service-img-overlay"><span>👶</span></div>
          </div>
          <div class="service-body">
            <h3>${t('service_baby_title')}</h3>
            <p>${t('service_baby_desc')}</p>
            <div class="service-tags">
              <span class="tag">2 oy – 6 yosh</span>
              <span class="tag">Sertifikatlangan</span>
            </div>
            <button class="btn-service" data-page="booking">${t('hero_btn_book')}</button>
          </div>
        </div>
        <div class="service-card animate-card">
          <div class="service-img-wrap">
            <img src="/women_massage.png" alt="Women massage" class="service-img"/>
            <div class="service-img-overlay"><span>🌸</span></div>
          </div>
          <div class="service-body">
            <h3>${t('service_women_title')}</h3>
            <p>${t('service_women_desc')}</p>
            <div class="service-tags">
              <span class="tag">Barcha yoshdagi ayollar</span>
              <span class="tag">Professional</span>
            </div>
            <button class="btn-service" data-page="booking">${t('hero_btn_book')}</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section prices-section" id="prices">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Narxlar</span>
        <h2 class="section-title">${t('prices_title')}</h2>
        <p class="section-sub">${t('prices_subtitle')}</p>
      </div>
      <div class="prices-grid">
        <div class="price-card animate-card">
          <div class="price-card-header baby-header">
            <div class="price-icon">👶</div>
            <h3>${t('prices_baby')}</h3>
          </div>
          <ul class="price-list">
            <li><span>2 oydan 1 yoshgacha</span><strong>70 000 ${t('price_currency')}</strong></li>
            <li><span>1 yoshdan 3 yoshgacha</span><strong>80 000 ${t('price_currency')}</strong></li>
            <li><span>4 yoshdan 6 yoshgacha</span><strong>90 000 ${t('price_currency')}</strong></li>
            <li class="divider-li"></li>
            <li><span>Parafin</span><strong>15 000 ${t('price_currency')}</strong></li>
            <li><span>Elektrofarez</span><strong>15 000 ${t('price_currency')}</strong></li>
            <li><span>Gidrovanna</span><strong>70 000 ${t('price_currency')}</strong></li>
          </ul>
          <div class="price-note">Kuniga ${t('price_per_day')}</div>
        </div>
        <div class="price-card price-featured animate-card">
          <div class="price-card-header women-header">
            <div class="price-icon">🌸</div>
            <h3>${t('prices_women')}</h3>
          </div>
          <ul class="price-list">
            <li><span>Boshdan belgacha</span><strong>80 000 ${t('price_currency')}</strong></li>
            <li><span>Oyoq massaji</span><strong>80 000 ${t('price_currency')}</strong></li>
            <li><span>Umumiy massaj</span><strong>200 000 ${t('price_currency')}</strong></li>
            <li><span>Bosh massaji</span><strong>80 000 ${t('price_currency')}</strong></li>
            <li><span>Bankali massaj</span><strong>80 000 ${t('price_currency')}</strong></li>
            <li><span>Ozdiruvchi massaj</span><strong>200 000 ${t('price_currency')}</strong></li>
          </ul>
          <div class="price-note">Kuniga ${t('price_per_day')}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="section staff-preview-section">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Jamoa</span>
        <h2 class="section-title">${t('staff_title')}</h2>
        <p class="section-sub">${t('staff_subtitle')}</p>
      </div>
      ${renderStaffCards(true)}
      <div style="text-align:center;margin-top:2rem">
        <button class="btn-primary" data-page="staff">Barchasini ko'rish</button>
      </div>
    </div>
  </section>

  ${renderFooter()}`;
}

// ── STAFF CARDS ─────────────────────────────────────────────────────────────
function renderStaffCards(preview = false) {
  const workers = getWorkers();
  const list = preview ? workers.slice(0, 4) : workers;
  return `
  <div class="staff-grid">
    ${list.map(w => {
      const [bgColor, lightColor] = avatarColors(w.id);
      const remaining = getCourseRemaining(w);
      const endDate = getCourseEndDate(w.courseStartDate);
      return `
      <div class="staff-card animate-card">
        <div class="staff-avatar" style="background:${lightColor}">
          ${w.photo
            ? `<img src="${w.photo}" alt="${w.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
            : `<span class="avatar-initials" style="color:${bgColor}">${workerInitials(w.name)}</span>`
          }
          <div class="staff-status-dot ${w.status === 'free' ? 'dot-free' : 'dot-busy'}"></div>
        </div>
        <h4 class="staff-name">${w.name}</h4>
        <p class="staff-exp">⭐ ${w.experience} ${t('staff_experience')}</p>
        <div class="staff-badge ${w.status === 'free' ? 'badge-free' : 'badge-busy'}">
          ${w.status === 'free' ? t('staff_free') : t('staff_busy')}
        </div>
        <div class="course-info">
          <span class="course-days">📅 Kurs: ${remaining} kun qoldi</span>
          <span class="course-end">Tugaydi: ${endDate}</span>
        </div>
        <button class="btn-staff-book" data-page="booking" data-worker="${w.id}">${t('staff_book')}</button>
      </div>`;
    }).join('')}
  </div>`;
}

function renderStaffPage() {
  return `
  <div class="page-hero">
    <div class="container">
      <h1 class="page-title">${t('staff_title')}</h1>
      <p class="page-sub">${t('staff_subtitle')}</p>
    </div>
  </div>
  <section class="section">
    <div class="container">
      ${renderStaffCards(false)}
    </div>
  </section>
  ${renderFooter()}`;
}

// ── BOOKING ──────────────────────────────────────────────────────────────────
let bookingWorkerId = null;
let bookingSlotId = null;

function renderBookingPage() {
  const workers = getWorkers();
  const selected = workers.find(w => w.id === bookingWorkerId);
  const freeSlots = selected
    ? selected.timeSlots.filter(s => s.enabled && !s.booked)
    : [];

  // Group slots by date for better display
  const slotsByDate = {};
  freeSlots.forEach(s => {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
    slotsByDate[s.date].push(s);
  });

  return `
  <div class="page-hero">
    <div class="container">
      <h1 class="page-title">${t('booking_title')}</h1>
      <p class="page-sub">${t('booking_subtitle')}</p>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="booking-layout">
        <div class="booking-step">
          <div class="step-num">1</div>
          <h3>${t('booking_select_worker')}</h3>
          <div class="booking-workers-list">
            ${workers.map(w => {
              const [bgColor, lightColor] = avatarColors(w.id);
              const remaining = getCourseRemaining(w);
              return `
              <div class="booking-worker-item ${bookingWorkerId === w.id ? 'selected' : ''}" data-select-worker="${w.id}">
                <div class="bw-avatar" style="background:${lightColor}">
                  ${w.photo
                    ? `<img src="${w.photo}" alt="${w.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
                    : `<span style="color:${bgColor};font-weight:700;font-size:1rem">${workerInitials(w.name)}</span>`
                  }
                </div>
                <div class="bw-info">
                  <span class="bw-name">${w.name}</span>
                  <span class="bw-exp">${w.experience} ${t('staff_experience')} · 📅 ${remaining} kun</span>
                </div>
                <div class="bw-badge ${w.status === 'free' ? 'badge-free' : 'badge-busy'}">
                  ${w.status === 'free' ? t('staff_free') : t('staff_busy')}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="booking-step ${!bookingWorkerId ? 'step-disabled' : ''}">
          <div class="step-num">2</div>
          <h3>${t('booking_select_time')}</h3>
          ${!bookingWorkerId ? `<p class="step-hint">Avval mutaxassis tanlang</p>` :
            freeSlots.length === 0 ? `<p class="step-hint">${t('booking_no_slots')}</p>` :
            `<div class="slots-by-date">
              ${Object.keys(slotsByDate).map(date => `
                <div class="date-group">
                  <div class="date-label">📅 ${date}</div>
                  <div class="slots-grid">
                    ${slotsByDate[date].map(s => `
                      <button class="slot-btn ${bookingSlotId === s.id ? 'slot-selected' : ''}" data-slot="${s.id}">
                        <span class="slot-time">🕐 ${s.time}</span>
                      </button>`).join('')}
                  </div>
                </div>`).join('')}
            </div>`
          }
        </div>

        <div class="booking-step ${!bookingSlotId ? 'step-disabled' : ''}">
          <div class="step-num">3</div>
          <h3>Ma'lumotlaringiz</h3>
          <div class="booking-form">
            <div class="form-group">
              <label>${t('booking_your_name')}</label>
              <input type="text" id="bookingName" placeholder="${t('booking_your_name')}" />
            </div>
            <div class="form-group">
              <label>${t('booking_your_phone')}</label>
              <input type="tel" id="bookingPhone" placeholder="+998 90 123 45 67" />
            </div>
            <button class="btn-primary btn-full" id="confirmBookingBtn" ${!bookingSlotId ? 'disabled' : ''}>
              ${t('booking_confirm')}
            </button>
          </div>
        </div>
      </div>
      <div id="bookingSuccess" class="booking-success hidden">
        <div class="success-icon">✓</div>
        <h3>${t('booking_success')}</h3>
      </div>
    </div>
  </section>
  ${renderFooter()}`;
}

// ── AUTH (LOGIN / REGISTER) ──────────────────────────────────────────────────
let authTab = 'login'; // 'login' | 'register'
let authRole = 'client'; // 'client' | 'worker'

function renderLoginPage() {
  return `
  <div class="auth-wrapper">
    <div class="auth-card animate-fade-in">
      <div class="auth-logo">✦</div>
      <div class="auth-tabs">
        <button class="auth-tab ${authTab === 'login' ? 'active' : ''}" data-auth-tab="login">${t('auth_login_tab')}</button>
        <button class="auth-tab ${authTab === 'register' ? 'active' : ''}" data-auth-tab="register">${t('auth_register_tab')}</button>
      </div>
      
      <div id="authError" class="form-error hidden"></div>

      ${authTab === 'login' ? `
        <h2>${t('login_title')}</h2>
        <div class="form-group">
          <label>${t('login_username')}</label>
          <input type="text" id="loginUser" placeholder="${t('login_username')}" />
        </div>
        <div class="form-group">
          <label>${t('login_password')}</label>
          <input type="password" id="loginPass" placeholder="${t('login_password')}" />
        </div>
        <button class="btn-primary btn-full" id="loginBtn">${t('login_btn')}</button>
      ` : `
        <h2>${t('auth_register_tab')}</h2>
        <div class="auth-role-select">
          <label class="radio-label">
            <input type="radio" name="authRole" value="client" ${authRole === 'client' ? 'checked' : ''} />
            ${t('auth_role_client')}
          </label>
          <label class="radio-label">
            <input type="radio" name="authRole" value="worker" ${authRole === 'worker' ? 'checked' : ''} />
            ${t('auth_role_worker')}
          </label>
        </div>

        <div class="form-group">
          <label>${t('auth_name')}</label>
          <input type="text" id="regName" placeholder="${t('auth_name')}" />
        </div>
        ${authRole === 'client' ? `
          <div class="form-group">
            <label>${t('auth_phone')}</label>
            <input type="tel" id="regPhone" placeholder="+998 90 123 45 67" />
          </div>
        ` : `
          <div class="form-group">
            <label>${t('auth_exp')}</label>
            <input type="number" id="regExp" placeholder="Misol uchun: 3" />
          </div>
        `}
        <div class="form-group">
          <label>${t('login_username')}</label>
          <input type="text" id="regUser" placeholder="${t('login_username')}" />
        </div>
        <div class="form-group">
          <label>${t('login_password')}</label>
          <input type="password" id="regPass" placeholder="${t('login_password')}" />
        </div>
        <button class="btn-primary btn-full" id="registerBtn">${t('auth_register_btn')}</button>
      `}
    </div>
  </div>`;
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
function renderProfilePage() {
  if (!currentUser) { setPage('login'); return ''; }

  const bookings = getBookings();
  let userBookings = [];
  
  if (currentUser.role === 'client') {
    // Client view
    userBookings = bookings.filter(b => b.clientName === currentUser.name);
    return `
    <div class="page-hero">
      <div class="container">
        <h1 class="page-title">${t('profile_title')}</h1>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="profile-layout" style="grid-template-columns: 1fr;">
          <div class="profile-section-card">
            <h3>👤 Mijoz: ${currentUser.name}</h3>
            <p>Telefon: ${currentUser.phone}</p>
          </div>
          <div class="profile-section-card">
            <h3>📋 Mening bronlarim (${userBookings.length})</h3>
            ${userBookings.length === 0 ? '<p class="empty-hint">Sizda hali bronlar mavjud emas</p>' :
              `<div class="bookings-list">
                ${userBookings.map(b => {
                  const worker = getWorkers().find(w => w.id === b.workerId);
                  return `
                  <div class="booking-item">
                    <div><strong>Mutaxassis: ${worker ? worker.name : '?'}</strong></div>
                    <div>📅 ${b.date} ${b.time}</div>
                  </div>`;
                }).join('')}
              </div>`}
          </div>
        </div>
      </div>
    </section>
    ${renderFooter()}`;
  }

  // Worker view
  const workers = getWorkers();
  const worker = workers.find(w => w.id === currentUser.id);
  if (!worker) { setPage('home'); return ''; }

  const [bgColor, lightColor] = avatarColors(worker.id);
  userBookings = bookings.filter(b => b.workerId === worker.id);
  const remaining = getCourseRemaining(worker);
  const endDate = getCourseEndDate(worker.courseStartDate);

  return `
  <div class="page-hero">
    <div class="container">
      <h1 class="page-title">${t('profile_title')}</h1>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="profile-layout">
        <div class="profile-card animate-card">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar" style="background:${lightColor}">
              ${worker.photo
                ? `<img src="${worker.photo}" alt="${worker.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`
                : `<span class="avatar-initials-lg" style="color:${bgColor}">${workerInitials(worker.name)}</span>`
              }
            </div>
            <label class="upload-btn" for="photoUpload">📷 ${t('profile_upload_photo')}</label>
            <input type="file" id="photoUpload" accept="image/*" style="display:none" />
          </div>

          <!-- Course progress -->
          <div class="course-card">
            <div class="course-card-row">
              <span>📅 Kurs boshlanishi</span>
              <strong>${worker.courseStartDate}</strong>
            </div>
            <div class="course-card-row">
              <span>🏁 Kurs tugashi</span>
              <strong>${endDate}</strong>
            </div>
            <div class="course-card-row">
              <span>⏳ Qolgan kunlar</span>
              <strong class="${remaining <= 2 ? 'text-danger' : 'text-success'}">${remaining} kun</strong>
            </div>
            <div class="course-progress-bar">
              <div class="course-progress-fill" style="width: ${Math.min(100, ((10 - remaining) / 10) * 100)}%"></div>
            </div>
            <p class="course-note">* Yakshanba dam olish kuni. 10 ish kunidan so'ng vaqtlar avtomatik yangilanadi.</p>
          </div>

          <div class="form-group">
            <label>${t('profile_name')}</label>
            <input type="text" id="profileName" value="${worker.name}" />
          </div>
          <div class="form-group">
            <label>${t('profile_experience')}</label>
            <input type="number" id="profileExp" value="${worker.experience}" min="0" />
          </div>
          <div class="form-group">
            <label>${t('profile_status')}</label>
            <div class="status-toggle">
              <button class="status-btn ${worker.status === 'free' ? 'active-free' : ''}" id="setFreeBtn">${t('free')}</button>
              <button class="status-btn ${worker.status === 'busy' ? 'active-busy' : ''}" id="setBusyBtn">${t('busy')}</button>
            </div>
          </div>
          <button class="btn-primary btn-full" id="saveProfileBtn">${t('profile_save')}</button>
          <div id="profileSaved" class="save-success hidden">✓ ${t('profile_saved')}</div>
        </div>

        <div class="profile-right">
          <div class="profile-section-card">
            <div class="section-header-row">
              <h3>🕐 ${t('profile_timeslots')} (${worker.timeSlots.filter(s => s.enabled && !s.booked).length} bo'sh)</h3>
              <button class="btn-add-slot" id="addSlotBtn">+ ${t('profile_add_slot')}</button>
            </div>
            <div id="addSlotForm" class="add-slot-form hidden">
              <input type="date" id="slotDate" min="${formatDate(new Date())}" />
              <select id="slotTime">
                ${['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
                  .map(ti => `<option value="${ti}">${ti}</option>`).join('')}
              </select>
              <button class="btn-sm-primary" id="saveSlotBtn">Qo'shish</button>
            </div>
            <div class="slots-list" id="slotsList">
              ${worker.timeSlots.length === 0 ? '<p class="empty-hint">Vaqt yo\'q</p>' :
                worker.timeSlots.map(s => `
                <div class="slot-item ${s.booked ? 'slot-booked' : s.enabled ? '' : 'slot-disabled'}">
                  <div class="slot-info">
                    <span class="slot-date-text">${s.date}</span>
                    <span class="slot-time-text">🕐 ${s.time}</span>
                    ${s.booked ? '<span class="slot-tag booked">Bron</span>' : ''}
                  </div>
                  <div class="slot-actions">
                    <button class="toggle-slot ${s.enabled ? 'btn-disable' : 'btn-enable'}" data-slot-id="${s.id}" ${s.booked ? 'disabled' : ''}>
                      ${s.enabled ? t('profile_slot_disable') : t('profile_slot_enable')}
                    </button>
                    <button class="delete-slot btn-del" data-slot-id="${s.id}" ${s.booked ? 'disabled' : ''}>🗑</button>
                  </div>
                </div>`).join('')}
            </div>
          </div>

          <div class="profile-section-card">
            <h3>📋 ${t('profile_bookings')} (${bookings.length})</h3>
            ${bookings.length === 0 ? '<p class="empty-hint">Bronlar yo\'q</p>' :
              `<div class="bookings-list">
                ${bookings.map(b => `
                  <div class="booking-item">
                    <div><strong>${b.clientName}</strong></div>
                    <div>📞 ${b.clientPhone}</div>
                    <div>📅 ${b.date} ${b.time}</div>
                  </div>`).join('')}
              </div>`}
          </div>
        </div>
      </div>
    </div>
  </section>
  ${renderFooter()}`;
}

// ── ADMIN ──────────────────────────────────────────────────────────────────────
let adminTab = 'workers';
let adminEditId = null;
let adminShowAddForm = false;

function renderAdminPage() {
  if (!currentUser || currentUser.role !== 'admin') { setPage('login'); return ''; }
  const workers = getWorkers();
  const bookings = getBookings();

  return `
  <div class="page-hero">
    <div class="container">
      <h1 class="page-title">${t('admin_title')}</h1>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="admin-tabs">
        <button class="admin-tab ${adminTab === 'workers' ? 'active' : ''}" data-tab="workers">👥 ${t('admin_workers')} (${workers.length})</button>
        <button class="admin-tab ${adminTab === 'bookings' ? 'active' : ''}" data-tab="bookings">📋 ${t('admin_bookings')} (${bookings.length})</button>
      </div>

      ${adminTab === 'workers' ? `
        <div class="admin-toolbar">
          <button class="btn-primary" id="toggleAddWorkerBtn">+ ${t('admin_add_worker')}</button>
        </div>

        ${adminShowAddForm ? `
        <div class="admin-form-card animate-fade-in">
          <h3>${adminEditId ? t('admin_edit') : t('admin_add_worker')}</h3>
          <div class="admin-form-grid">
            <div class="form-group">
              <label>${t('admin_name')}</label>
              <input type="text" id="af_name" value="${adminEditId ? workers.find(w => w.id === adminEditId)?.name || '' : ''}" placeholder="Ism familiya" />
            </div>
            <div class="form-group">
              <label>${t('admin_username')}</label>
              <input type="text" id="af_user" value="${adminEditId ? workers.find(w => w.id === adminEditId)?.username || '' : ''}" placeholder="login" />
            </div>
            <div class="form-group">
              <label>${t('admin_password')}</label>
              <input type="password" id="af_pass" placeholder="parol" />
            </div>
            <div class="form-group">
              <label>${t('admin_experience')}</label>
              <input type="number" id="af_exp" value="${adminEditId ? workers.find(w => w.id === adminEditId)?.experience || 0 : 0}" min="0" />
            </div>
          </div>
          ${!adminEditId ? `<p class="admin-note">⚡ Yangi xodim uchun 10 kunlik vaqtlar avtomatik yaratiladi.</p>` : ''}
          <div class="admin-form-actions">
            <button class="btn-primary" id="saveWorkerBtn">${t('admin_save')}</button>
            <button class="btn-secondary" id="cancelWorkerBtn">${t('admin_cancel')}</button>
          </div>
        </div>` : ''}

        <div class="admin-workers-table">
          ${workers.map(w => {
            const [bgColor, lightColor] = avatarColors(w.id);
            const remaining = getCourseRemaining(w);
            const endDate = getCourseEndDate(w.courseStartDate);
            return `
            <div class="admin-worker-row">
              <div class="admin-worker-info">
                <div class="admin-avatar" style="background:${lightColor}">
                  ${w.photo
                    ? `<img src="${w.photo}" alt="${w.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
                    : `<span style="color:${bgColor};font-weight:700">${workerInitials(w.name)}</span>`
                  }
                </div>
                <div>
                  <div class="admin-worker-name">${w.name}</div>
                  <div class="admin-worker-meta">
                    @${w.username} · ${w.experience} yil ·
                    <span class="kurs-badge">📅 Kurs: ${remaining} kun qoldi (tugaydi: ${endDate})</span>
                  </div>
                </div>
              </div>
              <div class="admin-worker-controls">
                <div class="admin-status-toggle">
                  <button class="status-btn-sm ${w.status === 'free' ? 'active-free' : ''}" data-set-status="${w.id}" data-status="free">${t('free')}</button>
                  <button class="status-btn-sm ${w.status === 'busy' ? 'active-busy' : ''}" data-set-status="${w.id}" data-status="busy">${t('busy')}</button>
                </div>
                <button class="btn-edit" data-edit-worker="${w.id}">✎ ${t('admin_edit')}</button>
                <button class="btn-delete" data-delete-worker="${w.id}">🗑 ${t('admin_delete')}</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      ` : `
        <div class="bookings-table">
          ${bookings.length === 0 ? `<p class="empty-hint">${t('admin_no_bookings')}</p>` :
            bookings.map(b => {
              const w = workers.find(ww => ww.id === b.workerId);
              return `
              <div class="booking-row">
                <div class="booking-col"><strong>${b.clientName}</strong><br/><small>📞 ${b.clientPhone}</small></div>
                <div class="booking-col">${w ? w.name : '–'}</div>
                <div class="booking-col">📅 ${b.date} ${b.time}</div>
              </div>`;
            }).join('')}
        </div>
      `}
    </div>
  </section>
  ${renderFooter()}`;
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function renderFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand-icon">✦</div>
          <span>BabyTouch</span>
          <p>${t('footer_text')}</p>
        </div>
        <div class="footer-col">
          <h4>${t('footer_contact')}</h4>
          <p>📍 ${t('footer_address')}</p>
          <p>📞 ${t('footer_phone')}</p>
          <p>⏰ ${t('footer_hours')}</p>
        </div>
        <div class="footer-col">
          <h4>Tezkor havolalar</h4>
          <a href="#" data-page="home">Bosh sahifa</a>
          <a href="#" data-page="services">Xizmatlar</a>
          <a href="#" data-page="prices">Narxlar</a>
          <a href="#" data-page="booking">Bron qilish</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>${t('footer_text')}</p>
      </div>
    </div>
  </footer>`;
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  let content = '';

  if (page === 'home' || page === 'services' || page === 'prices') {
    content = renderHome();
  } else if (page === 'staff') {
    content = renderStaffPage();
  } else if (page === 'booking') {
    content = renderBookingPage();
  } else if (page === 'login') {
    content = renderLoginPage();
  } else if (page === 'profile') {
    content = renderProfilePage();
  } else if (page === 'admin') {
    content = renderAdminPage();
  }

  app.innerHTML = renderNavbar() + `<main>${content}</main>`;
  bindEvents();
  scrollToSection();
}

function scrollToSection() {
  if (page === 'services' || page === 'prices') {
    setTimeout(() => {
      const el = document.getElementById(page);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
function bindEvents() {
  // Navigation
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const p = el.dataset.page;
      if (p === 'booking' && el.dataset.worker) {
        bookingWorkerId = parseInt(el.dataset.worker);
        bookingSlotId = null;
      }
      setPage(p);
      document.getElementById('navLinks')?.classList.remove('open');
    });
  });

  // Language
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.addEventListener('click', () => setLang(el.dataset.lang));
  });

  // Burger
  document.getElementById('burgerBtn')?.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.toggle('open');
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    currentUser = null;
    setCurrentUser(null);
    setPage('home');
  });

  // Scroll navbar
  window.onscroll = () => {
    const nb = document.getElementById('navbar');
    if (nb) nb.classList.toggle('scrolled', window.scrollY > 50);
  };

  // Auth Tabs & Radios
  document.querySelectorAll('[data-auth-tab]').forEach(el => {
    el.addEventListener('click', () => {
      authTab = el.dataset.authTab;
      render();
    });
  });

  document.querySelectorAll('input[name="authRole"]').forEach(el => {
    el.addEventListener('change', (e) => {
      authRole = e.target.value;
      render();
    });
  });

  // Login
  document.getElementById('loginBtn')?.addEventListener('click', doLogin);
  document.getElementById('loginPass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  function showAuthError(msg) {
    const err = document.getElementById('authError');
    if (err) {
      err.textContent = msg;
      err.classList.remove('hidden');
    }
  }

  function doLogin() {
    const u = document.getElementById('loginUser')?.value.trim();
    const p = document.getElementById('loginPass')?.value.trim();
    const user = login(u, p);
    if (user) {
      currentUser = user;
      setPage(user.role === 'admin' ? 'admin' : 'profile');
    } else {
      showAuthError(t('login_error'));
    }
  }

  // Register
  document.getElementById('registerBtn')?.addEventListener('click', () => {
    const name = document.getElementById('regName')?.value.trim();
    const username = document.getElementById('regUser')?.value.trim();
    const password = document.getElementById('regPass')?.value.trim();
    
    if (!name || !username || !password) {
      showAuthError('Barcha maydonlarni to\'ldiring');
      return;
    }

    let newUser = null;

    if (authRole === 'client') {
      const phone = document.getElementById('regPhone')?.value.trim();
      newUser = createClient({ name, phone, username, password });
    } else {
      const exp = document.getElementById('regExp')?.value.trim();
      newUser = createWorker({ name, username, password, experience: exp });
    }

    if (newUser) {
      // auto-login
      currentUser = login(newUser.username, newUser.password);
      setPage('profile');
    } else {
      showAuthError('Bu login allaqachon band!');
    }
  });

  // Booking: select worker
  document.querySelectorAll('[data-select-worker]').forEach(el => {
    el.addEventListener('click', () => {
      bookingWorkerId = parseInt(el.dataset.selectWorker);
      bookingSlotId = null;
      render();
    });
  });

  // Booking: select slot
  document.querySelectorAll('[data-slot]').forEach(el => {
    el.addEventListener('click', () => {
      bookingSlotId = parseInt(el.dataset.slot);
      render();
    });
  });

  // Confirm booking
  document.getElementById('confirmBookingBtn')?.addEventListener('click', () => {
    const name = document.getElementById('bookingName')?.value.trim();
    const phone = document.getElementById('bookingPhone')?.value.trim();
    if (!name || !phone || !bookingWorkerId || !bookingSlotId) {
      alert(t('booking_fill_all'));
      return;
    }
    const workers = getWorkers();
    const worker = workers.find(w => w.id === bookingWorkerId);
    const slot = worker?.timeSlots.find(s => s.id === bookingSlotId);
    if (!slot) return;

    addBooking({
      workerId: bookingWorkerId,
      slotId: bookingSlotId,
      clientName: name,
      clientPhone: phone,
      date: slot.date,
      time: slot.time,
    });

    document.querySelector('.booking-layout').style.display = 'none';
    document.getElementById('bookingSuccess')?.classList.remove('hidden');
    bookingWorkerId = null;
    bookingSlotId = null;
    
    // Refresh to show client bookings if logged in, otherwise go home
    setTimeout(() => {
      setPage(currentUser?.role === 'client' ? 'profile' : 'home');
    }, 2500);
  });

  // Profile: photo upload
  document.getElementById('photoUpload')?.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const workers = getWorkers();
      const idx = workers.findIndex(w => w.id === currentUser.id);
      if (idx !== -1) {
        workers[idx].photo = e.target.result;
        saveWorkers(workers);
        currentUser = { ...currentUser, photo: e.target.result };
        setCurrentUser(currentUser);
        render();
      }
    };
    reader.readAsDataURL(file);
  });

  // Profile: save
  document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
    const name = document.getElementById('profileName')?.value.trim();
    const exp = parseInt(document.getElementById('profileExp')?.value);
    const workers = getWorkers();
    const idx = workers.findIndex(w => w.id === currentUser.id);
    if (idx !== -1) {
      workers[idx].name = name;
      workers[idx].experience = exp;
      saveWorkers(workers);
      currentUser = { ...currentUser, name, experience: exp };
      setCurrentUser(currentUser);
      document.getElementById('profileSaved')?.classList.remove('hidden');
      setTimeout(() => document.getElementById('profileSaved')?.classList.add('hidden'), 2000);
    }
  });

  // Profile: status toggle
  document.getElementById('setFreeBtn')?.addEventListener('click', () => updateWorkerStatus('free'));
  document.getElementById('setBusyBtn')?.addEventListener('click', () => updateWorkerStatus('busy'));

  function updateWorkerStatus(status) {
    const workers = getWorkers();
    const idx = workers.findIndex(w => w.id === currentUser.id);
    if (idx !== -1) {
      workers[idx].status = status;
      saveWorkers(workers);
      currentUser = { ...currentUser, status };
      setCurrentUser(currentUser);
      render();
    }
  }

  // Profile: add slot toggle
  document.getElementById('addSlotBtn')?.addEventListener('click', () => {
    document.getElementById('addSlotForm')?.classList.toggle('hidden');
  });

  document.getElementById('saveSlotBtn')?.addEventListener('click', () => {
    const date = document.getElementById('slotDate')?.value;
    const time = document.getElementById('slotTime')?.value;
    if (!date || !time) return;

    const workers = getWorkers();
    const idx = workers.findIndex(w => w.id === currentUser.id);
    if (idx !== -1) {
      workers[idx].timeSlots.push({ id: Date.now(), date, time, enabled: true, booked: false });
      saveWorkers(workers);
      render();
    }
  });

  // Profile: toggle slot
  document.querySelectorAll('.toggle-slot').forEach(el => {
    el.addEventListener('click', () => {
      const slotId = parseInt(el.dataset.slotId);
      const workers = getWorkers();
      const idx = workers.findIndex(w => w.id === currentUser.id);
      if (idx !== -1) {
        const si = workers[idx].timeSlots.findIndex(s => s.id === slotId);
        if (si !== -1) workers[idx].timeSlots[si].enabled = !workers[idx].timeSlots[si].enabled;
        saveWorkers(workers);
        render();
      }
    });
  });

  // Profile: delete slot
  document.querySelectorAll('.delete-slot').forEach(el => {
    el.addEventListener('click', () => {
      const slotId = parseInt(el.dataset.slotId);
      const workers = getWorkers();
      const idx = workers.findIndex(w => w.id === currentUser.id);
      if (idx !== -1) {
        workers[idx].timeSlots = workers[idx].timeSlots.filter(s => s.id !== slotId);
        saveWorkers(workers);
        render();
      }
    });
  });

  // Admin tabs
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', () => {
      adminTab = el.dataset.tab;
      render();
    });
  });

  // Admin: toggle add form
  document.getElementById('toggleAddWorkerBtn')?.addEventListener('click', () => {
    adminShowAddForm = !adminShowAddForm;
    adminEditId = null;
    render();
  });

  document.getElementById('cancelWorkerBtn')?.addEventListener('click', () => {
    adminShowAddForm = false;
    adminEditId = null;
    render();
  });

  // Admin: save worker
  document.getElementById('saveWorkerBtn')?.addEventListener('click', () => {
    const name = document.getElementById('af_name')?.value.trim();
    const username = document.getElementById('af_user')?.value.trim();
    const password = document.getElementById('af_pass')?.value.trim();
    const experience = parseInt(document.getElementById('af_exp')?.value) || 0;

    if (!name || !username) return;

    if (adminEditId) {
      const workers = getWorkers();
      const idx = workers.findIndex(w => w.id === adminEditId);
      if (idx !== -1) {
        workers[idx].name = name;
        workers[idx].username = username;
        if (password) workers[idx].password = password;
        workers[idx].experience = experience;
        saveWorkers(workers);
      }
    } else {
      if (!password) { alert('Parolni kiriting'); return; }
      createWorker({ name, username, password, experience });
    }

    adminShowAddForm = false;
    adminEditId = null;
    render();
  });

  // Admin: edit worker
  document.querySelectorAll('[data-edit-worker]').forEach(el => {
    el.addEventListener('click', () => {
      adminEditId = parseInt(el.dataset.editWorker);
      adminShowAddForm = true;
      render();
    });
  });

  // Admin: delete
  document.querySelectorAll('[data-delete-worker]').forEach(el => {
    el.addEventListener('click', () => {
      if (!confirm(t('admin_confirm_delete'))) return;
      const workers = getWorkers().filter(w => w.id !== parseInt(el.dataset.deleteWorker));
      saveWorkers(workers);
      render();
    });
  });

  // Admin: set status
  document.querySelectorAll('[data-set-status]').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.setStatus);
      const status = el.dataset.status;
      const workers = getWorkers();
      const idx = workers.findIndex(w => w.id === id);
      if (idx !== -1) {
        workers[idx].status = status;
        saveWorkers(workers);
        render();
      }
    });
  });
}

// ── INIT ───────────────────────────────────────────────────────────────────────
render();
