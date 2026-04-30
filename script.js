// ===== CURSOR =====
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx - 6 + 'px';
  cursor.style.top = my - 6 + 'px';
});

function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx - 18 + 'px';
  ring.style.top = ry - 18 + 'px';
  requestAnimationFrame(animRing);
}
animRing();

// ===== THREE.JS HERO =====
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 0, 8);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// Dress form (mannequin shape using geometries)
const bodyGeo = new THREE.CylinderGeometry(0.6, 0.8, 2.2, 16);
const bodyMat = new THREE.MeshStandardMaterial({
  color: 0xE8C97A,
  roughness: 0.3,
  metalness: 0.6,
  transparent: true,
  opacity: 0.85,
  wireframe: false,
});
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.set(3, -0.5, 0);
scene.add(body);

// Neck
const neckGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 16);
const neck = new THREE.Mesh(neckGeo, bodyMat);
neck.position.set(3, 0.8, 0);
scene.add(neck);

// Head
const headGeo = new THREE.SphereGeometry(0.3, 32, 32);
const head = new THREE.Mesh(headGeo, bodyMat);
head.position.set(3, 1.3, 0);
scene.add(head);

// Skirt (cone)
const skirtGeo = new THREE.ConeGeometry(1.2, 1.8, 32);
const skirtMat = new THREE.MeshStandardMaterial({
  color: 0xC9A84C,
  roughness: 0.4,
  metalness: 0.3,
  transparent: true,
  opacity: 0.7,
  wireframe: true,
});
const skirt = new THREE.Mesh(skirtGeo, skirtMat);
skirt.position.set(3, -1.7, 0);
scene.add(skirt);

// Floating particles (gold dust)
const pGeo = new THREE.BufferGeometry();
const pCount = 800;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount * 3; i++) {
  pPos[i] = (Math.random() - 0.5) * 15;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({
  size: 0.04,
  color: 0xC9A84C,
  transparent: true,
  opacity: 0.5,
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// Floating rings
const ring1Geo = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
const ring1Mat = new THREE.MeshStandardMaterial({ color: 0xE8C97A, metalness: 0.9, roughness: 0.1 });
const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
ring1.position.set(3, 0, 0);
ring1.rotation.x = Math.PI / 3;
scene.add(ring1);

const ring2 = new THREE.Mesh(
  new THREE.TorusGeometry(2, 0.015, 16, 100),
  new THREE.MeshStandardMaterial({ color: 0xC9A84C, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.5 })
);
ring2.position.set(3, 0, 0);
ring2.rotation.x = Math.PI / 5;
ring2.rotation.y = Math.PI / 4;
scene.add(ring2);

// Lights
const goldLight = new THREE.PointLight(0xC9A84C, 3, 20);
goldLight.position.set(6, 3, 4);
scene.add(goldLight);

const warmLight = new THREE.PointLight(0xfff0d0, 2, 15);
warmLight.position.set(0, 5, 5);
scene.add(warmLight);

scene.add(new THREE.AmbientLight(0xfff5e0, 0.8));

// Animation
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  body.rotation.y = t * 0.3;
  neck.rotation.y = t * 0.3;
  head.rotation.y = t * 0.3;
  skirt.rotation.y = t * 0.3;
  ring1.rotation.z = t * 0.4;
  ring2.rotation.z = -t * 0.3;
  ring2.rotation.y = t * 0.2;
  particles.rotation.y = t * 0.05;

  // Floating bobbing
  body.position.y = -0.5 + Math.sin(t * 0.8) * 0.1;
  neck.position.y = 0.8 + Math.sin(t * 0.8) * 0.1;
  head.position.y = 1.3 + Math.sin(t * 0.8) * 0.1;
  skirt.position.y = -1.7 + Math.sin(t * 0.8) * 0.1;
  ring1.position.y = Math.sin(t * 0.8) * 0.1;
  ring2.position.y = Math.sin(t * 0.8) * 0.1;

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== DOOR TOGGLE =====
let doorOpen = false;
function toggleDoor() {
  doorOpen = !doorOpen;
  document.getElementById('doorPanel').classList.toggle('open', doorOpen);
  const btn = document.getElementById('openBtn');
  btn.textContent = doorOpen ? 'Close The Door ✦' : 'Open The Door ✦';
  btn.classList.toggle('active', doorOpen);
}

// ===== SCROLL ANIMATIONS =====
const cards = document.querySelectorAll('.product-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 120);
    }
  });
}, { threshold: 0.1 });

