// ZULVO - cart + UI behavior + currency detection
document.addEventListener('DOMContentLoaded', async () => {
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
  let currency = { code: 'USD', symbol: '$', rate: 1, isUSD: true };

  // Detect user country and set currency
  await detectCurrency();

  updateCartUI();
  updateProductPrices();

  // Add to Cart handlers
  addButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const id = card.dataset.id;
      const name = card.dataset.name || card.querySelector('h3')?.textContent || 'Product';
      const priceUSD = Number(card.dataset.price || 0);
      addToCart({ id, name, priceUSD, qty: 1 });
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

  /* CURRENCY FUNCTIONS */
  async function detectCurrency() {
    try {
      // Use ipapi.co for geolocation (free tier available)
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('Geolocation failed');
      
      const data = await response.json();
      const country = data.country_code;

      if (country === 'PK') {
        currency = {
          code: 'PKR',
          symbol: 'PKR',
          rate: 280, // Approximate USD to PKR rate
          isUSD: false
        };
      } else {
        currency = {
          code: 'USD',
          symbol: '$',
          rate: 1,
          isUSD: true
        };
      }
    } catch (err) {
      console.warn('Could not detect location, defaulting to USD', err);
      currency = { code: 'USD', symbol: '$', rate: 1, isUSD: true };
    }
  }

  function formatPrice(priceUSD) {
    const convertedPrice = priceUSD * currency.rate;
    if (currency.isUSD) {
      return `$${convertedPrice.toFixed(2)}`;
    } else {
      // PKR format: PKR 7,999
      return `PKR ${Math.round(convertedPrice).toLocaleString('en-US')}`;
    }
  }

  function updateProductPrices() {
    // Update featured products
    document.querySelectorAll('.product-card').forEach(card => {
      const priceUSD = Number(card.dataset.price || 0);
      const priceEl = card.querySelector('.price');
      if (priceEl) {
        priceEl.textContent = formatPrice(priceUSD);
      }
    });

    // Update best sellers
    document.querySelectorAll('.product-mini').forEach(item => {
      const priceText = item.querySelector('p');
      if (priceText) {
        // Extract price from text (handles both $X and old format)
        const match = priceText.textContent.match(/\$?(\d+)/);
        if (match) {
          const priceUSD = Number(match[1]);
          priceText.textContent = formatPrice(priceUSD);
        }
      }
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
      const formattedPrice = formatPrice(item.priceUSD);
      row.innerHTML = `
        <div class="meta">
          <div style="width:56px;height:56px;border-radius:6px;background:linear-gradient(135deg,rgba(255,255,255,0.02),rgba(0,0,0,0.08));display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--muted)">✓</div>
          <div>
            <div style="font-weight:700">${item.name}</div>
            <div style="color:var(--muted);font-size:0.9rem">${formattedPrice}</div>
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

    // Update cart total with proper formatting
    const total = cart.reduce((s, i) => s + (i.priceUSD * i.qty), 0);
    if (cartTotalEl) {
      if (currency.isUSD) {
        cartTotalEl.textContent = total.toFixed(2);
      } else {
        const convertedTotal = Math.round(total * currency.rate);
        cartTotalEl.textContent = convertedTotal.toLocaleString('en-US');
      }
    }
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