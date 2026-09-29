import { menuApi } from './services/menu-api.js';

const cart = [];
const money = value => `₹${value}`;
const byId = id => document.getElementById(id);

function renderCart() {
  const items = byId('cart-items');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  byId('cart-count').textContent = count;
  byId('cart-total').textContent = money(total);
  items.innerHTML = cart.length ? cart.map(item => `<article class="cart-line"><span>${item.icon}</span><div><b>${item.name}</b><small>${money(item.price)} × ${item.quantity}</small></div><button data-remove="${item.id}" aria-label="Remove ${item.name}">−</button></article>`).join('') : '<p class="empty-cart">Your cart is waiting for something delicious.</p>';
  items.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => { const i = cart.findIndex(item => item.id === button.dataset.remove); if (--cart[i].quantity === 0) cart.splice(i, 1); renderCart(); }));
}
function addToCart(item) { const found = cart.find(entry => entry.id === item.id); found ? found.quantity++ : cart.push({ ...item, quantity: 1 }); renderCart(); }
function setDrawer(open) { byId('cart-drawer').classList.toggle('open', open); byId('backdrop').classList.toggle('show', open); byId('cart-drawer').setAttribute('aria-hidden', String(!open)); }

async function init() {
  const [items, categories, rows] = await Promise.all([menuApi.getMenu(), menuApi.getCategories(), menuApi.getComparison()]);
  byId('categories').innerHTML = categories.map((category, i) => `<button class="category ${i === 0 ? 'active' : ''}" type="button"><span>${category.icon}</span>${category.name}</button>`).join('');
  byId('food-grid').innerHTML = items.map(item => `<article class="food-card"><div class="food-card-art"><span>${item.icon}</span>${item.badge ? `<b>${item.badge}</b>` : ''}</div><div class="card-content"><p>${item.category}</p><h3>${item.name}</h3><small>${item.description}</small><div><strong>${money(item.price)}</strong><button class="add-button" data-add="${item.id}" aria-label="Add ${item.name} to cart">+</button></div></div></article>`).join('');
  byId('comparison-body').innerHTML = rows.map(row => `<tr>${row.map((cell, i) => `<${i ? 'td' : 'th'}${i ? '' : ' scope="row"'}>${cell}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('');
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addToCart(items.find(item => item.id === button.dataset.add))));
  document.querySelectorAll('.category').forEach(button => button.addEventListener('click', () => { document.querySelector('.category.active').classList.remove('active'); button.classList.add('active'); }));
}
byId('cart-button').addEventListener('click', () => setDrawer(true));
byId('close-cart').addEventListener('click', () => setDrawer(false));
byId('backdrop').addEventListener('click', () => setDrawer(false));
byId('checkout').addEventListener('click', () => alert(cart.length ? 'Order received! We’ll start making it fresh.' : 'Add something tasty first.'));
init();
