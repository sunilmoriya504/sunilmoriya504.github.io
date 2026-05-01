/* ═══════════════════════════════════════════════
   ANITA COLLECTION — script.js
   Women's fashion e-commerce + secret owner panel
   UPI only — tarunmoriya121-1@okhdfcbank
═══════════════════════════════════════════════ */

// ── Seed Products (Women only) ──
const INITIAL_PRODUCTS = [
    { id: 1, name: "Floral Print Summer Dress", category: "dresses", price: 899, cost: 280, rating: 4.6, reviews: 124, emoji: "👗", color: "#ec4899", stock: 35, sizes: "S,M,L,XL", colors: "Floral Pink, Floral Blue", description: "Lightweight breathable fabric, perfect for summer outings." },
    { id: 2, name: "Embroidered Anarkali Suit", category: "ethnic", price: 1499, cost: 450, rating: 4.8, reviews: 89, emoji: "👘", color: "#a855f7", stock: 20, sizes: "S,M,L,XL,XXL", colors: "Maroon, Navy Blue", description: "Hand-embroidered georgette Anarkali with dupatta." },
    { id: 3, name: "Ruffle Sleeve Blouse", category: "tops", price: 499, cost: 140, rating: 4.4, reviews: 203, emoji: "👚", color: "#06b6d4", stock: 60, sizes: "S,M,L,XL", colors: "White, Peach, Lavender", description: "Elegant ruffle sleeve top in premium rayon fabric." },
    { id: 4, name: "High-Waist Skinny Jeans", category: "jeans", price: 799, cost: 240, rating: 4.5, reviews: 178, emoji: "👖", color: "#3b82f6", stock: 45, sizes: "26,28,30,32,34", colors: "Medium Wash, Black", description: "Stretch denim with flattering high waist fit." },
    { id: 5, name: "Pearl Drop Earrings Set", category: "accessories", price: 299, cost: 75, rating: 4.7, reviews: 312, emoji: "📿", color: "#f59e0b", stock: 80, sizes: "One Size", colors: "Pearl White, Rose Gold", description: "Elegant artificial pearl earrings with matching necklace." },
    { id: 6, name: "Bohemian Maxi Dress", category: "dresses", price: 1199, cost: 360, rating: 4.6, reviews: 67, emoji: "👗", color: "#10b981", stock: 25, sizes: "S,M,L,XL", colors: "Terracotta, Mustard", description: "Flowy boho maxi dress with tassel detailing." },
    { id: 7, name: "Silk Blend Saree", category: "ethnic", price: 1899, cost: 580, rating: 4.9, reviews: 145, emoji: "🧣", color: "#f43f5e", stock: 30, sizes: "Free Size", colors: "Wine, Emerald, Royal Blue", description: "Banarasi silk blend saree with rich zari border." },
    { id: 8, name: "Crop Top with Cold Shoulders", category: "tops", price: 399, cost: 110, rating: 4.3, reviews: 241, emoji: "👚", color: "#fbbf24", stock: 70, sizes: "S,M,L,XL", colors: "White, Sage Green, Coral", description: "Trendy cold shoulder crop top in soft cotton." },
    { id: 9, name: "Wide Leg Palazzo Pants", category: "jeans", price: 649, cost: 190, rating: 4.5, reviews: 156, emoji: "👖", color: "#6366f1", stock: 50, sizes: "S,M,L,XL", colors: "Black, Cream, Olive", description: "Comfortable wide-leg palazzo in flowy crepe fabric." },
    { id: 10, name: "Layered Gold-Plated Necklace", category: "accessories", price: 449, cost: 120, rating: 4.6, reviews: 289, emoji: "💎", color: "#d4af37", stock: 55, sizes: "One Size", colors: "Gold, Rose Gold", description: "Three-layer chain necklace with pendant detail." },
    { id: 11, name: "Wraparound Bodycon Dress", category: "dresses", price: 799, cost: 250, rating: 4.4, reviews: 98, emoji: "👗", color: "#ec4899", stock: 40, sizes: "S,M,L,XL", colors: "Black, Red, Bottle Green", description: "Sleek wraparound dress for party and dinner occasions." },
    { id: 12, name: "Chanderi Silk Kurta", category: "ethnic", price: 1099, cost: 320, rating: 4.7, reviews: 134, emoji: "👚", color: "#f97316", stock: 35, sizes: "S,M,L,XL,XXL", colors: "Powder Blue, Pink, Yellow", description: "Pure Chanderi silk kurta with intricate print." },
];

