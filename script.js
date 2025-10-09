// script.js — DSY Collective (cleaned & robust)
// Loads global header first (if present), then initializes the app.

(async function loadHeaderAndInit() {
  // Helper: safe query
  const $ = (sel) => document.querySelector(sel);

  // If there's a global header placeholder, fetch it and insert
  const headerPlaceholder = $('#global-header');
  if (headerPlaceholder) {
    try {
      const res = await fetch('header.html');
      if (res.ok) {
        const html = await res.text();
        headerPlaceholder.innerHTML = html;
        // small delay ensures DOM parser inserts nodes
        await new Promise(r => setTimeout(r, 0));
      } else {
        console.warn('Could not load header.html:', res.status);
      }
    } catch (err) {
      console.warn('Error loading header.html', err);
    }
  }

  // Now run the main init (header is loaded if it existed)
  initApp();
})();

function initApp() {
  /* ---------------- Splash ---------------- */
  const splash = document.getElementById('splash');
  const site = document.getElementById('site');
  if (splash && site) {
    setTimeout(() => {
      splash.classList.add('hidden');
      site.classList.remove('hidden');
    }, 1200);
  }

  /* ---------------- DOM elements (queried after header load) ---------------- */
  // Cart selectors: support either a header cart or shop-local cart
  const cartBtn = document.getElementById('cartBtn') || document.querySelector('.shop-cart #cartBtn') || document.querySelector('#cartBtn');
  const cartCountEl = document.getElementById('cartCount') || document.querySelector('#cartCount');
  const cartPanel = document.getElementById('cart-panel') || document.getElementById('cartPanel'); // may be absent on non-shop pages
  const cartItemsEl = document.getElementById('cart-items') || document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cart-total') || document.getElementById('cartTotal') || document.querySelector('#cart-total, #cartTotal');

  // Other elements
  const checkoutForm = document.getElementById('checkout-form');
  const closeCartBtn = document.getElementById('close-cart');
  const joinForm = document.getElementById('join-form');
  const contactForm = document.querySelector('.contact-form');

  /* ---------------- Cart State (load from localStorage if present) ---------------- */
  const STORAGE_KEY = 'dsyCart';
  let cart = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) cart = JSON.parse(saved) || [];
  } catch (e) {
    cart = [];
  }

  /* ---------------- Helpers ---------------- */
  const fmt = (n) => Number(n).toLocaleString();

  function persistCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not persist cart', e);
    }
  }

  function updateCartUI() {
    // update count bubble
    if (cartCountEl) cartCountEl.textContent = String(cart.length);

    // update panel contents (if present)
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <div class="muted small">₦${fmt(item.price)}</div>
          </div>
          <div>
            <button class="remove-item" data-idx="${idx}" style="background:none;border:none;color:var(--muted,#bdbdbd);cursor:pointer">✕</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(li);
      total += Number(item.price);
    });
    if (cartTotalEl) cartTotalEl.textContent = fmt(total);
    persistCart();
  }

  function escapeHtml(s) {
    if (typeof s !== 'string') return s;
    return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
  }

  /* ---------------- Page-specific: show cart icon only on shop page ---------------- */
  // If you want the cart icon to only appear on "shop" pages:
  const isShopPage = window.location.pathname.includes('shop') || window.location.pathname === '/' || window.location.pathname.endsWith('index.html') ? false : window.location.pathname.includes('shop');
  // Above line defaults to showing only on /shop or shop.html — tweak if needed.
  // We'll instead check more simply: show when path contains "shop"
  const showCartOnShopOnly = true;
  if (showCartOnShopOnly) {
    const path = window.location.pathname.toLowerCase();
    if (!path.includes('shop')) {
      // hide the header cart if present
      if (cartBtn && cartBtn.style) cartBtn.style.display = 'none';
    } else {
      if (cartBtn && cartBtn.style) cartBtn.style.display = '';
    }
  }

  /* ---------------- Add-to-cart button wiring (works anywhere) ---------------- */
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = e.target.closest('.product-card, .product');
      if (!card) return;
      const name = card.dataset.name || (card.querySelector('h3') && card.querySelector('h3').textContent.trim()) || 'Product';
      let price = card.dataset.price || (card.querySelector('p') && card.querySelector('p').textContent.replace(/[^\d]/g,''));
      if (!price) price = '0';
      // push and update
      cart.push({ id: String(Date.now()), name: name, price: Number(price) });
      updateCartUI();
      // if there's a panel, open it. otherwise save only.
      if (cartPanel) cartPanel.classList.remove('hidden');
      // ensure visible counter
      if (cartCountEl) cartCountEl.textContent = String(cart.length);
    });
  });

  /* ---------------- remove item (delegation) ---------------- */
  document.addEventListener('click', (e) => {
    const rem = e.target.closest('.remove-item');
    if (rem) {
      const idx = Number(rem.dataset.idx);
      if (!Number.isNaN(idx)) {
        cart.splice(idx, 1);
        updateCartUI();
      }
    }
  });

  /* ---------------- cart button behaviour ---------------- */
  if (cartBtn) {
    // If cartBtn is an <a href="checkout.html"> it's fine — but we want to save cart first
    cartBtn.addEventListener('click', (ev) => {
      // Save current cart to localStorage
      persistCart();
      // If cartBtn is an anchor linking to checkout, allow default navigation.
      // If it's a button (no href), open checkout in new tab
      const isAnchor = cartBtn.tagName.toLowerCase() === 'a' && cartBtn.getAttribute('href');
      if (!isAnchor) {
        ev.preventDefault();
        window.open('checkout.html', '_blank');
      }
    });
  }

  /* ---------------- close cart if applicable ---------------- */
  if (closeCartBtn && cartPanel) {
    closeCartBtn.addEventListener('click', () => cartPanel.classList.add('hidden'));
  }

  /* ---------------- checkout form (if present inside a panel) ---------------- */
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (cart.length === 0) {
        alert('Your cart is empty');
        return;
      }
      const emailInput = document.getElementById('customer-email');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) { alert('Enter email to proceed'); return; }
      const total = Number(cart.reduce((s,i)=> s + Number(i.price), 0));
      const PAYSTACK_PUBLIC_KEY = 'pk_live_8fc53d727f2efefc2e8899494197e9b04ddc945f';
      if (!window.PaystackPop) { alert('Paystack script not loaded'); return; }
      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: total * 100,
        currency: 'NGN',
        ref: 'DSY_' + Date.now(),
        metadata: { custom_fields: [{ display_name: 'Cart', variable_name: 'cart', value: JSON.stringify(cart) }] },
        callback: function(resp) {
          alert('Payment complete. Ref: ' + resp.reference);
          cart = []; // clear
          updateCartUI();
          if (cartPanel) cartPanel.classList.add('hidden');
          checkoutForm.reset();
          localStorage.removeItem(STORAGE_KEY);
        },
        onClose: function(){ alert('Payment cancelled'); }
      });
      handler.openIframe();
    });
  }

  /* ---------------- Join + Contact forms ---------------- */
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const resp = document.getElementById('join-response');
      if (resp) {
        resp.classList.remove('hidden');
        joinForm.reset();
        setTimeout(()=> resp.classList.add('hidden'), 3500);
      }
    });
  }
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      // Formspree will handle actual send — just give feedback
      const submitBtn = contactForm.querySelector('button');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        setTimeout(()=> { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }, 1800);
      }
    });
  }

  /* ---------------- Fade-in */
  document.querySelectorAll('.fade-in').forEach((el, i) => {
    el.style.opacity = 0;
    setTimeout(()=> { el.style.transition = 'opacity 0.8s ease-out'; el.style.opacity = 1; }, 120 + i*80);
  });

  /* ---------------- header hide on scroll (works now because header is loaded) ---------------- */
  (function headerHideOnScroll() {
    const headerEl = document.querySelector('header');
    if (!headerEl) return;
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > lastY && y > 80) {
        headerEl.style.transform = 'translateY(-100%)';
      } else {
        headerEl.style.transform = 'translateY(0)';
      }
      lastY = y <= 0 ? 0 : y;
    });
  })();

  // initial UI sync
  updateCartUI();
} // end initApp
