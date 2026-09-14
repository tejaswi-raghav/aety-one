'use client';

import { ChangeEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Camera, Download, LoaderCircle, LockKeyhole, RotateCcw, ScanLine, Upload } from 'lucide-react';
import { formatPrice, products, type Product } from './data';

type FitPreference = 'clean' | 'brand' | 'max';
type TryOnProduct = Product & { overlay: string; measure: 'chest' | 'waist'; garment: number[] };
type Landmark = { x: number; y: number; visibility?: number };
type PoseLayout = { centerX: number; centerY: number; width: number };
type Detector = { detect: (image: HTMLImageElement) => { landmarks?: Landmark[][] } };

const sizes = ['XS', 'S', 'M', 'L', 'XL'] as const;
const tryOnProducts: TryOnProduct[] = [
  { ...products[0], overlay: '/assets/tryon-jersey.png', measure: 'chest', garment: [104, 112, 120, 128, 136] },
  { ...products[1], overlay: '/assets/tryon-system-set.png', measure: 'chest', garment: [106, 114, 122, 130, 138] },
  { ...products[2], overlay: '/assets/tryon-system-set.png', measure: 'waist', garment: [70, 78, 86, 96, 106] },
  { ...products[3], overlay: '/assets/tryon-shell.png', measure: 'chest', garment: [112, 120, 128, 136, 144] },
];

let detectorPromise: Promise<Detector> | null = null;
async function getPoseDetector(): Promise<Detector> {
  if (!detectorPromise) {
    detectorPromise = import('@mediapipe/tasks-vision').then(async ({ FilesetResolver, PoseLandmarker }) => {
      const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/models/pose_landmarker_lite.task' },
        runningMode: 'IMAGE',
        numPoses: 1,
        minPoseDetectionConfidence: 0.45,
        minPosePresenceConfidence: 0.45,
      }) as Promise<Detector>;
    });
  }
  return detectorPromise;
}

function deriveLayout(landmarks: Landmark[] | null, product: TryOnProduct): PoseLayout {
  if (!landmarks) return { centerX: .5, centerY: product.measure === 'waist' ? .53 : .42, width: product.measure === 'waist' ? .48 : .52 };
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const shoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipX = (leftHip.x + rightHip.x) / 2;
  const hipY = (leftHip.y + rightHip.y) / 2;
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  const hipWidth = Math.abs(leftHip.x - rightHip.x);
  if (product.slug === 'system-longsleeve' || product.slug === 'terrace-track-pant') {
    const ankleY = leftAnkle && rightAnkle ? (leftAnkle.y + rightAnkle.y) / 2 : Math.min(.98, hipY + (hipY - shoulderY) * 2.2);
    return { centerX: (shoulderX + hipX) / 2, centerY: (shoulderY + ankleY) / 2, width: Math.min(.75, Math.max(shoulderWidth * 2.3, hipWidth * 2.6)) };
  }
  return { centerX: shoulderX, centerY: shoulderY + (hipY - shoulderY) * .43, width: Math.min(.72, shoulderWidth * (product.slug === 'a1-tech-shell' ? 2.65 : 2.5)) };
}

