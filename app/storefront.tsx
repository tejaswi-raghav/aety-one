'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Menu, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatPrice, products, type Product } from './data';
import { ChangingRoom } from './changing-room';

type CartItem = { slug: string; size: string; quantity: number };
type View = 'home' | 'drop' | 'archive' | 'cart' | 'product' | 'try-on';

export function Storefront({ view, slug }: { view: View; slug?: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('aety-cart') || '[]')); } catch { setCart([]); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('aety-cart', JSON.stringify(cart)); }, [cart, ready]);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const addToCart = (product: Product, size: string) => {
    setCart((current) => {
      const match = current.find((item) => item.slug === product.slug && item.size === size);
      return match ? current.map((item) => item === match ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { slug: product.slug, size, quantity: 1 }];
    });
    setCartOpen(true);
  };
  useEffect(() => {
    type ToolInput = { slug?: unknown; size?: unknown; quantity?: unknown };
    type ModelContext = { registerTool: (tool: object, options?: { signal?: AbortSignal }) => void | Promise<void> };
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = context.registerTool({
      name: 'add_drop_01_object_to_cart',
      title: 'Add DROP 01 object to cart',
      description: 'Add an ÆTY ONE DROP 01 product in a selected size and quantity to the same local cart used by the storefront.',
      inputSchema: {
        type: 'object',
        properties: { slug: { type: 'string', enum: products.map((p) => p.slug) }, size: { type: 'string', enum: ['XS','S','M','L','XL'] }, quantity: { type: 'integer', minimum: 1, maximum: 10 } },
        required: ['slug', 'size'], additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: ToolInput) {
        const product = products.find((p) => p.slug === input?.slug);
        const size = typeof input?.size === 'string' && ['XS','S','M','L','XL'].includes(input.size) ? input.size : null;
        const quantity = input?.quantity === undefined ? 1 : input.quantity;
        if (!product || !size || !Number.isInteger(quantity) || Number(quantity) < 1 || Number(quantity) > 10) throw new Error('Invalid product, size, or quantity.');
        setCart((current) => {
          const match = current.find((item) => item.slug === product.slug && item.size === size);
          return match ? current.map((item) => item === match ? { ...item, quantity: item.quantity + Number(quantity) } : item) : [...current, { slug: product.slug, size, quantity: Number(quantity) }];
        });
        setCartOpen(true);
        return { status: 'added', object: product.id, slug: product.slug, size, quantity };
      },
    }, { signal: lifecycle.signal });
    void Promise.resolve(register).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
  const update = (index: number, delta: number) => setCart((items) => items.flatMap((item, i) => i !== index ? [item] : item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : []));
  const remove = (index: number) => setCart((items) => items.filter((_, i) => i !== index));

  return (
    <div className="site-shell">
      <Navigation count={count} openCart={() => setCartOpen(true)} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {view === 'home' && <Home />}
      {view === 'drop' && <DropPage />}
      {view === 'archive' && <ArchivePage />}
      {view === 'cart' && <CartPage cart={cart} update={update} remove={remove} />}
      {view === 'product' && <ProductPage slug={slug} addToCart={addToCart} />}
      {view === 'try-on' && <ChangingRoom addToCart={addToCart} />}
      <Footer />
      <CartDrawer open={cartOpen} setOpen={setCartOpen} cart={cart} update={update} remove={remove} />
    </div>
  );
}

function Navigation({ count, openCart, menuOpen, setMenuOpen }: { count: number; openCart: () => void; menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  return <>
    <header className="nav">
      <a className="wordmark" href="/">ÆTY ONE®</a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="/drop-01">SHOP</a><a href="/changing-room">TRY ON</a><a href="/archive">ARCHIVE</a><a href="/#manifesto">MANIFESTO</a>
      </nav>
      <button className="cart-link" onClick={openCart}>CART ({count})</button>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
    </header>
    {menuOpen && <div className="mobile-menu"><a href="/drop-01">DROP 01</a><a href="/changing-room">TRY ON</a><a href="/archive">ARCHIVE</a><a href="/#manifesto">MANIFESTO</a><button onClick={openCart}>CART ({count})</button><small>SYSTEM ACTIVE / 2026</small></div>}
  </>;
}

function Home() {
  return <main>
    <section className="hero">
      <img src="/assets/hero-night.png" alt="Two models in oversized monochrome streetwear beneath a concrete city overpass at night" />
      <div className="hero-shade" />
      <div className="hero-meta hero-meta-left"><span>DROP_01</span><span>2026</span><span>Æ1/001</span></div>
      <div className="hero-meta hero-meta-right"><i /> ONLINE</div>
      <div className="hero-copy"><p>DROP 01</p><h1>ÆTY ONE</h1><div className="hero-bottom"><h2>NO PERMANENT FORM.</h2><a className="enter-link" href="/drop-01">ENTER DROP <ArrowRight /></a></div></div>
      <a className="scroll" href="#drop">SCROLL <ArrowDown /></a>
    </section>
    <Ticker />
    <section id="drop" className="drop-intro section-pad">
      <div><p className="eyebrow">DROP_01 / 2026/01</p><h2>INITIAL<br/>CONDITIONS</h2></div>
      <div className="drop-note"><p>THE FIRST ÆTY ONE CAPSULE.</p><p>SEVEN OBJECTS BUILT BETWEEN TERRACE, STREET AND NIGHT.</p><a href="/drop-01">VIEW COMPLETE DROP <ArrowRight /></a></div>
    </section>
    <ProductGrid items={products.slice(0, 4)} />
    <Campaign />
    <Manifesto />
  </main>;
}

function DropPage() {
  return <main className="inner-page">
    <section className="drop-mast section-pad"><div className="drop-index">DROP<br/><b>01</b></div><div><p className="eyebrow">ÆTY ONE / 2026</p><h1>INITIAL CONDITIONS</h1><p>OBJECTS 001—007<br/>STATUS: AVAILABLE</p></div></section>
    <Ticker />
    <ProductGrid items={products.slice(0, 3)} />
    <Campaign />
    <section className="category-break"><span>OUTERWEAR / ACCESSORIES</span><span>OBJECTS 004—007</span></section>
    <ProductGrid items={products.slice(3)} />
  </main>;
}

function ProductGrid({ items }: { items: Product[] }) {
  return <section className="product-grid section-pad">
    {items.map((product) => <article className={`product-card product-card-${product.id}`} key={product.id}>
      <a className="product-image" href={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
        <img src={product.image} style={{ objectPosition: product.position }} alt={product.name} />
        <span className="image-code">OBJECT_{product.id}</span><span className="view-object">VIEW OBJECT <ArrowRight /></span>
      </a>
      <div className="product-meta"><span>{product.id} / DROP_01</span><span>{product.category}</span></div>
      <h3><a href={`/product/${product.slug}`}>{product.name}</a></h3>
      <div className="product-foot"><span>{product.color}</span><b>{formatPrice(product.price)}</b></div>
    </article>)}
  </section>;
}

function Campaign() {
  return <section className="campaign">
    <img src="/assets/campaign-skater.png" alt="Skater in an oversized mesh football jersey on stadium steps at night" />
    <div className="campaign-top"><span>ÆTY ONE / 2026</span><span>01 / UNKNOWN TERRITORY</span></div>
    <div className="campaign-copy"><h2>INITIAL<br/>CONDITIONS</h2><p>BUILT FOR MOVEMENT.<br/>NOT APPROVAL.</p></div>
  </section>;
}

function Manifesto() {
  return <section id="manifesto" className="manifesto section-pad"><p className="eyebrow">MANIFESTO / SYSTEM_001</p><h2>ÆTY ONE EXISTS<br/>BETWEEN UNIFORMS.</h2><div className="manifesto-grid"><p>FOOTBALL.<br/>SKATE.<br/>STREET.<br/>NIGHT.</p><p>WE TAKE FAMILIAR FORMS<br/>AND DISTORT THEM.<br/><br/>NO SEASONS.<br/>NO PERMANENT FORM.</p><p className="manifesto-mark">ÆTY ONE®<br/><span>2026</span></p></div></section>;
}

function ArchivePage() {
  return <main className="inner-page archive-page section-pad">
    <div className="archive-head"><p className="eyebrow">ARCHIVE INDEX / SYSTEM ACTIVE</p><h1>ARCHIVE</h1><span>001—∞</span></div>
    <a className="archive-entry active" href="/drop-01"><span>DROP 01</span><span>INITIAL CONDITIONS</span><span>2026</span><span>STATUS: ACTIVE</span><ArrowRight /></a>
    <div className="archive-entry locked"><span>DROP 02</span><span>████████████</span><span>—</span><span>STATUS: UNKNOWN</span><span>LOCKED</span></div>
    <div className="archive-entry locked"><span>DROP 03</span><span>████████████</span><span>—</span><span>STATUS: UNKNOWN</span><span>LOCKED</span></div>
    <div className="archive-signal"><i /> ARCHIVE RECEIVER ACTIVE / NO FUTURE SIGNAL</div>
  </main>;
}

function ProductPage({ slug, addToCart }: { slug?: string; addToCart: (p: Product, s: string) => void }) {
  const product = products.find((p) => p.slug === slug) || products[0];
  const [size, setSize] = useState('M');
  const next = products[(products.indexOf(product) + 1) % products.length];
  return <main className="inner-page">
    <section className="product-detail">
      <div className="gallery">
        {['FRONT', 'BACK', 'DETAIL', 'ON-BODY', 'FABRIC'].map((label, index) => <figure key={label} className={`gallery-shot shot-${index}`}><img src={index % 2 ? '/assets/hero-night.png' : product.image} style={{ objectPosition: product.position }} alt={`${product.name} — ${label.toLowerCase()} view`} /><figcaption>{String(index + 1).padStart(2, '0')} / {label}</figcaption></figure>)}
      </div>
      <aside className="buy-panel">
        <p className="eyebrow">OBJECT_{product.id} / DROP_01</p><h1>{product.name}</h1><p className="buy-price">{formatPrice(product.price)}</p>
        <dl><div><dt>COLOR</dt><dd>{product.color}</dd></div><div><dt>STATUS</dt><dd>AVAILABLE</dd></div></dl>
        <fieldset><legend>SELECT SIZE</legend><div className="sizes">{['XS','S','M','L','XL'].map((s) => <button className={s === size ? 'selected' : ''} key={s} onClick={() => setSize(s)}>{s}</button>)}</div></fieldset>
        <button className="add-button" onClick={() => addToCart(product, size)}>ADD TO CART <span>{formatPrice(product.price)}</span></button>
        {Number(product.id) <= 4 && <a className="try-on-link" href={`/changing-room?product=${product.slug}`}>OPEN DIGITAL CHANGING ROOM <ArrowRight/></a>}
        <button className="size-guide">SIZE GUIDE ↗</button>
        <div className="specs"><p>{product.description}</p><details open><summary>DETAILS</summary><ul>{product.details.map((d) => <li key={d}>{d}</li>)}</ul></details><details><summary>MATERIAL</summary><p>{product.material}</p></details><details><summary>FIT</summary><p>{product.fit}</p></details><details><summary>CARE / SHIPPING</summary><p>COLD WASH. DO NOT TUMBLE DRY. UAE DELIVERY 2—4 WORKING DAYS.</p></details></div>
      </aside>
    </section>
    <a className="next-object section-pad" href={`/product/${next.slug}`}><span>NEXT OBJECT / {next.id}</span><strong>{next.name}</strong><ArrowRight /></a>
  </main>;
}

function CartPage({ cart, update, remove }: { cart: CartItem[]; update: (i:number,d:number)=>void; remove:(i:number)=>void }) {
  return <main className="inner-page cart-page section-pad"><p className="eyebrow">LOCAL SYSTEM / BAG</p><h1>CART ({cart.reduce((s,i)=>s+i.quantity,0)})</h1><CartContents cart={cart} update={update} remove={remove} /></main>;
}

function CartContents({ cart, update, remove, close }: { cart: CartItem[]; update: (i:number,d:number)=>void; remove:(i:number)=>void; close?:()=>void }) {
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (products.find((p) => p.slug === item.slug)?.price || 0) * item.quantity, 0), [cart]);
  if (!cart.length) return <div className="empty-cart"><ShoppingBag/><p>NO OBJECTS SELECTED.</p><a href="/drop-01" onClick={close}>ENTER DROP <ArrowRight/></a></div>;
  return <div className="cart-content"><div className="cart-items">{cart.map((item,index) => { const product = products.find((p)=>p.slug===item.slug)!; return <div className="cart-item" key={`${item.slug}-${item.size}`}><img src={product.image} style={{objectPosition:product.position}} alt=""/><div><span>OBJECT_{product.id}</span><h3>{product.name}</h3><p>{product.color} / SIZE {item.size}</p><div className="quantity"><button aria-label="Decrease quantity" onClick={()=>update(index,-1)}><Minus/></button><b>{item.quantity}</b><button aria-label="Increase quantity" onClick={()=>update(index,1)}><Plus/></button><button className="remove" aria-label="Remove item" onClick={()=>remove(index)}><Trash2/></button></div></div><b>{formatPrice(product.price*item.quantity)}</b></div>})}</div><div className="cart-summary"><div><span>SUBTOTAL</span><b>{formatPrice(subtotal)}</b></div><p>SHIPPING CALCULATED AT CHECKOUT.</p><button onClick={() => alert('CHECKOUT SYSTEM CONNECTOR READY FOR COMMERCE BACKEND.')}>PROCEED <ArrowRight/></button></div></div>;
}

function CartDrawer({ open, setOpen, cart, update, remove }: { open:boolean; setOpen:(v:boolean)=>void; cart:CartItem[]; update:(i:number,d:number)=>void; remove:(i:number)=>void }) {
  return <Sheet open={open} onOpenChange={setOpen}><SheetContent className="cart-drawer" showCloseButton><SheetHeader><SheetTitle>CART ({cart.reduce((s,i)=>s+i.quantity,0)})</SheetTitle><SheetDescription>DROP_01 / LOCAL BAG</SheetDescription></SheetHeader><CartContents cart={cart} update={update} remove={remove} close={()=>setOpen(false)}/></SheetContent></Sheet>;
}

function Ticker() { return <div className="ticker"><div>ÆTY ONE® &nbsp; / &nbsp; DROP_01 &nbsp; / &nbsp; NO PERMANENT FORM &nbsp; / &nbsp; SYSTEM ACTIVE &nbsp; / &nbsp; UNKNOWN TERRITORY &nbsp; / &nbsp; ÆTY ONE® &nbsp; / &nbsp; DROP_01 &nbsp; / &nbsp; NO PERMANENT FORM &nbsp; / &nbsp; SYSTEM ACTIVE &nbsp; / &nbsp; UNKNOWN TERRITORY</div></div>; }

function Footer() {
  return <footer className="footer section-pad"><h2>ÆTY ONE®</h2><div className="footer-grid"><nav><a href="/drop-01">DROP 01</a><a href="/archive">ARCHIVE</a><a href="#">INSTAGRAM ↗</a><a href="mailto:system@aety.one">CONTACT</a></nav><nav><a href="#">SHIPPING</a><a href="#">RETURNS</a></nav><form onSubmit={(e)=>{e.preventDefault(); alert('SYSTEM ENTRY RECEIVED.');}}><label htmlFor="email">ENTER THE SYSTEM</label><div><input id="email" type="email" required placeholder="EMAIL ADDRESS"/><button>JOIN <ArrowRight/></button></div></form></div><div className="footer-base"><span>ÆTY ONE® / 2026</span><span>ALL RIGHTS RESERVED</span><span>SYSTEM_001</span><span>DUBAI / 25.2048° N</span></div></footer>;
}
