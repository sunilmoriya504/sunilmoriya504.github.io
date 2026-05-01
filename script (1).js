// ANITA COLLECTION — script.js
// Default PIN: 1234
let products = JSON.parse(localStorage.getItem('anita_products')) || null;
let orders = JSON.parse(localStorage.getItem('anita_orders')) || [];
let cart = JSON.parse(localStorage.getItem('anita_cart')) || [];
if (!products) {
  products = [
    {id:1,name:"Floral Print Summer Dress",category:"dresses",price:899,cost:280,rating:4.6,reviews:124,emoji:"👗",color:"#ec4899",stock:45},
    {id:2,name:"Embroidered Anarkali Kurti",category:"ethnic",price:1499,cost:480,rating:4.8,reviews:89,emoji:"👚",color:"#a855f7",stock:30},
    {id:3,name:"Silk Blend Saree",category:"ethnic",price:2199,cost:720,rating:4.9,reviews:201,emoji:"🥻",color:"#f59e0b",stock:25},
    {id:4,name:"Ruffle Sleeve Top",category:"tops",price:549,cost:160,rating:4.4,reviews:156,emoji:"👚",color:"#06b6d4",stock:70},
    {id:5,name:"Tailored Palazzo Pants",category:"bottoms",price:699,cost:210,rating:4.5,reviews:98,emoji:"👖",color:"#10b981",stock:55},
    {id:6,name:"Pearl Drop Earrings",category:"accessories",price:299,cost:60,rating:4.7,reviews:312,emoji:"💎",color:"#f43f5e",stock:120},
    {id:7,name:"Designer Clutch Purse",category:"accessories",price:799,cost:200,rating:4.6,reviews:74,emoji:"👜",color:"#8b5cf6",stock:40},
    {id:8,name:"Lace Midi Dress",category:"dresses",price:1299,cost:400,rating:4.7,reviews:67,emoji:"👗",color:"#ec4899",stock:20},
    {id:9,name:"Cotton Kappa Kurti",category:"ethnic",price:699,cost:200,rating:4.3,reviews:188,emoji:"👚",color:"#06b6d4",stock:85},
    {id:10,name:"Wide Leg Jumpsuit",category:"bottoms",price:1199,cost:360,rating:4.6,reviews:55,emoji:"👗",color:"#a855f7",stock:35}
  ];
  saveProducts();
}

let ADMIN_PIN = localStorage.getItem('anita_pin') || '1234';
let currentFilter = 'all';
let adminTab = 'dashboard';

// ── Utilities ──
function saveProducts() { localStorage.setItem('anita_products', JSON.stringify(products)); }
function saveOrders() { localStorage.setItem('anita_orders', JSON.stringify(orders)); }
function saveCart() { localStorage.setItem('anita_cart', JSON.stringify(cart)); }
function formatCurrency(n) { return '₹' + Number(n).toLocaleString('en-IN', {minimumFractionDigits:2,maximumFractionDigits:2}); }
function generateId() { return 'AN' + Date.now().toString(36).toUpperCase(); }

// ── Cursor Trail ──
const canvas = document.getElementById('cursor-canvas');
const ctx = canvas.getContext('2d');
let mx = 0, my = 0, particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.push({x:mx,y:my,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,life:1,size:Math.random()*5+2});
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
    ctx.fillStyle = `rgba(168,85,247,${p.life * 0.5})`;
    ctx.fill();
    p.x += p.vx; p.y += p.vy; p.life -= 0.025;
  });
  requestAnimationFrame(draw);
})();

// Cursor follower
const follower = document.getElementById('cursor-follower');
document.addEventListener('mousemove', e => {
  follower.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});

// ── Nav Scroll Spy ──
function initNavScrollSpy() {
  const links = document.querySelectorAll('.nav-link[data-goto]');
  const sections = document.querySelectorAll('section > div[id], section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (s.getBoundingClientRect().top <= 100) current = s.id; });
    links.forEach(l => l.classList.toggle('active', l.dataset.goto === current));
  });
}

// ── Hero Counters ──
function initHeroCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      el.textContent = Math.floor(current).toLocaleString('en-IN');
    }, 20);
  });
}