export function ChangingRoom({ addToCart }: { addToCart: (product: Product, size: string) => void }) {
  const [selectedSlug, setSelectedSlug] = useState(tryOnProducts[0].slug);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'locked' | 'manual'>('idle');
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [imageSize, setImageSize] = useState({ width: 4, height: 5 });
  const [height, setHeight] = useState(175);
  const [chest, setChest] = useState(96);
  const [waist, setWaist] = useState(82);
  const [preference, setPreference] = useState<FitPreference>('brand');
  const [scale, setScale] = useState(100);
  const [vertical, setVertical] = useState(0);
  const [horizontal, setHorizontal] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; horizontal: number; vertical: number } | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('product');
    if (query && tryOnProducts.some((item) => item.slug === query)) setSelectedSlug(query);
  }, []);
  useEffect(() => () => { if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo); }, [photo]);

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
    return { selected, index, ease, length };
  }, [product, waist, chest, preference, height]);
  const poseLayout = useMemo(() => deriveLayout(landmarks, product), [landmarks, product]);
  const sizeFactor = .92 + recommendation.index * .04;
  const overlayScale = (scale / 100) * sizeFactor;

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setError('USE A JPG, PNG OR WEBP UNDER 10 MB.');
      return;
    }
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    setError('');
    setLandmarks(null);
    setStatus('loading');
    setScale(100);
    setHorizontal(0);
    setVertical(0);
    event.target.value = '';
  }

  function loadDemoPhoto() {
    if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo);
    setPhoto('/assets/campaign-skater.png');
    setError('');
    setLandmarks(null);
    setStatus('loading');
    resetAlignment();
  }

  async function detectPose(image: HTMLImageElement) {
    setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    setStatus('loading');
    try {
      const detector = await getPoseDetector();
      const result = detector.detect(image);
      const pose = result.landmarks?.[0];
      const essential = pose && [11, 12, 23, 24].every((index) => (pose[index]?.visibility ?? 1) > .35);
      if (!pose || !essential) {
        setLandmarks(null);
        setStatus('manual');
        setError('BODY LOCK NOT FOUND. USE A FRONT-FACING FULL-BODY PHOTO, OR ALIGN MANUALLY.');
        return;
      }
      setLandmarks(pose);
      setStatus('locked');
      setError('');
    } catch {
      setLandmarks(null);
      setStatus('manual');
      setError('AUTO ALIGNMENT IS UNAVAILABLE. MANUAL CONTROLS REMAIN ACTIVE.');
    }
  }

  function resetAlignment() {
    setScale(100);
    setHorizontal(0);
    setVertical(0);
  }

  function startDrag(event: PointerEvent<HTMLImageElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, horizontal, vertical };
  }
  function drag(event: PointerEvent<HTMLImageElement>) {
    if (!dragRef.current) return;
    setHorizontal(dragRef.current.horizontal + event.clientX - dragRef.current.x);
    setVertical(dragRef.current.vertical + event.clientY - dragRef.current.y);
  }
  function stopDrag() { dragRef.current = null; }

  async function downloadLook() {
    const source = imageRef.current;
    if (!source || !mirrorRef.current) return;
    setDownloading(true);
    try {
      const maxWidth = 1800;
      const width = Math.min(source.naturalWidth, maxWidth);
      const heightPx = Math.round(width * source.naturalHeight / source.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = heightPx;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      context.drawImage(source, 0, 0, width, heightPx);
      const overlay = new Image();
      overlay.src = product.overlay;
      await overlay.decode();
      const photoFrame = mirrorRef.current.querySelector('.photo-frame');
      const renderedPhotoWidth = photoFrame?.clientWidth || mirrorRef.current.clientWidth;
      const renderedPhotoHeight = photoFrame?.clientHeight || mirrorRef.current.clientHeight;
      const xOffset = horizontal / renderedPhotoWidth;
      const yOffset = vertical / renderedPhotoHeight;
      const garmentWidth = poseLayout.width * width * overlayScale;
      const garmentHeight = garmentWidth * overlay.naturalHeight / overlay.naturalWidth;
      const centerX = (poseLayout.centerX + xOffset) * width;
      const centerY = (poseLayout.centerY + yOffset) * heightPx;
      context.drawImage(overlay, centerX - garmentWidth / 2, centerY - garmentHeight / 2, garmentWidth, garmentHeight);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', .92));
      if (!blob) throw new Error('Export failed');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AETY-ONE-${product.id}-${recommendation.selected}.jpg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('COULD NOT EXPORT THIS LOOK. TRY AGAIN.');
    } finally {
      setDownloading(false);
    }
  }

  return <main className="inner-page changing-room-page">
    <section className="cr-head section-pad">
      <div><p className="eyebrow">ÆTY ONE / FIT SYSTEM_02</p><h1>DIGITAL<br/>CHANGING ROOM</h1></div>
      <div className="cr-intro"><p>SELECT AN OBJECT. LOAD A FRONT-FACING PHOTO. THE SYSTEM LOCKS TO YOUR BODY; MEASUREMENTS CALCULATE YOUR SIZE.</p><p className="privacy-note"><LockKeyhole /> BODY DETECTION RUNS ON YOUR DEVICE. YOUR PHOTO IS NEVER UPLOADED OR SAVED.</p></div>
    </section>

    <section className="cr-workspace">
      <div className="cr-stage">
        <div ref={mirrorRef} className={`mirror ${photo ? 'has-photo' : ''}`}>
          {photo ? <div className="photo-frame" style={{ aspectRatio: `${imageSize.width}/${imageSize.height}` }}><img ref={imageRef} className="person-photo" src={photo} alt="Your uploaded changing-room preview" onLoad={(event) => void detectPose(event.currentTarget)} /><img className={`garment-overlay overlay-${product.slug}`} src={product.overlay} alt={`${product.name} visual overlay`} style={{ left: `${poseLayout.centerX * 100}%`, top: `${poseLayout.centerY * 100}%`, width: `${poseLayout.width * 100}%`, transform: `translate(calc(-50% + ${horizontal}px), calc(-50% + ${vertical}px)) scale(${overlayScale})` }} onPointerDown={startDrag} onPointerMove={drag} onPointerUp={stopDrag} onPointerCancel={stopDrag} draggable={false}/></div> : <div className="mirror-empty-wrap"><button className="mirror-empty" onClick={() => inputRef.current?.click()}><Camera/><b>LOAD A FULL-BODY PHOTO</b><span>FACE CAMERA / ARMS RELAXED / EVEN LIGHT</span></button><button className="demo-photo" onClick={loadDemoPhoto}>TRY DEMO PHOTO <ArrowRight/></button></div>}
          <div className="mirror-grid" aria-hidden="true" />
          <span className="mirror-code">MIRROR_02 / {product.id} / {recommendation.selected}</span>
          {photo && <><span className={`pose-status status-${status}`}>{status === 'loading' ? <LoaderCircle/> : <ScanLine/>}{status === 'loading' ? 'ANALYZING BODY' : status === 'locked' ? 'BODY LOCKED' : 'MANUAL ALIGNMENT'}</span><button className="change-photo" onClick={() => inputRef.current?.click()}><Upload/> CHANGE PHOTO</button></>}
        </div>
        <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={handlePhoto} />
        {error && <p className="upload-error" role="alert">{error}</p>}
        <div className="calibration-tools">
          <label><span><b>SCALE</b><small>{scale}%</small></span><input type="range" min="70" max="145" value={scale} onChange={(e) => setScale(Number(e.target.value))}/></label>
          <label><span><b>VERTICAL</b><small>{vertical > 0 ? '+' : ''}{vertical}px</small></span><input type="range" min="-180" max="180" value={vertical} onChange={(e) => setVertical(Number(e.target.value))}/></label>
          <button onClick={resetAlignment}><RotateCcw/> AUTO RESET</button>
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

        <fieldset className="fit-preference"><legend>HOW SHOULD IT WEAR?</legend><div className="fit-options">
          {[['clean','CLEAN','LESS VOLUME'],['brand','BRAND FIT','CAMPAIGN PROPORTION'],['max','MAX VOLUME','EXAGGERATED']].map(([value,label,note]) => <label key={value}><input type="radio" name="fit-preference" value={value} checked={preference === value} onChange={() => setPreference(value as FitPreference)}/><span><b>{label}</b><small>{note}</small></span></label>)}
        </div></fieldset>

        <div className="fit-result">
          <p>RECOMMENDED SIZE</p><strong>{recommendation.selected}</strong><div><span>{product.measure.toUpperCase()} EASE</span><b>+{recommendation.ease} CM</b></div><div><span>LENGTH</span><b>{recommendation.length}</b></div>
          <button onClick={() => addToCart(product, recommendation.selected)}>ADD SIZE {recommendation.selected} TO CART <ArrowRight/></button>
          <button className="download-look" disabled={!photo || downloading} onClick={() => void downloadLook()}>{downloading ? 'RENDERING…' : 'DOWNLOAD LOOK'} <Download/></button>
        </div>
        <p className="fit-disclaimer">SIZE IS CALCULATED FROM THE MEASUREMENTS ENTERED AND THE GARMENT SPEC. BODY DETECTION ALIGNS THE PRODUCT TO THE PHOTO; IT CANNOT SIMULATE FABRIC DRAPE OR REPLACE AN IN-PERSON FITTING.</p>
      </aside>
    </section>

    <section className="size-matrix section-pad"><div><p className="eyebrow">GARMENT SPEC / {product.id}</p><h2>SIZE MATRIX</h2></div><div className="matrix-table"><div><span>SIZE</span>{sizes.map((size)=><b key={size}>{size}</b>)}</div><div><span>{product.measure === 'waist' ? 'GARMENT WAIST' : 'GARMENT CHEST'}</span>{product.garment.map((value)=><b key={value}>{value} CM</b>)}</div></div></section>
  </main>;
}
