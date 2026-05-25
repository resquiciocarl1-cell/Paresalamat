/* =============================================
   PARESALAMAT – FULL SCRIPT.JS
   ============================================= */

const API_URL = "https://paresalamat-backend.onrender.com";

// ---- MENU DATA ----
const menuItems = [
  { id: 1, name: "Pares Mami", price: 40, desc: "Classic pares broth with mami noodles – the ultimate comfort combo.", img: "pares_mami.jpg", category: "budget", popular: false },
  { id: 2, name: "Siomai Rice", price: 40, desc: "Steamy siomai dumplings served over garlic rice with chili oil.", img: "Basic_Overload.jpg", category: "budget", popular: false },
  { id: 3, name: "Pares", price: 79, desc: "Our signature slow-braised beef in a rich, sweet-savory broth. The classic.", img: "Pares.jpg", category: "classic", popular: true },
  { id: 4, name: "Pares Mata", price: 79, desc: "Traditional beef pares featuring tender mata (face) cuts. Deep flavor.", img: "pares_mata.jpg", category: "classic", popular: false },
  { id: 5, name: "Pares Utak", price: 79, desc: "Bold and adventurous – pares with creamy utak (brain). Truly legendary.", img: "pares_utak.jpg", category: "classic", popular: false },
  { id: 6, name: "Pares No. 5", price: 79, desc: "The secret cut. Ask the regulars – they know what No. 5 is all about.", img: "pares_no5.jpg", category: "classic", popular: false },
  { id: 7, name: "Basic Overload", price: 159, desc: "Laman, taba, balat, chicharon, balut – everything in one glorious bowl.", img: "Basic_Overload.jpg", category: "overload", popular: true },
  { id: 8, name: "All-In Overload", price: 219, desc: "Laman, taba, balat, chicharon, mata, no. 5, balut – the ultimate bowl.", img: "all_in_overload.jpg", category: "overload", popular: true },
  { id: 9, name: "Fourth's Bowl", price: 229, desc: "Pares elevated – featuring premium Wagyu cubes.", img: "forthsbowl.jpg", category: "special", popular: true }
];

// ---- REVIEWS DATA ----
const initialReviews = [
  { name: "Maria Santos", stars: 5, date: "March 2024", text: "Grabe, the All-In Overload hit different! First time ko pero definitely babalik ako.", avatar: "M" },
  { name: "Jomar Reyes", stars: 5, date: "February 2024", text: "Fourth's Bowl is no joke — the wagyu cubes are so tender.", avatar: "J" },
  { name: "Ate Nena", stars: 5, date: "January 2024", text: "Dito na kami lagi kumakain ng pamilya ko.", avatar: "N" }
];

// ---- STATE ----
let cart = [];
let deliveryType = "pickup";
let reviews = [...initialReviews];
let currentFilter = "all";

// ---- INIT ----
document.addEventListener("DOMContentLoaded", () => {
  renderMenu(currentFilter);
  fetchReviewsFromDB();
  initFilterBtns();
  initScrollEffects();
  initNavScroll();
  initStarRating();

  const phoneInput = document.getElementById("custPhone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, '');
      if (this.value.length > 11) {
        this.value = this.value.slice(0, 11);
      }
    });
  }
});

// ============================================
// MENU & FILTER
// ============================================
function renderMenu(filter = "all") {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  const filtered = filter === "all" ? menuItems : menuItems.filter(i => i.category === filter);

  grid.innerHTML = filtered.map(item => `
    <div class="menu-card fade-up" data-category="${item.category}">
      <div class="menu-card-img">
        <img src="${item.img}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"/>
        ${item.popular ? '<span class="popular-badge">🔥 Popular</span>' : ""}
      </div>
      <div class="menu-card-body">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.desc}</div>
        <div class="menu-card-footer">
          <div class="menu-card-price">₱${item.price}</div>
          <button class="add-to-cart-btn" onclick="addToCart(${item.id}, this)">+</button>
        </div>
      </div>
    </div>
  `).join("");

  setTimeout(() => {
    grid.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }, 50);
}

function initFilterBtns() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderMenu(btn.dataset.filter);
    });
  });
}

