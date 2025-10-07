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

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("Your cart is empty");
        return;
      }

      const total = cart.reduce((s, i) => s + Number(i.price), 0);
      const email = prompt("Enter your email for Paystack demo payment:");
      if (!email) return;

      if (!window.PaystackPop) {
        alert("Paystack script not loaded. (Add Paystack inline.js to enable)");
        return;
      }

      const handler = window.PaystackPop.setup({
        key: "pk_live_8fc53d727f2efefc2e8899494197e9b04ddc945f", // Replace with your real key
        email: email,
        amount: total * 100,
        metadata: { custom_fields: [{ display_name: "Cart", value: JSON.stringify(cart) }] },
        callback: response => {
          alert("Payment complete. Reference: " + response.reference);
          cart.length = 0;
          updateCartUI();
          cartPanel?.classList.add("hidden");
        },
        onClose: () => alert("Payment cancelled.")
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