// ── State ──
let products = JSON.parse(localStorage.getItem('anita_products')) || INITIAL_PRODUCTS;
let orders = JSON.parse(localStorage.getItem('anita_orders')) || [];
let cart = JSON.parse(localStorage.getItem('anita_cart')) || [];
const WHATSAPP_NUMBER = '8595291672';
const UPI_ID = 'tarunmoriya121-1@okhdfcbank';

// Admin PIN — default 1234, owner can change it
let ADMIN_PIN = localStorage.getItem('anita_pin') || '1234';
let secretUnlocked = false;
let currentAdminTab = 'dashboard';
let searchQuery = '';
let checkoutStep = 1;

// ── Utility ──
function saveProducts() { localStorage.setItem('anita_products', JSON.stringify(products)); }
function saveOrders() { localStorage.setItem('anita_orders', JSON.stringify(orders)); }
function saveCart() { localStorage.setItem('anita_cart', JSON.stringify(cart)); }
function formatCurrency(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

// ── Hero Counters ──
function initHeroCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current.toLocaleString('en-IN');
        }, 30);
    });
}

// ── Navigation Scroll Spy ──
function initNavScrollSpy() {
    const sections = document.querySelectorAll('section[id], div[id="shop"], div[id="orders"]');
    const navLinks = document.querySelectorAll('.nav-link[data-goto]');
    const obs = new IntersectionObserver(e => {
        e.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.toggle('active', l.dataset.goto === entry.target.id));
            }
        });
    }, { threshold: 0.3 });
    sections.forEach(s => obs.observe(s));
    document.querySelectorAll('.nav-link[data-goto]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById(link.dataset.goto);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ── Filters & Search ──
function initFilters() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            renderProducts(filter, searchQuery);
        });
    });
    document.getElementById('searchInput')?.addEventListener('input', e => {
        searchQuery = e.target.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        renderProducts(activeFilter, searchQuery);
    });
}