// ============================================
// CART LOGIC
// ============================================
function addToCart(id, btn) {
  const item = menuItems.find(i => i.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  updateCartUI();
  if (cart.length === 1) toggleCart(true);
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cartBadge").textContent = count;
  document.getElementById("cartBadge").style.display = count > 0 ? "flex" : "none";

  const itemsEl = document.getElementById("cartItems");
  const footerEl = document.getElementById("cartFooter");

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footerEl.style.display = "none";
    return;
  }
  footerEl.style.display = "block";
  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₱${item.price}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join("");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = deliveryType === "delivery" ? 60 : 0;
  document.getElementById("cartSubtotal").textContent = `₱${total}`;
  document.getElementById("cartTotal").textContent = `₱${total + delivery}`;
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

function toggleCart(open) {
  document.getElementById("cartSidebar").classList.toggle("open", open);
  document.getElementById("cartOverlay").classList.toggle("open", open);
}

function updateOrderType(radio) {
  deliveryType = radio.value;
  updateCartUI();
  document.getElementById("addressGroup").style.display = deliveryType === "delivery" ? "block" : "none";
}

// ============================================
// CHECKOUT & PAYMENT FLOW
// ============================================
function openGcashModal() {
  if (cart.length === 0) return;
  document.getElementById("gcashModal").classList.add("open");
  toggleCart(false);
}
function closeGcashModal() { document.getElementById("gcashModal").classList.remove("open"); }
function proceedToForm() {
  closeGcashModal();
  openCheckout();
}

function openCheckout() {
  document.getElementById("checkoutModal").classList.add("open");
}
function closeCheckout() { document.getElementById("checkoutModal").classList.remove("open"); }

async function placeOrder() {
  const phoneVal = document.getElementById("custPhone").value;

  if (phoneVal.length < 10) {
    alert("Please enter a valid 10 or 11-digit phone number.");
    return;
  }

  const orderData = {
    name: document.getElementById("custName").value,
    phone: document.getElementById("custPhone").value,
    address: document.getElementById("custAddress").value,
    items: cart,
    total: document.getElementById("cartTotal").textContent,
    type: deliveryType,
    notes: document.getElementById("custNotes").value
  };

  try {
    await fetch(API_URL + '/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
  } catch (e) { console.error("Database error", e); }

  const deliveryFee = deliveryType === "delivery" ? "₱60" : "₱0";
  const msg = encodeURIComponent(
    `🍜 *NEW ORDER – PARESALAMAT*\n\n` +
    `👤 *Name:* ${orderData.name}\n` +
    `📱 *Phone:* ${orderData.phone}\n` +
    `🚗 *Type:* ${deliveryType}\n` +
    `📍 *Address:* ${orderData.address}\n` +
    `\n📋 *Items:*\n${orderData.items.map(i => `• ${i.name} (x${i.qty})`).join('\n')}\n` +
    `🚚 *Delivery Fee:* ${deliveryFee}\n` +
    `💰 *Total:* ${orderData.total}\n` +
    `📝 *Notes:* ${orderData.notes}\n\n` +
    `💳 *Payment:* Screenshot attached to chat.`
  );

  window.open(`https://wa.me/639948243867?text=${msg}`, "_blank");

  cart = [];
  updateCartUI();
  closeCheckout();
  document.getElementById("successModal").classList.add("open");
}

function closeSuccess() { document.getElementById("successModal").classList.remove("open"); }

// ============================================
// IMAGE LIGHTBOX
// ============================================
// ============================================
// IMAGE LIGHTBOX WITH ZOOM
// ============================================
let lbScale = 1;
let lbX = 0;
let lbY = 0;
let lbDragging = false;
let lbLastX = 0;
let lbLastY = 0;
let lbPinchDist = null;

function openImageModal(src) {
  const img = document.getElementById("lightboxImage");
  const modal = document.getElementById("imageModal");
  img.src = src;
  modal.classList.add("open");
  lbScale = 1; lbX = 0; lbY = 0;
  applyLbTransform();
  updateZoomLevel();

  if (!document.getElementById("zoomControls")) {
    const controls = document.createElement("div");
    controls.className = "zoom-controls";
    controls.id = "zoomControls";
    controls.innerHTML = `
      −
      100%
      +
      ↺
    `;
    modal.appendChild(controls);
  }
}

function closeImageModal() {
  document.getElementById("imageModal").classList.remove("open");
  lbScale = 1; lbX = 0; lbY = 0;
}

function applyLbTransform() {
  const img = document.getElementById("lightboxImage");
  img.style.transform = `translate(${lbX}px, ${lbY}px) scale(${lbScale})`;
}

function updateZoomLevel() {
  const el = document.getElementById("zoomLevel");
  if (el) el.textContent = Math.round(lbScale * 100) + "%";
}

function lbZoom(delta) {
  lbScale = Math.min(5, Math.max(0.5, lbScale + delta));
  if (lbScale === 1) { lbX = 0; lbY = 0; }
  applyLbTransform();
  updateZoomLevel();
}

function lbReset() {
  lbScale = 1; lbX = 0; lbY = 0;
  applyLbTransform();
  updateZoomLevel();
}

document.addEventListener("DOMContentLoaded", () => {
  const img = document.getElementById("lightboxImage");
  if (!img) return;

  // Mouse wheel zoom
  img.addEventListener("wheel", (e) => {
    e.preventDefault();
    lbZoom(e.deltaY < 0 ? 0.15 : -0.15);
  }, { passive: false });

  // Mouse drag to pan
  img.addEventListener("mousedown", (e) => {
    if (lbScale <= 1) return;
    e.preventDefault();
    lbDragging = true;
    lbLastX = e.clientX;
    lbLastY = e.clientY;
    img.classList.add("dragging");
  });
  document.addEventListener("mousemove", (e) => {
    if (!lbDragging) return;
    lbX += e.clientX - lbLastX;
    lbY += e.clientY - lbLastY;
    lbLastX = e.clientX;
    lbLastY = e.clientY;
    applyLbTransform();
  });
  document.addEventListener("mouseup", () => {
    lbDragging = false;
    img.classList.remove("dragging");
  });

  // Touch: pinch to zoom + drag to pan
  img.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      lbPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1 && lbScale > 1) {
      lbDragging = true;
      lbLastX = e.touches[0].clientX;
      lbLastY = e.touches[0].clientY;
    }
    e.stopPropagation();
  }, { passive: true });

  img.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && lbPinchDist !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (newDist - lbPinchDist) * 0.01;
      lbScale = Math.min(5, Math.max(0.5, lbScale + delta));
      lbPinchDist = newDist;
      applyLbTransform();
      updateZoomLevel();
    } else if (e.touches.length === 1 && lbDragging) {
      lbX += e.touches[0].clientX - lbLastX;
      lbY += e.touches[0].clientY - lbLastY;
      lbLastX = e.touches[0].clientX;
      lbLastY = e.touches[0].clientY;
      applyLbTransform();
    }
    e.stopPropagation();
  }, { passive: true });

  img.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) lbPinchDist = null;
    if (e.touches.length === 0) lbDragging = false;
  });

  // Double-click to toggle zoom
  img.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    if (lbScale > 1) {
      lbReset();
    } else {
      lbScale = 2.5;
      applyLbTransform();
      updateZoomLevel();
    }
  });
});

