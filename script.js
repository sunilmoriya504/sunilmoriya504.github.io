// ANITA COLLECTION — script.js
// Default PIN: 1234 — change in ADMIN_PIN variable below

let ADMIN_PIN = localStorage.getItem('anita_pin') || '1234';

let products = JSON.parse(localStorage.getItem('anita_products'));
let orders = JSON.parse(localStorage.getItem('anita_orders')) || [];
let cart = JSON.parse(localStorage.getItem('anita_cart')) || [];

if (!products) {
    products = [
        {id:1,name:"Floral Print Summer Dress",category:"dresses",price:899,cost:280,rating:4.6,reviews:124,emoji:"👗",color:"#ec4899",stock:45},
        {id:2,name:"Embroidered Anarkali Kurti",category:"ethnic",price:1499,cost:480,rating:4.8,reviews:89,emoji:"🥻",color:"#a855f7",stock:30},
        {id:3,name:"Silk Blend Saree",category:"ethnic",price:2199,cost:720,rating:4.9,reviews:201,emoji:"🥻",color:"#f59e0b",stock:25},
        {id:4,name:"Ruffle Sleeve Top",category:"tops",price:549,cost:160,rating:4.4,reviews:156,emoji:"👚",color:"#06b6d4",stock:70},
        {id:5,name:"Tailored Palazzo Pants",category:"bottoms",price:699,cost:210,rating:4.5,reviews:98,emoji:"👖",color:"#10b981",stock:55},
        {id:6,name:"Pearl Drop Earrings",category:"accessories",price:299,cost:60,rating:4.7,reviews:312,emoji:"💎",color:"#f43f5e",stock:120},
        {id:7,name:"Designer Clutch Purse",category:"accessories",price:799,cost:200,rating:4.6,reviews:74,emoji:"👜",color:"#8b5cf6",stock:40},
        {id:8,name:"Lace Midi Dress",category:"dresses",price:1299,cost:420,rating:4.7,reviews:67,emoji:"👗",color:"#ec4899",stock:20},
        {id:9,name:"Cotton Kantha Kurti",category:"ethnic",price:799,cost:240,rating:4.5,reviews:183,emoji:"👚",color:"#a855f7",stock:60},
        {id:10,name:"Off-Shoulder Blouse Top",category:"tops",price:649,cost:190,rating:4.3,reviews:92,emoji:"👚",color:"#06b6d4",stock:48}
    ];
    localStorage.setItem('anita_products', JSON.stringify(products));
}

// ── Cursor Trail ──
let mx = 0, my = 0;
const canvas = document.getElementById('cursor-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const trail = [];
const TRAIL_LEN = 28;

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    trail.push({x: mx, y: my, alpha: 1});
    if (trail.length > TRAIL_LEN) trail.shift();
});

function drawTrail() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    trail.forEach((p, i) => {
        const progress = i / trail.length;
        const radius = progress * 18;
        const alpha = progress * 0.25;
        const hue = (i * 12) % 360;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},80%,65%,${alpha})`;
        ctx.fill();
    });
    requestAnimationFrame(drawTrail);
}
drawTrail();

// Cursor follower
const follower = document.getElementById('cursor-follower');
document.addEventListener('mousemove', e => {
    if (follower) {
        follower.style.left = e.clientX + 'px';
        follower.style.top = e.clientY + 'px';
    }
});

// ── Format ──
function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN', {minimumFractionDigits:0,maximumFractionDigits:2}); }

// ── Products ──
function renderProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
    let filtered = products.filter(p => {
        const matchFilter = filter === 'all' || p.category === filter;
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.includes(q);
        return matchFilter && matchSearch;
    });

    grid.innerHTML = filtered.length ? filtered.map(p => `
        <div class="product-card" style="--product-color:${p.color}" data-id="${p.id}">
            <div class="product-glow"></div>
            <div class="product-image">
                <span class="product-badge">${p.category}</span>
                <span class="product-rating">⭐ ${p.rating}</span>
                ${p.emoji}
            </div>
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-category-tag">${p.category}</div>
                <div class="product-bottom">
                    <div class="product-price">${fmt(p.price)}</div>
                    <div class="product-actions">
                        <button class="add-cart-btn" onclick="event.stopPropagation();addToCart(${p.id})" title="Add to cart">+</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('') : `
        <div class="no-products">
            <div class="no-products-emoji">👗</div>
            <p>No products found</p>
        </div>
    `;

    // Intersection observer for scroll reveal
    const cards = grid.querySelectorAll('.product-card');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    cards.forEach((c, i) => { c.style.animationDelay = i * 0.07 + 's'; obs.observe(c); });
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.dataset.filter);
        });
    });
    document.getElementById('searchInput')?.addEventListener('input', () => {
        const active = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        renderProducts(active);
    });
}

