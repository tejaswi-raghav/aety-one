'use client';

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, ImagePlus, Layers3, LoaderCircle, LockKeyhole, Plus, RotateCcw, Sparkles, Upload, X } from 'lucide-react';
import { formatPrice, products, type Product } from './data';

type Mode = 'replace' | 'add';
type GenerationState = 'idle' | 'generating' | 'complete' | 'error';
type ServiceStatus = 'checking' | 'ready' | 'setup';
type StudioProduct = Product & { cutout: string; placement: string };

const studioProducts: StudioProduct[] = [
  { ...products[0], cutout: '/assets/tryon-jersey.png', placement: 'TOP' },
  { ...products[1], cutout: '/assets/tryon-system-set.png', placement: 'TOP' },
  { ...products[2], cutout: '/assets/tryon-system-set.png', placement: 'BOTTOM' },
  { ...products[3], cutout: '/assets/tryon-shell.png', placement: 'OUTER' },
];

export function AetyVerse() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [look, setLook] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>('replace');
  const [dragging, setDragging] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [generation, setGeneration] = useState<GenerationState>('idle');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showGenerated, setShowGenerated] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('checking');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo);
  }, [photo]);

  useEffect(() => {
    let active = true;
    fetch('/api/aetyverse/generate', { cache: 'no-store' })
      .then((response) => response.json() as Promise<{ configured?: boolean }>)
      .then((result) => { if (active) setServiceStatus(result.configured ? 'ready' : 'setup'); })
      .catch(() => { if (active) setServiceStatus('setup'); });
    return () => { active = false; };
  }, []);

  function resetResult() {
    setGeneratedImage(null);
    setShowGenerated(false);
    setGeneration('idle');
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 12 * 1024 * 1024) {
      setNotice('USE A JPG, PNG OR WEBP UNDER 12 MB.');
      return;
    }
    if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    setSourceFile(file);
    resetResult();
    setNotice('PHOTO READY. BUILD YOUR LOOK.');
    event.target.value = '';
  }

  function addProduct(slug: string) {
    setLook((current) => current.includes(slug) ? current : [...current, slug]);
    resetResult();
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
    resetResult();
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    resetResult();
  }

  async function generateLook() {
    if (!sourceFile || !look.length || serviceStatus !== 'ready' || generation === 'generating') return;
    setGeneration('generating');
    setNotice('GENERATING YOUR AETYVERSE LOOK. THIS CAN TAKE UP TO A MINUTE.');

    const body = new FormData();
    body.append('photo', sourceFile);
    body.append('mode', mode);
    look.forEach((slug) => body.append('products', slug));

    try {
      const response = await fetch('/api/aetyverse/generate', { method: 'POST', body });
      const result = await response.json() as { image?: string; error?: string; code?: string };
      if (!response.ok || !result.image) {
        if (result.code === 'engine_not_configured') setServiceStatus('setup');
        throw new Error(result.error || 'AETYVERSE COULD NOT GENERATE THIS LOOK.');
      }
      setGeneratedImage(result.image);
      setShowGenerated(true);
      setGeneration('complete');
      setNotice('LOOK GENERATED. COMPARE, DOWNLOAD OR GENERATE AGAIN.');
    } catch (error) {
      setGeneration('error');
      setNotice(error instanceof Error ? error.message.toUpperCase() : 'AETYVERSE COULD NOT GENERATE THIS LOOK.');
    }
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
        <p className="av-privacy"><LockKeyhole/> YOUR IMAGE IS SENT SECURELY FOR GENERATION AND IS NOT SAVED BY AETYVERSE.</p>
      </div>
    </section>

    <section className="av-studio">
      <div className="av-canvas-column">
        <div className="av-toolbar">
          <span><i/> AETYVERSE / NEW LOOK</span>
          <button onClick={() => inputRef.current?.click()}><Upload/> {photo ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}</button>
        </div>

        <div className={`av-canvas ${photo ? 'has-photo' : ''} ${dragging ? 'is-target' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          {photo ? <img className={`av-source-photo ${showGenerated ? 'is-result' : ''}`} src={showGenerated && generatedImage ? generatedImage : photo} alt={showGenerated ? 'Your generated AetyVerse look' : 'Your AetyVerse source'}/> : <button className="av-upload" onClick={() => inputRef.current?.click()}><ImagePlus/><b>DROP OR UPLOAD YOUR IMAGE</b><span>FULL-BODY OR PORTRAIT / JPG, PNG, WEBP</span></button>}
          <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto}/>
          <div className="av-grid" aria-hidden="true"/>
          {generatedImage && <div className="av-result-controls"><button className={!showGenerated ? 'active' : ''} onClick={() => setShowGenerated(false)}>SOURCE</button><button className={showGenerated ? 'active' : ''} onClick={() => setShowGenerated(true)}>GENERATED</button></div>}
          {generation === 'generating' && <div className="av-generating"><LoaderCircle/><b>CONSTRUCTING LOOK</b><span>IDENTITY / FIT / FABRIC / LIGHT</span></div>}
          {photo && !look.length && <div className="av-drop-message"><Layers3/><b>DRAG PRODUCTS HERE</b><span>THEY WILL FORM YOUR LOOK STACK</span></div>}
          {look.length > 0 && <div className="av-look-stack">
            <span>LOOK STACK / {String(look.length).padStart(2, '0')}</span>
            <div>{look.map((slug, index) => {
              const item = studioProducts.find((product) => product.slug === slug)!;
              return <article key={slug}><b>{String(index + 1).padStart(2, '0')}</b><img src={item.cutout} alt=""/><span>{item.name}</span><button aria-label={`Remove ${item.name}`} onClick={() => removeProduct(slug)}><X/></button></article>;
            })}</div>
          </div>}
          <span className="av-canvas-code">{showGenerated ? 'RESULT_01' : 'SOURCE_01'} / PORTRAIT TARGET / RGB</span>
        </div>

        <div className="av-mode-row">
          <span>EDIT MODE</span>
          <div><button className={mode === 'replace' ? 'active' : ''} onClick={() => changeMode('replace')}>REPLACE OUTFIT</button><button className={mode === 'add' ? 'active' : ''} onClick={() => changeMode('add')}>ADD PRODUCT</button></div>
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
          <button disabled={!photo || !look.length || generation === 'generating' || serviceStatus !== 'ready'} onClick={generateLook}>{generation === 'generating' ? <LoaderCircle className="av-spinner"/> : <Sparkles/>} {generation === 'generating' ? 'GENERATING LOOK' : generatedImage ? 'GENERATE AGAIN' : 'GENERATE LOOK'} {generatedImage ? <RotateCcw/> : <ArrowRight/>}</button>
          {generatedImage && <a className="av-download" href={generatedImage} download="aetyverse-look.png"><Download/> DOWNLOAD RESULT <ArrowRight/></a>}
          <p className={generation === 'error' || serviceStatus === 'setup' ? 'is-error' : ''}>{serviceStatus === 'checking' ? 'CHECKING IMAGE ENGINE…' : serviceStatus === 'setup' ? 'ENGINE SETUP REQUIRED — SECURE API KEY NOT CONFIGURED.' : notice || 'UPLOAD AN IMAGE AND ADD AT LEAST ONE OBJECT.'}</p>
          <small>LIVE IMAGE EDIT PIPELINE — RESULTS ARE AI-GENERATED VISUALISATIONS. FIT AND SIZE ARE APPROXIMATE, NOT A GUARANTEE.</small>
        </div>
      </aside>
    </section>
  </main>;
}

export const ChangingRoom = AetyVerse;