// ============================================
// REVIEWS LOGIC
// ============================================
let currentRating = 5;

async function fetchReviewsFromDB() {
  try {
    const res = await fetch(API_URL + '/api/reviews');
    if (res.ok) {
      const dbReviews = await res.json();
      if (dbReviews.length > 0) {
        reviews = dbReviews;
      }
    }
  } catch (e) {
    console.error("Could not fetch reviews from DB", e);
  }
  renderReviews();
}

function renderReviews() {
  const grid = document.getElementById("reviewsGrid");
  if (!grid) return;

  grid.innerHTML = reviews.map(rev => `
    <div class="review-card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); min-width: 300px; max-width: 300px; flex-shrink: 0; scroll-snap-align: start;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <div style="width: 40px; height: 40px; background: #8B0000; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
          ${rev.avatar || rev.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight: bold; color: #333;">${rev.name}</div>
          <div style="font-size: 0.8em; color: #777;">${rev.date || "Just now"}</div>
        </div>
      </div>
      <div style="color: #FACC15; font-size: 1.2rem; margin-bottom: 10px;">
        ${'★'.repeat(rev.stars)}${'☆'.repeat(5 - rev.stars)}
      </div>
      <p style="color: #555; line-height: 1.5; font-style: italic;">"${rev.text}"</p>
    </div>
  `).join("");
}