// ── Product Filters & Render ──
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });
  document.getElementById('searchInput').addEventListener('input', renderProducts);
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = products.filter(p => {
    const matchCat = currentFilter === 'all' || p.category === currentFilter;
    const matchSearch = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" style="--c:${p.color}">
      <div class="product-card-header">
        <div><div class="product-emoji-wrap" style="background:${p.color}22">${p.emoji}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-meta">
            <span class="product-rating">⭐ ${p.rating}</span>
            <span>(${p.reviews})</span>
            <span>•</span>
            <span style="text-transform:capitalize">${p.category}</span>
          </div>
          <div class="product-price">${formatCurrency(p.price)}</div>
        </div>
      </div>
      <div class="product-card-footer">
        <div style="font-size:12px;color:${p.stock<15?'var(--rose)':'var(--text3)'}">${p.stock<15?'⚠ Low stock':'In stock: '+p.stock}</div>
        <button class="product-quick-add" data-id="${p.id}" title="Add to cart">+</button>
      </div>
    </div>
  `).join('');

  // Scroll animation
  const cards = grid.querySelectorAll('.product-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e,i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i*80);
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.05});
  cards.forEach(c => { c.style.setProperty('--c', 'var(--violet)'); obs.observe(c); });

  grid.querySelectorAll('.product-quick-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(parseInt(btn.dataset.id));
    });
  });
}

// ── Cart ──
function initCart() {
  document.getElementById('navCart').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('checkoutBtn').addEventListener('click', () => { closeCart(); openCheckoutModal(); });
  renderCart();
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const item = cart.find(x => x.id === id);
  if (item) { item.qty = Math.min(item.qty + 1, p.stock); }
  else { cart.push({id, qty:1}); }
  saveCart(); renderCart();
  showToast(`${p.emoji} ${p.name} added to cart!`);
}

function updateCartQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  const p = products.find(x => x.id === id);
  item.qty = Math.max(1, Math.min(item.qty + delta, p?.stock || 10));
  saveCart(); renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart(); renderCart();
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

function renderCart() {
  const countEl = document.getElementById('cartCount');
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');

  const totalItems = cart.reduce((s,i) => s + i.qty, 0);
  countEl.textContent = totalItems;
  document.getElementById('cartItemCount').textContent = `(${totalItems})`;

  if (cart.length === 0) {
    itemsEl.innerHTML = ''; emptyEl.style.display = 'flex'; footerEl.style.display = 'none';
    return;
  }
  emptyEl.style.display = 'none'; footerEl.style.display = 'flex';

  let subtotal = 0, tax = 0;
  itemsEl.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return '';
    subtotal += p.price * item.qty;
    tax += p.price * item.qty * 0.18;
    return `<div class="cart-item">
      <div class="cart-item-emoji">${p.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">${formatCurrency(p.price)} × ${item.qty}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateCartQty(${p.id},-1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty(${p.id},1)">+</button>
          <button class="qty-btn" onclick="removeFromCart(${p.id})" style="margin-left:auto;color:var(--rose)">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('cartSubtotal').textContent = formatCurrency(subtotal);
  document.getElementById('cartTax').textContent = formatCurrency(tax);
  document.getElementById('cartTotal').textContent = formatCurrency(subtotal + tax);
}

// ── Checkout ──
let checkoutStep = 1;
function initCheckout() {
  document.getElementById('modalClose').addEventListener('click', closeCheckoutModal);
  document.getElementById('nextStepBtn').addEventListener('click', nextStep);
  document.getElementById('prevStepBtn').addEventListener('click', () => { checkoutStep--; showStep(checkoutStep); });
  document.getElementById('continueShoppingBtn').addEventListener('click', closeCheckoutModal);
}

function nextStep() {
  if (checkoutStep === 1) {
    const name = document.getElementById('checkoutName').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    if (!name || !phone) { showToast('Please fill name and phone'); return; }
  }
  if (checkoutStep === 3) {
    const upi = document.getElementById('checkoutUPI').value.trim();
    if (!upi) { showToast('Enter UPI transaction ID'); return; }
    placeOrder();
    return;
  }
  checkoutStep++;
  showStep(checkoutStep);
}

function showStep(step) {
  document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.checkout-step[data-step="${step}"]`).classList.add('active');
  document.getElementById('prevStepBtn').style.display = step > 1 ? 'inline-flex' : 'none';
  document.getElementById('nextStepBtn').querySelector('span').textContent = step === 3 ? 'Place Order' : 'Next';
}

function placeOrder() {
  const name = document.getElementById('checkoutName').value.trim();
  const email = document.getElementById('checkoutEmail').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const city = document.getElementById('checkoutCity').value.trim();
  const zip = document.getElementById('checkoutZip').value.trim();
  const upi = document.getElementById('checkoutUPI').value.trim();

  const orderItems = cart.map(item => ({id:item.id, qty:item.qty}));
  const subtotal = cart.reduce((s,item) => { const p = products.find(x=>x.id===item.id); return s + (p?.price||0)*item.qty; }, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const cost = cart.reduce((s,item) => { const p = products.find(x=>x.id===item.id); return s + (p?.cost||0)*item.qty; }, 0);

  const order = {
    id: generateId(), customer:name, email, phone, address, city, zip, upi,
    items: orderItems, subtotal, tax, total, cost, profit: total - cost,
    status: 'pending', date: new Date().toLocaleDateString('en-IN')
  };
  orders.unshift(order); saveOrders();
  cart = []; saveCart(); renderCart();

  document.getElementById('newOrderId').textContent = order.id;
  checkoutStep = 4; showStep(4);
  document.getElementById('modalFooter').style.display = 'none';
}

function openCheckoutModal() {
  if (cart.length === 0) return;
  document.getElementById('checkoutModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  checkoutStep = 1; showStep(1);
  document.getElementById('modalFooter').style.display = 'flex';
  document.getElementById('checkoutName').value = '';
  document.getElementById('checkoutEmail').value = '';
  document.getElementById('checkoutPhone').value = '';
  document.getElementById('checkoutAddress').value = '';
  document.getElementById('checkoutCity').value = '';
  document.getElementById('checkoutZip').value = '';
  document.getElementById('checkoutUPI').value = '';
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Order Lookup ──
function initOrderLookup() {
  document.getElementById('lookupOrderBtn').addEventListener('click', () => {
    const id = document.getElementById('orderLookupInput').value.trim().toUpperCase();
    const result = document.getElementById('orderResult');
    if (!id) { result.innerHTML = '<p style="color:var(--rose)">Please enter an order ID</p>'; return; }
    const order = orders.find(o => o.id === id);
    if (!order) { result.innerHTML = '<p style="color:var(--rose)">Order not found. Check your ID and try again.</p>'; return; }
    const items = order.items.map(it => { const p = products.find(x=>x.id===it.id); return `${p?.emoji||''} ${p?.name||'Item'} × ${it.qty}`; }).join('<br>');
    result.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;justify-content:space-between"><strong>Order ID</strong><code>${order.id}</code></div>
      <div style="display:flex;justify-content:space-between"><strong>Status</strong><span style="padding:2px 10px;border-radius:100px;background:${statusColor(order.status)}22;color:${statusColor(order.status)};font-weight:600;text-transform:capitalize">${order.status}</span></div>
      <div style="display:flex;justify-content:space-between"><strong>Total</strong><strong>${formatCurrency(order.total)}</strong></div>
      <div style="border-top:1px solid var(--border);padding-top:10px;text-align:left;font-size:13px">${items}</div>
    </div>`;
  });
}