cards.forEach(card => observer.observe(card));

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.boxShadow = window.scrollY > 50
    ? '0 4px 30px rgba(201,168,76,0.1)'
    : 'none';
});
// ============================================================
// ⚙️  SHOP CONFIGURATION — EDIT THESE VALUES
// ============================================================
const SHOP_CONFIG = {
  shopName: "Anita Collection",
  upiId: "yourname@upi",          // 👈 APNA UPI ID YAHAN LIKHEIN
  upiName: "Anita Collection",    // 👈 UPI pe dikhne wala naam
  phone: "+919999999999",         // 👈 Apna phone number
  // Google Sheets Web App URL (admin.html mein instructions hain)
  googleSheetURL: "YOUR_GOOGLE_SHEET_WEBAPP_URL",
};

// ============================================================
// 📦 PRODUCTS LIST — Apne products yahan add karein
// ============================================================
const PRODUCTS = [
  // FORMAT:
  // { id, name, category, price, oldPrice, emoji, tag, desc, sizes, bg, stock }

  // SAREES
  { id:1, name:"Silk Banarasi Saree", category:"saree", price:7999, oldPrice:9999, emoji:"🥻", tag:"Bestseller", desc:"Pure silk Banarasi saree with intricate gold zari work. Perfect for weddings and festivals.", sizes:["Free Size"], bg:"linear-gradient(135deg,#fdf0e0,#f5e0c8)", stock:true },
  { id:2, name:"Kanjivaram Silk Saree", category:"saree", price:12999, oldPrice:15999, emoji:"🥻", tag:"Premium", desc:"Authentic Kanjivaram silk saree with traditional temple border design.", sizes:["Free Size"], bg:"linear-gradient(135deg,#f0e0f5,#e8d0f0)", stock:true },
  { id:3, name:"Georgette Party Saree", category:"saree", price:3499, oldPrice:4999, emoji:"🥻", tag:"New", desc:"Light georgette saree with sequin embellishment. Perfect for parties.", sizes:["Free Size"], bg:"linear-gradient(135deg,#e0f0f5,#d0e8f0)", stock:true },
  { id:4, name:"Cotton Printed Saree", category:"saree", price:1299, oldPrice:1999, emoji:"🥻", tag:"", desc:"Comfortable cotton saree with floral print. Ideal for daily wear.", sizes:["Free Size"], bg:"linear-gradient(135deg,#f5f0e0,#ede8d0)", stock:true },
  { id:5, name:"Chiffon Embroidered Saree", category:"saree", price:4999, oldPrice:6999, emoji:"🥻", tag:"", desc:"Elegant chiffon saree with delicate thread embroidery work.", sizes:["Free Size"], bg:"linear-gradient(135deg,#f5e8e0,#f0ddd0)", stock:true },

  // LEHENGAS
  { id:6, name:"Bridal Lehenga Choli", category:"lehenga", price:24999, oldPrice:34999, emoji:"👗", tag:"Premium", desc:"Stunning bridal lehenga with heavy zari embroidery. Includes choli and dupatta.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#fdf0e0,#f8e0cc)", stock:true },
  { id:7, name:"Party Wear Lehenga", category:"lehenga", price:8999, oldPrice:12999, emoji:"👗", tag:"New", desc:"Designer lehenga with mirror work and gota patti detailing.", sizes:["S","M","L","XL"], bg:"linear-gradient(135deg,#f0e0f8,#e8d0f5)", stock:true },
  { id:8, name:"Kids Lehenga Set", category:"lehenga", price:2999, oldPrice:3999, emoji:"👗", tag:"", desc:"Beautiful lehenga choli set for girls. Available in multiple colors.", sizes:["2-4Y","4-6Y","6-8Y","8-10Y"], bg:"linear-gradient(135deg,#ffe0f0,#ffd0e8)", stock:true },
  { id:9, name:"Indo-Western Lehenga", category:"lehenga", price:6499, oldPrice:8999, emoji:"👗", tag:"Trending", desc:"Fusion lehenga with contemporary design and traditional touch.", sizes:["S","M","L","XL"], bg:"linear-gradient(135deg,#e0f0e0,#d0e8d0)", stock:true },

  // KURTIS
  { id:10, name:"Cotton Straight Kurti", category:"kurti", price:699, oldPrice:999, emoji:"👘", tag:"", desc:"Comfortable daily wear cotton kurti with beautiful block print.", sizes:["XS","S","M","L","XL","XXL","3XL"], bg:"linear-gradient(135deg,#f5f5e0,#ededd0)", stock:true },
  { id:11, name:"Rayon Printed Kurti", category:"kurti", price:849, oldPrice:1299, emoji:"👘", tag:"Bestseller", desc:"Soft rayon kurti with vibrant floral print. Perfect for office and casual wear.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#e8f0f5,#d8e8f0)", stock:true },
  { id:12, name:"A-Line Embroidered Kurti", category:"kurti", price:1299, oldPrice:1799, emoji:"👘", tag:"New", desc:"Stylish A-line kurti with beautiful neck embroidery and flare.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#f5e8f0,#f0d8e8)", stock:true },
  { id:13, name:"Kurti Palazzo Set", category:"kurti", price:1799, oldPrice:2499, emoji:"👘", tag:"", desc:"Trendy kurti with matching palazzo pants. Great casual ethnic look.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#f0f5e8,#e8f0d8)", stock:true },
  { id:14, name:"Long Maxi Kurti", category:"kurti", price:999, oldPrice:1499, emoji:"👘", tag:"", desc:"Flowy maxi length kurti with side slits. Modern and comfortable.", sizes:["S","M","L","XL","XXL","3XL"], bg:"linear-gradient(135deg,#f5f0f8,#ede8f5)", stock:true },

  // ANARKALI
  { id:15, name:"Zari Embroidered Anarkali", category:"anarkali", price:4299, oldPrice:5999, emoji:"🪭", tag:"New", desc:"Floor-length anarkali with intricate zari embroidery. Includes churidar and dupatta.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#fdf0e0,#f5e0c8)", stock:true },
  { id:16, name:"Georgette Anarkali Suit", category:"anarkali", price:2999, oldPrice:3999, emoji:"🪭", tag:"", desc:"Elegant georgette anarkali with thread work detailing. Semi-stitched.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#f0e8f8,#e8d8f5)", stock:true },
  { id:17, name:"Net Bridal Anarkali", category:"anarkali", price:8999, oldPrice:12999, emoji:"🪭", tag:"Premium", desc:"Heavy bridal anarkali in net fabric with stone and sequin work.", sizes:["S","M","L","XL"], bg:"linear-gradient(135deg,#fff0e0,#fde0c0)", stock:true },
  { id:18, name:"Cotton Anarkali Kurti", category:"anarkali", price:1499, oldPrice:1999, emoji:"🪭", tag:"", desc:"Comfortable cotton anarkali for daily and casual wear.", sizes:["S","M","L","XL","XXL","3XL"], bg:"linear-gradient(135deg,#e8f5f0,#d8f0e8)", stock:true },

  // PALAZZO
  { id:19, name:"Designer Palazzo Set", category:"palazzo", price:3499, oldPrice:4999, emoji:"✨", tag:"", desc:"Trendy palazzo set with printed top and wide-leg palazzo pants.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#f5f5e8,#eeeede)", stock:true },
  { id:20, name:"Rayon Palazzo Pants", category:"palazzo", price:799, oldPrice:1199, emoji:"✨", tag:"", desc:"Comfortable rayon palazzo in solid colors. Mix and match with any top.", sizes:["S","M","L","XL","XXL","3XL"], bg:"linear-gradient(135deg,#e8f0f8,#d8e8f5)", stock:true },
  { id:21, name:"Sharara Set", category:"palazzo", price:4999, oldPrice:6999, emoji:"✨", tag:"Trending", desc:"Beautiful sharara set with embroidered kurti. Perfect for festive occasions.", sizes:["S","M","L","XL"], bg:"linear-gradient(135deg,#f8e8f0,#f5d8e8)", stock:true },

  // GOWNS
  { id:22, name:"Sequin Evening Gown", category:"gown", price:8499, oldPrice:11999, emoji:"💎", tag:"New", desc:"Dazzling sequin gown perfect for parties, receptions and cocktail events.", sizes:["S","M","L","XL"], bg:"linear-gradient(135deg,#f5f5f0,#eeede0)", stock:true },
  { id:23, name:"Floral Maxi Gown", category:"gown", price:2999, oldPrice:3999, emoji:"💎", tag:"", desc:"Breezy floral maxi gown in chiffon fabric. Great for summer occasions.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#f0f8e8,#e8f5d8)", stock:true },
  { id:24, name:"Velvet Indo-Gown", category:"gown", price:12999, oldPrice:17999, emoji:"💎", tag:"Premium", desc:"Luxurious velvet gown with hand embroidery. Perfect for winter weddings.", sizes:["S","M","L","XL"], bg:"linear-gradient(135deg,#f0e0f8,#e8d0f5)", stock:true },

  // SUITS
  { id:25, name:"Punjabi Patiala Suit", category:"suit", price:1999, oldPrice:2799, emoji:"🎀", tag:"", desc:"Traditional Patiala salwar suit with phulkari dupatta.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#ffe8e0,#ffd8d0)", stock:true },
  { id:26, name:"Designer Salwar Suit", category:"suit", price:3999, oldPrice:5499, emoji:"🎀", tag:"Bestseller", desc:"Elegant designer salwar suit with printed dupatta. Dry clean recommended.", sizes:["S","M","L","XL","XXL"], bg:"linear-gradient(135deg,#e8f0e0,#d8e8d0)", stock:true },
  { id:27, name:"Kashmiri Embroidered Suit", category:"suit", price:6999, oldPrice:9999, emoji:"🎀", tag:"Premium", desc:"Hand-embroidered Kashmiri suit with signature chain stitch work.", sizes:["S","M","L","XL"], bg:"linear-gradient(135deg,#f8f0e8,#f5e8d8)", stock:true },
  { id:28, name:"Linen Suit Set", category:"suit", price:2499, oldPrice:3299, emoji:"🎀", tag:"New", desc:"Comfortable linen suit with minimalist design. Perfect for office wear.", sizes:["S","M","L","XL","XXL","3XL"], bg:"linear-gradient(135deg,#f0f0e8,#e8e8d8)", stock:true },
];

