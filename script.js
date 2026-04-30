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
