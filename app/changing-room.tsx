'use client';

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Download, ImagePlus, Layers3, LoaderCircle, LockKeyhole, MessageSquare, Palette, Plus, RotateCcw, Ruler, Sparkles, Upload, X } from 'lucide-react';
import { formatPrice, products, type Product } from './data';

type Mode = 'replace' | 'add';
type GenerationState = 'idle' | 'generating' | 'complete' | 'error';
type ServiceStatus = 'checking' | 'ready' | 'setup';
type FitPreference = 'close' | 'regular' | 'oversized';
type ColorDirection = 'signal' | 'acid' | 'concrete';
type MeasurementKey = 'height' | 'chest' | 'waist' | 'hips' | 'shoulder' | 'inseam';
type BodyProfile = Record<MeasurementKey, string>;
type StudioProduct = Product & { cutout: string; placement: string };

type GarmentSize = { size: string; chest?: number; waistMax?: number; hips?: number; inseam?: number };

const emptyProfile: BodyProfile = { height: '', chest: '', waist: '', hips: '', shoulder: '', inseam: '' };
const measurementFields: Array<{ key: MeasurementKey; label: string; placeholder: string; min: number; max: number }> = [
  { key: 'height', label: 'HEIGHT', placeholder: '178', min: 120, max: 230 },
  { key: 'chest', label: 'CHEST', placeholder: '96', min: 60, max: 180 },
  { key: 'waist', label: 'WAIST', placeholder: '80', min: 50, max: 180 },
  { key: 'hips', label: 'HIPS', placeholder: '98', min: 60, max: 190 },
  { key: 'shoulder', label: 'SHOULDER', placeholder: '46', min: 30, max: 70 },
  { key: 'inseam', label: 'INSEAM', placeholder: '79', min: 50, max: 110 },
];

// Prototype garment measurements in centimetres. Replace with graded production tech-pack data before fit validation.
const garmentCharts: Record<string, GarmentSize[]> = {
  'distorted-football-jersey': [
    { size: 'XS', chest: 108 }, { size: 'S', chest: 114 }, { size: 'M', chest: 120 }, { size: 'L', chest: 126 }, { size: 'XL', chest: 134 },
  ],
  'system-longsleeve': [
    { size: 'XS', chest: 102 }, { size: 'S', chest: 108 }, { size: 'M', chest: 114 }, { size: 'L', chest: 120 }, { size: 'XL', chest: 128 },
  ],
  'terrace-track-pant': [
    { size: 'XS', waistMax: 76, hips: 102, inseam: 76 }, { size: 'S', waistMax: 82, hips: 108, inseam: 77 }, { size: 'M', waistMax: 88, hips: 114, inseam: 78 }, { size: 'L', waistMax: 96, hips: 122, inseam: 79 }, { size: 'XL', waistMax: 104, hips: 130, inseam: 80 },
  ],
  'a1-tech-shell': [
    { size: 'XS', chest: 106 }, { size: 'S', chest: 112 }, { size: 'M', chest: 118 }, { size: 'L', chest: 124 }, { size: 'XL', chest: 132 },
  ],
};

const colorDirections: Record<ColorDirection, { name: string; colors: string[]; advice: string }> = {
  signal: { name: 'COLD SIGNAL', colors: ['#345cff', '#edebe4', '#191919'], advice: 'COBALT OR SILVER ACCESSORIES CUT THROUGH THE BLACK SYSTEM WITHOUT FIGHTING THE GRAPHICS.' },
  acid: { name: 'ACID UTILITY', colors: ['#d9ff3f', '#7d806f', '#101010'], advice: 'ONE ACID ACCENT IS ENOUGH. KEEP FOOTWEAR AND LOWER LAYERS IN BLACK OR WEATHERED GREY.' },
  concrete: { name: 'WARM CONCRETE', colors: ['#9d4f38', '#c9bda8', '#282828'], advice: 'BONE, RUST AND WASHED BROWN SOFTEN THE TECHNICAL BLACK WHILE KEEPING THE LOOK GROUNDED.' },
};

