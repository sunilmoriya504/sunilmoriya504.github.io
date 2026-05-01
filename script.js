/* ═══════════════════════════════════════════════
   BOUNTIFUL — script.js
   E-commerce + secret owner admin panel
═══════════════════════════════════════════════ */

// ── Seed Data ──
const INITIAL_PRODUCTS = [
    { id: 1, name: "Wireless Noise-Cancelling Headphones", category: "electronics", price: 129.99, cost: 42, rating: 4.8, reviews: 2431, emoji: "🎧", color: "#a855f7", stock: 45, description: "Premium wireless headphones with active noise cancellation." },
    { id: 2, name: "Mechanical RGB Keyboard", category: "electronics", price: 89.99, cost: 28, rating: 4.6, reviews: 1892, emoji: "⌨️", color: "#06b6d4", stock: 78, description: "Compact 75% mechanical keyboard with per-key RGB." },
    { id: 3, name: "Smart Fitness Tracker Watch", category: "electronics", price: 199.99, cost: 65, rating: 4.7, reviews: 3201, emoji: "⌚", color: "#ec4899", stock: 32, description: "Advanced fitness tracker with heart rate and sleep monitoring." },
    { id: 4, name: "Organic Cotton Oversized Hoodie", category: "fashion", price: 59.99, cost: 18, rating: 4.5, reviews: 876, emoji: "🧥", color: "#f59e0b", stock: 120, description: "100% organic cotton hoodie, relaxed oversized fit." },
    { id: 5, name: "Minimalist Leather Crossbody Bag", category: "fashion", price: 79.99, cost: 22, rating: 4.4, reviews: 654, emoji: "👜", color: "#10b981", stock: 55, description: "Handcrafted genuine leather crossbody bag." },
    { id: 6, name: "Handcrafted Ceramic Vase Set", category: "home", price: 49.99, cost: 14, rating: 4.3, reviews: 412, emoji: "🏺", color: "#f43f5e", stock: 28, description: "Set of 3 handcrafted ceramic vases in earth tones." },
    { id: 7, name: "Smart LED Desk Lamp", category: "home", price: 69.99, cost: 20, rating: 4.6, reviews: 728, emoji: "💡", color: "#6366f1", stock: 60, description: "Adjustable LED desk lamp with touch control and USB charging." },
    { id: 8, name: "Aromatherapy Diffuser + Oils", category: "home", price: 39.99, cost: 11, rating: 4.2, reviews: 534, emoji: "🫧", color: "#8b5cf6", stock: 90, description: "Ultrasonic aromatherapy diffuser with lavender and eucalyptus oils." },
    { id: 9, name: "Vitamin C Brightening Serum", category: "beauty", price: 34.99, cost: 8, rating: 4.7, reviews: 1823, emoji: "🧴", color: "#fbbf24", stock: 150, description: "20% Vitamin C serum for radiant, even-toned skin." },
    { id: 10, name: "Luxury Silk Sleep Mask", category: "beauty", price: 24.99, cost: 6, rating: 4.5, reviews: 967, emoji: "😴", color: "#34d399", stock: 200, description: "100% mulberry silk sleep mask with adjustable strap." },
    { id: 11, name: "Bamboo Yoga Mat Premium", category: "sports", price: 54.99, cost: 15, rating: 4.6, reviews: 1124, emoji: "🧘", color: "#f97316", stock: 75, description: "Extra thick eco-friendly yoga mat with alignment lines." },
    { id: 12, name: "Adjustable Resistance Bands Set", category: "sports", price: 29.99, cost: 7, rating: 4.4, reviews: 2341, emoji: "💪", color: "#a3e635", stock: 180, description: "Set of 5 resistance bands with varying tension levels." },
];

