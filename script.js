/* DSY Collective — Unified Script (header, menu, cart, splash, fade) */
document.addEventListener("DOMContentLoaded", async () => {
  // Splash -> show site
  const splash = document.getElementById("splash");
  const site = document.getElementById("site");
  if (splash && site) {
    setTimeout(() => {
      splash.classList.add("hidden");
      site.classList.remove("hidden");
    }, 900);
  }

  // Load global header (try fetch header.html, fallback to inline)
  const headerContainer = document.getElementById("global-header");
  if (headerContainer) {
    try {
      const res = await fetch("header.html");
      if (!res.ok) throw new Error("fetch failed");
      headerContainer.innerHTML = await res.text();
    } catch (err) {
      // fallback header (minimal)
      headerContainer.innerHTML = `
        <header>
          <div class="header-container">
            <h1 class="logo-text"><a href="index.html">DSY COLLECTIVE</a></h1>
            <button id="menuToggle" class="menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>
          </div>
          <nav id="menuPanel" class="menu-panel">
            <button id="closeMenu" class="close-btn">&times;</button>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="shop.html">Shop</a></li>
              <li><a href="lookbook.html">Lookbook</a></li>
              <li><a href="about.html">About</a></li>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="join.html">Join</a></li>
            </ul>
          </nav>
        </header>
      `;
    }

    // menu logic
    const menuToggle = document.getElementById("menuToggle");
    const menuPanel = document.getElementById("menuPanel");
    const closeMenu = document.getElementById("closeMenu");
    menuToggle?.addEventListener("click", () => menuPanel?.classList.toggle("active"));
    closeMenu?.addEventListener("click", () => menuPanel?.classList.remove("active"));
    // close menu when a link clicked
    menuPanel?.querySelectorAll("a")?.forEach(a => a.addEventListener("click", () => menuPanel.classList.remove("active")));
  }

  // Smooth header hide on scroll
  const headerEl = document.querySelector("header");
  if (headerEl) {
    let lastScrollTop = 0;
    let ticking = false;
    const delta = 10;
    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop + delta) headerEl.style.transform = "translateY(-100%)";
      else if (st < lastScrollTop - delta) headerEl.style.transform = "translateY(0)";
      lastScrollTop = Math.max(st, 0);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    });
    headerEl.style.willChange = "transform";
    headerEl.style.transition = "transform 0.35s ease";
  }

  // Fade-in using IntersectionObserver
  const faders = document.querySelectorAll(".fade-in");
  if (faders.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) en.target.classList.add("visible");
      });
    }, { threshold: 0.15 });
    faders.forEach(el => obs.observe(el));
  }

  /* ===========================
     CART (works across pages)
     =========================== */
  const CART_KEY = "dsyCart_v1";
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

  const cartPanel = document.getElementById("cart-panel");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartCountEl = document.getElementById("cartCount");
  const cartBtn = document.getElementById("cartBtn");

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }
  function updateCartCount() {
    if (cartCountEl) cartCountEl.textContent = String(cart.length);
  }
  function renderCartPanel() {
    if (!cartPanel) return;
    const ul = cartPanel.querySelector("ul#cart-items") || cartItemsEl;
    if (ul) {
      ul.innerHTML = cart.map((it, idx) => `
        <li data-idx="${idx}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
            <div><strong>${it.name}</strong><div class="muted small">₦${Number(it.price).toLocaleString()}</div></div>
            <div><button class="remove-item" data-idx="${idx}" style="background:none;border:none;color:var(--muted);cursor:pointer">✕</button></div>
          </div>
        </li>
      `).join("");
    }
    const total = cart.reduce((s,i)=> s + Number(i.price || 0), 0);
    if (cartTotalEl) cartTotalEl.textContent = total.toLocaleString();
    // ensure checkout button exists
    if (cartPanel && !cartPanel.querySelector("#checkout-btn")) {
      const btn = document.createElement("button");
      btn.id = "checkout-btn";
      btn.textContent = "Proceed to Checkout";
      btn.style.marginTop = "10px";
      cartPanel.appendChild(btn);
    }
    if (cart.length === 0) cartPanel.classList.add("hidden");
  }

  // initial sync
  updateCartCount();
  renderCartPanel();

  // delegate add-to-cart
  document.addEventListener("click", (e) => {
    const add = e.target.closest(".add-to-cart");
    if (add) {
      const card = add.closest(".product-card, .product");
      const name = add.dataset.name || card?.dataset?.name || card?.querySelector("h3")?.textContent?.trim() || "Product";
      const priceRaw = add.dataset.price || card?.dataset?.price || card?.querySelector("p")?.textContent || "0";
      const price = Number(String(priceRaw).replace(/[^\d]/g,"")) || 0;
      cart.push({ id: Date.now(), name, price });
      saveCart();
      renderCartPanel();
      if (cartPanel) cartPanel.classList.remove("hidden");
      // small visual feedback
      add.animate([{ transform: "scale(1.02)" }, { transform: "scale(1)" }], { duration: 180 });
      return;
    }

    // remove item
    const rem = e.target.closest(".remove-item");
    if (rem) {
      const idx = Number(rem.dataset.idx);
      if (!Number.isNaN(idx)) {
        cart.splice(idx,1);
        saveCart();
        renderCartPanel();
      }
      return;
    }

    // checkout from panel
    if (e.target && e.target.id === "checkout-btn") {
      // persist and open checkout page
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.open("checkout.html", "_blank");
      return;
    }
  });

  // cart icon click toggles panel
  cartBtn?.addEventListener("click", () => {
    if (cartPanel) {
      cartPanel.classList.toggle("hidden");
      renderCartPanel();
    }
  });

  // close-cart button inside panel (if present)
  const closeCartBtn = document.getElementById("close-cart");
  closeCartBtn?.addEventListener("click", () => cartPanel?.classList.add("hidden"));

  /* ===========================
     CHECKOUT PAGE HANDLER
     (if user is on checkout.html)
     =========================== */
  if (location.pathname.endsWith("checkout.html") || location.href.includes("checkout.html")) {
    // render checkout summary
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    const itemsContainer = document.getElementById("checkout-items");
    const totalEl = document.getElementById("checkout-total");
    const checkoutForm = document.getElementById("checkout-form");
    if (itemsContainer) {
      itemsContainer.innerHTML = stored.map(it => `<li>${it.name} <span>₦${Number(it.price).toLocaleString()}</span></li>`).join("");
    }
    if (totalEl) totalEl.textContent = "₦" + (stored.reduce((s,i)=> s + Number(i.price),0)).toLocaleString();

    // Paystack form handling (inline)
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const email = checkoutForm.querySelector('input[name="email"]')?.value;
        if (!email) { alert("Enter email"); return; }
        const total = stored.reduce((s,i)=> s + Number(i.price), 0);
        const PAYSTACK_PUBLIC_KEY = "pk_live_8fc53d727f2efefc2e8899494197e9b04ddc945f"; // replace with yours if needed
        if (!window.PaystackPop) { alert("Paystack script not loaded."); return; }
        const handler = PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: email,
          amount: total * 100,
          currency: "NGN",
          metadata: { custom_fields: [{ display_name: "Cart", variable_name: "cart", value: JSON.stringify(stored) }] },
          callback: function(response) {
            alert("Payment complete! Reference: " + response.reference);
            localStorage.removeItem(CART_KEY);
            window.location.href = "index.html";
          },
          onClose: function() { alert("Payment cancelled"); }
        });
        handler.openIframe();
      });
    }
  }

});