function statusColor(s) {
  return {pending:'#f59e0b',confirmed:'#06b6d4',shipped:'#a855f7',delivered:'#10b981',cancelled:'#f43f5e'}[s]||'#94a3b8';
}

// ── SECRET ADMIN — PIN GATE ──
let secretClickCount = 0, secretClickTimer;
document.getElementById('navBrand').addEventListener('click', () => {
  secretClickCount++;
  clearTimeout(secretClickTimer);
  if (secretClickCount >= 3) { secretClickCount = 0; openPinModal(); }
  else { secretClickTimer = setTimeout(() => secretClickCount = 0, 800); }
});

function openPinModal() {
  const modal = document.getElementById('pinModal');
  modal.classList.add('open');
  document.getElementById('pinError').style.display = 'none';
  document.getElementById('pinDisplay').innerHTML = '<div class="pin-digit"></div><div class="pin-digit"></div><div class="pin-digit"></div><div class="pin-digit"></div>';
  buildPinKeypad();
}

function closePinModal() {
  document.getElementById('pinModal').classList.remove('open');
}

function buildPinKeypad() {
  const keypad = document.getElementById('pinKeypad');
  const keys = [
    ['1','2','3'],['4','5','6'],['7','8','9'],['clear','0','del']
  ];
  keypad.innerHTML = keys.map(row => `<div class="pin-key-row">${row.map(k => {
    if (k==='clear') return '<button class="pin-key clear" data-key="C">C</button>';
    if (k==='del') return '<button class="pin-key del" data-key="del">⌫</button>';
    return `<button class="pin-key" data-key="${k}">${k}</button>`;
  }).join('')}</div>`).join('');

  keypad.querySelectorAll('.pin-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const display = document.getElementById('pinDisplay');
      const digits = display.querySelectorAll('.pin-digit');
      const filled = Array.from(digits).filter(d => d.textContent).length;
      if (btn.dataset.key === 'C') {
        digits.forEach(d => d.textContent = '');
        document.getElementById('pinError').style.display = 'none';
      } else if (btn.dataset.key === 'del') {
        const last = Array.from(digits).reverse().find(d => d.textContent);
        if (last) last.textContent = '';
      } else if (filled < 4) {
        digits[filled].textContent = btn.dataset.key;
        digits[filled].classList.add('filled');
        if (filled === 3) setTimeout(checkPin, 100);
      }
    });
  });
}

