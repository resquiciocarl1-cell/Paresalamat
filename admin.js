/* =============================================
   PARESALAMAT – ADMIN SCRIPT (WITH FALLBACK)
   ============================================= */

const API_URL = "https://paresalamat-backend.onrender.com"; // 👈 CHANGE THIS

document.addEventListener("DOMContentLoaded", () => {
  fetchAdminOrders();
});

function switchTab(tabId, btnElement) {
  document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  document.querySelectorAll('.admin-view').forEach(view => view.style.display = 'none');

  if (tabId === 'orders') {
    document.getElementById('ordersView').style.display = 'block';
    document.getElementById('pageTitle').innerHTML = 'Recent Orders';
    fetchAdminOrders();
  } else if (tabId === 'reviews') {
    document.getElementById('reviewsView').style.display = 'block';
    document.getElementById('pageTitle').innerHTML = 'Customer Reviews';
    fetchAdminReviews();
  }
}

async function fetchAdminOrders() {
  const tableBody = document.getElementById('ordersTableBody');
  const countEl = document.getElementById('totalCount');
  
  try {
    const response = await fetch(API_URL + '/api/order'); 
    if (!response.ok) throw new Error("Network response was not ok");
    const orders = await response.json();
    renderOrdersTable(orders, tableBody, countEl);

  } catch (error) {
    console.warn("Backend not found. Loading sample database data for demonstration...");
    const sampleOrders = [
      { createdAt: new Date().toISOString(), name: "Juan dela Cruz", phone: "09123456789", total: "₱269", type: "delivery", items: [{qty: 1, name: "Fourth's Bowl"}, {qty: 1, name: "Pares Mami"}], notes: "Extra chili oil please" },
      { createdAt: new Date(Date.now() - 86400000).toISOString(), name: "Maria Santos", phone: "09987654321", total: "₱159", type: "pickup", items: [{qty: 1, name: "Basic Overload"}], notes: "None" }
    ];
    renderOrdersTable(sampleOrders, tableBody, countEl);
    document.getElementById('pageTitle').innerHTML = 'Recent Orders <span style="color:var(--red); font-size: 1rem; vertical-align: middle;">(Offline Mode)</span>';
  }
}

function renderOrdersTable(orders, tableBody, countEl) {
  countEl.textContent = orders.length;
  if (orders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No orders found.</td></tr>`;
    return;
  }
  tableBody.innerHTML = orders.map(order => {
    const itemList = order.items ? order.items.map(i => `${i.qty}x ${i.name}`).join('<br>') : 'N/A';
    const typeClass = order.type === 'delivery' ? 'badge-delivery' : 'badge-pickup';
    return `
      <tr>
        <td><strong>${new Date(order.createdAt || Date.now()).toLocaleDateString()}</strong></td>
        <td>${order.name}</td>
        <td>${order.phone}</td>
        <td style="color: var(--red); font-weight: 800;">${order.total}</td>
        <td class="${typeClass}">${(order.type || 'Pickup').toUpperCase()}</td>
        <td>
          <div style="font-weight: 700; margin-bottom: 0.25rem;">${itemList}</div>
          <div style="font-size: 0.8rem; opacity: 0.8;">Note: ${order.notes || 'None'}</div>
        </td>
      </tr>
    `;
  }).join('');
}

async function fetchAdminReviews() {
  const tableBody = document.getElementById('reviewsTableBody');
  const countEl = document.getElementById('totalCount');

  try {
    const response = await fetch(API_URL + '/api/reviews'); 
    if (!response.ok) throw new Error("Network response was not ok");
    const reviews = await response.json();
    renderReviewsTable(reviews, tableBody, countEl);

  } catch (error) {
    console.warn("Backend not found. Loading sample database data for demonstration...");
    const sampleReviews = [
      { date: "March 2024", name: "Maria Santos", stars: 5, text: "Grabe, the All-In Overload hit different! First time ko pero definitely babalik ako.", avatar: "M" },
      { date: "February 2024", name: "Jomar Reyes", stars: 5, text: "Fourth's Bowl is no joke — the wagyu cubes are so tender.", avatar: "J" },
      { date: "January 2024", name: "Ate Nena", stars: 5, text: "Dito na kami lagi kumakain ng pamilya ko.", avatar: "A" }
    ];
    renderReviewsTable(sampleReviews, tableBody, countEl);
    document.getElementById('pageTitle').innerHTML = 'Customer Reviews <span style="color:var(--red); font-size: 1rem; vertical-align: middle;">(Offline Mode)</span>';
  }
}

function renderReviewsTable(reviews, tableBody, countEl) {
  countEl.textContent = reviews.length;
  if (reviews.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No reviews found.</td></tr>`;
    return;
  }
  tableBody.innerHTML = reviews.map(rev => `
    <tr>
      <td><strong>${rev.date || 'Recent'}</strong></td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; background: var(--red); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">
            ${rev.avatar || rev.name.charAt(0).toUpperCase()}
          </div>
          ${rev.name}
        </div>
      </td>
      <td style="color: var(--gold); font-size: 1.1rem;">
        ${'★'.repeat(rev.stars)}${'☆'.repeat(5 - rev.stars)}
      </td>
      <td><em style="opacity: 0.9;">"${rev.text}"</em></td>
    </tr>
  `).join('');
}

function logout() {
  localStorage.removeItem("paresAdminAuth");
  window.location.href = "login.html";
}
