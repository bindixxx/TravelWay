  document.getElementById('quizBtn').addEventListener('click', () => {
  window.location.href = 'quiz.html';
});
document.getElementById('TravelGPTBtn').addEventListener('click', () => {
  window.location.href = 'TravelGPT.html';
});
/* ------------------------------ Тема ------------------------------ */
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(theme) {
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  toggle.checked = theme === 'light';
  themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));

toggle.addEventListener('change', () => {
  setTheme(toggle.checked ? 'light' : 'dark');
});


/* --------------------------- Избранное --------------------------- */
const favKey = 'travelway_favorites_v1';
let favorites = new Set(JSON.parse(localStorage.getItem(favKey) || '[]'));

function saveFavorites() {
  localStorage.setItem(favKey, JSON.stringify(Array.from(favorites)));
  updateFavCount();
}

function updateFavCount() {
  const countElem = document.getElementById('favCount');
  if (countElem) countElem.innerText = favorites.size;
}

function initFavoriteButtons() {
  document.querySelectorAll('.card').forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector('.favorite-btn');
    if (!btn) return;

    if (favorites.has(id)) {
      btn.classList.add('active');
      btn.textContent = '❤️';
    } else {
      btn.classList.remove('active');
      btn.textContent = '🤍';
    }
  });
  updateFavCount();
}

function toggleFavorite(e, id) {
  e.stopPropagation();
  const btn = e.currentTarget || e.target;

  if (favorites.has(id)) {
    favorites.delete(id);
    btn.classList.remove('active');
    btn.textContent = '🤍';
    showNotification('Удалено из избранного', '💔');
  } else {
    favorites.add(id);
    btn.classList.add('active');
    btn.textContent = '❤️';
    showNotification('Добавлено в избранное', '❤️');
  }

  saveFavorites();
}

document.getElementById('favoritesBtn')?.addEventListener('click', () => {
  const btn = document.getElementById('favoritesBtn');
  const showingFavs = btn.dataset.showing === '1';

  document.querySelectorAll('.card').forEach(card => {
    if (!showingFavs && !favorites.has(card.dataset.id)) card.classList.add('hidden');
    if (showingFavs) card.classList.remove('hidden');
  });

  btn.dataset.showing = showingFavs ? '0' : '1';
  showNotification(showingFavs ? 'Показаны все направления' : 'Показано только избранное', showingFavs ? '🔁' : '❤️');
});


/* ------------------------ Уведомления ------------------------ */
let notifTimeout = null;

function showNotification(message, icon = '') {
  let notif = document.getElementById('notification');

  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notification';
    notif.className = 'notification';
    document.body.appendChild(notif);
  }

  notif.innerHTML = `${icon} ${message}`;
  notif.classList.remove('hide');
  notif.classList.add('show');

  if (notifTimeout) clearTimeout(notifTimeout);

  notifTimeout = setTimeout(() => {
    notif.classList.remove('show');
    notif.classList.add('hide');

    setTimeout(() => { notif.innerHTML = ''; }, 500);
  }, 2500);
}



/* --------------------------- Модалки --------------------------- */
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalRating = document.getElementById('modal-rating');

function extractUrlFromBackground(bg) {
  const match = /url\((?:'|")?(.*?)(?:'|")?\)/.exec(bg || '');
  return match ? match[1] : '';
}

function openModal(card) {
  if (!card) return;

  const media = card.querySelector('.card-media');
  const bg = getComputedStyle(media).backgroundImage;
  const imgUrl = extractUrlFromBackground(bg) || media.dataset.img || '';
  const title = card.querySelector('.card-title')?.innerText || '';
  const desc = card.querySelector('.card-description')?.innerText || '';
  const rating = card.querySelector('.card-rating')?.innerText || '';
  const gmap = card.dataset.maps || "";
  modal.dataset.map = gmap;

  const priceMain = card.querySelector('.price-main')?.innerText || '';
  const priceOld = card.querySelector('.price-old')?.innerText || '';
  const discount = card.querySelector('.price-discount')?.innerText || '';

  modalImg.src = imgUrl;
  modalImg.alt = title;
  modalTitle.innerText = title;
  modalDesc.innerText = desc;
  modalRating.innerText = rating;

  let modalPrice = modal.querySelector('.modal-price');
  
  if (!modalPrice) {
    modalPrice = document.createElement('div');
    modalPrice.className = 'modal-price';
    modalRating.insertAdjacentElement('afterend', modalPrice);
  }

  let priceHTML = '';
  
  if (discount) {
    priceHTML += `<span class="modal-discount">${discount}</span>`;
  }
  
  if (priceOld) {
    priceHTML += `<span class="modal-price-old">${priceOld}</span>`;
  }
  
  if (priceMain) {
    priceHTML += `<span class="modal-price-main">${priceMain}</span>`;
  }

  modalPrice.innerHTML = priceHTML;

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.card').forEach(card => card.addEventListener('click', () => openModal(card)));
document.querySelector('.modal-close')?.addEventListener('click', closeModal);
window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });


/* --------------------------- Поиск --------------------------- */
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');

function matchCard(card, query, activeFilter) {
  const title = card.querySelector('.card-title')?.innerText.toLowerCase() || '';
  const desc = card.querySelector('.card-description')?.innerText.toLowerCase() || '';
  const category = (card.dataset.category || '').toLowerCase();

  const matchesQuery = !query || title.includes(query) || desc.includes(query);
  const matchesFilter = !activeFilter || activeFilter === 'all' || category.includes(activeFilter);

  return matchesQuery && matchesFilter;
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const activeTag = document.querySelector('.filter-tag.active')?.dataset.filter || 'all';

  document.querySelectorAll('.card').forEach(card => {
    if (matchCard(card, query, activeTag)) card.classList.remove('hidden');
    else card.classList.add('hidden');
  });
}

searchBtn?.addEventListener('click', () => {
  applyFilters();
  showNotification('Поиск применён', '🔎');
});

searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    applyFilters();
    showNotification('Поиск применён', '🔎');
  }
});

