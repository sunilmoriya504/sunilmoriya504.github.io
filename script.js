/* ═══════════════════════════════════════════════
   BOUNTIFUL — script.js
   Full e-commerce with admin control panel
═══════════════════════════════════════════════ */

// ── Seed Data ──────────────────────────────────────────────────────────────
const INITIAL_PRODUCTS = [
    { id: 1, name: "Wireless Noise-Cancelling Headphones", category: "electronics", price: 129.99, cost: 42, rating: 4.8, reviews: 2431, emoji: "🎧", color: "#a855f7", stock: 45 },
    { id: 2, name: "Mechanical RGB Keyboard", category: "electronics", price: 89.99, cost: 28, rating: 4.6, reviews: 1892, emoji: "⌨️", color: "#06b6d4", stock: 78 },
    { id: 3, name: "Smart Fitness Tracker Watch", category: "electronics", price: 199.99, cost: 65, rating: 4.7, reviews: 3201, emoji: "⌚", color: "#ec4899", stock: 32 },
    { id: 4, name: "Organic Cotton Oversized Hoodie", category: "fashion", price: 59.99, cost: 18, rating: 4.5, reviews: 876, emoji: "🧥", color: "#f59e0b", stock: 120 },
    { id: 5, name: "Minimalist Leather Crossbody Bag", category: "fashion", price: 79.99, cost: 22, rating: 4.4, reviews: 654, emoji: "👜", color: "#10b981", stock: 55 },
    { id: 6, name: "Handcrafted Ceramic Vase Set", category: "home", price: 49.99, cost: 14, rating: 4.3, reviews: 412, emoji: "🏺", color: "#f43f5e", stock: 28 },
    { id: 7, name: "Smart LED Desk Lamp", category: "home", price: 69.99, cost: 20, rating: 4.6, reviews: 987, emoji: "💡", color: "#6366f1", stock: 94 },
    { id: 8, name: "Aromatherapy Essential Oil Diffuser", category: "home", price: 39.99, cost: 11, rating: 4.2, reviews: 1567, emoji: "🫧", color: "#06b6d4", stock: 67 },
    { id: 9, name: "Vitamin C Brightening Serum", category: "beauty", price: 34.99, cost: 8, rating: 4.7, reviews: 4532, emoji: "🧴", color: "#f59e0b", stock: 210 },
    { id: 10, name: "Bamboo Makeup Brush Set", category: "beauty", price: 28.99, cost: 7, rating: 4.5, reviews: 2341, emoji: "💄", color: "#ec4899", stock: 143 },
    { id: 11, name: "Adjustable Resistance Bands Set", category: "sports", price: 24.99, cost: 5, rating: 4.4, reviews: 1876, emoji: "🏋️", color: "#f97316", stock: 320 },
    { id: 12, name: "Carbon Fiber Tennis Racket", category: "sports", price: 119.99, cost: 38, rating: 4.8, reviews: 743, emoji: "🎾", color: "#84cc16", stock: 37 },
    { id: 13, name: "4K Ultra HD Webcam", category: "electronics", price: 79.99, cost: 24, rating: 4.3, reviews: 1543, emoji: "📷", color: "#a855f7", stock: 62 },
    { id: 14, name: "Merino Wool Beanie Hat", category: "fashion", price: 22.99, cost: 6, rating: 4.6, reviews: 2198, emoji: "🎩", color: "#6366f1", stock: 180 },
    { id: 15, name: "Cordless Handheld Vacuum", category: "home", price: 59.99, cost: 17, rating: 4.4, reviews: 876, emoji: "🧹", color: "#10b981", stock: 44 },
    { id: 16, name: "Retinol Anti-Aging Night Cream", category: "beauty", price: 44.99, cost: 12, rating: 4.6, reviews: 3210, emoji: "🧖", color: "#ec4899", stock: 157 },
];

// ── State ─────────────────────────────────────────────────────────────────
let products = JSON.parse(localStorage.getItem('bountiful_products')) || [...INITIAL_PRODUCTS];
let orders = JSON.parse(localStorage.getItem('bountiful_orders')) || [];
let cart = JSON.parse(localStorage.getItem('bountiful_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('bountiful_wishlist')) || [];

// ── Cart helpers ───────────────────────────────────────────────────────────
function persistCart() { localStorage.setItem('bountiful_cart', JSON.stringify(cart)); }
function persistProducts() { localStorage.setItem('bountiful_products', JSON.stringify(products)); }
function persistOrders() { localStorage.setItem('bountiful_orders', JSON.stringify(orders)); }
function persistWishlist() { localStorage.setItem('bountiful_wishlist', JSON.stringify(wishlist)); }

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 400); }, 3000);
}

