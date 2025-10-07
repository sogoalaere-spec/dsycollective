// script.js - DSY Collective interactions (cart + basic Paystack checkout placeholder)
document.addEventListener('DOMContentLoaded', function(){
  // Splash -> show site after a short delay
  setTimeout(()=>{
    const splash = document.getElementById('splash');
    if(splash) splash.classList.add('hidden');
    const site = document.getElementById('site');
    if(site) site.classList.remove('hidden');
  }, 900);

  // Menu open/close
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const closeMenu = document.getElementById('closeMenu');
  if(menuBtn && sideMenu){
    menuBtn.addEventListener('click', ()=> sideMenu.classList.add('open'));
    closeMenu.addEventListener('click', ()=> sideMenu.classList.remove('open'));
    sideMenu.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> sideMenu.classList.remove('open')));
  }

  // Cart logic (client-side)
  const cart = [];
  const cartCount = document.getElementById('cartCount');
  const cartBtn = document.getElementById('cartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCart = document.getElementById('clearCart');

  function updateCartUI(){
    if(!cartItemsEl) return;
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx)=>{
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `<div><strong>${item.name}</strong> <div class="muted small">Size: ${item.size}</div></div><div>₦${item.price}</div>`;
      cartItemsEl.appendChild(el);
      total += Number(item.price);
    });
    if(cartTotalEl) cartTotalEl.textContent = total;
    if(cartCount) cartCount.textContent = cart.length;
  }

  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const card = e.target.closest('.product');
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = card.dataset.price;
      const size = card.querySelector('.size').value;
      cart.push({id,name,price,size});
      updateCartUI();
      if(cartPanel) cartPanel.classList.remove('hidden');
    });
  });

  if(cartBtn){
    cartBtn.addEventListener('click', ()=>{
      if(cartPanel) cartPanel.classList.toggle('hidden');
    });
  }
  if(clearCart){
    clearCart.addEventListener('click', ()=>{
      cart.length = 0; updateCartUI(); if(cartPanel) cartPanel.classList.add('hidden');
    });
  }

  // Checkout (Paystack inline) - PLACEHOLDER
  if(checkoutBtn){
    checkoutBtn.addEventListener('click', ()=>{
      if(cart.length === 0){ alert('Your cart is empty'); return; }
      const total = Number(cart.reduce((s,i)=> s + Number(i.price),0));
      const PAYSTACK_PUBLIC_KEY = 'pk_live_8fc53d727f2efefc2e8899494197e9b04ddc945f';
      const email = prompt('Enter customer email for payment');
      if(!email) return;
      if(!window.PaystackPop){
        alert('Paystack script not loaded. To enable payments, add Paystack script and a real public key.');
        return;
        
      }
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: total * 100,
        metadata: { custom_fields: [{ display_name: 'Cart', variable_name: 'cart', value: JSON.stringify(cart) }] },
        callback: function(response){
          alert('Payment complete. Reference: ' + response.reference + '\nThis is a demo—verify server-side.');
          cart.length = 0; updateCartUI(); if(cartPanel) cartPanel.classList.add('hidden');
        },
        onClose: function(){ alert('Payment cancelled.'); }
      });
      handler.openIframe();
    });
  }

  // Newsletter (demo)
  const newsletterForm = document.getElementById('newsletterForm');
  if(newsletterForm) newsletterForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Thanks — you\'re in the DSY Circle! (Replace this with Mailchimp/Formspree connection)');
    e.target.reset();
  });

  // Contact form (demo)
  const contactForm = document.getElementById('contactForm');
  if(contactForm) contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Message sent! (Demo handler)');
    e.target.reset();
  });
});

// 🧠 Splash fade-out animation
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const site = document.getElementById("site");

  setTimeout(() => {
    splash.classList.add("fade-out");
    site.classList.remove("hidden");
  }, 1800); // 1.8s delay before fade
});