function checkPin() {
  const display = document.getElementById('pinDisplay');
  const entered = Array.from(display.querySelectorAll('.pin-digit')).map(d => d.textContent).join('');
  if (entered === ADMIN_PIN) {
    closePinModal();
    openAdmin();
  } else {
    document.getElementById('pinError').style.display = 'block';
    display.innerHTML = '<div class="pin-digit"></div><div class="pin-digit"></div><div class="pin-digit"></div><div class="pin-digit"></div>';
  }
}

document.getElementById('resetPinLink').addEventListener('click', e => {
  e.preventDefault();
  const newPin = prompt('Set a new PIN (4 digits):');
  if (newPin && /^\d{4}$/.test(newPin)) {
    ADMIN_PIN = newPin;
    localStorage.setItem('anita_pin', ADMIN_PIN);
    showToast('PIN updated to: ' + newPin);
  } else if (newPin) { showToast('PIN must be exactly 4 digits'); }
});

// ── Admin ──
function openAdmin() {
  document.getElementById('adminPanel').classList.add('open');
  document.getElementById('adminOverlay').classList.add('open');
  document.getElementById('adminClose').addEventListener('click', closeAdmin);
  document.getElementById('adminOverlay').addEventListener('click', closeAdmin);
  switchAdminTab('dashboard');
  renderAdminStats();
  renderAdminOrdersTable();
  renderAdminProducts();
  renderCategoryBars();
  initChart();
  initProductForm();
}

function closeAdmin() {
  document.getElementById('adminPanel').classList.remove('open');
  document.getElementById('adminOverlay').classList.remove('open');
}

function switchAdminTab(tab) {
  adminTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.adminTab === tab));
  document.querySelectorAll('.admin-content').forEach(c => c.classList.toggle('active', c.id === 'admin'+tab.charAt(0).toUpperCase()+tab.slice(1)));
  if (tab === 'orders-admin') renderAdminFullOrders();
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('.admin-tab').forEach(t => {
  t.addEventListener('click', () => switchAdminTab(t.dataset.adminTab));
});