function createToastContainer() {
    const c = document.createElement('div');
    c.className = 'toast-container';
    c.id = 'toastContainer';
    document.body.appendChild(c);
    return c;
}

// ── Custom Cursor ──────────────────────────────────────────────────────────
function initCursor() {
    const follower = document.getElementById('cursor-follower');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mousedown', () => follower.classList.add('clicking'));
    document.addEventListener('mouseup', () => follower.classList.remove('clicking'));

    const allEls = document.querySelectorAll('button, a, .product-card, .filter-btn, .admin-tab, .action-btn');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('hovering');
            else e.target.classList.remove('hovering');
        });
    }, { threshold: 0.5 });

    allEls.forEach(el => {
        el.addEventListener('mouseenter', () => follower.classList.add('hovering'));
        el.addEventListener('mouseleave', () => follower.classList.remove('hovering'));
    });

    function animateCursor() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        follower.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor trail canvas
    const canvas = document.getElementById('cursor-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('mousemove', e => {
        for (let i = 0; i < 2; i++) {
            particles.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, life: 1, maxLife: 1, size: Math.random() * 3 + 2, color: randomColor() });
        }
    });

    function randomColor() {
        const colors = ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function drawTrail() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(p.life * 99).toString(16).padStart(2, '0');
            ctx.fill();
        });
        requestAnimationFrame(drawTrail);
    }
    drawTrail();
}

// ── Navigation scroll effect ────────────────────────────────────────────────
function initNavScroll() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    document.querySelectorAll('[data-goto]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById(el.dataset.goto);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ── Hero counter animation ──────────────────────────────────────────────────
function initHeroCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}

// ── Product card rendering ─────────────────────────────────────────────────
function getCategoryColor(cat) {
    const map = { electronics: '#a855f7', fashion: '#ec4899', home: '#f59e0b', beauty: '#10b981', sports: '#06b6d4' };
    return map[cat] || '#a855f7';
}

function getCategoryTag(cat) {
    const map = { electronics: 'Electronics', fashion: 'Fashion', home: 'Home', beauty: 'Beauty', sports: 'Sports' };
    return map[cat] || cat;
}

function getStockClass(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
}

function getStockText(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return `Only ${stock} left`;
    return 'In Stock';
}