// ── Cart ──
function addToCart(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const existing = cart.find(x => x.id === id);
    if (existing) existing.qty++;
    else cart.push({id, qty: 1});
    saveCart();
    renderCart();
    showToast(`${p.emoji} ${p.name} added to cart`);
}

function removeFromCart(id) {
    cart = cart.filter(x => x.id !== id);
    saveCart();
    renderCart();
}

function changeQty(id, delta) {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { cart = cart.filter(x => x.id !== id); }
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem('anita_cart', JSON.stringify(cart));
    document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function renderCart() {
    const items = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    const itemCount = document.getElementById('cartItemCount');
    if (!items) return;

    itemCount.textContent = `(${cart.reduce((s, i) => s + i.qty, 0)})`;

    if (!cart.length) {
        items.innerHTML = '';
        empty.style.display = 'flex';
        footer.style.display = 'none';
        return;
    }
    empty.style.display = 'none';
    footer.style.display = 'flex';

    let subtotal = 0;
    items.innerHTML = cart.map(item => {
        const p = products.find(x => x.id === item.id);
        if (!p) return '';
        subtotal += p.price * item.qty;
        return `
            <div class="cart-item">
                <div class="cart-item-emoji">${p.emoji}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${p.name}</div>
                    <div class="cart-item-meta">${fmt(p.price)} × ${item.qty}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeQty(${p.id},-1)">−</button>
                    <span class="cart-qty-num">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${p.id})">×</button>
            </div>
        `;
    }).join('');

    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    document.getElementById('cartSubtotal').textContent = fmt(subtotal);
    document.getElementById('cartTax').textContent = fmt(tax);
    document.getElementById('cartTotal').textContent = fmt(total);
}

function initCart() {
    document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
    renderCart();

    document.getElementById('navCart')?.addEventListener('click', openCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
    document.getElementById('cartClose')?.addEventListener('click', closeCart);
    document.getElementById('checkoutBtn')?.addEventListener('click', () => { closeCart(); openCheckoutModal(); });
}

function openCart() {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeCart() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
}

// ── Checkout ──
let checkoutStep = 1;

function initCheckout() {
    document.getElementById('modalClose')?.addEventListener('click', closeCheckoutModal);
    document.getElementById('continueShoppingBtn')?.addEventListener('click', closeCheckoutModal);
    document.getElementById('nextStepBtn')?.addEventListener('click', advanceStep);
    document.getElementById('prevStepBtn')?.addEventListener('click', () => { checkoutStep--; showStep(checkoutStep); });
    document.querySelectorAll('.payment-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
}

function openCheckoutModal() {
    checkoutStep = 1;
    showStep(1);
    document.getElementById('checkoutModal')?.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeCheckoutModal() {
    document.getElementById('checkoutModal')?.classList.remove('open');
    document.body.style.overflow = '';
}

function showStep(step) {
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
    document.querySelector(`.checkout-step[data-step="${step}"]`)?.classList.add('active');
    const prev = document.getElementById('prevStepBtn');
    const next = document.getElementById('nextStepBtn');
    if (prev) prev.style.display = step > 1 ? 'inline-flex' : 'none';
    if (next) {
        next.innerHTML = step === 3 ? '<span>Place Order</span>' : '<span>Next</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    }
}

function advanceStep() {
    if (checkoutStep === 1) {
        const name = document.getElementById('checkoutName')?.value?.trim();
        const email = document.getElementById('checkoutEmail')?.value?.trim();
        if (!name || !email) { showToast('Please fill name and email'); return; }
    }
    if (checkoutStep === 2) {
        const addr = document.getElementById('checkoutAddress')?.value?.trim();
        if (!addr) { showToast('Please fill shipping address'); return; }
    }
    if (checkoutStep === 3) {
        placeOrder();
        return;
    }
    checkoutStep++;
    showStep(checkoutStep);
}

function placeOrder() {
    const name = document.getElementById('checkoutName')?.value?.trim() || '';
    const email = document.getElementById('checkoutEmail')?.value?.trim() || '';
    const phone = document.getElementById('checkoutPhone')?.value?.trim() || '';
    const address = document.getElementById('checkoutAddress')?.value?.trim() || '';
    const city = document.getElementById('checkoutCity')?.value?.trim() || '';
    const zip = document.getElementById('checkoutZip')?.value?.trim() || '';
    const upiRef = document.getElementById('checkoutCard')?.value?.trim() || '';

    const orderItems = cart.map(item => {
        const p = products.find(x => x.id === item.id);
        return { id: item.id, name: p?.name || '', emoji: p?.emoji || '', price: p?.price || 0, qty: item.qty, cost: p?.cost || 0 };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const totalCost = orderItems.reduce((s, i) => s + i.cost * i.qty, 0);
    const profit = subtotal - totalCost;

    const orderId = 'ANI' + Date.now().toString(36).toUpperCase();
    const order = { id: orderId, customer: name, email, phone, address, city, zip, items: orderItems, subtotal, tax, total, profit, cost: totalCost, status: 'pending', date: new Date().toLocaleDateString('en-IN'), upiRef };

    orders.unshift(order);
    localStorage.setItem('anita_orders', JSON.stringify(orders));
    cart = [];
    saveCart();

    document.getElementById('newOrderId').textContent = orderId;
    checkoutStep = 4;
    showStep(4);
    showToast('Order placed successfully! 🎉');
}

// ── Order Tracking ──
function initOrderLookup() {
    document.getElementById('lookupOrderBtn')?.addEventListener('click', () => {
        const id = document.getElementById('orderLookupInput')?.value?.trim()?.toUpperCase();
        const result = document.getElementById('orderResult');
        if (!id) { showToast('Please enter an order ID'); return; }
        const order = orders.find(o => o.id === id || o.id.toLowerCase() === id.toLowerCase());
        if (!order) { result.innerHTML = '<div class="order-result-empty">No order found with this ID. Please check and try again.</div>'; return; }
        const statusClass = order.status;
        result.innerHTML = `
            <div class="order-result-header">
                <span class="order-result-id">${order.id}</span>
                <span class="order-result-status ${statusClass}">${order.status.toUpperCase()}</span>
            </div>
            <p style="font-size:14px;color:var(--text2)">${order.customer} — ${order.email}</p>
            <div class="order-result-items">${order.items.map(i => `<div class="order-result-item"><span>${i.emoji} ${i.name} × ${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`).join('')}</div>
            <div class="order-result-totals">
                <div style="display:flex;justify-content:space-between"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
                <div style="display:flex;justify-content:space-between;color:var(--text2)"><span>Tax (8%)</span><span>${fmt(order.tax)}</span></div>
                <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px"><span>Total</span><span>${fmt(order.total)}</span></div>
            </div>
        `;
    });
}

// ── Admin ──
function openAdmin() {
    document.getElementById('adminPanel')?.classList.add('open');
    document.getElementById('adminOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderAdminStats();
    renderAdminOrdersTable();
    renderCategoryBars();
    initChart();
}
function closeAdmin() {
    document.getElementById('adminPanel')?.classList.remove('open');
    document.getElementById('adminOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.adminTab === tab));

    const tabIdMap = {
        dashboard: 'adminDashboard',
        products: 'adminProducts',
        'orders-admin': 'adminOrdersAdmin',
        'add-product': 'adminAddProduct'
    };

    document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
    const targetId = tabIdMap[tab] || 'adminDashboard';
    document.getElementById(targetId)?.classList.add('active');

    if (tab === 'dashboard') { renderAdminStats(); renderAdminOrdersTable(); renderCategoryBars(); initChart(); }
    if (tab === 'products') { renderAdminProducts(); }
    if (tab === 'orders-admin') { renderAdminFullOrders(); }
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function renderAdminStats() {
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const profit = orders.reduce((s, o) => s + (o.profit || 0), 0);
    document.getElementById('adminRevenue').textContent = fmt(revenue);
    document.getElementById('adminProfit').textContent = fmt(profit);
    document.getElementById('adminTotalOrders').textContent = orders.length;
    document.getElementById('adminProductCount').textContent = products.length;
}

function renderAdminOrdersTable(status = 'all') {
    const tbody = document.getElementById('adminOrdersTable');
    if (!tbody) return;
    const filtered = status === 'all' ? orders : orders.filter(o => o.status === status);
    tbody.innerHTML = filtered.slice(0, 10).map(o => `
        <tr>
            <td><span style="font-family:monospace;font-size:11px">${o.id}</span></td>
            <td>${o.customer}</td>
            <td>${o.items.map(i => `${i.emoji}×${i.qty}`).join(', ')}</td>
            <td style="font-weight:600">${fmt(o.total)}</td>
            <td style="color:var(--emerald);font-weight:600">${fmt(o.profit)}</td>
            <td>
                <select onchange="window.updateOrderStatus('${o.id}', this.value)" style="padding:4px 10px;border-radius:50px;font-size:12px;font-weight:600;border:1.5px solid var(--border);background:var(--bg);font-family:var(--font);cursor:pointer">
                    ${['pending','confirmed','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
                </select>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">No orders yet</td></tr>';
}

window.updateOrderStatus = function(id, status) {
    const order = orders.find(o => o.id === id);
    if (order) { order.status = status; localStorage.setItem('anita_orders', JSON.stringify(orders)); renderAdminStats(); renderAdminOrdersTable(); }
};

function renderAdminFullOrders() {
    const tbody = document.getElementById('adminFullOrdersTable');
    if (!tbody) return;
    const q = (document.getElementById('adminOrdersSearch')?.value || '').toLowerCase();
    const filtered = orders.filter(o => !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q));
    tbody.innerHTML = filtered.map(o => `
        <tr>
            <td><span style="font-family:monospace;font-size:10px">${o.id}</span></td>
            <td>${o.customer}</td>
            <td style="color:var(--text2)">${o.email}</td>
            <td>${o.items.map(i => `${i.emoji}×${i.qty}`).join(', ')}</td>
            <td>${fmt(o.subtotal)}</td>
            <td>${fmt(o.tax)}</td>
            <td style="font-weight:700">${fmt(o.total)}</td>
            <td style="color:var(--text2)">${fmt(o.cost)}</td>
            <td style="color:var(--emerald);font-weight:700">${fmt(o.profit)}</td>
            <td>
                <select onchange="window.updateOrderStatus('${o.id}', this.value)" style="padding:4px 8px;border-radius:50px;font-size:11px;font-weight:600;border:1.5px solid var(--border);background:var(--bg);font-family:var(--font);cursor:pointer">
                    ${['pending','confirmed','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
                </select>
            </td>
            <td style="color:var(--text3);font-size:11px">${o.date}</td>
        </tr>
    `).join('') || '<tr><td colspan="12" style="text-align:center;color:var(--text3);padding:24px">No orders found</td></tr>';
}

function renderCategoryBars() {
    const container = document.getElementById('categoryBars');
    if (!container) return;
    const cats = ['dresses','ethnic','tops','bottoms','accessories'];
    const catData = cats.map(cat => {
        const catOrders = orders.filter(o => o.items.some(i => {
            const p = products.find(x => x.id === i.id);
            return p?.category === cat;
        }));
        const revenue = catOrders.reduce((s, o) => s + o.total, 0);
        return { cat, revenue };
    });
    const max = Math.max(...catData.map(c => c.revenue), 1);
    const colors = {dresses:'#ec4899',ethnic:'#a855f7',tops:'#06b6d4',bottoms:'#10b981',accessories:'#f43f5e'};
    container.innerHTML = catData.map(c => `
        <div class="category-bar">
            <div class="category-bar-label">
                <span style="text-transform:capitalize">${c.cat}</span>
                <span style="font-weight:600">${fmt(c.revenue)}</span>
            </div>
            <div class="category-bar-track">
                <div class="category-bar-fill" style="width:${(c.revenue/max)*100}%;background:${colors[c.cat]||'var(--violet)'}"></div>
            </div>
        </div>
    `).join('');
}

function renderAdminProducts() {
    const grid = document.getElementById('adminProductsGrid');
    if (!grid) return;
    grid.innerHTML = products.map(p => `
        <div class="admin-product-card">
            <div class="admin-product-emoji">${p.emoji}</div>
            <div class="admin-product-name">${p.name}</div>
            <div class="admin-product-cat">${p.category}</div>
            <div class="admin-product-price">${fmt(p.price)}</div>
            <div class="admin-product-stock">Stock: ${p.stock}</div>
            <div class="admin-product-actions">
                <button class="btn-sm btn-edit" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn-sm btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

window.editProduct = function(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('editProductId').value = id;
    document.getElementById('productName').value = p.name;
    document.getElementById('productCategory').value = p.category;
    document.getElementById('productPrice').value = p.price;
    document.getElementById('productCost').value = p.cost;
    document.getElementById('productStock').value = p.stock;
    document.getElementById('productRating').value = p.rating;
    document.getElementById('productEmoji').value = p.emoji;
    document.getElementById('productColor').value = p.color;
    document.getElementById('productDescription').value = '';
    document.getElementById('productFormSubmitText').textContent = 'Update Product';
    document.getElementById('cancelEditBtn').style.display = 'inline-flex';
    switchAdminTab('add-product');
};

window.deleteProduct = function(id) {
    if (!confirm('Delete this product?')) return;
    products = products.filter(x => x.id !== id);
    localStorage.setItem('anita_products', JSON.stringify(products));
    renderAdminProducts();
    renderAdminStats();
    showToast('Product deleted');
};

function initProductForm() {
    const form = document.getElementById('productForm');
    form?.addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('editProductId').value;
        const data = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value) || 0,
            cost: parseFloat(document.getElementById('productCost').value) || 0,
            stock: parseInt(document.getElementById('productStock').value) || 0,
            rating: parseFloat(document.getElementById('productRating').value) || 4.5,
            emoji: document.getElementById('productEmoji').value || '👗',
            color: document.getElementById('productColor').value || '#a855f7'
        };

        if (id) {
            const idx = products.findIndex(x => x.id === parseInt(id));
            if (idx !== -1) { products[idx] = {...products[idx], ...data}; showToast('Product updated!'); }
        } else {
            data.id = Date.now();
            products.push(data);
            showToast('Product added!');
        }

        localStorage.setItem('anita_products', JSON.stringify(products));
        form.reset();
        document.getElementById('editProductId').value = '';
        document.getElementById('productFormSubmitText').textContent = 'Save Product';
        document.getElementById('cancelEditBtn').style.display = 'none';
        renderAdminProducts();
        renderAdminStats();
        renderProducts();
    });

    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
        form?.reset();
        document.getElementById('editProductId').value = '';
        document.getElementById('productFormSubmitText').textContent = 'Save Product';
        document.getElementById('cancelEditBtn').style.display = 'none';
    });

    document.getElementById('adminAddProductBtn')?.addEventListener('click', () => switchAdminTab('add-product'));
    document.getElementById('adminOrdersSearch')?.addEventListener('input', renderAdminFullOrders);

    document.querySelectorAll('.table-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.table-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAdminOrdersTable(btn.dataset.status);
        });
    });

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAdminTab(tab.dataset.adminTab));
    });

    document.getElementById('adminClose')?.addEventListener('click', closeAdmin);
}

// ── Chart ──
let chartCanvas, chartCtx, chartData;
function initChart() {
    chartCanvas = document.getElementById('revenueChart');
    if (!chartCanvas) return;
    chartCtx = chartCanvas.getContext('2d');
    chartData = buildChartData();
    draw();
    document.querySelectorAll('.chart-period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            chartData = buildChartData(btn.dataset.period);
            draw();
        });
    });
}