function scrollReviews(direction) {
  const container = document.getElementById("reviewsGrid");
  if (container) {
    container.scrollBy({ left: direction * 324, behavior: 'smooth' });
  }
}

function initStarRating() {
  const stars = document.querySelectorAll("#starRating span");
  if (stars.length === 0) return;

  stars.forEach(s => {
    s.style.cursor = "pointer";
    s.style.fontSize = "1.8rem";
    s.style.color = "#FACC15";
  });

  stars.forEach(star => {
    star.addEventListener("click", function() {
      currentRating = parseInt(this.getAttribute("data-val"));
      stars.forEach((s, index) => {
        s.style.color = index < currentRating ? "#FACC15" : "#E5E7EB";
      });
    });
  });
}

async function submitReview() {
  const nameInput = document.getElementById("reviewerName").value.trim();
  const textInput = document.getElementById("reviewText").value.trim();

  if (!nameInput || !textInput) {
    alert("Please enter both your name and a review.");
    return;
  }

  const newReview = {
    name: nameInput,
    stars: currentRating,
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    text: textInput,
    avatar: nameInput.charAt(0).toUpperCase()
  };

  try {
    await fetch(API_URL + '/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    });
  } catch (e) { console.error("Error saving review", e); }

  reviews.unshift(newReview);
  renderReviews();

  document.getElementById("reviewerName").value = "";
  document.getElementById("reviewText").value = "";
  currentRating = 5;
  document.querySelectorAll("#starRating span").forEach(s => s.style.color = "#FACC15");

  const successMsg = document.getElementById("reviewSuccess");
  if (successMsg) {
    successMsg.style.display = "block";
    setTimeout(() => { successMsg.style.display = "none"; }, 3000);
  }
}

// ============================================
// SCROLL & NAV
// ============================================
function initScrollEffects() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.1 });
  document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
}

function initNavScroll() { window.addEventListener("scroll", () => document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 60)); }
function toggleMenu() { document.getElementById("navLinks").classList.toggle("open"); }
function closeMenu() { document.getElementById("navLinks").classList.remove("open"); }

// ============================================
// MESSAGE FORM LOGIC
// ============================================
function sendMessage() {
  const name = document.getElementById("msgName").value.trim();
  const email = document.getElementById("msgEmail").value.trim();
  const body = document.getElementById("msgBody").value.trim();

  if (!name || !email || !body) {
    alert("Please fill out all fields before sending.");
    return;
  }

  const btn = document.querySelector(".message-form .btn-primary");
  const originalText = btn.textContent;
  btn.textContent = "Sending...";
  btn.disabled = true;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://formsubmit.co/resquiciocarl1@gmail.com";
  form.target = "_blank";

  const addInput = (inputName, inputValue) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = inputName;
    input.value = inputValue;
    form.appendChild(input);
  };

  addInput("name", name);
  addInput("email", email);
  addInput("message", body);
  addInput("_subject", `New Paresalamat Message from ${name}`);
  addInput("_captcha", "false");
  addInput("_template", "table");

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  document.getElementById("msgSuccess").style.display = "block";
  document.getElementById("msgName").value = "";
  document.getElementById("msgEmail").value = "";
  document.getElementById("msgBody").value = "";

  setTimeout(() => {
    document.getElementById("msgSuccess").style.display = "none";
  }, 4000);

  btn.textContent = originalText;
  btn.disabled = false;
}

// ============================================
// DEMO REEL TOGGLE (mute / unmute + play/pause)
// ============================================
function toggleReel() {
  const video   = document.getElementById("reelVideo");
  const icon    = document.getElementById("reelIcon");
  const wrapper = document.getElementById("reelWrapper");

  if (!video) return;

  // First click: unmute and mark as active so overlay hides
  if (video.muted) {
    video.muted  = false;
    video.volume = 1;
    icon.textContent = "⏸";
    wrapper.classList.add("active");
    return;
  }

  // Subsequent clicks: pause / play
  if (video.paused) {
    video.play();
    icon.textContent = "⏸";
    wrapper.classList.add("active");
  } else {
    video.pause();
    icon.textContent = "▶";
    wrapper.classList.remove("active");
  }
}
