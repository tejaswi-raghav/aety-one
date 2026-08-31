# ÆTY ONE — Architecture Notes

This repo is a **frontend MVP**: a fully interactive storefront UI with no
real backend behind it yet. Everything below is honest about what's real
versus what's mocked, so nobody mistakes the demo for a finished store.

| Area | Current state | Real-world path |
|---|---|---|
| Product catalog | 6 hardcoded products in `src/App.jsx` | Move to a headless commerce backend — Shopify Storefront API is the fastest path if you want hosted checkout/inventory/payments without building your own; a custom Postgres + Stripe setup gives more control if you want it fully self-owned |
| Volumetric product view | CSS-layered parallax (3 depth planes) simulating tilt/orbit — no real 3D asset | For a real volumetric product viewer, either (a) real product photography composited into foreground/midground/background layers matching this same 3-plane structure, or (b) true 3D — a turntable photo set turned into a `<model-viewer>` GLB, or a Gaussian-splat capture rendered with [Spark](https://sparkjs.dev) (Three.js-native 3DGS renderer) |
| Cart | Local component state (a counter) | Real cart needs persistence (localStorage at minimum, server-side for multi-device) and ties into whatever checkout provider you choose |
| Checkout / payment | Not implemented — "Add to bag" only increments a counter | Stripe Checkout or Shopify's hosted checkout are the two lowest-effort real integrations |
| Email capture | Form exists, does not submit anywhere | Wire to an ESP (Klaviyo, Resend, or a simple serverless function to your own list) |
| Sizing / inventory | Static size list, no stock levels | Needs a real inventory table if you want accurate sold-out states per size/colorway |

## Suggested build order

1. **Product data + real photography.** Replace the `PRODUCTS` array and the
   `DEPTH` tone gradients with real shot product images. Keep the 3-plane
   (bg/mid/fg) structure if you want to preserve the parallax/orbit feature —
   just swap flat color gradients for actual photo layers or a real 3D asset.
2. **Commerce backend.** Shopify Storefront API (fastest to real checkout) or
   a custom Postgres + Stripe stack (more control, more work).
3. **Cart + checkout.** Wire the existing "Add to bag" button and drawer to
   real cart state and a real checkout redirect.
4. **Email capture.** Connect the notify form to an actual list provider.
5. **Inventory-aware sizing.** Disable sizes server-side instead of the
   current hardcoded `disabled={s==="XS"}` placeholder.

## Non-goals for this MVP

- No admin/CMS for managing products — the catalog is a hardcoded array by
  design, meant to be replaced wholesale once you pick a backend.
- No user accounts or order history.
