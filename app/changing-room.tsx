'use client';

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import { ArrowRight, ImagePlus, Layers3, LockKeyhole, Plus, Sparkles, Upload, X } from 'lucide-react';
import { formatPrice, products, type Product } from './data';

type Mode = 'replace' | 'add';
type StudioProduct = Product & { cutout: string; placement: string };

const studioProducts: StudioProduct[] = [
  { ...products[0], cutout: '/assets/tryon-jersey.png', placement: 'TOP' },
  { ...products[1], cutout: '/assets/tryon-system-set.png', placement: 'TOP' },
  { ...products[2], cutout: '/assets/tryon-system-set.png', placement: 'BOTTOM' },
  { ...products[3], cutout: '/assets/tryon-shell.png', placement: 'OUTER' },
];

export function AetyVerse() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [look, setLook] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>('replace');
  const [dragging, setDragging] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo);
  }, [photo]);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 12 * 1024 * 1024) {
      setNotice('USE A JPG, PNG OR WEBP UNDER 12 MB.');
      return;
    }
    if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    setNotice('PHOTO READY. BUILD YOUR LOOK.');
    event.target.value = '';
  }

  function addProduct(slug: string) {
    setLook((current) => current.includes(slug) ? current : [...current, slug]);
    setNotice('OBJECT ADDED TO LOOK.');
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const slug = event.dataTransfer.getData('text/aety-product') || dragging;
    if (slug && studioProducts.some((item) => item.slug === slug)) addProduct(slug);
    setDragging(null);
  }

  function removeProduct(slug: string) {
    setLook((current) => current.filter((item) => item !== slug));
  }

  function prepareGeneration() {
    if (!photo || !look.length) return;
    setNotice(`LOOK READY: ${mode === 'replace' ? 'REPLACE CURRENT OUTFIT' : 'ADD TO CURRENT OUTFIT'}. IMAGE GENERATION CONNECTS IN THE NEXT BUILD.`);
  }

  return <main className="inner-page aetyverse-page">
    <section className="av-head section-pad">
      <div>
        <p className="eyebrow">ÆTY ONE / IMAGE STUDIO_00.1</p>
        <h1>AETY<br/><i>VERSE</i></h1>
      </div>
      <div className="av-intro">
        <p>BUILD A LOOK WITH YOUR IMAGE AND OBJECTS FROM DROP_01.</p>
        <div><span>01 UPLOAD</span><span>02 DROP OBJECTS</span><span>03 GENERATE</span></div>
        <p className="av-privacy"><LockKeyhole/> YOUR SOURCE IMAGE STAYS IN THIS BROWSER DURING THIS FIRST STUDIO PHASE.</p>
      </div>
    </section>

    <section className="av-studio">
      <div className="av-canvas-column">
        <div className="av-toolbar">
          <span><i/> AETYVERSE / NEW LOOK</span>
          <button onClick={() => inputRef.current?.click()}><Upload/> {photo ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}</button>
        </div>

        <div className={`av-canvas ${photo ? 'has-photo' : ''} ${dragging ? 'is-target' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          {photo ? <img className="av-source-photo" src={photo} alt="Your AetyVerse source"/> : <button className="av-upload" onClick={() => inputRef.current?.click()}><ImagePlus/><b>DROP OR UPLOAD YOUR IMAGE</b><span>FULL-BODY OR PORTRAIT / JPG, PNG, WEBP</span></button>}
          <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto}/>
          <div className="av-grid" aria-hidden="true"/>
          {photo && !look.length && <div className="av-drop-message"><Layers3/><b>DRAG PRODUCTS HERE</b><span>THEY WILL FORM YOUR LOOK STACK</span></div>}
          {look.length > 0 && <div className="av-look-stack">
            <span>LOOK STACK / {String(look.length).padStart(2, '0')}</span>
            <div>{look.map((slug, index) => {
              const item = studioProducts.find((product) => product.slug === slug)!;
              return <article key={slug}><b>{String(index + 1).padStart(2, '0')}</b><img src={item.cutout} alt=""/><span>{item.name}</span><button aria-label={`Remove ${item.name}`} onClick={() => removeProduct(slug)}><X/></button></article>;
            })}</div>
          </div>}
          <span className="av-canvas-code">SOURCE_01 / 2048PX TARGET / RGB</span>
        </div>

        <div className="av-mode-row">
          <span>EDIT MODE</span>
          <div><button className={mode === 'replace' ? 'active' : ''} onClick={() => setMode('replace')}>REPLACE OUTFIT</button><button className={mode === 'add' ? 'active' : ''} onClick={() => setMode('add')}>ADD PRODUCT</button></div>
        </div>
      </div>

      <aside className="av-library">
        <div className="av-library-head"><span>OBJECT LIBRARY</span><small>DRAG TO CANVAS OR TAP +</small></div>
        <div className="av-products">{studioProducts.map((item) => {
          const selected = look.includes(item.slug);
          return <article key={item.slug} draggable onDragStart={(event) => { event.dataTransfer.setData('text/aety-product', item.slug); setDragging(item.slug); }} onDragEnd={() => setDragging(null)}>
            <div><img src={item.cutout} alt={item.name}/><span>{item.placement}</span></div>
            <p>OBJECT_{item.id}</p><h2>{item.name}</h2><footer><span>{formatPrice(item.price)}</span><button className={selected ? 'added' : ''} onClick={() => selected ? removeProduct(item.slug) : addProduct(item.slug)} aria-label={`${selected ? 'Remove' : 'Add'} ${item.name}`}>{selected ? <X/> : <Plus/>}</button></footer>
          </article>;
        })}</div>

        <div className="av-generate-panel">
          <div><span>GENERATION INPUT</span><b>{photo ? 'IMAGE_01' : 'NO IMAGE'} / {look.length} OBJECT{look.length === 1 ? '' : 'S'}</b></div>
          <button disabled={!photo || !look.length} onClick={prepareGeneration}><Sparkles/> GENERATE LOOK <ArrowRight/></button>
          <p>{notice || 'UPLOAD AN IMAGE AND ADD AT LEAST ONE OBJECT.'}</p>
          <small>PHASE 00.1 — THE WORKSPACE AND LOOK-BUILDING FLOW ARE LIVE. PHOTOREALISTIC IMAGE REPLACEMENT WILL BE CONNECTED NEXT.</small>
        </div>
      </aside>
    </section>
  </main>;
}

export const ChangingRoom = AetyVerse;