// ── State ──
let products = JSON.parse(localStorage.getItem('bountiful_products')) || INITIAL_PRODUCTS;
let orders = JSON.parse(localStorage.getItem('bountiful_orders')) || [];
let cart = JSON.parse(localStorage.getItem('bountiful_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('bountiful_wishlist')) || [];

// Admin PIN — default 1234, owner can change it
let ADMIN_PIN = localStorage.getItem('bountiful_pin') || '1234';
let secretUnlocked = false;
let adminIsOpen = false;
let currentFilter = 'all';
let searchQuery = '';
let checkoutStep = 1;

// ── Cursor Trail ──
function initCursor() {
    const canvas = document.getElementById('cursor-canvas');
    const follower = document.getElementById('cursor-follower');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let trail = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#f43f5e'];
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        follower.style.left = mouseX + 'px';
        follower.style.top = mouseY + 'px';
        trail.push({ x: mouseX, y: mouseY, color: colors[Math.floor(Math.random() * colors.length)], alpha: 1, radius: Math.random() * 4 + 2 });
        if (trail.length > 40) trail.shift();
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        trail.forEach((p, i) => {
            ctx.globalAlpha = (i / trail.length) * 0.6;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.alpha -= 0.015;
            p.radius *= 0.97;
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    draw();
}

// ── Nav Scroll ──
function initNavScroll() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
    document.querySelectorAll('.nav-link[data-goto], .btn[data-goto]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById(link.dataset.goto);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ── Hero Counters ──
function initHeroCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                const target = parseInt(el.dataset.count);
                let current = 0;
                const step = target / 60;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) { current = target; clearInterval(timer); }
                    el.textContent = Math.floor(current).toLocaleString();
                }, 16);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
}

// ── Products ──
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    let filtered = products.filter(p => {
        const matchCat = currentFilter === 'all' || p.category === currentFilter;
        const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-products"><p>No products found</p></div>';
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        const qty = cartItem ? cartItem.qty : 0;
        const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
        return `
        <div class="product-card" data-id="${p.id}" style="--card-color:${p.color}">
            <div class="product-image-placeholder" style="background:${p.color}22">
                <span class="product-emoji">${p.emoji}</span>
                ${qty > 0 ? `<span class="product-qty-badge">${qty}</span>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category-tag" style="color:${p.color};background:${p.color}18">${p.category}</div>
                <h3 class="product-name">${p.name}</h3>
                <div class="product-rating"><span class="stars">${stars}</span> <span class="rating-num">${p.rating}</span> <span class="review-count">(${p.reviews.toLocaleString()})</span></div>
                <div class="product-footer">
                    <div class="product-price">$${p.price.toFixed(2)}</div>
                    <div class="product-stock ${p.stock < 10 ? 'low' : ''}">${p.stock < 10 ? 'Low stock' : p.stock + ' in stock'}</div>
                </div>
                <div class="product-actions">
                    <div class="qty-control">
                        <button class="qty-btn" onclick="changeQty(${p.id},-1)">−</button>
                        <span class="qty-value" id="qty-${p.id}">${qty}</span>
                        <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
                    </div>
                    <button class="product-quick-add ${qty > 0 ? 'added' : ''}" onclick="addToCart(${p.id})">
                        ${qty > 0 ? '✓ Added' : '+ Add'}
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');

    // Scroll-in animation
    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 60);
    });
}

function changeQty(id, delta) {
    const idx = cart.findIndex(c => c.id === id);
    if (idx === -1 && delta === 1) {
        cart.push({ id, qty: 1 });
    } else if (idx !== -1) {
        cart[idx].qty = Math.max(0, cart[idx].qty + delta);
        if (cart[idx].qty === 0) cart.splice(idx, 1);
    }
    localStorage.setItem('bountiful_cart', JSON.stringify(cart));
    renderProducts();
    renderCart();
    updateCartCount();
}

function addToCart(id) {
    const idx = cart.findIndex(c => c.id === id);
    if (idx !== -1) {
        cart[idx].qty++;
    } else {
        cart.push({ id, qty: 1 });
    }
    localStorage.setItem('bountiful_cart', JSON.stringify(cart));
    renderProducts();
    renderCart();
    updateCartCount();
    showToast('Added to cart!', 'success');
}

