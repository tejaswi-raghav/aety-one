# ÆTY ONE

**Drop 001. Six hoodies, cut once, dyed and printed in small batches. No
restock after sellout.**

ÆTY ONE is the apparel arm of ÆTY. This repo is the interactive frontend
MVP: a real six-piece catalog, a working cart, wishlist, search/sort, and a
volumetric product viewer built from actual product photography.

## Design reference

The console/boot-sequence motif on the landing page is a deliberate nod to
[thegithubshop.com](https://thegithubshop.com), translated from dev-humor
into dark-luxury material language: clay, umber, moss, and bone instead of
neon, a serif display face (Fraunces) instead of mono-everything, and the
terminal device reused structurally (a `materials.log` spec block, a boot
sequence in the hero) rather than as a one-off joke. The whole site sits
over a faint, fixed starfield-and-nebula backdrop — cosmic depth behind the
material rather than a competing visual layer.

## Features

- **Real catalog, six pieces**: Ronin, Senbazuru, Transit, Flight Path,
  Marble Tide, and Orbit — actual product photography in `public/products/`.
- **Volumetric product cards**: every product image tilts in 3D with
  cursor/touch movement (pointer-parallax + a moving color sheen keyed to
  each print's dominant tone), plus a full **drag-to-orbit viewer** on
  click-to-expand. This is a lightweight CSS/JS technique applied to real
  photography — see `docs/ARCHITECTURE.md` for the honest version vs. a true
  multi-angle 3D pipeline.
- **Cart**: add to bag, adjust quantity, remove items, running subtotal, a
  slide-in bag drawer — all in local component state.
- **Wishlist**: heart any product, filter the grid to wishlisted items only.
- **Search & sort**: filter the catalog by name, sort by price.
- **PDP drawer**: size selection, accordion details, and a "you may also
  like" row of related pieces.
- **Low-stock badges**: urgency tags on select pieces.
- **Drop counter**: a running "days since Drop 001 sealed" readout instead
  of a countdown-timer sales gimmick, paired with a featured volumetric
  preview (the Orbit hoodie).
- **Minimal copy throughout**: spec sheets and short labels over marketing
  paragraphs, on purpose.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for what's real versus
mocked — checkout, payment, and inventory are not wired to a real backend.

## Getting started

```bash
npm install
npm run dev
```

Runs the storefront at `http://localhost:5173`. No backend required — the
catalog is a hardcoded array, and cart/wishlist/search all run in local
state.

## Project structure

```
.
├── public/
│   └── products/        # real product photography (6 hoodies)
├── src/
│   ├── main.jsx           # React entry point
│   └── App.jsx             # The entire storefront (single component)
├── docs/
│   └── ARCHITECTURE.md    # What's real vs. mocked, suggested build order
└── index.html
```

## License

MIT — see [`LICENSE`](LICENSE).