// ── Render Products ──
function renderProducts(categoryFilter = 'all', textFilter = '') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    let filtered = products.filter(p => {
        const catOk = categoryFilter === 'all' || p.category === categoryFilter;
        const textOk = !textFilter || p.name.toLowerCase().includes(textFilter) || p.category.toLowerCase().includes(textFilter);
        return catOk && textOk;
    });

    grid.innerHTML = filtered.map(p => `
        <div class="product-card" data-id="${p.id}" style="--card-accent:${p.color}">
            <div class="product-image">
                <div class="product-emoji">${p.emoji}</div>
                ${p.stock <= 5 ? `<span class="stock-badge">Only ${p.stock} left!</span>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.description || ''}</p>
                ${p.sizes ? `<div class="product-sizes"><span>Sizes:</span> ${p.sizes}</div>` : ''}
                ${p.colors ? `<div class="product-colors"><span>Colors:</span> ${p.colors}</div>` : ''}
                <div class="product-rating">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))} <span>${p.rating} (${p.reviews})</span></div>
                <div class="product-price-row">
                    <span class="product-price">${formatCurrency(p.price)}</span>
                    <button class="product-quick-add" data-id="${p.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>Add</button>
                </div>
            </div>
        </div>
    `).join('');

    // Staggered entrance animation
    grid.querySelectorAll('.product-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(24px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 60);
    });

    grid.querySelectorAll('.product-quick-add').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            addToCart(id);
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
            btn.style.background = '#10b981';
            setTimeout(() => {
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>';
                btn.style.background = '';
            }, 1500);
        });
    });

    grid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const p = products.find(pr => pr.id === id);
            if (!p) return;
            const existing = cart.find(c => c.id === id);
            const qty = existing ? existing.qty + 1 : 1;
            if (existing) cart = cart.map(c => c.id === id ? { ...c, qty } : c);
            else cart.push({ id, qty });
            saveCart();
            updateCartUI();
            openCart();
            showToast(`${p.emoji} ${p.name} added to cart!`);
        });
    });
}

// ── Cart ──
function initCart() {
    document.getElementById('navCart')?.addEventListener('click', openCart);
    document.getElementById('cartClose')?.addEventListener('click', closeCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
    document.getElementById('checkoutBtn')?.addEventListener('click', () => { closeCart(); openCheckoutModal(); });
    updateCartUI();
}

function openCart() {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartItems();
}

function closeCart() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
}

function addToCart(id) {
    const existing = cart.find(c => c.id === id);
    if (existing) cart = cart.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c);
    else cart.push({ id, qty: 1 });
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const total = cart.reduce((s, c) => s + c.qty, 0);
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = total;
    countEl?.classList.toggle('bump', total > 0);
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    const countEl = document.getElementById('cartItemCount');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        empty && (empty.style.display = 'flex');
        footer && (footer.style.display = 'none');
        if (countEl) countEl.textContent = '(0)';
        return;
    }

    empty && (empty.style.display = 'none');
    footer && (footer.style.display = 'block');
    if (countEl) countEl.textContent = `(${cart.reduce((s, c) => s + c.qty, 0)})`;

    container.innerHTML = cart.map(item => {
        const p = products.find(pr => pr.id === item.id);
        if (!p) return '';
        return `
        <div class="cart-item" data-id="${item.id}">
            <div class="ci-emoji">${p.emoji}</div>
            <div class="ci-info">
                <div class="ci-name">${p.name}</div>
                <div class="ci-meta">${p.sizes ? p.sizes.split(',')[0] : ''} · ${p.colors ? p.colors.split(',')[0] : ''}</div>
                <div class="ci-price">${formatCurrency(p.price)}</div>
            </div>
            <div class="ci-qty">
                <button class="ci-qty-btn ci-minus" data-id="${item.id}">−</button>
                <span>${item.qty}</span>
                <button class="ci-qty-btn ci-plus" data-id="${item.id}">+</button>
            </div>
        </div>`;
    }).join('');

    const subtotal = cart.reduce((s, c) => { const p = products.find(pr => pr.id === c.id); return s + (p?.price || 0) * c.qty; }, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    document.getElementById('cartSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('cartTax').textContent = formatCurrency(tax);
    document.getElementById('cartTotal').textContent = formatCurrency(total);

    container.querySelectorAll('.ci-minus').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        cart = cart.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0);
        saveCart(); updateCartUI(); renderCartItems();
    }));
    container.querySelectorAll('.ci-plus').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        cart = cart.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c);
        saveCart(); updateCartUI(); renderCartItems();
    }));
}

// ── Checkout ──
function initCheckout() {
    document.getElementById('modalClose')?.addEventListener('click', closeCheckoutModal);
    document.getElementById('continueShoppingBtn')?.addEventListener('click', () => { closeCheckoutModal(); cart = []; saveCart(); updateCartUI(); });
    document.getElementById('prevStepBtn')?.addEventListener('click', () => { checkoutStep--; showStep(checkoutStep); updateNavButtons(); });
    document.getElementById('nextStepBtn')?.addEventListener('click', () => {
        if (checkoutStep < 3) { checkoutStep++; showStep(checkoutStep); updateNavButtons(); }
        else if (checkoutStep === 3) { placeOrder(); }
    });

    document.querySelectorAll('.payment-card').forEach(card => card.addEventListener('click', () => {
        document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    }));

    document.querySelectorAll('.checkout-step[data-step="3"] input, .checkout-step[data-step="3"]').forEach(el => {
        el.addEventListener('focus', () => {
            const subtotal = cart.reduce((s, c) => { const p = products.find(pr => pr.id === c.id); return s + (p?.price || 0) * c.qty; }, 0);
            const tax = subtotal * 0.05;
            const total = subtotal + tax;
            document.getElementById('checkoutTotalAmt').textContent = formatCurrency(total);
        });
    });

    document.getElementById('checkoutPhone')?.addEventListener('input', function() {
        if (!this.value.startsWith('8595291672') && this.value.length >= 10) {
            // keep as reference only, don't force
        }
    });
}

function openCheckoutModal() {
    document.getElementById('checkoutModal')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    checkoutStep = 1;
    showStep(1);
    updateNavButtons();
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal')?.classList.remove('open');
    document.body.style.overflow = '';
}

function showStep(step) {
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === step));
    if (step === 3) {
        const orderId = 'ANI' + Date.now().toString(36).toUpperCase();
        document.getElementById('checkoutOrderId').textContent = orderId;
    }
}

function updateNavButtons() {
    document.getElementById('prevStepBtn').style.display = checkoutStep > 1 ? '' : 'none';
    const nextBtn = document.getElementById('nextStepBtn');
    if (nextBtn) {
        nextBtn.querySelector('span').textContent = checkoutStep === 3 ? 'Confirm Order ✅' : 'Next';
    }
}

function placeOrder() {
    const name = document.getElementById('checkoutName')?.value?.trim() || 'Customer';
    const phone = document.getElementById('checkoutPhone')?.value?.trim() || '';
    const whatsapp = document.getElementById('checkoutEmail')?.value?.trim() || '';
    const address = document.getElementById('checkoutAddress')?.value?.trim() || '';
    const city = document.getElementById('checkoutCity')?.value?.trim() || '';
    const zip = document.getElementById('checkoutZip')?.value?.trim() || '';
    const state = document.getElementById('checkoutState')?.value?.trim() || '';
    const upi = document.getElementById('checkoutUPI')?.value?.trim() || '';

    if (!name || !phone) { showToast('Please enter name and phone number'); return; }
    if (!address || !city || !zip) { showToast('Please fill delivery address'); return; }
    if (cart.length === 0) { showToast('Your cart is empty!'); return; }

    const orderId = 'ANI' + Date.now().toString(36).toUpperCase();
    const orderItems = cart.map(item => {
        const p = products.find(pr => pr.id === item.id);
        return { id: item.id, name: p?.name || '', emoji: p?.emoji || '', price: p?.price || 0, qty: item.qty, cost: p?.cost || 0 };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    const orderCost = orderItems.reduce((s, i) => s + (i.cost || 0) * i.qty, 0);
    const profit = subtotal - orderCost;

    const order = { id: orderId, customer: name, phone, whatsapp, address, city, zip, state, upi, items: orderItems, subtotal, tax, total, cost: orderCost, profit, status: 'pending', date: new Date().toISOString() };
    orders.push(order);
    saveOrders();

    document.getElementById('newOrderId').textContent = orderId;
    checkoutStep = 4;
    showStep(4);
    updateNavButtons();
}

// ── Order Lookup ──
function initOrderLookup() {
    document.getElementById('lookupOrderBtn')?.addEventListener('click', () => {
        const id = document.getElementById('orderLookupInput')?.value?.trim()?.toUpperCase();
        const result = document.getElementById('orderResult');
        if (!id || !result) return;

        const order = orders.find(o => o.id === id || o.id.toLowerCase().includes(id.toLowerCase()));
        if (!order) {
            result.innerHTML = '<div class="order-not-found">❌ Order not found. Please check your Order ID.</div>';
            return;
        }

        const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
        const statusLabels = { pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };
        const statusIdx = statusSteps.indexOf(order.status);

        result.innerHTML = `
            <div class="order-detail-card">
                <div class="odc-header">
                    <div>
                        <div class="odc-id">${order.id}</div>
                        <div class="odc-date">${new Date(order.date).toLocaleDateString('en-IN')}</div>
                    </div>
                    <span class="odc-status status-${order.status}">${statusLabels[order.status]}</span>
                </div>
                <div class="odc-items">${order.items.map(i => `<div class="odc-item"><span>${i.emoji} ${i.name}</span><span>×${i.qty}</span><span>${formatCurrency(i.price * i.qty)}</span></div>`).join('')}</div>
                <div class="odc-totals"><div><span>Subtotal</span><span>${formatCurrency(order.subtotal)}</span></div><div><span>GST (5%)</span><span>${formatCurrency(order.tax)}</span></div><div class="odc-total"><span>Total</span><span>${formatCurrency(order.total)}</span></div></div>
                <div class="odc-timeline">
                    ${statusSteps.map((s, i) => `<div class="tl-step ${i <= statusIdx ? 'done' : ''} ${i === statusIdx ? 'current' : ''}"><div class="tl-dot"></div><div class="tl-label">${statusLabels[s]}</div></div>`).join('')}
                </div>
                <div class="odc-contact">WhatsApp for queries: <strong>8595291672</strong></div>
            </div>`;
    });
}

// ── Toast Notifications ──
function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✓</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ── SECRET ADMIN — PIN GATE ──
let secretClickCount = 0;
let secretClickTimer = null;

function initSecretAdmin() {
    const brand = document.getElementById('navBrand');
    if (!brand) return;
    brand.addEventListener('click', () => {
        secretClickCount++;
        clearTimeout(secretClickTimer);
        secretClickTimer = setTimeout(() => { secretClickCount = 0; }, 600);
        if (secretClickCount >= 3) {
            secretClickCount = 0;
            openPinModal();
        }
    });

    buildPinKeypad();
    setupPinInputs();
    document.getElementById('pinCancelBtn')?.addEventListener('click', closePinModal);
    document.getElementById('pinClearBtn')?.addEventListener('click', clearPinInputs);
}

function openPinModal() {
    const modal = document.getElementById('pinModal');
    if (!modal) return;
    modal.classList.add('open');
    clearPinInputs();
    document.getElementById('pinError').style.display = 'none';
    setTimeout(() => document.querySelector('.pin-digit')?.focus(), 100);
}

function closePinModal() {
    document.getElementById('pinModal')?.classList.remove('open');
    clearPinInputs();
}

function clearPinInputs() {
    document.querySelectorAll('.pin-digit').forEach(i => i.value = '');
    document.getElementById('pinError').style.display = 'none';
}

function buildPinKeypad() {
    const keypad = document.getElementById('pinKeypad');
    if (!keypad) return;
    const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','🔒'];
    keypad.innerHTML = keys.map(k => `<button class="pin-key" data-key="${k}">${k}</button>`).join('');
    keypad.querySelectorAll('.pin-key').forEach(btn => {
        btn.addEventListener('click', () => handlePinKey(btn.dataset.key));
    });
}

function setupPinInputs() {
    document.querySelectorAll('.pin-digit').forEach((input, idx) => {
        input.addEventListener('input', () => {
            if (input.value) {
                input.value = input.value.replace(/\D/g, '').slice(-1);
                if (idx < 3) document.querySelectorAll('.pin-digit')[idx + 1]?.focus();
            }
            checkPin();
        });
        input.addEventListener('keydown', e => {
            if (e.key === 'Backspace' && !input.value && idx > 0) {
                document.querySelectorAll('.pin-digit')[idx - 1]?.focus();
            }
            if (e.key === 'Enter') verifyPin();
        });
    });
}

function handlePinKey(key) {
    const inputs = document.querySelectorAll('.pin-digit');
    if (key === '⌫') {
        const filled = [...inputs].reverse().find(i => i.value);
        if (filled) filled.value = '';
        else { const empty = [...inputs].find(i => !i.value); if (empty) empty.focus(); }
    } else if (key === '🔒') {
        verifyPin();
    } else {
        const empty = [...inputs].find(i => !i.value);
        if (empty) { empty.value = key; empty.dispatchEvent(new Event('input')); }
    }
}

function checkPin() {
    const inputs = document.querySelectorAll('.pin-digit');
    const entered = [...inputs].map(i => i.value).join('');
    if (entered.length === 4) setTimeout(verifyPin, 100);
}

function verifyPin() {
    const inputs = document.querySelectorAll('.pin-digit');
    const entered = [...inputs].map(i => i.value).join('');
    if (entered === ADMIN_PIN) {
        closePinModal();
        openAdminPanel();
        showToast('👑 Owner access granted!');
    } else {
        document.getElementById('pinError').style.display = 'block';
        document.querySelectorAll('.pin-digit').forEach(i => i.value = '');
        document.querySelector('.pin-digit')?.focus();
    }
}

// ── Admin Panel ──
function openAdminPanel() {
    document.getElementById('adminPanel')?.classList.add('open');
    document.getElementById('adminOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    secretUnlocked = true;
    renderAdminDashboard();
}

function closeAdmin() {
    document.getElementById('adminPanel')?.classList.remove('open');
    document.getElementById('adminOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
    secretUnlocked = false;
}

function initAdmin() {
    document.getElementById('adminClose')?.addEventListener('click', closeAdmin);

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
            const tabName = tab.dataset.adminTab;
            document.getElementById('admin' + capitalize(tabName.replace('-admin', '')))?.classList.add('active');
            currentAdminTab = tabName;
            if (tabName === 'dashboard') renderAdminDashboard();
            else if (tabName === 'products') renderAdminProducts();
            else if (tabName === 'orders-admin') renderAdminOrders();
        });
    });

    document.querySelectorAll('.table-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.table-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAdminDashboard();
        });
    });

    document.getElementById('adminAddProductBtn')?.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
        document.getElementById('adminAddProduct')?.classList.add('active');
        currentAdminTab = 'add-product';
    });

    initProductForm();
    document.getElementById('adminOrdersSearch')?.addEventListener('input', renderAdminOrders);
}

function capitalize(s) { return s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(''); }

function renderAdminDashboard() {
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalProfit = orders.reduce((s, o) => s + (o.profit || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    document.getElementById('adminRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('adminProfit').textContent = formatCurrency(totalProfit);
    document.getElementById('adminTotalOrders').textContent = totalOrders;
    document.getElementById('adminProductCount').textContent = totalProducts;

    // Chart
    drawRevenueChart();

    // Recent Orders
    const statusFilter = document.querySelector('.table-filter-btn.active')?.dataset.status || 'all';
    const recent = (statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)).slice(-10).reverse();

    document.getElementById('adminOrdersTable').innerHTML = recent.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer}</td>
            <td>${o.items.map(i => `${i.emoji}×${i.qty}`).join(', ')}</td>
            <td>${formatCurrency(o.total)}</td>
            <td><select class="status-select" data-id="${o.id}">${['pending','processing','shipped','delivered'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}</select></td>
            <td>${new Date(o.date).toLocaleDateString('en-IN')}</td>
            <td><button class="btn-delete-order" data-id="${o.id}">🗑️</button></td>
        </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:#94a3b8;">No orders yet</td></tr>';

    document.querySelectorAll('.status-select').forEach(sel => sel.addEventListener('change', e => {
        const o = orders.find(ord => ord.id === e.target.dataset.id);
        if (o) { o.status = e.target.value; saveOrders(); }
    }));
    document.querySelectorAll('.btn-delete-order').forEach(btn => btn.addEventListener('click', e => {
        if (confirm('Delete this order?')) {
            orders = orders.filter(o => o.id !== e.currentTarget.dataset.id);
            saveOrders();
            renderAdminDashboard();
        }
    }));

    // Category Bars
    const cats = {};
    orders.forEach(o => o.items.forEach(i => {
        const p = products.find(pr => pr.id === i.id);
        const cat = p?.category || 'other';
        cats[cat] = (cats[cat] || 0) + i.qty;
    }));
    const maxCat = Math.max(...Object.values(cats), 1);
    const colors = { dresses: '#ec4899', tops: '#06b6d4', ethnic: '#a855f7', jeans: '#3b82f6', accessories: '#f59e0b' };
    document.getElementById('categoryBars').innerHTML = Object.entries(cats).map(([cat, qty]) => `
        <div class="cat-bar-item">
            <div class="cat-bar-label"><span>${cat}</span><span>${qty} sold</span></div>
            <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(qty/maxCat)*100}%;background:${colors[cat]||'#a855f7'}"></div></div>
        </div>`).join('') || '<p style="color:#94a3b8;text-align:center;">No sales data yet</p>';
}

function drawRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.parentElement?.offsetWidth || 600;
    const h = 180;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    const weeks = 8;
    const revenueData = Array.from({ length: weeks }, (_, i) => {
        const weekOrders = orders.filter((_, idx) => idx % weeks === i);
        return weekOrders.reduce((s, o) => s + o.total, 0);
    });
    const profitData = revenueData.map(r => r * (0.35 + Math.random() * 0.1));
    const maxVal = Math.max(...revenueData, 1);

    const pad = 30;
    const chartW = w - pad * 2;
    const chartH = h - pad * 2;

    // Grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = pad + (chartH / 4) * i;
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    }

    // Revenue line
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    revenueData.forEach((v, i) => {
        const x = pad + (chartW / (weeks - 1)) * i;
        const y = pad + chartH - (v / maxVal) * chartH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Revenue dots
    revenueData.forEach((v, i) => {
        const x = pad + (chartW / (weeks - 1)) * i;
        const y = pad + chartH - (v / maxVal) * chartH;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    });

    // Profit line
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    profitData.forEach((v, i) => {
        const x = pad + (chartW / (weeks - 1)) * i;
        const y = pad + chartH - (v / maxVal) * chartH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
}

function renderAdminProducts() {
    document.getElementById('adminProductsGrid').innerHTML = products.map(p => `
        <div class="admin-product-card" style="--card-accent:${p.color}">
            <div class="apc-emoji">${p.emoji}</div>
            <div class="apc-info">
                <div class="apc-category">${p.category}</div>
                <h4 class="apc-name">${p.name}</h4>
                <div class="apc-price">${formatCurrency(p.price)} <small>Cost: ${formatCurrency(p.cost)}</small></div>
                <div class="apc-margin" style="color:${((p.price-p.cost)/p.price*100)>50?'#10b981':'#f59e0b'}">Margin: ${Math.round((p.price-p.cost)/p.price*100)}%</div>
                <div class="apc-stock">Stock: ${p.stock} | Rating: ${p.rating}★</div>
            </div>
            <div class="apc-actions">
                <button class="btn-ap-edit" data-id="${p.id}">✏️ Edit</button>
                <button class="btn-ap-delete" data-id="${p.id}">🗑️ Delete</button>
            </div>
        </div>`).join('');

    document.querySelectorAll('.btn-ap-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = products.find(pr => pr.id === parseInt(btn.dataset.id));
            if (!p) return;
            document.getElementById('editProductId').value = p.id;
            document.getElementById('productName').value = p.name;
            document.getElementById('productCategory').value = p.category;
            document.getElementById('productPrice').value = p.price;
            document.getElementById('productCost').value = p.cost;
            document.getElementById('productSizes').value = p.sizes || '';
            document.getElementById('productColors').value = p.colors || '';
            document.getElementById('productDescription').value = p.description || '';
            document.getElementById('productEmoji').value = p.emoji;
            document.getElementById('productColor').value = p.color;
            document.getElementById('productStock').value = p.stock;
            document.getElementById('productFormSubmitText').textContent = 'Update Product';
            document.getElementById('cancelEditBtn').style.display = '';
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
            document.getElementById('adminAddProduct')?.classList.add('active');
        });
    });

    document.querySelectorAll('.btn-ap-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this product?')) {
                products = products.filter(p => p.id !== parseInt(btn.dataset.id));
                saveProducts();
                renderAdminProducts();
                showToast('Product deleted');
            }
        });
    });
}

function renderAdminOrders() {
    const search = document.getElementById('adminOrdersSearch')?.value?.toLowerCase() || '';
    const filtered = orders.filter(o =>
        !search || o.id.toLowerCase().includes(search) || o.customer.toLowerCase().includes(search) || o.phone.includes(search)
    );

    document.getElementById('adminFullOrdersTable').innerHTML = filtered.slice().reverse().map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer}</td>
            <td>${o.phone}</td>
            <td>${o.items.map(i => `${i.emoji}×${i.qty}`).join(', ')}</td>
            <td>${formatCurrency(o.subtotal)}</td>
            <td>${formatCurrency(o.tax)}</td>
            <td><strong>${formatCurrency(o.total)}</strong></td>
            <td style="color:#94a3b8">${formatCurrency(o.cost || 0)}</td>
            <td style="color:#10b981">${formatCurrency(o.profit || 0)}</td>
            <td><select class="status-select" data-id="${o.id}">${['pending','processing','shipped','delivered'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}</select></td>
            <td>${new Date(o.date).toLocaleDateString('en-IN')}</td>
            <td><button class="btn-delete-order" data-id="${o.id}">🗑️</button></td>
        </tr>`).join('') || '<tr><td colspan="12" style="text-align:center;color:#94a3b8;">No orders found</td></tr>';

    document.querySelectorAll('.status-select').forEach(sel => sel.addEventListener('change', e => {
        const o = orders.find(ord => ord.id === e.target.dataset.id);
        if (o) { o.status = e.target.value; saveOrders(); renderAdminDashboard(); }
    }));
    document.querySelectorAll('.btn-delete-order').forEach(btn => btn.addEventListener('click', e => {
        if (confirm('Delete this order?')) {
            orders = orders.filter(o => o.id !== e.currentTarget.dataset.id);
            saveOrders();
            renderAdminOrders();
        }
    }));
}