function updateCartCount() {
    const count = cart.reduce((s, c) => s + c.qty, 0);
    const el = document.getElementById('cartCount');
    if (el) { el.textContent = count; el.style.transform = 'scale(1.4)'; setTimeout(() => el.style.transform = '', 200); }
}

function renderCart() {
    const items = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    const countEl = document.getElementById('cartItemCount');
    if (!items) return;

    if (cart.length === 0) {
        items.innerHTML = '';
        empty.style.display = 'flex';
        footer.style.display = 'none';
        countEl.textContent = '(0)';
        return;
    }

    empty.style.display = 'none';
    footer.style.display = 'block';
    countEl.textContent = `(${cart.reduce((s, c) => s + c.qty, 0)})`;

    items.innerHTML = cart.map(item => {
        const p = products.find(pr => pr.id === item.id);
        if (!p) return '';
        return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-emoji">${p.emoji}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${p.name}</div>
                <div class="cart-item-price">$${p.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="cart-qty-btn" onclick="changeQty(${item.id},-1)">−</button>
                <span>${item.qty}</span>
                <button class="cart-qty-btn" onclick="changeQty(${item.id},1)">+</button>
            </div>
            <div class="cart-item-total">$${(p.price * item.qty).toFixed(2)}</div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
        </div>`;
    }).join('');

    const subtotal = cart.reduce((s, item) => s + (products.find(p => p.id === item.id)?.price || 0) * item.qty, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    document.getElementById('cartSubtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('cartTax').textContent = '$' + tax.toFixed(2);
    document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
}

function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    localStorage.setItem('bountiful_cart', JSON.stringify(cart));
    renderProducts();
    renderCart();
    updateCartCount();
}

// ── Filters & Search ──
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderProducts();
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchQuery = e.target.value;
            renderProducts();
        });
    }
}

// ── Cart Drawer ──
function initCart() {
    const navCart = document.getElementById('navCart');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');

    navCart?.addEventListener('click', () => openCart());
    cartOverlay?.addEventListener('click', closeCart);
    cartClose?.addEventListener('click', closeCart);

    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn?.addEventListener('click', () => { closeCart(); openCheckoutModal(); });
}

function openCart() {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCart();
}

function closeCart() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
}

// ── Checkout ──
function initCheckout() {
    const modal = document.getElementById('checkoutModal');
    document.getElementById('modalClose')?.addEventListener('click', closeCheckoutModal);
    modal?.addEventListener('click', e => { if (e.target === modal) closeCheckoutModal(); });
    document.getElementById('prevStepBtn')?.addEventListener('click', () => { checkoutStep--; showStep(checkoutStep); });
    document.getElementById('nextStepBtn')?.addEventListener('click', () => {
        if (checkoutStep < 4) { checkoutStep++; showStep(checkoutStep); }
        if (checkoutStep === 4) placeOrder();
    });
    document.getElementById('continueShoppingBtn')?.addEventListener('click', closeCheckoutModal);

    document.querySelectorAll('.payment-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
}

function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal?.classList.add('open');
    document.body.style.overflow = 'hidden';
    checkoutStep = 1;
    showStep(1);
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal')?.classList.remove('open');
    document.body.style.overflow = '';
}

function showStep(step) {
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === step));
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    prevBtn.style.display = step > 1 ? '' : 'none';
    nextBtn.querySelector('span').textContent = step === 3 ? 'Place Order' : 'Next';
    prevBtn.style.display = step > 1 ? '' : 'none';
}

function placeOrder() {
    const name = document.getElementById('checkoutName')?.value.trim() || '';
    const email = document.getElementById('checkoutEmail')?.value.trim() || '';
    const phone = document.getElementById('checkoutPhone')?.value.trim() || '';
    const address = document.getElementById('checkoutAddress')?.value.trim() || '';
    const city = document.getElementById('checkoutCity')?.value.trim() || '';
    const zip = document.getElementById('checkoutZip')?.value.trim() || '';

    const orderItems = cart.map(item => {
        const p = products.find(pr => pr.id === item.id);
        return { id: item.id, name: p?.name || '', emoji: p?.emoji || '', price: p?.price || 0, qty: item.qty, cost: p?.cost || 0 };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const orderCost = orderItems.reduce((s, i) => s + (i.cost || 0) * i.qty, 0);
    const profit = total - orderCost;

    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
    const order = {
        id: orderId, customer: name, email, phone, address, city, zip,
        items: orderItems, subtotal, tax, total, orderCost, profit,
        status: 'pending', date: new Date().toISOString()
    };

    orders.unshift(order);
    localStorage.setItem('bountiful_orders', JSON.stringify(orders));
    localStorage.setItem('bountiful_cart', JSON.stringify([]));
    cart = [];

    document.getElementById('newOrderId').textContent = orderId;
    renderCart();
    updateCartCount();
    renderProducts();
    showToast('Order placed successfully!', 'success');
}

// ── Order Lookup ──
function initOrderLookup() {
    const btn = document.getElementById('lookupOrderBtn');
    const input = document.getElementById('orderLookupInput');
    btn?.addEventListener('click', doLookup);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') doLookup(); });
}

function doLookup() {
    const val = document.getElementById('orderLookupInput')?.value.trim().toUpperCase();
    const result = document.getElementById('orderResult');
    if (!val) { result.innerHTML = '<p style="color:#94a3b8;text-align:center;">Enter an order ID to track</p>'; return; }
    const order = orders.find(o => o.id === val);
    if (!order) { result.innerHTML = '<p style="color:#f43f5e;text-align:center;">Order not found. Check the ID and try again.</p>'; return; }

    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const statusIndex = statuses.indexOf(order.status);
    result.innerHTML = `
    <div class="order-detail-card">
        <div class="order-detail-header">
            <div><strong>${order.id}</strong></div>
            <span class="order-status status-${order.status}">${order.status}</span>
        </div>
        <div class="order-timeline">
            ${statuses.map((s, i) => `
            <div class="timeline-step ${i <= statusIndex ? 'done' : ''} ${i === statusIndex ? 'current' : ''}">
                <div class="timeline-dot">${i < statusIndex ? '✓' : i + 1}</div>
                <div class="timeline-label">${s.charAt(0).toUpperCase() + s.slice(1)}</div>
            </div>`).join('')}
        </div>
        <div class="order-items-list">
            ${order.items.map(item => `<div class="order-item-row"><span>${item.emoji} ${item.name} ×${item.qty}</span><span>$${(item.price * item.qty).toFixed(2)}</span></div>`).join('')}
        </div>
        <div class="order-totals"><div><span>Subtotal</span><span>$${order.subtotal.toFixed(2)}</span></div><div><span>Tax</span><span>$${order.tax.toFixed(2)}</span></div><div class="order-grand-total"><span>Total</span><span>$${order.total.toFixed(2)}</span></div></div>
        <div class="order-delivery">🚚 Estimated delivery: <strong>3-5 business days</strong></div>
    </div>`;
}

// ── Toast ──
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) { container = document.createElement('div'); container.id = 'toastContainer'; document.body.appendChild(container); }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2500);
}

// ═══════════════════════════════════════════════
// SECRET ADMIN SYSTEM — PIN GATE + BRAND CLICK
// ═══════════════════════════════════════════════

let secretClickCount = 0;
let secretClickTimer = null;

function initSecretAdmin() {
    // Triple-click on brand logo to reveal secret
    const brand = document.getElementById('navBrand');
    if (!brand) return;

    brand.addEventListener('click', () => {
        secretClickCount++;
        clearTimeout(secretClickTimer);
        secretClickTimer = setTimeout(() => { secretClickCount = 0; }, 600);

        if (secretClickCount >= 3) {
            secretClickCount = 0;
            showSecretHint();
        }
    });

    // PIN keypad
    buildPinKeypad();
    setupPinInputs();

    // Cancel PIN modal
    document.getElementById('pinCancelBtn')?.addEventListener('click', closePinModal);
    document.getElementById('pinClearBtn')?.addEventListener('click', clearPinInputs);
}

function showSecretHint() {
    const hint = document.getElementById('secretHint');
    if (!hint) return;
    hint.style.display = 'block';
    setTimeout(() => { hint.style.opacity = '0'; setTimeout(() => hint.style.display = 'none', 400); }, 2500);

    // Open PIN modal
    openPinModal();
}

function openPinModal() {
    const modal = document.getElementById('pinModal');
    if (!modal) return;
    modal.classList.add('open');
    clearPinInputs();
    document.getElementById('pinError').style.display = 'none';
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.querySelector('.pin-digit')?.focus(), 100);
}

function closePinModal() {
    document.getElementById('pinModal')?.classList.remove('open');
    document.body.style.overflow = '';
    clearPinInputs();
}

function buildPinKeypad() {
    const keypad = document.getElementById('pinKeypad');
    if (!keypad) return;
    const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
    keypad.innerHTML = keys.map(k => k === '' ? '<div></div>' : `<button class="pin-key" data-key="${k}">${k}</button>`).join('');
    keypad.querySelectorAll('.pin-key').forEach(btn => {
        btn.addEventListener('click', () => {
            const digits = document.querySelectorAll('.pin-digit');
            const emptySlot = Array.from(digits).find(d => !d.value);
            if (btn.dataset.key === '⌫') {
                const filled = Array.from(digits).find(d => d.value);
                if (filled) filled.value = '';
            } else if (emptySlot) {
                emptySlot.value = btn.dataset.key;
                // Auto-advance
                const nextEmpty = Array.from(digits).find(d => !d.value);
                if (!nextEmpty) checkPin();
            }
        });
    });
}

function setupPinInputs() {
    document.querySelectorAll('.pin-digit').forEach((digit, i) => {
        digit.addEventListener('input', () => {
            if (digit.value.length === 1) {
                const next = document.querySelectorAll('.pin-digit')[i + 1];
                if (next && !next.value) next.focus();
            }
        });
        digit.addEventListener('keydown', e => {
            if (e.key === 'Backspace' && !digit.value && i > 0) {
                document.querySelectorAll('.pin-digit')[i - 1].focus();
            }
        });
    });
}

function getPinValue() {
    return Array.from(document.querySelectorAll('.pin-digit')).map(d => d.value).join('');
}

function clearPinInputs() {
    document.querySelectorAll('.pin-digit').forEach(d => d.value = '');
    document.getElementById('pinError').style.display = 'none';
}

function checkPin() {
    const entered = getPinValue();
    if (entered === ADMIN_PIN) {
        closePinModal();
        openAdmin();
        showToast('Welcome, Owner!', 'success');
    } else {
        document.getElementById('pinError').style.display = 'block';
        clearPinInputs();
        document.querySelector('.pin-digit')?.focus();
    }
}

// ── Admin Open / Close ──
function openAdmin() {
    adminIsOpen = true;
    document.getElementById('adminPanel')?.classList.add('open');
    document.getElementById('adminOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderAdminDashboard();
}

function closeAdmin() {
    adminIsOpen = false;
    document.getElementById('adminPanel')?.classList.remove('open');
    document.getElementById('adminOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
}

// ── Admin Dashboard ──
function renderAdminDashboard() {
    if (!adminIsOpen) return;

    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const profit = orders.reduce((s, o) => s + (o.profit || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    const el = id => document.getElementById(id);
    el('adminRevenue').textContent = '$' + revenue.toFixed(2);
    el('adminProfit').textContent = '$' + profit.toFixed(2);
    el('adminTotalOrders').textContent = totalOrders;
    el('adminProductCount').textContent = totalProducts;

    // Build sparklines
    const revEl = document.getElementById('sparklineRevenue');
    const proEl = document.getElementById('sparklineProfit');
    if (revEl) revEl.innerHTML = buildSparkline(orders.map(o => o.total), '#a855f7');
    if (proEl) proEl.innerHTML = buildSparkline(orders.map(o => o.profit || 0), '#06b6d4');

    // Chart
    buildRevenueChart();

    // Recent orders
    renderAdminOrdersTable(orders.slice(0, 10));

    // Category bars
    renderCategoryBars();
}

function buildSparkline(values, color) {
    if (values.length < 2) return '<div class="no-data">Not enough data</div>';
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const w = 80, h = 30;
    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function buildRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.parentElement?.clientWidth || 600;
    const H = 200;
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    if (orders.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Place orders to see revenue data', W / 2, H / 2);
        return;
    }

    // Group by week
    const weeks = [];
    const now = Date.now();
    for (let i = 3; i >= 0; i--) {
        const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
        const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;
        const weekOrders = orders.filter(o => {
            const t = new Date(o.date).getTime();
            return t >= weekStart && t < weekEnd;
        });
        weeks.push({
            label: `W${4 - i}`,
            revenue: weekOrders.reduce((s, o) => s + o.total, 0),
            profit: weekOrders.reduce((s, o) => s + (o.profit || 0), 0),
        });
    }

    const maxVal = Math.max(...weeks.map(w => w.revenue), 1);
    const barW = (W - 80) / 4;
    const colorsRev = ['#a855f7', '#c084fc', '#a855f7', '#c084fc'];
    const colorsPro = ['#06b6d4', '#22d3ee', '#06b6d4', '#22d3ee'];

    weeks.forEach((week, i) => {
        const x = 40 + i * barW;
        const revH = (week.revenue / maxVal) * (H - 50);
        const proH = (week.profit / maxVal) * (H - 50);

        // Revenue bar
        ctx.fillStyle = colorsRev[i];
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        roundRect(ctx, x + 4, H - 30 - revH, barW / 2 - 4, revH, 4);
        ctx.fill();

        // Profit bar
        ctx.fillStyle = colorsPro[i];
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        roundRect(ctx, x + barW / 2 + 4, H - 30 - proH, barW / 2 - 4, proH, 4);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = '#475569';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(week.label, x + barW / 2, H - 10);
        ctx.fillText('$' + Math.round(week.revenue), x + barW / 4, H - 35 - revH);
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
}

function renderAdminOrdersTable(ordersToShow) {
    const tbody = document.getElementById('adminOrdersTable');
    if (!tbody) return;
    if (ordersToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px;">No orders yet</td></tr>';
        return;
    }
    tbody.innerHTML = ordersToShow.map(order => `
    <tr>
        <td><code style="font-size:12px;">${order.id}</code></td>
        <td>${order.customer}</td>
        <td>${order.items.reduce((s, i) => s + i.qty, 0)} items</td>
        <td>$${order.total.toFixed(2)}</td>
        <td><select class="order-status-select" onchange="updateOrderStatus('${order.id}', this.value)" data-current="${order.status}">
            ${['pending','processing','shipped','delivered'].map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select></td>
        <td>${new Date(order.date).toLocaleDateString()}</td>
        <td><button class="btn-icon" onclick="deleteOrder('${order.id}')" title="Delete">🗑️</button></td>
    </tr>`).join('');
}

function renderCategoryBars() {
    const container = document.getElementById('categoryBars');
    if (!container) return;
    const categories = ['electronics', 'fashion', 'home', 'beauty', 'sports'];
    const catData = categories.map(cat => {
        const catOrders = orders.filter(o => o.items.some(i => {
            const p = products.find(pr => pr.id === i.id);
            return p?.category === cat;
        }));
        return { cat, revenue: catOrders.reduce((s, o) => s + o.total, 0) };
    });
    const max = Math.max(...catData.map(c => c.revenue), 1);
    const colors = { electronics: '#a855f7', fashion: '#ec4899', home: '#f43f5e', beauty: '#f59e0b', sports: '#10b981' };
    container.innerHTML = catData.map(c => `
    <div class="cat-bar-row">
        <span class="cat-bar-label">${c.cat}</span>
        <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(c.revenue / max) * 100}%;background:${colors[c.cat] || '#a855f7'}"></div></div>
        <span class="cat-bar-value">$${c.revenue.toFixed(0)}</span>
    </div>`).join('');
}

window.updateOrderStatus = function(id, status) {
    const order = orders.find(o => o.id === id);
    if (order) { order.status = status; localStorage.setItem('bountiful_orders', JSON.stringify(orders)); renderAdminDashboard(); showToast('Status updated', 'success'); }
};

window.deleteOrder = function(id) {
    if (confirm(`Delete order ${id}?`)) {
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('bountiful_orders', JSON.stringify(orders));
        renderAdminDashboard();
        showToast(`Order ${id} deleted`, 'info');
    }
};

// ── Admin Products ──
function renderAdminProducts() {
    const grid = document.getElementById('adminProductsGrid');
    if (!grid) return;
    grid.innerHTML = products.map(p => `
    <div class="admin-product-card" style="--card-color:${p.color}">
        <div class="admin-product-header">
            <span class="admin-product-emoji">${p.emoji}</span>
            <div>
                <div class="admin-product-name">${p.name}</div>
                <div class="admin-product-cat" style="color:${p.color}">${p.category}</div>
            </div>
            <div class="admin-product-price">$${p.price.toFixed(2)}</div>
        </div>
        <div class="admin-product-meta">
            <span>Stock: <strong>${p.stock}</strong></span>
            <span>Cost: <strong>$${p.cost.toFixed(2)}</strong></span>
            <span>Margin: <strong>${(((p.price - p.cost) / p.price) * 100).toFixed(0)}%</strong></span>
        </div>
        <div class="admin-product-actions">
            <button class="btn btn-ghost btn-sm" onclick="editProduct(${p.id})">✏️ Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="deleteProduct(${p.id})">🗑️ Delete</button>
        </div>
    </div>`).join('');
}

window.editProduct = function(id) {
    const p = products.find(pr => pr.id === id);
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
    document.getElementById('cancelEditBtn').style.display = '';
    switchAdminTab('add-product');
    document.getElementById('productName').focus();
};

window.deleteProduct = function(id) {
    if (confirm(`Delete this product?`)) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('bountiful_products', JSON.stringify(products));
        renderAdminProducts();
        renderProducts();
        renderAdminDashboard();
        showToast('Product deleted', 'info');
    }
};

function initProductForm() {
    const form = document.getElementById('productForm');
    form?.addEventListener('submit', e => {
        e.preventDefault();
        const editId = document.getElementById('editProductId').value;
        const productData = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            cost: parseFloat(document.getElementById('productCost').value),
            rating: parseFloat(document.getElementById('productRating').value) || 4.5,
            reviews: parseInt(document.getElementById('productReviews').value) || 0,
            description: document.getElementById('productDescription').value.trim(),
            emoji: document.getElementById('productEmoji').value || '📦',
            color: document.getElementById('productColor').value,
            stock: parseInt(document.getElementById('productStock').value) || 0,
        };

        if (editId) {
            const idx = products.findIndex(p => p.id === parseInt(editId));
            if (idx !== -1) { products[idx] = { ...products[idx], ...productData }; showToast('Product updated!', 'success'); }
        } else {
            productData.id = Date.now();
            products.push(productData);
            showToast('Product added!', 'success');
        }

        localStorage.setItem('bountiful_products', JSON.stringify(products));
        form.reset();
        document.getElementById('editProductId').value = '';
        document.getElementById('productFormSubmitText').textContent = 'Save Product';
        document.getElementById('cancelEditBtn').style.display = 'none';
        renderProducts();
        renderAdminProducts();
        renderAdminDashboard();
    });

    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
        form.reset();
        document.getElementById('editProductId').value = '';
        document.getElementById('productFormSubmitText').textContent = 'Save Product';
        document.getElementById('cancelEditBtn').style.display = 'none';
    });

    document.getElementById('adminAddProductBtn')?.addEventListener('click', () => switchAdminTab('add-product'));
}

// ── Admin Full Orders ──
function renderAdminFullOrders() {
    const tbody = document.getElementById('adminFullOrdersTable');
    if (!tbody) return;
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;color:#94a3b8;padding:20px;">No orders yet</td></tr>';
        return;
    }
    tbody.innerHTML = orders.map(order => `
    <tr>
        <td><code style="font-size:11px;">${order.id}</code></td>
        <td>${order.customer}</td>
        <td style="font-size:12px;">${order.email}</td>
        <td style="font-size:12px;">${order.items.map(i => `${i.emoji}×${i.qty}`).join(', ')}</td>
        <td>$${order.subtotal.toFixed(2)}</td>
        <td>$${order.tax.toFixed(2)}</td>
        <td><strong>$${order.total.toFixed(2)}</strong></td>
        <td>$${order.orderCost.toFixed(2)}</td>
        <td style="color:#10b981;"><strong>$${order.profit.toFixed(2)}</strong></td>
        <td><select class="order-status-select" onchange="updateOrderStatus('${order.id}', this.value)" data-current="${order.status}">
            ${['pending','processing','shipped','delivered'].map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select></td>
        <td>${new Date(order.date).toLocaleDateString()}</td>
        <td><button class="btn-icon" onclick="deleteOrder('${order.id}')">🗑️</button></td>
    </tr>`).join('');
}

function initAdminOrdersSearch() {
    document.getElementById('adminOrdersSearch')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        const filtered = orders.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q));
        renderAdminOrdersTable(filtered.slice(0, 10));
        renderAdminFullOrdersFiltered(filtered);
    });
}

function renderAdminFullOrdersFiltered(filtered) {
    const tbody = document.getElementById('adminFullOrdersTable');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;color:#94a3b8;padding:20px;">No matches</td></tr>';
        return;
    }
    tbody.innerHTML = filtered.map(order => `
    <tr>
        <td><code style="font-size:11px;">${order.id}</code></td>
        <td>${order.customer}</td>
        <td style="font-size:12px;">${order.email}</td>
        <td style="font-size:12px;">${order.items.map(i => `${i.emoji}×${i.qty}`).join(', ')}</td>
        <td>$${order.subtotal.toFixed(2)}</td>
        <td>$${order.tax.toFixed(2)}</td>
        <td><strong>$${order.total.toFixed(2)}</strong></td>
        <td>$${order.orderCost.toFixed(2)}</td>
        <td style="color:#10b981;"><strong>$${order.profit.toFixed(2)}</strong></td>
        <td><select class="order-status-select" onchange="updateOrderStatus('${order.id}', this.value)" data-current="${order.status}">
            ${['pending','processing','shipped','delivered'].map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select></td>
        <td>${new Date(order.date).toLocaleDateString()}</td>
        <td><button class="btn-icon" onclick="deleteOrder('${order.id}')">🗑️</button></td>
    </tr>`).join('');
}

// ── Admin Tabs ──
function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.adminTab === tab));
    document.querySelectorAll('.admin-content').forEach(c => c.classList.toggle('active', c.id === 'admin' + tab.charAt(0).toUpperCase() + tab.slice(1)));
    if (tab === 'dashboard') renderAdminDashboard();
    else if (tab === 'products') renderAdminProducts();
    else if (tab === 'orders-admin') { renderAdminFullOrders(); initAdminOrdersSearch(); }
    else if (tab === 'add-product') { document.getElementById('productName')?.focus(); }
}

// ── Init All ──
document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initNavScroll();
    initHeroCounters();
    initFilters();
    renderProducts();
    initCart();
    initCheckout();
    initOrderLookup();
    initSecretAdmin();

    // Admin
    document.getElementById('adminClose')?.addEventListener('click', closeAdmin);
    document.getElementById('adminOverlay')?.addEventListener('click', closeAdmin);
    initProductForm();

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAdminTab(tab.dataset.adminTab));
    });

    document.querySelectorAll('.table-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.table-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const status = btn.dataset.status;
            const filtered = status === 'all' ? orders : orders.filter(o => o.status === status);
            renderAdminOrdersTable(filtered.slice(0, 10));
        });
    });

    document.querySelectorAll('.chart-period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            buildRevenueChart();
        });
    });
});