// ============================================================
// CART & STATE
// ============================================================
let cart = JSON.parse(localStorage.getItem('anitaCart') || '[]');
let currentProducts = [...PRODUCTS];
let activeCategory = 'all';
let selectedSize = '';

function saveCart() { localStorage.setItem('anitaCart', JSON.stringify(cart)); }

// ============================================================
// RENDER PRODUCTS
// ============================================================
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  document.getElementById('productCount').textContent = `Showing ${list.length} products`;
  if (!list.length) {
    grid.innerHTML = '<div class="no-results"><p>🔍</p><p>No products found</p></div>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="product-card" onclick="openModal(${p.id})">
      ${p.tag ? `<span class="card-tag ${p.stock ? '' : 'sold-out'}">${p.stock ? p.tag || 'New' : 'Sold Out'}</span>` : ''}
      <div class="card-img" style="background:${p.bg}">${p.emoji}</div>
      <div class="card-info">
        <p class="card-category">${p.category}</p>
        <h3 class="card-name">${p.name}</h3>
        <div class="card-bottom">
          <div class="card-price">
            ${p.oldPrice ? `<span class="old-price">₹${p.oldPrice.toLocaleString()}</span>` : ''}
            ₹${p.price.toLocaleString()}
          </div>
          <button class="add-cart-btn" onclick="event.stopPropagation(); quickAdd(${p.id})" ${!p.stock?'disabled':''}>
            ${p.stock ? '+ Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function quickAdd(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const size = p.sizes.length === 1 ? p.sizes[0] : '';
  addToCart(p, size || 'Free Size');
}

// ============================================================
// FILTER & SORT
// ============================================================
function filterCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function filterProducts() {
  applyFilters();
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  currentProducts = PRODUCTS.filter(p => {
    const catMatch = activeCategory === 'all' || p.category === activeCategory;
    const searchMatch = !search || p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search);
    return catMatch && searchMatch;
  });
  sortProducts();
}

