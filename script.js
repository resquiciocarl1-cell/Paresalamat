/* =============================================
   PARESALAMAT – FULL SCRIPT.JS
   ============================================= */

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
  { id: 9, name: "Fourth's Bowl", price: 229, desc: "Pares elevated – featuring premium Wagyu cubes.", img: "fourth's_bowl.jpg", category: "special", popular: true }
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
  renderReviews();
  initFilterBtns();
  initScrollEffects();
  initNavScroll();
  initStarRating();
});

// ============================================
// MENU & FILTER
// ============================================
function renderMenu(filter = "all") {
  const grid = document.getElementById("menuGrid");
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
  const orderData = {
    name: document.getElementById("custName").value,
    phone: document.getElementById("custPhone").value,
    address: document.getElementById("custAddress").value,
    items: cart,
    total: document.getElementById("cartTotal").textContent,
    notes: document.getElementById("custNotes").value
  };

  // 1. Database Backend Call
  try {
    await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
  } catch (e) { console.error("Database error", e); }

  // 2. WhatsApp Message
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
function openImageModal(src) {
  document.getElementById("lightboxImage").src = src;
  document.getElementById("imageModal").classList.add("open");
}
function closeImageModal() { document.getElementById("imageModal").classList.remove("open"); }

// ============================================
// OTHER FEATURES
// ============================================
function renderReviews() { /* ... kept original ... */ }
function initScrollEffects() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.1 });
  document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
}
function initNavScroll() { window.addEventListener("scroll", () => document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 60)); }
function initStarRating() { /* ... kept original ... */ }
function toggleMenu() { document.getElementById("navLinks").classList.toggle("open"); }
function closeMenu() { document.getElementById("navLinks").classList.remove("open"); }
function submitReview() { /* ... kept original ... */ }
function sendMessage() { /* ... kept original ... */ }