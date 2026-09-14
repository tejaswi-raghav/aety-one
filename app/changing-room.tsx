'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Camera, LockKeyhole, MoveVertical, RotateCcw, Upload } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatPrice, products, type Product } from './data';

type FitPreference = 'clean' | 'brand' | 'max';
type TryOnProduct = Product & { overlay: string; measure: 'chest' | 'waist'; garment: number[] };

const sizes = ['XS', 'S', 'M', 'L', 'XL'] as const;
const tryOnProducts: TryOnProduct[] = [
  { ...products[0], overlay: '/assets/tryon-jersey.png', measure: 'chest', garment: [104, 112, 120, 128, 136] },
  { ...products[1], overlay: '/assets/tryon-system-set.png', measure: 'chest', garment: [106, 114, 122, 130, 138] },
  { ...products[2], overlay: '/assets/tryon-system-set.png', measure: 'waist', garment: [70, 78, 86, 96, 106] },
  { ...products[3], overlay: '/assets/tryon-shell.png', measure: 'chest', garment: [112, 120, 128, 136, 144] },
];

export function ChangingRoom({ addToCart }: { addToCart: (product: Product, size: string) => void }) {
  const [selectedSlug, setSelectedSlug] = useState(tryOnProducts[0].slug);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [error, setError] = useState('');
  const [height, setHeight] = useState(175);
  const [chest, setChest] = useState(96);
  const [waist, setWaist] = useState(82);
  const [preference, setPreference] = useState<FitPreference>('brand');
  const [scale, setScale] = useState(100);
  const [vertical, setVertical] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('product');
    if (query && tryOnProducts.some((item) => item.slug === query)) setSelectedSlug(query);
  }, []);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);

  const product = tryOnProducts.find((item) => item.slug === selectedSlug) || tryOnProducts[0];
  const recommendation = useMemo(() => {
    const body = product.measure === 'waist' ? waist : chest;
    const desiredEase = product.measure === 'waist' ? 8 : preference === 'clean' ? 12 : preference === 'brand' ? 22 : 32;
    const target = body + desiredEase;
    let index = product.garment.findIndex((value) => value >= target);
    if (index < 0) index = 4;
    const selected = sizes[index];
    const ease = product.garment[index] - body;
    const length = height < 165 ? 'LONGER ON BODY' : height > 188 ? 'CROPPED RELATIVE TO CAMPAIGN FIT' : 'CAMPAIGN LENGTH';
    return { selected, index, ease, length, body };
  }, [product, waist, chest, preference, height]);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setError('USE A JPG, PNG OR WEBP UNDER 10 MB.');
      return;
    }
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    setPhotoName(file.name.toUpperCase());
    setError('');
  }

  const overlayScale = (product.slug === 'terrace-track-pant' ? .82 : product.slug === 'system-longsleeve' ? .9 : 1) * (scale / 100) * (0.88 + recommendation.index * .045);

  return <main className="inner-page changing-room-page">
    <section className="cr-head section-pad">
      <div><p className="eyebrow">ÆTY ONE / FIT SYSTEM_01</p><h1>DIGITAL<br/>CHANGING ROOM</h1></div>
      <div className="cr-intro"><p>SELECT AN OBJECT. LOAD A FRONT-FACING PHOTO. CALIBRATE WITH YOUR MEASUREMENTS.</p><p className="privacy-note"><LockKeyhole /> YOUR PHOTO STAYS IN THIS BROWSER. IT IS NOT SAVED OR SENT.</p></div>
    </section>

    <section className="cr-workspace">
      <div className="cr-stage">
        <div className={`mirror ${photo ? 'has-photo' : ''}`}>
          {photo ? <img className="person-photo" src={photo} alt="Your uploaded changing-room preview" /> : <button className="mirror-empty" onClick={() => inputRef.current?.click()}><Camera/><b>LOAD A FULL-BODY PHOTO</b><span>FACE CAMERA / ARMS RELAXED / EVEN LIGHT</span></button>}
          {photo && <img className={`garment-overlay overlay-${product.slug}`} src={product.overlay} alt={`${product.name} visual overlay`} style={{ transform: `translate(-50%, calc(-50% + ${vertical}px)) scale(${overlayScale})` }} />}
          <div className="mirror-grid" aria-hidden="true" />
          <span className="mirror-code">MIRROR_01 / {product.id} / {recommendation.selected}</span>
          {photo && <button className="change-photo" onClick={() => inputRef.current?.click()}><Upload/> CHANGE PHOTO</button>}
        </div>
        <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} />
        {error && <p className="upload-error" role="alert">{error}</p>}
        <div className="calibration-tools">
          <label><span><b>SCALE</b><small>{scale}%</small></span><input type="range" min="78" max="128" value={scale} onChange={(e) => setScale(Number(e.target.value))}/></label>
          <label><span><b>VERTICAL POSITION</b><small>{vertical > 0 ? '+' : ''}{vertical}px</small></span><input type="range" min="-140" max="140" value={vertical} onChange={(e) => setVertical(Number(e.target.value))}/></label>
          <button onClick={() => { setScale(100); setVertical(0); }}><RotateCcw/> RESET</button>
        </div>
      </div>

      <aside className="cr-controls">
        <div className="cr-step"><span>01</span><div><b>SELECT OBJECT</b><small>SIZED GARMENTS / DROP_01</small></div></div>
        <div className="try-products">{tryOnProducts.map((item) => <button key={item.slug} className={item.slug === product.slug ? 'selected' : ''} onClick={() => setSelectedSlug(item.slug)}><img src={item.overlay} alt=""/><span><small>OBJECT_{item.id}</small><b>{item.name}</b><em>{formatPrice(item.price)}</em></span></button>)}</div>

        <div className="cr-step"><span>02</span><div><b>BODY CALIBRATION</b><small>CM / MEASURE CLOSE TO BODY</small></div></div>
        <div className="measurements">
          <label><span>HEIGHT</span><div><input type="number" min="145" max="205" value={height} onChange={(e)=>setHeight(Number(e.target.value))}/><b>CM</b></div></label>
          <label><span>CHEST</span><div><input type="number" min="76" max="140" value={chest} onChange={(e)=>setChest(Number(e.target.value))}/><b>CM</b></div></label>
          <label><span>WAIST</span><div><input type="number" min="58" max="130" value={waist} onChange={(e)=>setWaist(Number(e.target.value))}/><b>CM</b></div></label>
        </div>

        <fieldset className="fit-preference"><legend>HOW SHOULD IT WEAR?</legend><RadioGroup value={preference} onValueChange={(value) => setPreference(value as FitPreference)}>
          {[['clean','CLEAN','LESS VOLUME'],['brand','BRAND FIT','CAMPAIGN PROPORTION'],['max','MAX VOLUME','EXAGGERATED']].map(([value,label,note]) => <label key={value}><RadioGroupItem value={value}/><span><b>{label}</b><small>{note}</small></span></label>)}
        </RadioGroup></fieldset>

        <div className="fit-result">
          <p>RECOMMENDED SIZE</p><strong>{recommendation.selected}</strong><div><span>{product.measure.toUpperCase()} EASE</span><b>+{recommendation.ease} CM</b></div><div><span>LENGTH</span><b>{recommendation.length}</b></div>
          <button onClick={() => addToCart(product, recommendation.selected)}>ADD SIZE {recommendation.selected} TO CART <ArrowRight/></button>
        </div>
        <p className="fit-disclaimer">FIT IS CALCULATED FROM THE MEASUREMENTS ENTERED AND THIS GARMENT&apos;S SPEC. THE PHOTO OVERLAY IS A VISUAL ESTIMATE—BODY SHAPE, POSE AND CAMERA ANGLE CAN CHANGE HOW IT APPEARS. FOR EXACT FIT, COMPARE THE SIZE CHART WITH A GARMENT YOU OWN.</p>
      </aside>
    </section>

    <section className="size-matrix section-pad"><div><p className="eyebrow">GARMENT SPEC / {product.id}</p><h2>SIZE MATRIX</h2></div><div className="matrix-table"><div><span>SIZE</span>{sizes.map((size)=><b key={size}>{size}</b>)}</div><div><span>{product.measure === 'waist' ? 'GARMENT WAIST' : 'GARMENT CHEST'}</span>{product.garment.map((value)=><b key={value}>{value} CM</b>)}</div></div></section>
  </main>;
}