document.querySelectorAll('.filter-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    applyFilters();
  });
});

resetBtn?.addEventListener('click', () => {
  searchInput.value = '';
  document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
  document.querySelector('.filter-tag[data-filter="all"]')?.classList.add('active');
  document.querySelectorAll('.card').forEach(card => card.classList.remove('hidden'));
  showNotification('Фильтры сброшены', '♻️');
});

/* --------------------------- Кнопки --------------------------- */
document.getElementById('exploreBtn')?.addEventListener('click', () => {
  document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('bookBtn')?.addEventListener('click', () => {
  closeModal();
  showNotification('Спасибо! Пожалуйста, заполните форму.', '🛎️');
});

document.getElementById('shareBtn')?.addEventListener('click', () => {
  showNotification('Ссылка скопирована в буфер обмена (демо)', '📋');
});

/* --------------------------- Инициализация --------------------------- */
(function init() {
  initFavoriteButtons();
  updateFavCount();

  searchInput?.addEventListener('focus', () => searchInput.select());
})();

const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "light") {
    root.classList.add("light");
    themeToggle.checked = true;
}

themeToggle.addEventListener("change", () => {
    root.classList.toggle("light", themeToggle.checked);
    localStorage.setItem("theme", themeToggle.checked ? "light" : "dark");
});

/* -------------------------- Поделиться -------------------------- */
document.getElementById("shareBtn").addEventListener("click", async () => {
  const placeUrl = modal.dataset.map;

  if (!placeUrl) {
    showNotification("Нет ссылки для этого места", "⚠️");
    return;
  }

  try {
    await navigator.clipboard.writeText(placeUrl);
    showNotification("Ссылка на карту скопирована!", "📍");
  } catch {
    showNotification("Ошибка копирования", "❌");
  }
});

/* ======================== Модальное окно бронирования ======================== */

const bookingModal = document.getElementById("bookingModal");
const closeBookingModalBtn = document.getElementById("closeBookingModal");
const bookingForm = document.getElementById("bookingForm");
const bookingSubmitBtn = document.getElementById("bookingSubmitBtn");
const btnText = document.getElementById("btnText");
const bookingPlace = document.getElementById("bookingPlace");
const bookingPlaceShown = document.getElementById("bookingPlaceShown");
const bookingName = document.getElementById("bookingName");
const bookingPhone = document.getElementById("bookingPhone");
const bookingEmail = document.getElementById("bookingEmail");
const bookingDate = document.getElementById("bookingDate");
const bookingPeople = document.getElementById("bookingPeople");
const bookingComment = document.getElementById("bookingComment");
const formContainer = document.getElementById("bookingFormContainer");
const successMessage = document.getElementById("successMessage");
const EMAILJS_PUBLIC_KEY = "OWJajyuJQNJSXqBBw";

/* -------------------------- Открытие модального окна -------------------------- */
document.getElementById("bookBtn").addEventListener("click", () => {
  bookingModal.classList.add("show");
  bookingModal.setAttribute("aria-hidden", "false");

  const placeName = modalTitle.innerText.trim();
  bookingPlace.value = placeName;
  bookingPlaceShown.value = placeName;

  resetForm();
});


/* -------------------------- Закрытие модального окна -------------------------- */
closeBookingModalBtn.addEventListener("click", closeBookingModal);

window.addEventListener("click", (e) => {
  if (e.target === bookingModal) {
    closeBookingModal();
  }
});

function closeBookingModal() {
  bookingModal.classList.remove("show");
  bookingModal.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    formContainer.style.display = "block";
    successMessage.style.display = "none";
    resetForm();
  }, 300);
}