function buildChartData(period = 'week') {
    const days = period === 'week' ? 7 : 30;
    const now = new Date();
    const labels = [];
    const revenue = [];
    const profit = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-IN', {day:'2-digit',month:'short'});
        labels.push(dateStr);
        const dayOrders = orders.filter(o => {
            const orderDate = new Date(o.date);
            return Math.abs(orderDate - d) < 86400000;
        });
        revenue.push(dayOrders.reduce((s, o) => s + o.total, 0));
        profit.push(dayOrders.reduce((s, o) => s + o.profit, 0));
    }
    return { labels, revenue, profit };
}

function draw() {
    if (!chartCanvas || !chartCtx) return;
    const W = chartCanvas.parentElement.clientWidth;
    const H = 200;
    chartCanvas.width = W;
    chartCanvas.height = H;
    const ctx = chartCtx;
    const { labels, revenue, profit } = chartData;
    const max = Math.max(...revenue, ...profit, 1);

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * H;
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }

    // Revenue line (violet)
    ctx.beginPath();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    revenue.forEach((v, i) => {
        const x = (i / (labels.length - 1)) * W;
        const y = H - (v / max) * (H - 20) - 10;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Profit line (cyan)
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    profit.forEach((v, i) => {
        const x = (i / (labels.length - 1)) * W;
        const y = H - (v / max) * (H - 20) - 10;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
}

// ── Secret PIN System ──
let secretClickCount = 0;
let secretClickTimer = null;

document.getElementById('navBrand')?.addEventListener('click', () => {
    secretClickCount++;
    clearTimeout(secretClickTimer);
    if (secretClickCount >= 3) {
        secretClickCount = 0;
        openPinModal();
    } else {
        secretClickTimer = setTimeout(() => secretClickCount = 0, 800);
    }
});

function openPinModal() {
    const modal = document.getElementById('pinModal');
    if (modal) modal.classList.add('open');
    document.getElementById('pinError').style.display = 'none';
    buildPinKeypad();
    clearPinInputs();
}

function closePinModal() {
    document.getElementById('pinModal')?.classList.remove('open');
}

function buildPinKeypad() {
    const keypad = document.getElementById('pinKeypad');
    if (!keypad) return;
    let html = '';
    [1,2,3,4,5,6,7,8,9,'C',0,'⌫'].forEach(k => {
        html += `<button class="pin-key ${k==='C'||k==='⌫'?'action':''}" data-key="${k}">${k}</button>`;
    });
    keypad.innerHTML = html;
    keypad.querySelectorAll('.pin-key').forEach(btn => {
        btn.addEventListener('click', () => handlePinKey(btn.dataset.key));
    });
    document.getElementById('pinCancel')?.addEventListener('click', closePinModal);
}

let currentPin = '';
function handlePinKey(key) {
    if (key === 'C') { currentPin = ''; clearPinInputs(); return; }
    if (key === '⌫') { currentPin = currentPin.slice(0, -1); updatePinDisplay(); return; }
    if (currentPin.length >= 4) return;
    currentPin += key;
    updatePinDisplay();
    if (currentPin.length === 4) verifyPin();
}

function updatePinDisplay() {
    const display = document.getElementById('pinDisplay');
    if (!display) return;
    display.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        const d = document.createElement('div');
        d.className = 'pin-digit' + (i < currentPin.length ? ' filled' : '');
        if (i < currentPin.length) d.textContent = '●';
        display.appendChild(d);
    }
}

function clearPinInputs() { currentPin = ''; updatePinDisplay(); }

function verifyPin() {
    if (currentPin === ADMIN_PIN) {
        closePinModal();
        currentPin = '';
        openAdmin();
    } else {
        const digits = document.querySelectorAll('.pin-digit');
        digits.forEach(d => d.classList.add('error'));
        document.getElementById('pinError').style.display = 'block';
        setTimeout(() => {
            currentPin = '';
            clearPinInputs();
            digits.forEach(d => d.classList.remove('error'));
        }, 600);
    }
}

// ── Toast ──
function showToast(msg) {
    let c = document.getElementById('toastContainer');
    if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; c.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px'; document.body.appendChild(c); }
    const t = document.createElement('div');
    t.style.cssText = 'padding:12px 20px;background:var(--text);color:#fff;border-radius:10px;font-size:13px;font-weight:500;animation:slideUp .3s ease;box-shadow:0 4px 20px rgba(0,0,0,.2)';
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(() => t.remove(), 300); }, 2500);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    initFilters();
    initCart();
    initCheckout();
    initOrderLookup();
    initProductForm();

    document.querySelectorAll('[data-goto]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById(el.dataset.goto);
            if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
        });
    });

    // Hero stat counters
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current).toLocaleString();
        }, 20);
    });
});