function numberFrom(profile: BodyProfile, key: MeasurementKey) {
  const value = Number(profile[key]);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function validMeasurement(profile: BodyProfile, key: MeasurementKey) {
  const field = measurementFields.find((item) => item.key === key)!;
  const value = numberFrom(profile, key);
  return value >= field.min && value <= field.max;
}

function recommendSize(slug: string, profile: BodyProfile, preference: FitPreference) {
  const chart = garmentCharts[slug];
  if (!chart) return null;
  const chest = numberFrom(profile, 'chest');
  const waist = numberFrom(profile, 'waist');
  const hips = numberFrom(profile, 'hips');
  const inseam = numberFrom(profile, 'inseam');
  const preferenceEase = preference === 'close' ? 6 : preference === 'regular' ? 12 : 20;
  const isPant = slug === 'terrace-track-pant';
  const target = isPant
    ? chart.find((entry) => (entry.waistMax || 0) >= waist && (entry.hips || 0) >= hips + (preference === 'oversized' ? 14 : 8))
    : chart.find((entry) => (entry.chest || 0) >= chest + preferenceEase);
  const selected = target || chart[chart.length - 1];
  const note = !target ? 'OUTSIDE PROTOTYPE RANGE / PHYSICAL CHECK NEEDED' : isPant
    ? `${Math.max(0, (selected.hips || 0) - hips)} CM HIP EASE / ${inseam && selected.inseam ? Math.abs(selected.inseam - inseam) <= 2 ? 'LENGTH ALIGNED' : selected.inseam > inseam ? 'LONGER BREAK' : 'CROPPED BREAK' : 'LENGTH CHECK NEEDED'}`
    : `${Math.max(0, (selected.chest || 0) - chest)} CM CHEST EASE / ${preference.toUpperCase()} PROFILE`;
  return { size: selected.size, note, label: target ? 'RECOMMENDED' : 'CLOSEST SIZE' };
}

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
  const [profile, setProfile] = useState<BodyProfile>(emptyProfile);
  const [fitPreference, setFitPreference] = useState<FitPreference>('regular');
  const [colorDirection, setColorDirection] = useState<ColorDirection>('signal');
  const inputRef = useRef<HTMLInputElement>(null);

  const completedMeasurements = measurementFields.filter((field) => validMeasurement(profile, field.key)).length;
  const profileComplete = completedMeasurements === measurementFields.length;
  const calibrationScore = Math.round((completedMeasurements / measurementFields.length) * 100);
  const recommendations = look.map((slug) => ({ slug, result: recommendSize(slug, profile, fitPreference) }));
  const selectedColor = colorDirections[colorDirection];

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
    if (!sourceFile || !look.length || !profileComplete || serviceStatus !== 'ready' || generation === 'generating') return;
    setGeneration('generating');
    setNotice('GENERATING YOUR AETYVERSE LOOK. THIS CAN TAKE UP TO A MINUTE.');

    const body = new FormData();
    body.append('photo', sourceFile);
    body.append('mode', mode);
    body.append('profile', JSON.stringify({ ...profile, fitPreference }));
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
        <p className="eyebrow">ÆTY ONE / DIGITAL MIRROR_00.2</p>
        <h1>AETY<br/><i>VERSE</i></h1>
      </div>
      <div className="av-intro">
        <p>MEET YOUR DIGITAL FITTER. CALIBRATE YOUR BODY, BUILD A LOOK AND SEE WHY IT WORKS.</p>
        <div><span>01 CALIBRATE</span><span>02 STYLE</span><span>03 MIRROR</span></div>
        <p className="av-privacy"><LockKeyhole/> YOUR IMAGE IS SENT SECURELY FOR GENERATION AND IS NOT SAVED BY AETYVERSE.</p>
      </div>
    </section>

    <section className="av-calibration section-pad">
      <div className="av-calibration-title">
        <p className="eyebrow"><Ruler/> BODY PROFILE / CM</p>
        <h2>FIT<br/><i>CALIBRATION</i></h2>
        <p>USE BODY MEASUREMENTS, NOT YOUR USUAL LABEL SIZE. FOR BEST RESULTS, MEASURE CLOSE TO THE BODY.</p>
        <div className="av-calibration-meter"><span style={{ width: `${calibrationScore}%` }}/><b>{calibrationScore}% PROFILE COMPLETE</b></div>
      </div>

      <div className="av-measurement-form">
        <div className="av-measurements">{measurementFields.map((field) => <label key={field.key}>
          <span>{field.label}</span>
          <div><input inputMode="decimal" aria-label={`${field.label.toLowerCase()} in centimetres`} aria-invalid={Boolean(profile[field.key]) && !validMeasurement(profile, field.key)} value={profile[field.key]} placeholder={field.placeholder} onChange={(event) => { setProfile((current) => ({ ...current, [field.key]: event.target.value.replace(/[^0-9.]/g, '') })); resetResult(); }}/><b>CM</b></div>
        </label>)}</div>
        <fieldset className="av-fit-preference"><legend>HOW SHOULD IT FEEL?</legend><div>{([
          ['close', 'CLOSE', 'Sharper silhouette'], ['regular', 'INTENDED', 'Designer-intended fit'], ['oversized', 'LOOSE', 'More room and drape'],
        ] as const).map(([value, label, detail]) => <label key={value} className={fitPreference === value ? 'active' : ''}><input type="radio" name="fit-preference" value={value} checked={fitPreference === value} onChange={() => { setFitPreference(value); resetResult(); }}/><span><b>{label}</b><small>{detail}</small></span></label>)}</div></fieldset>
        <small className="av-prototype-note">PROTOTYPE FIT LOGIC — RECOMMENDATIONS USE A PROVISIONAL DROP_01 GARMENT CHART UNTIL PRODUCTION TECH-PACK MEASUREMENTS ARE CONNECTED.</small>
      </div>

      <aside className="av-salesperson">
        <div><MessageSquare/><span>AETYVERSE FITTER</span><i className={profileComplete ? 'is-ready' : ''}/></div>
        <p>{!profileComplete
          ? `I NEED ${measurementFields.length - completedMeasurements} MORE MEASUREMENT${measurementFields.length - completedMeasurements === 1 ? '' : 'S'} BEFORE I CAN RECOMMEND A SIZE WITH CONFIDENCE.`
          : !look.length
            ? `YOUR ${fitPreference.toUpperCase()} FIT PROFILE IS READY. ADD A PRODUCT AND I’LL EXPLAIN THE SIZE, EASE AND PROPORTION.`
            : `I’VE MATCHED ${look.length} OBJECT${look.length === 1 ? '' : 'S'} TO YOUR BODY PROFILE. REVIEW MY SIZE NOTES BESIDE EACH PRODUCT.`}</p>
        <div className="av-color-advice"><span><Palette/> COLOR DIRECTION</span><div>{(Object.keys(colorDirections) as ColorDirection[]).map((key) => <button key={key} className={colorDirection === key ? 'active' : ''} onClick={() => setColorDirection(key)} aria-label={colorDirections[key].name}>{colorDirections[key].colors.map((color) => <i key={color} style={{ background: color }}/>)}</button>)}</div><b>{selectedColor.name}</b><small>{selectedColor.advice}</small></div>
      </aside>
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
              const fit = recommendSize(slug, profile, fitPreference);
              return <article key={slug}><b>{fit && profileComplete ? fit.size : String(index + 1).padStart(2, '0')}</b><img src={item.cutout} alt=""/><span>{item.name}</span><button aria-label={`Remove ${item.name}`} onClick={() => removeProduct(slug)}><X/></button></article>;
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
            <p>OBJECT_{item.id}</p><h2>{item.name}</h2>
            {selected && profileComplete && (() => { const fit = recommendations.find((entry) => entry.slug === item.slug)?.result; return fit ? <div className="av-fit-note"><span><Check/> {fit.label} {fit.size}</span><small>{fit.note}</small></div> : null; })()}
            <footer><span>{formatPrice(item.price)}</span><button className={selected ? 'added' : ''} onClick={() => selected ? removeProduct(item.slug) : addProduct(item.slug)} aria-label={`${selected ? 'Remove' : 'Add'} ${item.name}`}>{selected ? <X/> : <Plus/>}</button></footer>
          </article>;
        })}</div>

        <div className="av-generate-panel">
          <div><span>MIRROR INPUT</span><b>{profileComplete ? 'FIT READY' : 'FIT INCOMPLETE'} / {photo ? 'IMAGE_01' : 'NO IMAGE'} / {look.length} OBJECT{look.length === 1 ? '' : 'S'}</b></div>
          <button disabled={!photo || !look.length || !profileComplete || generation === 'generating' || serviceStatus !== 'ready'} onClick={generateLook}>{generation === 'generating' ? <LoaderCircle className="av-spinner"/> : <Sparkles/>} {generation === 'generating' ? 'GENERATING LOOK' : generatedImage ? 'GENERATE AGAIN' : 'GENERATE LOOK'} {generatedImage ? <RotateCcw/> : <ArrowRight/>}</button>
          {generatedImage && <a className="av-download" href={generatedImage} download="aetyverse-look.png"><Download/> DOWNLOAD RESULT <ArrowRight/></a>}
          <p className={generation === 'error' || serviceStatus === 'setup' ? 'is-error' : ''}>{serviceStatus === 'checking' ? 'CHECKING IMAGE ENGINE…' : serviceStatus === 'setup' ? 'ENGINE SETUP REQUIRED — SECURE API KEY NOT CONFIGURED.' : notice || 'UPLOAD AN IMAGE AND ADD AT LEAST ONE OBJECT.'}</p>
          <small>SIZE GUIDANCE IS A PROTOTYPE UNTIL VALIDATED AGAINST PRODUCTION GARMENTS. GENERATED IMAGES VISUALISE THE RECOMMENDATION; THEY DO NOT CALCULATE IT.</small>
        </div>
      </aside>
    </section>
  </main>;
}

export const ChangingRoom = AetyVerse;