function sortProducts() {
  const sort = document.getElementById('sortSelect').value;
  if (sort === 'low') currentProducts.sort((a,b) => a.price - b.price);
  else if (sort === 'high') currentProducts.sort((a,b) => b.price - a.price);
  else if (sort === 'name') currentProducts.sort((a,b) => a.name.localeCompare(b.name));
  renderProducts(currentProducts);
}

// ============================================================
// PRODUCT MODAL
// ============================================================
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  selectedSize = p.sizes.length === 1 ? p.sizes[0] : '';
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-img" style="background:${p.bg}">${p.emoji}</div>
    ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ''}
    <p class="modal-category">${p.category.toUpperCase()}</p>
    <h2 class="modal-name">${p.name}</h2>
    <p class="modal-price">₹${p.price.toLocaleString()} ${p.oldPrice ? `<span style="font-size:0.85rem;color:var(--text-light);text-decoration:line-through;font-weight:400">₹${p.oldPrice.toLocaleString()}</span>` : ''}</p>
    <p class="modal-desc">${p.desc}</p>
    ${p.sizes.length > 1 ? `
      <div class="modal-sizes">
        <p>Select Size:</p>
        <div class="size-btns">
          ${p.sizes.map(s => `<button class="size-btn" onclick="selectSize('${s}', this)">${s}</button>`).join('')}
        </div>
      </div>
    ` : ''}
    <button class="modal-add-btn" onclick="addFromModal(${p.id})" ${!p.stock?'disabled':''}>
      ${p.stock ? '🛒 Add to Cart' : 'Currently Out of Stock'}
    </button>
  `;
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('productModal').classList.add('active');
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function addFromModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (p.sizes.length > 1 && !selectedSize) { showToast('Please select a size!'); return; }
  addToCart(p, selectedSize || 'Free Size');
  closeModal();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('productModal').classList.remove('active');
}

// ============================================================
// CART
// ============================================================
function addToCart(product, size) {
  const key = `${product.id}-${size}`;
  const existing = cart.find(i => i.key === key);
  if (existing) { existing.qty++; }
  else { cart.push({ key, id: product.id, name: product.name, price: product.price, emoji: product.emoji, size, qty: 1 }); }
  saveCart();
  updateCartUI();
  showToast(`✅ ${product.name} added to cart!`);
}

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  document.getElementById('cartTotal').textContent = `₹${total.toLocaleString()}`;
  if (!cart.length) {
    itemsEl.innerHTML = '<div class="empty-cart">Your cart is empty 🛍️</div>';
    footerEl.style.display = 'none';
    return;
  }
  footerEl.style.display = 'block';
  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">₹${item.price.toLocaleString()} ${item.size !== 'Free Size' ? `· ${item.size}` : ''}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.key}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.key}', 1)">+</button>
          <button class="remove-item" onclick="removeItem('${item.key}')">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

function changeQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { cart = cart.filter(i => i.key !== key); }
  saveCart(); updateCartUI();
}

function removeItem(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart(); updateCartUI();
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('active');
}

// ============================================================
// CHECKOUT
// ============================================================
function proceedToCheckout() {
  if (!cart.length) { showToast('Your cart is empty!'); return; }
  toggleCart();
  document.getElementById('checkoutOverlay').classList.add('active');
  document.getElementById('checkoutModal').classList.add('active');
  showStep(1);
}

function showStep(n) {
  [1,2,3].forEach(i => document.getElementById(`step${i}`).style.display = i===n ? 'block' : 'none');
}

function goToPayment() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const pincode = document.getElementById('custPincode').value.trim();
  if (!name || !phone || !address || !pincode) { showToast('Please fill all required fields!'); return; }
  if (phone.length < 10) { showToast('Enter valid mobile number!'); return; }

  // Build order summary
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const summaryHTML = cart.map(i => `
    <div class="order-summary-item">
      <span>${i.name} ${i.size !== 'Free Size' ? `(${i.size})` : ''} × ${i.qty}</span>
      <span>₹${(i.price * i.qty).toLocaleString()}</span>
    </div>
  `).join('') + `<div class="order-summary-total"><span>Total to Pay</span><span>₹${total.toLocaleString()}</span></div>`;
  document.getElementById('orderSummary').innerHTML = summaryHTML;

  // Set UPI details
  document.getElementById('upiIdText').textContent = SHOP_CONFIG.upiId;

  // Generate QR code (UPI deep link)
  generateQR(total);
  showStep(2);
}

function generateQR(amount) {
  const upiURL = `upi://pay?pa=${SHOP_CONFIG.upiId}&pn=${encodeURIComponent(SHOP_CONFIG.upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Anita Collection Order')}`;
  const canvas = document.getElementById('qrCanvas');
  const size = 180;
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Simple QR-like visual (real QR needs library — show UPI link instead)
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);

  // Draw UPI amount prominently
  ctx.fillStyle = '#1a1410';
  ctx.font = 'bold 14px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Scan with any UPI app', size/2, 30);
  ctx.font = 'bold 22px Montserrat, sans-serif';
  ctx.fillStyle = '#C9A84C';
  ctx.fillText(`₹${amount.toLocaleString()}`, size/2, 70);
  ctx.font = '11px Montserrat, sans-serif';
  ctx.fillStyle = '#8a7a65';
  ctx.fillText(SHOP_CONFIG.upiId, size/2, 95);

  // Draw decorative border pattern
  ctx.strokeStyle = '#C9A84C';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, size-16, size-16);
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, size-24, size-24);

  // Corner squares (QR-like)
  const drawCorner = (x, y) => {
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(x, y, 24, 24);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x+3, y+3, 18, 18);
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(x+6, y+6, 12, 12);
  };
  drawCorner(20, 110); drawCorner(136, 110); drawCorner(20, 20);

  ctx.font = '10px Montserrat, sans-serif';
  ctx.fillStyle = '#C9A84C';
  ctx.fillText('GPay · PhonePe · Paytm · BHIM', size/2, 165);
}

function copyUPI() {
  navigator.clipboard.writeText(SHOP_CONFIG.upiId).then(() => showToast('✅ UPI ID copied!'));
}

function goBack() { showStep(1); }

async function confirmPayment() {
  const utr = document.getElementById('utrNumber').value.trim();
  if (!utr) { showToast('Please enter Transaction/UTR ID!'); return; }

  const orderId = 'AC' + Date.now().toString().slice(-8);
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const address = document.getElementById('custAddress').value.t
