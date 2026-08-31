# ÆTY ONE

**Drop 001. Six hoodies, cut once, dyed in earth tones. No restock after
sellout.**

ÆTY ONE is the apparel arm of [ÆTY](https://github.com) — a small, fixed
hoodie collection presented as a single fixed-run drop rather than an
always-on catalog. This repo is the interactive frontend MVP.

## Design reference

The console/boot-sequence motif on the landing page is a deliberate nod to
[thegithubshop.com](https://thegithubshop.com), translated from dev-humor
into dark-luxury material language: clay, umber, moss, and bone instead of
neon, a serif display face (Fraunces) instead of mono-everything, and the
terminal device reused structurally (a `materials.log` spec block, a boot
sequence in the hero) rather than as a one-off joke.

## Features

- **Volumetric product cards**: every product renders as three layered depth
  planes that tilt with cursor/touch movement (a lightweight CSS stand-in for
  a real Gaussian-splat or multi-layer photo composite), plus a full **drag-
  to-orbit viewer** on click-to-expand.
- **Boot-console hero**: a typed init sequence resolves into the headline —
  the same structural device as GitHub's shop, in a different register.
- **PDP drawer**: colorway swatches, size selection, accordion product
  details — slides in from the right without leaving the page.
- **Drop counter**: a running "days since Drop 001 sealed" readout instead of
  a countdown-timer sales gimmick.
- **Minimal copy throughout**: spec sheets and short labels over marketing
  paragraphs, on purpose.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for an honest breakdown of
what's wired up versus what's still a placeholder (catalog data, cart,
checkout, email capture are all currently mocked/local-only).

## Getting started

```bash
npm install
npm run dev
```

Runs the storefront at `http://localhost:5173`. No backend required to
explore the UI — the catalog, cart, and email form are all local/mocked.

## Project structure

```
.
├── src/
│   ├── main.jsx   # React entry point
│   └── App.jsx     # The entire storefront (single component)
├── docs/
│   └── ARCHITECTURE.md  # What's real vs. mocked, suggested build order
└── index.html
```

## License

MIT — see [`LICENSE`](LICENSE).
