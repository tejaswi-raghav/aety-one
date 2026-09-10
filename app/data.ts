export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  color: string;
  price: number;
  image: string;
  position: string;
  description: string;
  details: string[];
  material: string;
  fit: string;
};

export const products: Product[] = [
  { id: '001', slug: 'distorted-football-jersey', name: 'Æ1 DISTORTED FOOTBALL JERSEY', category: 'TOPS', color: 'BLACK / BONE', price: 295, image: '/assets/campaign-skater.png', position: '50% 30%', description: 'An oversized terrace jersey distorted through an ÆTY ONE lens.', details: ['ENGINEERED MESH CONSTRUCTION', 'CONTRAST PIPING', 'Æ1 CREST / LARGE BACK NUMBER'], material: '100% RECYCLED POLYESTER MESH', fit: 'EXTREME OVERSIZED / DROP SHOULDER' },
  { id: '002', slug: 'system-longsleeve', name: 'SYSTEM LONGSLEEVE', category: 'TOPS', color: 'FADED BLACK', price: 220, image: '/assets/hero-night.png', position: '24% 38%', description: 'Washed cotton with distressed system graphics and extended sleeves.', details: ['DISTRESSED SCREEN PRINT', 'RAW-FEEL GRAPHICS', 'EXTENDED CUFF'], material: '240GSM WASHED COTTON', fit: 'OVERSIZED / LONG SLEEVE' },
  { id: '003', slug: 'terrace-track-pant', name: 'TERRACE TRACK PANT', category: 'BOTTOMS', color: 'BLACK / GREY', price: 320, image: '/assets/hero-night.png', position: '74% 65%', description: 'A wide-leg track pant built for movement between concrete and terrace.', details: ['CONTRAST PIPING', 'EMBROIDERED Æ MARK', 'ADJUSTABLE HEM'], material: 'CRUSHED TECHNICAL NYLON', fit: 'RELAXED / WIDE LEG' },
  { id: '004', slug: 'a1-tech-shell', name: 'Æ1 TECH SHELL', category: 'OUTERWEAR', color: 'CHARCOAL', price: 520, image: '/assets/product-archive.png', position: '22% 48%', description: 'A high-collar shell cut in articulated technical panels.', details: ['HIDDEN POCKET SYSTEM', 'REFLECTIVE BRANDING', 'WEATHER-RESISTANT FINISH'], material: '3-LAYER TECHNICAL NYLON', fit: 'OVERSIZED / ADJUSTABLE WAIST' },
  { id: '005', slug: 'aety-one-panel-cap', name: 'ÆTY ONE PANEL CAP', category: 'ACCESSORIES', color: 'WASHED BLACK', price: 140, image: '/assets/product-archive.png', position: '91% 12%', description: 'Low-profile panel cap with a worn-in finish and metal hardware.', details: ['DISTRESSED EDGE', 'EMBROIDERED Æ MARK', 'METAL ADJUSTER'], material: 'WASHED COTTON TWILL', fit: 'ADJUSTABLE' },
  { id: '006', slug: 'a1-crossbody-system-bag', name: 'Æ1 CROSSBODY SYSTEM BAG', category: 'ACCESSORIES', color: 'BLACK', price: 190, image: '/assets/product-archive.png', position: '68% 42%', description: 'Compact carriage system for the objects that stay on-body.', details: ['MULTIPLE UTILITY COMPARTMENTS', 'METAL HARDWARE', 'REFLECTIVE DETAIL'], material: 'WATER-RESISTANT RIPSTOP', fit: 'ADJUSTABLE STRAP' },
  { id: '007', slug: 'a1-football-scarf', name: 'Æ1 FOOTBALL SCARF', category: 'ACCESSORIES', color: 'BLACK / BONE', price: 120, image: '/assets/product-archive.png', position: '87% 78%', description: 'Jacquard terrace scarf carrying the first system statement.', details: ['DOUBLE-SIDED JACQUARD', 'WOVEN SYSTEM GRAPHIC', 'FRINGED EDGE'], material: 'ACRYLIC JACQUARD KNIT', fit: 'ONE SIZE' },
];

export const formatPrice = (price: number) => `AED ${price}`;