/* -------------------------- Валидация формы -------------------------- */
function validateForm() {
  let isValid = true;

  if (bookingName.value.trim().length < 2) {
    showError(bookingName, "errorName");
    isValid = false;
  } else {
    hideError(bookingName, "errorName");
  }

  const phoneRegex = /^[+]?[0-9]{10,15}$/;
  if (!phoneRegex.test(bookingPhone.value.replace(/\s/g, ""))) {
    showError(bookingPhone, "errorPhone");
    isValid = false;
  } else {
    hideError(bookingPhone, "errorPhone");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(bookingEmail.value.trim())) {
    showError(bookingEmail, "errorEmail");
    isValid = false;
  } else {
    hideError(bookingEmail, "errorEmail");
  }

  const selectedDate = new Date(bookingDate.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!bookingDate.value || selectedDate < today) {
    showError(bookingDate, "errorDate");
    isValid = false;
  } else {
    hideError(bookingDate, "errorDate");
  }

  const people = parseInt(bookingPeople.value);
  if (!people || people < 1 || people > 50) {
    showError(bookingPeople, "errorPeople");
    isValid = false;
  } else {
    hideError(bookingPeople, "errorPeople");
  }

  return isValid;
}

function showError(input, errorId) {
  input.classList.add("error");
  document.getElementById(errorId).classList.add("show");
}

function hideError(input, errorId) {
  input.classList.remove("error");
  document.getElementById(errorId).classList.remove("show");
}

function resetForm() {
  bookingForm.reset();

  document.querySelectorAll(".error-message").forEach(msg => msg.classList.remove("show"));
  document.querySelectorAll(".booking-modal input, .booking-modal textarea").forEach(input => {
    input.classList.remove("error");
  });
}

/* -------------------------- Отправка через EmailJS -------------------------- */
(function() {
  emailjs.init("OWJajyuJQNJSXqBBw");
  console.log("EmailJS инициализирован");
})();

// ============= КОНФИГУРАЦИЯ =============
const EMAILJS_SERVICE_ID = "service_4dq9f7j";
const EMAILJS_TEMPLATE_ID = "template_i36upnh";

// ============= ОТПРАВКА EMAIL =============
async function sendEmailViaEmailJS(data) {
  const templateParams = {
    to_email: data.email,
    client_name: data.name,
    place: data.place,
    phone: data.phone,
    date: data.date,
    people: data.people,
    comment: data.comment
  };

  console.log("📧 Отправка email с данными:", templateParams);

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log("✅ Email успешно отправлен!", response);
    return response;
    
  } catch (error) {
    console.error("❌ Ошибка отправки email:", error);
    throw error;
  }
}

// ============= ОБРАБОТКА ФОРМЫ =============
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showNotification("Пожалуйста, заполните все поля корректно", "⚠️");
    return;
  }

  bookingSubmitBtn.classList.add("loading");
  btnText.innerText = "Отправка...";

  const formData = {
    place: bookingPlace.value,
    name: bookingName.value.trim(),
    phone: bookingPhone.value.trim(),
    email: bookingEmail.value.trim(),
    date: formatDate(bookingDate.value),
    people: bookingPeople.value,
    comment: bookingComment.value.trim() || "Нет комментариев"
  };

  try {
    await sendEmailViaEmailJS(formData);
    showSuccessMessage(formData);
    
  } catch (error) {
    console.error("Ошибка отправки:", error);
    showNotification("Ошибка отправки. Попробуйте позже.", "❌");
    
    bookingSubmitBtn.classList.remove("loading");
    btnText.innerText = "Отправить заявку";
  }
});

/* -------------------------- Показ успешного сообщения -------------------------- */
function showSuccessMessage(data) {
  bookingSubmitBtn.classList.remove("loading");
  btnText.innerText = "Отправить заявку";

  document.getElementById("successPlace").innerText = data.place;
  document.getElementById("successEmail").innerText = data.email;

  formContainer.style.display = "none";
  successMessage.style.display = "block";

  showNotification("Заявка успешно отправлена! 📩", "✅");
  closeModal();
}


/* -------------------------- Закрытие success message -------------------------- */
document.getElementById("closeSuccessBtn")?.addEventListener("click", () => {
  closeBookingModal();
});

/* -------------------------- Вспомогательные функции -------------------------- */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString("ru-RU", options);
}

/* -------------------------- Установка минимальной даты (сегодня) -------------------------- */
if (bookingDate) {
  const today = new Date().toISOString().split("T")[0];
  bookingDate.setAttribute("min", today);
}