function initProductForm() {
    const form = document.getElementById('productForm');
    form?.addEventListener('submit', e => {
        e.preventDefault();
        const editId = document.getElementById('editProductId').value;
        const data = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            cost: parseFloat(document.getElementById('productCost').value),
            sizes: document.getElementById('productSizes').value.trim(),
            colors: document.getElementById('productColors').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            emoji: document.getElementById('productEmoji').value.trim() || '👗',
            color: document.getElementById('productColor').value || '#a855f7',
            stock: parseInt(document.getElementById('productStock').value) || 0,
            rating: 4.5,
            reviews: 0,
        };

        if (editId) {
            const idx = products.findIndex(p => p.id === parseInt(editId));
            if (idx !== -1) { products[idx] = { ...products[idx], ...data }; showToast('Product updated!'); }
        } else {
            data.id = Date.now();
            products.push(data);
            showToast('Product added!');
        }

        saveProducts();
        form.reset();
        document.getElementById('editProductId').value = '';
        document.getElementById('productFormSubmitText').textContent = 'Save Product';
        document.getElementById('cancelEditBtn').style.display = 'none';
        document.getElementById('productEmoji').value = '👗';
        document.getElementById('productColor').value = '#a855f7';
        renderProducts();
    });

    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
        form?.reset();
        document.getElementById('editProductId').value = '';
        document.getElementById('productFormSubmitText').textContent = 'Save Product';
        document.getElementById('cancelEditBtn').style.display = 'none';
        document.getElementById('productEmoji').value = '👗';
        document.getElementById('productColor').value = '#a855f7';
    });
}

// ── Hero CTA ──
function initHeroCTA() {
    document.querySelectorAll('.btn[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.goto);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ── Init All ──
document.addEventListener('DOMContentLoaded', () => {
    initHeroCounters();
    initNavScrollSpy();
    initHeroCTA();
    initFilters();
    renderProducts();
    initCart();
    initCheckout();
    initOrderLookup();
    initSecretAdmin();
    initAdmin();
});