function renderProducts(filter = 'all', search = '') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    let filtered = products;
    if (filter !== 'all') filtered = filtered.filter(p => p.category === filter);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    grid.innerHTML = '';
    filtered.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = p.id;
        card.style.animationDelay = `${i * 0.06}s`;
        card.innerHTML = `
            <div class="product-card-bg" style="background: linear-gradient(135deg, ${p.color}22, ${p.color}11);">
                <div class="product-card-gradient" style="background: radial-gradient(circle at 50% 60%, ${p.color}44, transparent 70%);"></div>
                <div class="product-emoji">${p.emoji}</div>
                <div class="product-wishlist" data-id="${p.id}">${wishlist.includes(p.id) ? '❤️' : '🤍'}</div>
                <button class="product-quick-add" data-id="${p.id}">Add to Cart +</button>
            </div>
            <div class="product-info">
                <span class="product-category-tag" style="background: ${p.color}18; color: ${p.color};">${getCategoryTag(p.category)}</span>
                <div class="product-name">${p.name}</div>
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
                    <span class="rating-count">(${p.reviews.toLocaleString()})</span>
                </div>
                <div class="product-price-row">
                    <div>
                        <span class="product-price" style="color: ${p.color};">$${p.price.toFixed(2)}</span>
                    </div>
                    <span class="product-stock-badge ${getStockClass(p.stock)}">${getStockText(p.stock)}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);

        // Intersection observer for entrance animation
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { card.classList.add('visible'); obs.unobserve(card); } });
        }, { threshold: 0.1 });
        obs.observe(card);
    });

    // Quick add buttons
    grid.querySelectorAll('.product-quick-add').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            addToCart(id);
            btn.textContent = '✓ Added!';
            setTimeout(() => btn.textContent = 'Add to Cart +', 1500);
        });
    });

    // Wishlist
    grid.querySelectorAll('.product-wishlist').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            toggleWishlist(id);
        });
    });
}

function toggleWishlist(id) {
    const idx = wishlist.indexOf(id);
    if (idx > -1) wishlist.splice(idx, 1);
    else wishlist.push(id);
    persistWishlist();
    renderProducts(getCurrentFilter(), getCurrentSearch());
    showToast(wishlist.includes(id) ? 'Added to wishlist ❤️' : 'Removed from wishlist', 'info');
}

function getCurrentFilter() {
    const active = document.querySelector('.filter-btn.active');
    return active ? active.dataset.filter : 'all';
}

function getCurrentSearch() {
    return document.getElementById('searchInput')?.value || '';
}

// ── Filters ────────────────────────────────────────────────────────────────
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.dataset.filter, getCurrentSearch());
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderProducts(getCurrentFilter(), searchInput.value));
    }
}

// ── Cart ────────────────────────────────────────────────────────────────────
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const existing = cart.find(i => i.id === productId);
    if (existing) {
        if (existing.qty < product.stock) existing.qty++;
    } else {
        cart.push({ id: productId, qty: 1 });
    }
    persistCart();
    updateCartUI();
    showToast(`${product.name} added to cart`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    persistCart();
    updateCartUI();
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    const product = products.find(p => p.id === productId);
    if (!item || !product) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(productId);
    else persistCart();
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    const cartItemCount = document.getElementById('cartItemCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTax = document.getElementById('cartTax');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('pop');
        void cartCount.offsetWidth;
        cartCount.classList.add('pop');
    }

    if (cart.length === 0) {
        if (cartItems) cartItems.innerHTML = '';
        if (cartEmpty) cartEmpty.style.display = 'flex';
        if (cartFooter) cartFooter.style.display = 'none';
        if (cartItemCount) cartItemCount.textContent = '(0)';
        return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'flex';
    if (cartItemCount) cartItemCount.textContent = `(${totalItems})`;

    const subtotal = cart.reduce((sum, item) => {
        const p = products.find(pr => pr.id === item.id);
        return sum + (p ? p.price * item.qty : 0);
    }, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;

    if (cartItems) {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const p = products.find(pr => pr.id === item.id);
            if (!p) return;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-emoji">${p.emoji}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${p.name}</div>
                    <div class="cart-item-price">$${p.price.toFixed(2)} × ${item.qty}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="qty-control">
                        <button class="qty-btn" data-id="${p.id}" data-delta="-1">−</button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button class="qty-btn" data-id="${p.id}" data-delta="1">+</button>
                    </div>
                    <button class="cart-item-remove" data-id="${p.id}">Remove</button>
                </div>
            `;
            cartItems.appendChild(div);
        });

        cartItems.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.id), parseInt(btn.dataset.delta)));
        });
        cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
        });
    }
}

function initCart() {
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const navCart = document.getElementById('navCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    function openCart() {
        cartDrawer?.classList.add('open');
        cartOverlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeCart() {
        cartDrawer?.classList.remove('open');
        cartOverlay?.classList.remove('open');
        document.body.style.overflow = '';
    }

    navCart?.addEventListener('click', openCart);
    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);
    checkoutBtn?.addEventListener('click', () => { closeCart(); openCheckoutModal(); });

    updateCartUI();
}

// ── Checkout Modal ───────────────────────────────────────────────────────────
let checkoutStep = 1;

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
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
    document.querySelector(`.checkout-step[data-step="${step}"]`)?.classList.add('active');
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    if (prevBtn) prevBtn.style.display = step > 1 ? 'inline-flex' : 'none';
    if (nextBtn) {
        if (step === 3) {
            nextBtn.innerHTML = '<span>Place Order</span>';
        } else if (step === 4) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.innerHTML = '<span>Next</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
            nextBtn.style.display = 'inline-flex';
        }
    }
}

