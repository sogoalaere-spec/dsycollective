// script.js — DSY Collective Unified Interactions (clean build)
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

  /* 🛒 CART SYSTEM */
  const cart = [];
  const cartPanel = document.getElementById("cart-panel");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartCountEl = document.getElementById("cartCount");
  const cartBtn = document.getElementById("cartBtn");
  const closeCart = document.getElementById("close-cart");
  const checkoutForm = document.getElementById("checkout-form");

  function updateCartUI() {
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div><strong>${item.name}</strong><br><span class="muted small">₦${Number(item.price).toLocaleString()}</span></div>
          <button data-index="${index}" class="remove-item" style="background:none;border:none;color:#bdbdbd;cursor:pointer;">✕</button>
        </div>
      `;
      cartItemsEl.appendChild(li);
      total += Number(item.price);
    });
    cartTotalEl.textContent = total.toLocaleString();
    if (cartCountEl) cartCountEl.textContent = cart.length;
  }

  // Add to Cart Buttons
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", e => {
      const card = e.target.closest(".product-card");
      const name = card.dataset.name || card.querySelector("h3")?.textContent;
      const price = card.dataset.price || card.querySelector("p")?.textContent.replace(/[₦,]/g, "") || "0";
      cart.push({ name, price });
      updateCartUI();
      cartPanel.classList.remove("hidden");
    });
  });

  // Remove item from cart
  document.addEventListener("click", e => {
    if (e.target.classList.contains("remove-item")) {
      const index = e.target.dataset.index;
      cart.splice(index, 1);
      updateCartUI();
    }
  });

  // Toggle Cart Panel
if (cartBtn) {
  cartBtn.addEventListener('click', () => {
    // save cart data for checkout page
    localStorage.setItem('dsyCart', JSON.stringify(cart));
    // open checkout in new tab
    window.open('checkout.html', '_blank');
  });
}

  // Close Cart
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartPanel.classList.add("hidden");
    });
  }

  // 🪙 Paystack Checkout
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", e => {
      e.preventDefault();

      if (cart.length === 0) {
        alert("Your cart is empty");
        return;
      }

      const email = document.getElementById("customer-email").value.trim();
      if (!email) {
        alert("Please enter your email before checkout.");
        return;
      }

      const total = Number(cart.reduce((sum, i) => sum + Number(i.price), 0));
      const PAYSTACK_PUBLIC_KEY = "pk_live_8fc53d727f2efefc2e8899494197e9b04ddc945f"; // your real key

      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: total * 100,
        currency: "NGN",
        ref: "DSY_" + String(new Date().getTime()),
        metadata: {
          custom_fields: [
            {
              display_name: "Cart Details",
              variable_name: "cart",
              value: JSON.stringify(cart),
            },
          ],
        },
        callback: function (response) {
          alert("Payment complete! Reference: " + response.reference);
          cart.length = 0;
          updateCartUI();
          cartPanel.classList.add("hidden");
          checkoutForm.reset();
        },
        onClose: function () {
          alert("Payment cancelled.");
        },
      });

      handler.openIframe();
    });
  }

  /* 💌 Join Form */
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

  /* 📬 Contact Form */
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", e => {
      const submitBtn = contactForm.querySelector("button");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }, 2000);
    });
  }

  /* ✨ Fade-in animation */
  document.querySelectorAll(".fade-in").forEach(el => {
    el.style.opacity = 0;
    setTimeout(() => {
      el.style.transition = "opacity 0.8s ease-out";
      el.style.opacity = 1;
    }, 200);
  });
});

// ✅ Load global header
document.addEventListener("DOMContentLoaded", async () => {
  const headerContainer = document.getElementById("global-header");

  if (headerContainer) {
    try {
      const response = await fetch("header.html");
      const html = await response.text();
      headerContainer.innerHTML = html;

      // Now that header is loaded, enable the menu logic
      const menuToggle = document.getElementById("menuToggle");
      const menuPanel = document.getElementById("menuPanel");
      const closeMenu = document.getElementById("closeMenu");

      if (menuToggle && menuPanel) {
        menuToggle.addEventListener("click", () => {
          menuPanel.classList.toggle("active");
        });
      }

      if (closeMenu) {
        closeMenu.addEventListener("click", () => {
          menuPanel.classList.remove("active");
        });
      }
    } catch (err) {
      console.error("Header failed to load:", err);
    }
  }
});