function renderAdminStats() {
  const totalRevenue = orders.reduce((s,o) => s + o.total, 0);
  const totalProfit = orders.reduce((s,o) => s + (o.profit||0), 0);
  document.getElementById('adminRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('adminProfit').textContent = formatCurrency(totalProfit);
  document.getElementById('adminTotalOrders').textContent = orders.length;
  document.getElementById('adminProductCount').textContent = products.length;
}

function renderAdminOrdersTable() {
  const tb = document.getElementById('adminOrdersTable');
  if (!tb) return;
  tb.innerHTML = orders.slice(0,20).map(o => `
    <tr>
      <td><code style="font-size:11px">${o.id}</code></td>
      <td>${o.customer}</td>
      <td>${o.items.length} item${o.items.length!==1?'s':''}</td>
      <td><strong>${formatCurrency(o.total)}</strong></td>
      <td>
        <select class="admin-status-btn" onchange="updateOrderStatus('${o.id}', this.value)" style="text-transform:capitalize;background:${statusColor(o.status)}22;color:${statusColor(o.status)}">
          ${['pending','confirmed','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>${o.date}</td>
      <td><button class="admin-status-btn" onclick="deleteOrder('${o.id}')" style="color:var(--rose)">Delete</button></td>
    </tr>
  `).join('');
}

function renderAdminFullOrders() {
  const tb = document.getElementById('adminFullOrdersTable');
  if (!tb) return;
  tb.innerHTML = orders.map(o => `
    <tr>
      <td><code style="font-size:11px">${o.id}</code></td>
      <td>${o.customer}</td>
      <td>${o.email||'-'}</td>
      <td>${o.items.map(it => { const p = products.find(x=>x.id===it.id); return `${p?.emoji||''}×${it.qty}`; }).join(' ')}</td>
      <td>${formatCurrency(o.subtotal)}</td>
      <td>${formatCurrency(o.tax)}</td>
      <td><strong>${formatCurrency(o.total)}</strong></td>
      <td style="color:var(--text2)">${formatCurrency(o.cost)}</td>
      <td style="color:var(--emerald)">${formatCurrency(o.profit||0)}</td>
      <td>
        <select class="admin-status-btn" onchange="updateOrderStatus('${o.id}', this.value)" style="text-transform:capitalize">
          ${['pending','confirmed','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>${o.date}</td>
      <td><button class="admin-status-btn" onclick="deleteOrder('${o.id}')" style="color:var(--rose)">✕</button></td>
    </tr>
  `).join('');
}

window.updateOrderStatus = function(id, status) {
  const o = orders.find(x => x.id === id);
  if (o) { o.status = status; saveOrders(); renderAdminStats(); }
};

window.deleteOrder = function(id) {
  if (confirm('Delete this order?')) {
    orders = orders.filter(x => x.id !== id);
    saveOrders();
    renderAdminStats();
    renderAdminOrdersTable();
    renderAdminFullOrders();
  }
};

function renderAdminProducts() {
  const grid = document.getElementById('adminProductsGrid');
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <div class="admin-product-card">
      <span class="admin-product-emoji">${p.emoji}</span>
      <div class="admin-product-name">${p.name}</div>
      <div class="admin-product-cat">${p.category}</div>
      <div class="admin-product-price">${formatCurrency(p.price)} <span style="font-size:11px;color:var(--text3);font-weight:400">· Cost: ${formatCurrency(p.cost)}</span></div>
      <div style="font-size:12px;margin-top:6px;color:${p.stock<15?'var(--rose)':'var(--text3)'}">Stock: ${p.stock}</div>
      <div class="admin-product-actions">
        <button onclick="editProduct(${p.id})">Edit</button>
        <button onclick="deleteProduct(${p.id})" style="color:var(--rose)">Delete</button>
      </div>
    </div>
  `).join('');
}

function initProductForm() {
  document.getElementById('adminAddProductBtn').addEventListener('click', () => switchAdminTab('add-product'));
  document.getElementById('productForm').addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;
    const data = {
      name: document.getElementById('productName').value.trim(),
      category: document.getElementById('productCategory').value,
      price: parseFloat(document.getElementById('productPrice').value) || 0,
      cost: parseFloat(document.getElementById('productCost').value) || 0,
      rating: parseFloat(document.getElementById('productRating').value) || 4.5,
      reviews: parseInt(document.getElementById('productReviews').value) || 0,
      description: document.getElementById('productDescription').value.trim(),
      emoji: document.getElementById('productEmoji').value.trim() || '👚',
      color: document.getElementById('productColor').value || '#a855f7',
      stock: parseInt(document.getElementById('productStock').value) || 0
    };
    if (id) {
      const idx = products.findIndex(x => x.id === parseInt(id));
      if (idx > -1) { products[idx] = {...products[idx], ...data}; showToast('Product updated!'); }
    } else {
      data.id = products.length ? Math.max(...products.map(x=>x.id))+1 : 1;
      products.push(data);
      showToast('Product added!');
    }
    saveProducts(); renderProducts(); renderAdminProducts(); renderAdminStats();
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('productFormSubmitText').textContent = 'Save Product';
    document.getElementById('cancelEditBtn').style.display = 'none';
    switchAdminTab('products');
  });
  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('productFormSubmitText').textContent = 'Save Product';
    document.getElementById('cancelEditBtn').style.display = 'none';
  });
}

window.editProduct = function(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('editProductId').value = id;
  document.getElementById('productName').value = p.name;
  document.getElementById('productCategory').value = p.category;
  document.getElementById('productPrice').value = p.price;
  document.getElementById('productCost').value = p.cost;
  document.getElementById('productRating').value = p.rating;
  document.getElementById('productReviews').value = p.reviews;
  document.getElementById('productDescription').value = p.description || '';
  document.getElementById('productEmoji').value = p.emoji;
  document.getElementById('productColor').value = p.color;
  document.getElementById('productStock').value = p.stock;
  document.getElementById('productFormSubmitText').textContent = 'Update Product';
  document.getElementById('cancelEditBtn').style.display = 'inline-flex';
  switchAdminTab('add-product');
};

window.deleteProduct = function(id) {
  if (confirm('Delete this product?')) {
    products = products.filter(x => x.id !== id);
    saveProducts(); renderProducts(); renderAdminProducts(); renderAdminStats();
  }
};

function renderCategoryBars() {
  const container = document.getElementById('categoryBars');
  if (!container) return;
  const cats = ['dresses','tops','bottoms','ethnic','accessories'];
  const totalRevenue = orders.reduce((s,o) => s + o.total, 0) || 1;
  container.innerHTML = cats.map(cat => {
    const catRevenue = orders.reduce((s,o) => {
      return s + o.items.filter(it => { const p = products.find(x=>x.id===it.id); return p?.category === cat; }).reduce((ss,it) => {
        const p = products.find(x=>x.id===it.id); return ss + (p?.price||0)*it.qty;
      }, 0);
    }, 0);
    const pct = (catRevenue / totalRevenue * 100).toFixed(1);
    return `<div class="cat-bar">
      <div class="cat-bar-label"><span style="text-transform:capitalize">${cat}</span><span>${pct}%</span></div>
      <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%;background:${['#a855f7','#06b6d4','#ec4899','#f59e0b','#10b981'][cats.indexOf(cat)]}"></div></div>
    </div>`;
  }).join('');
}

// ── Chart ──
let chartInstance = null;
function initChart() {
  const canvasEl = document.getElementById('revenueChart');
  if (!canvasEl) return;
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  const ctx2d = canvasEl.getContext('2d');
  const draw = () => {
    const w = canvasEl.offsetWidth;
    const h = canvasEl.offsetHeight;
    canvasEl.width = w; canvasEl.height = h;
    ctx2d.clearRect(0,0,w,h);

    const labels = [];
    const revenueData = [];
    const profitData = [];
    const periods = {week:7, month:30, year:365}[period] || 7;
    for (let i = periods-1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i);
      const key = d.toLocaleDateString('en-IN', {month:'short',day:'numeric'});
      labels.push(key);
      const dayOrders = orders.filter(o => new Date(o.date+' '+new Date().getFullYear()) >= d && new Date(o.date+' '+new Date().getFullYear()) <= d);
      revenueData.push(orders.reduce((s,o) => s + o.total, 0) / periods);
      profitData.push(orders.reduce((s,o) => s + (o.profit||0), 0) / periods);
    }

    const maxR = Math.max(...revenueData, 1);
    const barW = (w - 60) / (labels.length || 1);
    const drawLine = (data, color) => {
      ctx2d.beginPath();
      data.forEach((v,i) => {
        const x = 30 + i * barW + barW/2;
        const y = h - 30 - (v/maxR)*(h-50);
        if (i===0) ctx2d.moveTo(x,y); else ctx2d.lineTo(x,y);
      });
      ctx2d.strokeStyle = color; ctx2d.lineWidth = 2.5; ctx2d.stroke();
      data.forEach((v,i) => {
        const x = 30 + i * barW + barW/2;
        const y = h - 30 - (v/maxR)*(h-50);
        ctx2d.beginPath(); ctx2d.arc(x,y,4,0,Math.PI*2);
        ctx2d.fillStyle = color; ctx2d.fill();
      });
    };
    ctx2d.font = '10px Space Grotesk'; ctx2d.fillStyle = '#94a3b8';
    labels.forEach((l,i) => {
      const x = 30 + i*barW; ctx2d.fillText(l, x, h-10);
    });
    drawLine(revenueData, '#a855f7');
    drawLine(profitData, '#06b6d4');
  };

  let period = 'week';
  document.querySelectorAll('.chart-period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      period = btn.dataset.period;
      draw();
    });
  });
  draw();
}

// ── Toast ──
function showToast(msg) {
  let c = document.getElementById('toastContainer');
  if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; c.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.style.cssText = 'padding:12px 20px;background:var(--text);color:#fff;border-radius:10px;font-size:13px;font-weight:500;animation:slideUp .3s ease;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 2500);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initNavScrollSpy();
  initHeroCounters();
  initFilters();
  renderProducts();
  initCart();
  initCheckout();
  initOrderLookup();

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(el.dataset.goto);
      if (target) target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
});
