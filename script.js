// ZULVO - cart + UI behavior
document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'zulvo_cart_v1';
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCart = document.getElementById('closeCart');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const addButtons = document.querySelectorAll('.add-btn');
  const newsletterForm = document.getElementById('newsletterForm');
  const yearEl = document.getElementById('year');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  yearEl && (yearEl.textContent = new Date().getFullYear());

  let cart = loadCart();

  updateCartUI();

  // Add to Cart handlers
  addButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const id = card.dataset.id;
      const name = card.dataset.name || card.querySelector('h3')?.textContent || 'Product';
      const price = Number(card.dataset.price || 0);
      addToCart({ id, name, price, qty: 1 });
      // brief feedback
      btn.textContent = 'Added';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.disabled = false;
      }, 900);
    });
  });

  // Cart open / close
  cartBtn && cartBtn.addEventListener('click', () => toggleCart(true));
  closeCart && closeCart.addEventListener('click', () => toggleCart(false));

  // checkout (basic demo)
  checkoutBtn && checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    // In real site: go to checkout / payment
    alert('Thanks for shopping with ZULVO — checkout demo. Cart will be cleared.');
    cart = [];
    saveCart();
    updateCartUI();
    toggleCart(false);
  });

  // newsletter
  newsletterForm && newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    if (!email) return;
    // for demo only - show success
    newsletterForm.reset();
    alert(`Thanks — ${email} has been added to the list.`);
  });

  // search
  searchBtn && searchBtn.addEventListener('click', handleSearch);
  searchInput && searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  function handleSearch() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const cards = document.querySelectorAll('.product-card');
    if (!q) {
      cards.forEach(c => c.style.display = '');
      return;
    }
    cards.forEach(c => {
      const text = (c.dataset.name || c.querySelector('h3')?.textContent || '').toLowerCase();
      c.style.display = text.includes(q) ? '' : 'none';
    });
  }

  /* CART FUNCTIONS */
  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Failed to load cart', err);
      return [];
    }
  }
  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart', err);
    }
  }
  function addToCart(item) {
    const idx = cart.findIndex(i => i.id === item.id);
    if (idx > -1) {
      cart[idx].qty += item.qty;
    } else {
      cart.push({ ...item });
    }
    saveCart();
    updateCartUI();
    // small animation: open cart briefly
    toggleCart(true);
    setTimeout(() => toggleCart(false), 1200);
  }
  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
  }
  function changeQty(id, delta) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    saveCart();
    updateCartUI();
  }

  function updateCartUI() {
    // count
    const totalCount = cart.reduce((s, i) => s + i.qty, 0);
    cartCountEl && (cartCountEl.textContent = totalCount);
    // items
    if (cartItemsEl) cartItemsEl.innerHTML = '';
    if (!cartItemsEl) return;
    if (cart.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.style.opacity = 0.8;
      empty.textContent = 'Your cart is empty.';
      cartItemsEl.appendChild(empty);
      cartTotalEl && (cartTotalEl.textContent = '0');
      return;
    }
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="meta">
          <div style="width:56px;height:56px;border-radius:6px;background:linear-gradient(135deg,rgba(255,255,255,0.02),rgba(0,0,0,0.08));display:flex;align-items:center;justify-content:center;font-weight:700">${(item.name||'P').split(' ')[0]}</div>
          <div>
            <div style="font-weight:700">${item.name}</div>
            <div style="color:${getComputedStyle(document.documentElement).getPropertyValue('--muted') || 'gray'};font-size:0.9rem">$${(item.price).toFixed(2)}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div class="qty-control" style="color:var(--muted);">
            <button data-action="dec" data-id="${item.id}">-</button>
            <div style="padding:4px 8px">${item.qty}</div>
            <button data-action="inc" data-id="${item.id}">+</button>
          </div>
          <button data-action="remove" data-id="${item.id}" style="background:transparent;border:0;color:var(--muted);cursor:pointer">Remove</button>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });

    // attach handlers for qty / remove
    cartItemsEl.querySelectorAll('button[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      btn.addEventListener('click', () => {
        if (action === 'dec') changeQty(id, -1);
        if (action === 'inc') changeQty(id, +1);
        if (action === 'remove') removeFromCart(id);
      });
    });

    const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    cartTotalEl && (cartTotalEl.textContent = total.toFixed(2));
  }

  function toggleCart(open) {
    if (!cartDrawer) return;
    if (open === undefined) open = !cartDrawer.classList.contains('open');
    if (open) {
      cartDrawer.classList.add('open');
      cartDrawer.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    } else {
      cartDrawer.classList.remove('open');
      cartDrawer.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
  }
});
