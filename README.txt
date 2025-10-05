DSY Collective - Starter Site (Dark Luxury)
===========================================

What's included:
- index.html (dark luxury one-page site with separate sections for Home, Shop, Lookbook, About, Journal, Join, Contact)
- styles.css (dark theme with grunge texture)
- script.js (client-side cart, demo Paystack checkout template)
- assets/logo.png (your uploaded logo)
- assets/grunge.png (subtle texture)
- assets/prod-*.jpg (product placeholders)

Important notes:
1) This site is static. The cart is client-side and demo-only. To accept real payments on-site you can use Paystack (inline).
   - In script.js find PAYSTACK_PUBLIC_KEY and replace 'pk_test_REPLACE_WITH_YOURS' with your Paystack public key.
   - Also add the Paystack script to index.html's <head> like this:
     <script src="https://js.paystack.co/v1/inline.js"></script>
   - For production, create a server endpoint to verify transactions server-side (Paystack sends a reference).
   - Paystack works well for Nigeria (NGN). For international cards, Stripe is an alternative (but needs server-side handling).

2) To change copy or images:
   - Edit index.html text directly in GitHub or locally.
   - Replace images in assets/ (keep filenames or update paths).

3) To publish updates:
   - Commit changes to your GitHub repo branch used by Pages (usually 'main'). GitHub Pages redeploys automatically.

4) To deploy to Netlify, Vercel, or another host:
   - The site is a static site; just upload the folder or connect a Git repo.

5) Security & HTTPS:
   - If using a custom domain with GitHub Pages, set DNS A records to GitHub's IPs and enable 'Enforce HTTPS' in Pages settings.

6) Need help integrating Paystack or customizing visuals?
   - Tell me your Paystack public key (ONLY the public key; never share secret keys).
   - I can add the script tag, implement inline flow, and provide server verification code examples if you use Netlify Functions, Vercel Serverless, or a simple PHP endpoint.

Enjoy — and tell me any tweaks you want (fonts, spacing, or full cart + server setup).

Made for: Daizy / DSY Collective
