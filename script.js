// script.js — DSY Collective Unified Interactions
document.addEventListener("DOMContentLoaded", () => {
  /* 🌼 Splash transition */
  const splash = document.getElementById("splash");
  const site = document.getElementById("site");
  if (splash && site) {
    setTimeout(() => {
      splash.classList.add("hidden");
      site.classList.remove("hidden");
    }, 1200);
  }

  /* 🛒 Cart logic (only if shop page elements exist) */
  const cart = [];
  const cartPanel = document.getElementById("cartPanel");
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartBtn = document.getElementById("cartBtn");
  const clearCart = document.getElementById("clearCart");
  const checkoutBtn = document.getElementById("checkoutBtn");

  function updateCartUI() {
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <div class="muted small">₦${item.price}</div>
        </div>
      `;
      cartItemsEl.appendChild(row);
      total += Number(item.price);
    });
    if (cartTotalEl) cartTotalEl.textContent = total.toLocaleString();
  }

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", e => {
      const card = e.target.closest(".product, .product-card");
      const name = card.dataset.name || card.querySelector("h3")?.textContent;
      const price = card.dataset.price || card.querySelector("p")?.textContent.replace("₦", "") || "0";
      cart.push({ name, price });
      updateCartUI();
      if (cartPanel) cartPanel.classList.remove("hidden");
    });
  });

  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cartPanel?.classList.toggle("hidden");
    });
  }

  if (clearCart) {
    clearCart.addEventListener("click", () => {
      cart.length = 0;
      updateCartUI();
      cartPanel?.classList.add("hidden");
    });
  }

// Checkout form submit
const checkoutForm = document.getElementById('checkout-form');
if(checkoutForm){
  checkoutForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    if(cart.length === 0){
      alert('Your cart is empty');
      return;
    }

    const emailInput = document.getElementById('customer-email');
    const email = emailInput.value.trim();
    if(!email){
      alert('Please enter your email before checkout.');
      return;
    }

    const total = Number(cart.reduce((sum, item)=> sum + Number(item.price), 0));
    const PAYSTACK_PUBLIC_KEY = 'pk_live_8fc53d727f2efefc2e8899494197e9b04ddc945f'; // Replace with your own key

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: total * 100,
      currency: "NGN",
      ref: "DSY_" + String(new Date().getTime()),
      metadata: {
        custom_fields: [
          { display_name: "Cart Details", variable_name: "cart", value: JSON.stringify(cart) }
        ]
      },
      callback: function(response){
        alert('Payment complete! Reference: ' + response.reference);
        cart.length = 0;
        updateCartUI();
        cartPanel.classList.add('hidden');
        checkoutForm.reset();
      },
      onClose: function(){
        alert('Payment cancelled.');
      }
    });

    handler.openIframe();
  });
}


  /* 💌 Join form feedback */
  const joinForm = document.getElementById("join-form");
  const joinResponse = document.getElementById("join-response");
  if (joinForm && joinResponse) {
    joinForm.addEventListener("submit", e => {
      e.preventDefault();
      joinResponse.classList.remove("hidden");
      joinForm.reset();
      setTimeout(() => joinResponse.classList.add("hidden"), 4000);
    });
  }

  /* 📬 Contact form (Formspree safe fallback) */
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", e => {
      const submitBtn = contactForm.querySelector("button");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      // Let Formspree handle submission
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }, 2000);
    });
  }

  /* 🪄 Fade-in animation */
  document.querySelectorAll(".fade-in").forEach(el => {
    el.style.opacity = 0;
    setTimeout(() => {
      el.style.transition = "opacity 0.8s ease-out";
      el.style.opacity = 1;
    }, 200);
  });
});
// --- Robust Add-to-Cart module ---
(function(){
  // simple in-memory cart
  const cart = [];

  // helper: try both ID styles
  const getEl = (idA, idB) => document.getElementById(idA) || document.getElementById(idB);

  const cartPanel = getEl('cartPanel','cart-panel');
  const cartItemsEl = getEl('cartItems','cart-items');
  const cartTotalEl = getEl('cartTotal','cart-total');
  const cartCountEl = getEl('cartCount','cart-count');
  const cartBtn = getEl('cartBtn','cart-btn');
  const clearCartBtn = getEl('clearCart','clear-cart');

  // format numbers to simple string with commas
  const fmt = n => Number(n).toLocaleString();

  function updateCartUI(){
    if(!cartItemsEl) {
      console.warn('cartItems element not found');
      return;
    }
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx)=>{
      const li = document.createElement('li');
      li.className = 'cart-item';
      // show name and price
      li.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
        <div>
          <strong>${item.name}</strong>
          <div class="muted small">₦${fmt(item.price)}</div>
        </div>
        <div>
          <button class="remove-item" data-idx="${idx}" title="Remove" style="background:transparent;border:none;color:var(--muted);cursor:pointer">✕</button>
        </div>
      </div>`;
      cartItemsEl.appendChild(li);
      total += Number(item.price);
    });

    if(cartTotalEl) cartTotalEl.textContent = fmt(total);
    if(cartCountEl) cartCountEl.textContent = String(cart.length);

    // hide panel if empty
    if(cart.length === 0 && cartPanel) cartPanel.classList.add('hidden');
  }

  // event delegation for Add to Cart (works even if buttons are created dynamically)
  document.addEventListener('click', function(e){
    const addBtn = e.target.closest('.add-to-cart');
    if(addBtn){
      e.preventDefault();
      // try to read data attributes first
      let name = addBtn.dataset.name || addBtn.getAttribute('data-name');
      let price = addBtn.dataset.price || addBtn.getAttribute('data-price');

      // fallback: find nearest product card info
      const productCard = addBtn.closest('.product-card, .product');
      if(!name && productCard){
        const h = productCard.querySelector('h3, h2, .product-name');
        name = h ? h.textContent.trim() : 'Product';
      }
      if(!price && productCard){
        const p = productCard.querySelector('p');
        // extract digits from price like "₦26,000"
        price = p ? p.textContent.replace(/[^\d]/g,'') : '0';
      }
      // final fallbacks
      name = name || 'Product';
      price = price || '0';

      // push to cart
      cart.push({ id: String(Date.now()), name: name, price: Number(price) });
      console.log('Added to cart:', name, price);
      updateCartUI();
      if(cartPanel) cartPanel.classList.remove('hidden');
      return;
    }

    // remove item button inside cart
    const removeBtn = e.target.closest('.remove-item');
    if(removeBtn){
      const idx = Number(removeBtn.dataset.idx);
      if(!Number.isNaN(idx)) {
        cart.splice(idx,1);
        updateCartUI();
      }
      return;
    }
  });

  // toggle cart panel on header button
  if(cartBtn && cartPanel){
    cartBtn.addEventListener('click', ()=> cartPanel.classList.toggle('hidden'));
  }

  // clear cart if button present
  if(clearCartBtn){
    clearCartBtn.addEventListener('click', ()=>{
      cart.length = 0;
      updateCartUI();
    });
  }

  // expose cart to window for debugging in console if needed
  window.dsyCart = cart;
  // initial UI update (in case there are items)
  updateCartUI();
})();
