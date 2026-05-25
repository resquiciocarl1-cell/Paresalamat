/* =============================================
   PARESALAMAT – ADMIN SCRIPT
   ============================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Load orders by default when the dashboard opens
  fetchAdminOrders();
});

// Function to handle switching between Orders and Reviews views
function switchTab(tabId, btnElement) {
  // Update sidebar buttons
  document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');

  // Hide all views
  document.querySelectorAll('.admin-view').forEach(view => view.style.display = 'none');

  // Show selected view and fetch fresh data
  if (tabId === 'orders') {
    document.getElementById('ordersView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Recent Orders';
    fetchAdminOrders();
  } else if (tabId === 'reviews') {
    document.getElementById('reviewsView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Customer Reviews';
    fetchAdminReviews();
  }
}

// Fetch and display Orders from MongoDB
async function fetchAdminOrders() {
  const tableBody = document.getElementById('ordersTableBody');
  const countEl = document.getElementById('totalCount');
  
  try {
    const response = await fetch('/api/order'); // Calling your Node.js backend
    if (!response.ok) throw new Error("Network response was not ok");
    
    const orders = await response.json();
    countEl.textContent = orders.length;

    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No orders found in the database.</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders.map(order => {
      // Format items array into a readable string
      const itemList = order.items ? order.items.map(i => `${i.qty}x ${i.name}`).join(', ') : 'N/A';
      
      // Determine delivery styling
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

  } catch (error) {
    console.error("Error fetching orders:", error);
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--red);">Error connecting to database. Make sure your Node server is running.</td></tr>`;
  }
}

// Fetch and display Reviews from MongoDB
async function fetchAdminReviews() {
  const tableBody = document.getElementById('reviewsTableBody');
  const countEl = document.getElementById('totalCount');

  try {
    const response = await fetch('/api/reviews'); // Calling your Node.js backend
    if (!response.ok) throw new Error("Network response was not ok");

    const reviews = await response.json();
    countEl.textContent = reviews.length;

    if (reviews.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No reviews found in the database.</td></tr>`;
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

  } catch (error) {
    console.error("Error fetching reviews:", error);
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--red);">Error connecting to database. Make sure your Node server is running.</td></tr>`;
  }
}