function validateStep(step) {
    if (step === 1) {
        const name = document.getElementById('checkoutName')?.value.trim();
        const email = document.getElementById('checkoutEmail')?.value.trim();
        if (!name || !email) { showToast('Please fill in name and email', 'error'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email', 'error'); return false; }
    }
    if (step === 2) {
        const addr = document.getElementById('checkoutAddress')?.value.trim();
        if (!addr) { showToast('Please fill in shipping address', 'error'); return false; }
    }
    if (step === 3) {
        const card = document.getElementById('checkoutCard')?.value.trim().replace(/\s/g, '');
        if (!card || card.length < 16) { showToast('Please enter a valid card number', 'error'); return false; }
    }
    return true;
}

function initCheckout() {
    document.getElementById('modalClose')?.addEventListener('click', closeCheckoutModal);
    document.getElementById('continueShoppingBtn')?.addEventListener('click', () => {
        closeCheckoutModal();
        resetCheckoutForm();
    });

    document.getElementById('nextStepBtn')?.addEventListener('click', () => {
        if (!validateStep(checkoutStep)) return;
        if (checkoutStep < 4) {
            if (checkoutStep === 3) {
                placeOrder();
            }
            checkoutStep++;
            showStep(checkoutStep);
        }
    });

    document.getElementById('prevStepBtn')?.addEventListener('click', () => {
        if (checkoutStep > 1) {
            checkoutStep--;
            showStep(checkoutStep);
        }
    });

    document.querySelectorAll('.payment-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    // Card number auto-format
    const cardInput = document.getElementById('checkoutCard');
    if (cardInput) {
        cardInput.addEventListener('input', e => {
            let v = e.target.value.replace(/\D/g, '');
            v = v.match(/.{1,4}/g)?.join(' ') || v;
            e.target.value = v;
        });
    }

    const expiryInput = document.getElementById('checkoutExpiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', e => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
            e.target.value = v;
        });
    }
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
        id: orderId,
        customer: name,
        email, phone, address, city, zip,
        items: orderItems,
        subtotal, tax, total, cost: orderCost, profit,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // Deduct stock
    orderItems.forEach(item => {
        const p = products.find(pr => pr.id === item.id);
        if (p) { p.stock = Math.max(0, p.stock - item.qty); }
    });
    persistProducts();

    orders.unshift(order);
    persistOrders();

    cart = [];
    persistCart();
    updateCartUI();

    document.getElementById('newOrderId').textContent = orderId;
    checkoutStep = 4;
    showStep(4);

    updateAdminDashboard();
    showToast(`Order ${orderId} placed successfully!`, 'success');
}

function resetCheckoutForm() {
    document.querySelectorAll('#checkoutName, #checkoutEmail, #checkoutPhone, #checkoutAddress, #checkoutCity, #checkoutZip, #checkoutCard, #checkoutExpiry, #checkoutCvv').forEach(i => i.value = '');
    checkoutStep = 1;
}

// ── Order Lookup (Customer) ────────────────────────────────────────────────
function initOrderLookup() {
    document.getElementById('lookupOrderBtn')?.addEventListener('click', () => {
        const id = document.getElementById('orderLookupInput')?.value.trim().toUpperCase();
        const result = document.getElementById('orderResult');
        if (!id) { showToast('Please enter an order ID', 'error'); return; }
        const order = orders.find(o => o.id === id || o.id.toLowerCase().includes(id.toLowerCase()));
        if (!result) return;
        if (!order) {
            result.innerHTML = '<div class="order-result-card"><p style="color:var(--rose);text-align:center;">Order not found. Check the ID and try again.</p></div>';
            return;
        }
        result.innerHTML = `
            <div class="order-result-card">
                <h4>Order ${order.id}</h4>
                <div class="result-row"><span>Status</span><span class="status-badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
                <div class="result-row"><span>Total</span><strong>$${order.total.toFixed(2)}</strong></div>
                <div class="result-row"><span>Items</span><span>${order.items.length} item${order.items.length > 1 ? 's' : ''}</span></div>
                <div class="result-row"><span>Date</span><span>${new Date(order.createdAt).toLocaleDateString()}</span></div>
                <div class="order-timeline">
                    ${generateTimeline(order.status)}
                </div>
            </div>
        `;
    });
}

function generateTimeline(status) {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const labels = { pending: 'Order Placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };
    const icons = { pending: '📋', processing: '⚙️', shipped: '🚚', delivered: '✅' };
    const currentIdx = statuses.indexOf(status);
    return statuses.map((s, i) => {
        const active = i === currentIdx;
        const done = i < currentIdx;
        return `
            <div class="timeline-step">
                <div class="timeline-dot ${active ? 'active' : ''} ${done ? 'done' : ''}">${icons[s]}</div>
                <div class="timeline-content">
                    <div class="step-title">${labels[s]}</div>
                    ${active ? `<div class="step-date">In progress</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ── Admin Panel ────────────────────────────────────────────────────────────
let adminCurrentTab = 'dashboard';
let adminStatusFilter = 'all';
let adminChartPeriod = 'week';
let chartInstance = null;

function openAdmin() {
    document.getElementById('adminPanel')?.classList.add('open');
    document.getElementById('adminOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateAdminDashboard();
    renderAdminProducts();
    renderAdminOrders();
}

function closeAdmin() {
    document.getElementById('adminPanel')?.classList.remove('open');
    document.getElementById('adminOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
}

function initAdmin() {
    document.getElementById('adminClose')?.addEventListener('click', closeAdmin);
    document.getElementById('adminOverlay')?.addEventListener('click', closeAdmin);
    document.getElementById('adminToggle')?.addEventListener('click', e => {
        e.preventDefault();
        const panel = document.getElementById('adminPanel');
        if (panel?.classList.contains('open')) closeAdmin();
        else openAdmin();
    });

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAdminTab(tab.dataset.adminTab));
    });

    document.querySelectorAll('.table-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            adminStatusFilter = btn.dataset.status;
            document.querySelectorAll('.table-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAdminOrdersTable();
        });
    });

    document.querySelectorAll('.chart-period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            adminChartPeriod = btn.dataset.period;
            document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderRevenueChart();
        });
    });

    document.getElementById('adminAddProductBtn')?.addEventListener('click', () => switchAdminTab('add-product'));
    document.getElementById('adminCloseBottom')?.addEventListener('click', closeAdmin);

    initProductForm();
}

function switchAdminTab(tab) {
    adminCurrentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.adminTab === tab));
    document.querySelectorAll('.admin-content').forEach(c => c.classList.toggle('active', c.id === 'admin' + tab.charAt(0).toUpperCase() + tab.slice(1)));
    if (tab === 'dashboard') updateAdminDashboard();
    if (tab === 'products') renderAdminProducts();
    if (tab === 'orders-admin') renderAdminOrders();
    if (tab === 'add-product') resetProductForm();
}

function updateAdminDashboard() {
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalProfit = orders.reduce((s, o) => s + (o.profit || 0), 0);
    const totalOrders = orders.length;

    document.getElementById('adminRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('adminProfit').textContent = `$${totalProfit.toFixed(2)}`;
    document.getElementById('adminTotalOrders').textContent = totalOrders;
    document.getElementById('adminProductCount').textContent = products.length;

    renderAdminOrdersTable();
    renderRevenueChart();
    renderCategoryBars();
}

function renderAdminOrdersTable() {
    const tbody = document.getElementById('adminOrdersTable');
    if (!tbody) return;

    let filtered = orders;
    if (adminStatusFilter !== 'all') filtered = filtered.filter(o => o.status === adminStatusFilter);

    tbody.innerHTML = filtered.slice(0, 10).map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer || 'N/A'}</td>
            <td>${o.items.length} item${o.items.length !== 1 ? 's' : ''}</td>
            <td><strong>$${o.total.toFixed(2)}</strong></td>
            <td><span class="status-badge status-${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
            <td>${new Date(o.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="action-btn" onclick="updateOrderStatus('${o.id}', 'next')">→ Update</button>
            </td>
        </tr>
    `).join('');
}

function updateOrderStatus(orderId, direction) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const flow = ['pending', 'processing', 'shipped', 'delivered'];
    const idx = flow.indexOf(order.status);
    if (direction === 'next' && idx < flow.length - 1) {
        order.status = flow[idx + 1];
    } else if (direction === 'prev' && idx > 0) {
        order.status = flow[idx - 1];
    } else if (typeof direction === 'string' && flow.includes(direction)) {
        order.status = direction;
    }
    persistOrders();
    renderAdminOrdersTable();
    renderAdminOrders();
    updateAdminDashboard();
    showToast(`Order ${orderId} → ${order.status}`, 'info');
}
window.updateOrderStatus = updateOrderStatus;

function renderRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;

    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

    const days = adminChartPeriod === 'week' ? 7 : adminChartPeriod === 'month' ? 30 : 12;
    const labels = adminChartPeriod === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : adminChartPeriod === 'month'
        ? Array.from({ length: 30 }, (_, i) => i + 1)
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate mock daily data based on real orders
    const revenueData = new Array(days).fill(0);
    const profitData = new Array(days).fill(0);

    orders.forEach(o => {
        const d = new Date(o.createdAt);
        let bucket = 0;
        if (adminChartPeriod === 'week') {
            bucket = d.getDay();
        } else if (adminChartPeriod === 'month') {
            bucket = Math.min(29, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));
            if (bucket < 0) bucket = 0;
        } else {
            bucket = d.getMonth();
        }
        if (bucket >= 0 && bucket < days) {
            revenueData[bucket] += o.total;
            profitData[bucket] += o.profit || 0;
        }
    });

    // Fill empty buckets with small random values for visual appeal
    for (let i = 0; i < days; i++) {
        if (revenueData[i] === 0) revenueData[i] = Math.random() * 500 + 100;
        if (profitData[i] === 0) profitData[i] = revenueData[i] * (0.3 + Math.random() * 0.2);
    }

    import('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js').catch(() => {
        // Fallback: simple bar drawing without chart.js
        const ctx = canvas.getContext('2d');
        const max = Math.max(...revenueData);
        const barW = (canvas.width = canvas.parentElement?.clientWidth || 600) / days - 4;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        revenueData.forEach((v, i) => {
            const h = (v / max) * 200;
            const x = i * (barW + 4) + 2;
            const grd = ctx.createLinearGradient(0, 240 - h, 0, 240);
            grd.addColorStop(0, '#a855f7');
            grd.addColorStop(1, '#6366f1');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.roundRect(x, 240 - h, barW, h, 4);
            ctx.fill();
        });
        return;
    }).then(() => {
        if (typeof Chart === 'undefined') return;
        chartInstance = new Chart(ctx = canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Revenue',
                        data: revenueData,
                        backgroundColor: 'rgba(168,85,247,0.6)',
                        borderColor: '#a855f7',
                        borderWidth: 2,
                        borderRadius: 6,
                    },
                    {
                        label: 'Profit',
                        data: profitData,
                        backgroundColor: 'rgba(6,182,212,0.6)',
                        borderColor: '#06b6d4',
                        borderWidth: 2,
                        borderRadius: 6,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: v => '$' + v.toFixed(0)
                        }
                    }
                }
            }
        });
    });
}

function renderCategoryBars() {
    const container = document.getElementById('categoryBars');
    if (!container) return;

    const cats = ['electronics', 'fashion', 'home', 'beauty', 'sports'];
    const catTotals = {};
    cats.forEach(c => catTotals[c] = 0);
    orders.forEach(o => {
        o.items.forEach(item => {
            const p = products.find(pr => pr.id === item.id);
            if (p) catTotals[p.category] = (catTotals[p.category] || 0) + item.price * item.qty;
        });
    });

    const max = Math.max(...Object.values(catTotals), 1);
    container.innerHTML = cats.map(c => {
        const val = catTotals[c];
        const pct = (val / max) * 100;
        return `
            <div class="category-bar-item">
                <div class="category-bar-label">
                    <span class="category-bar-name">${getCategoryTag(c)}</span>
                    <span class="category-bar-value">$${val.toFixed(2)}</span>
                </div>
                <div class="category-bar-track">
                    <div class="category-bar-fill cat-${c}" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminProducts() {
    const grid = document.getElementById('adminProductsGrid');
    if (!grid) return;

    grid.innerHTML = products.map(p => `
        <div class="admin-product-card">
            <div class="admin-product-thumb" style="background: linear-gradient(135deg, ${p.color}18, ${p.color}08);">
                <span style="font-size:40px;">${p.emoji}</span>
            </div>
            <div class="admin-product-info">
                <div class="admin-product-name">${p.name}</div>
                <div class="admin-product-meta">
                    <span>$${p.price.toFixed(2)}</span>
                    <span>Stock: ${p.stock}</span>
                </div>
                <div class="admin-product-actions">
                    <button onclick="editProduct(${p.id})">Edit</button>
                    <button onclick="deleteProduct(${p.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function editProduct(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    switchAdminTab('add-product');
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
    showToast(`Editing "${p.name}"`, 'info');
}
window.editProduct = editProduct;

function deleteProduct(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    products = products.filter(pr => pr.id !== id);
    persistProducts();
    renderProducts();
    renderAdminProducts();
    updateAdminDashboard();
    showToast(`"${p.name}" deleted`, 'info');
}
window.deleteProduct = deleteProduct;

function initProductForm() {
    const form = document.getElementById('productForm');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const editId = document.getElementById('editProductId').value;
        const data = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value) || 0,
            cost: parseFloat(document.getElementById('productCost').value) || 0,
            rating: parseFloat(document.getElementById('productRating').value) || 4,
            reviews: parseInt(document.getElementById('productReviews').value) || 0,
            description: document.getElementById('productDescription').value.trim(),
            emoji: document.getElementById('productEmoji').value || '📦',
            color: document.getElementById('productColor').value || '#a855f7',
            stock: parseInt(document.getElementById('productStock').value) || 0,
        };

        if (!data.name || data.price <= 0) { showToast('Name and price are required', 'error'); return; }

        if (editId) {
            const idx = products.findIndex(p => p.id === parseInt(editId));
            if (idx > -1) {
                products[idx] = { ...products[idx], ...data };
                showToast(`"${data.name}" updated`, 'success');
            }
        } else {
            data.id = Date.now();
            products.push(data);
            showToast(`"${data.name}" added`, 'success');
        }

        persistProducts();
        renderProducts();
        renderAdminProducts();
        updateAdminDashboard();
        resetProductForm();
        switchAdminTab('products');
    });

    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
        resetProductForm();
        switchAdminTab('products');
    });
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('productColor').value = '#a855f7';
    document.getElementById('productFormSubmitText').textContent = 'Save Product';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

function renderAdminOrders() {
    const tbody = document.getElementById('adminFullOrdersTable');
    if (!tbody) return;

    const search = document.getElementById('adminOrdersSearch')?.value.toLowerCase() || '';
    let filtered = orders;
    if (search) {
        filtered = filtered.filter(o =>
            o.id.toLowerCase().includes(search) ||
            (o.customer || '').toLowerCase().includes(search) ||
            (o.email || '').toLowerCase().includes(search)
        );
    }

    tbody.innerHTML = filtered.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer || 'N/A'}</td>
            <td style="font-size:12px;">${o.email || 'N/A'}</td>
            <td style="font-size:12px;">${o.items.map(i => `${i.emoji}×${i.qty}`).join(', ')}</td>
            <td>$${o.subtotal.toFixed(2)}</td>
            <td>$${o.tax.toFixed(2)}</td>
            <td><strong>$${o.total.toFixed(2)}</strong></td>
            <td>$${o.cost.toFixed(2)}</td>
            <td style="color:var(--emerald);font-weight:600;">$${o.profit.toFixed(2)}</td>
            <td>
                <select onchange="updateOrderStatus('${o.id}', this.value)" style="border:1px solid var(--border);border-radius:8px;padding:4px 8px;font-size:12px;cursor:pointer;">
                    <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
                    <option value="processing" ${o.status==='processing'?'selected':''}>Processing</option>
                    <option value="shipped" ${o.status==='shipped'?'selected':''}>Shipped</option>
                    <option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option>
                    <option value="cancelled" ${o.status==='cancelled'?'selected':''}>Cancelled</option>
                </select>
            </td>
            <td>${new Date(o.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="action-btn delete" onclick="deleteOrder('${o.id}')">Delete</button>
            </td>
        </tr>
    `).join('');

    // Admin orders search
    const searchInput = document.getElementById('adminOrdersSearch');
    if (searchInput) {
        searchInput.removeEventListener('input', handleAdminOrdersSearch);
        searchInput.addEventListener('input', handleAdminOrdersSearch);
    }
}

function handleAdminOrdersSearch() { renderAdminOrders(); }

function deleteOrder(orderId) {
    if (!confirm(`Delete order ${orderId}?`)) return;
    orders = orders.filter(o => o.id !== orderId);
    persistOrders();
    renderAdminOrders();
    updateAdminDashboard();
    showToast(`Order ${orderId} deleted`, 'info');
}
window.deleteOrder = deleteOrder;

// ── Nav link active state on scroll ─────────────────────────────────────────
function initNavScrollSpy() {
    const sections = document.querySelectorAll('section > div[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-goto]');

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                navLinks.forEach(l => l.classList.toggle('active', l.dataset.goto === e.target.id));
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(s => obs.observe(s));
}

// ── Init Everything ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initNavScroll();
    initNavScrollSpy();
    initHeroCounters();
    initFilters();
    renderProducts();
    initCart();
    initCheckout();
    initOrderLookup();
    initAdmin();

    // Smooth section scroll for nav links
    document.querySelectorAll('.nav-link[data-goto]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById(link.dataset.goto);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});
