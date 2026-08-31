import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight, X, Plus, Minus, ShoppingBag, Maximize2, Move3d,
} from "lucide-react";

/* ================================================================== *
 *  ÆTY ONE — hoodies, one collection at a time.                       *
 *  Console/boot motif borrowed from thegithubshop.com, translated     *
 *  into dark-luxury material language. Products render as layered    *
 *  volumetric depth cards (parallax tilt + full orbit viewer),        *
 *  carried over from Lattice's spatial-post system.                   *
 * ================================================================== */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,340;9..144,480;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box; margin:0; padding:0;}
.a-root{
  --bone:#EDE7DB; --bone-dim:#C9C0AE; --clay:#B5652D; --clay-dim:#8A4E23;
  --ink:#100D0A; --ink-2:#17130F; --ink-3:#211B15; --line:#332B22; --line-soft:#241E18;
  --umber:#5C4530; --moss:#4A5240;
  font-family:'Inter',sans-serif; background:var(--ink); color:var(--bone);
  -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
.disp{ font-family:'Fraunces',serif; }
.mono{ font-family:'JetBrains Mono',monospace; }
button{ font-family:inherit; color:inherit; cursor:pointer; }

.grain{ position:fixed; inset:0; z-index:200; pointer-events:none; opacity:.05; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.vignette{ position:fixed; inset:0; z-index:199; pointer-events:none; background:radial-gradient(120% 90% at 50% 10%, transparent 55%, rgba(0,0,0,.55) 100%); }

/* ===== top bar ===== */
.bar{ position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between;
  padding:18px 26px; background:rgba(16,13,10,.82); backdrop-filter:blur(14px); border-bottom:1px solid var(--line-soft); }
.mark{ display:flex; align-items:center; gap:10px; font-family:'Fraunces',serif; font-weight:600; font-size:20px; letter-spacing:.01em; }
.navmid{ display:flex; gap:30px; font-size:12.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--bone-dim); }
.navmid button{ background:none; border:none; }
.navmid button:hover{ color:var(--bone); }
.bagbtn{ display:flex; align-items:center; gap:7px; background:none; border:1px solid var(--line); border-radius:999px; padding:8px 14px; font-size:12px; letter-spacing:.03em; }
.bagbtn:hover{ border-color:var(--clay); }
.bagcount{ background:var(--clay); color:var(--ink); width:16px;height:16px;border-radius:50%; font-size:9.5px; display:grid; place-items:center; font-family:'JetBrains Mono',monospace; }

/* ===== boot console hero ===== */
.hero{ min-height:88vh; display:flex; flex-direction:column; justify-content:center; position:relative;
  padding:60px 26px 40px; background:
    radial-gradient(1100px 520px at 80% -10%, rgba(181,101,45,.10), transparent 60%),
    radial-gradient(900px 460px at 10% 110%, rgba(74,82,64,.08), transparent 55%),
    var(--ink); }
.console{ max-width:900px; margin:0 auto; width:100%; }
.consoleline{ font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--moss); display:flex; gap:10px; align-items:baseline; margin-bottom:7px; opacity:0; animation:fadeup .5s ease forwards; }
.consoleline .dim{ color:var(--umber); }
.consoleline .ok{ color:#8FA377; }
.cursor{ display:inline-block; width:8px; height:15px; background:var(--clay); margin-left:2px; animation:blink 1s step-end infinite; vertical-align:-2px; }
@keyframes blink{ 50%{ opacity:0; } }
@keyframes fadeup{ from{ opacity:0; transform:translateY(6px); } to{ opacity:1; transform:translateY(0); } }
.heroh{ font-family:'Fraunces',serif; font-weight:340; font-size:clamp(56px,9.5vw,148px); line-height:.92; letter-spacing:-.02em; margin-top:34px; color:var(--bone); }
.heroh em{ font-style:italic; color:var(--clay); }
.herosub{ display:flex; justify-content:space-between; align-items:center; margin-top:26px; flex-wrap:wrap; gap:18px; border-top:1px solid var(--line); padding-top:22px; }
.herotag{ font-family:'JetBrains Mono',monospace; font-size:11.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--umber); }
.herocta{ display:inline-flex; align-items:center; gap:10px; background:var(--bone); color:var(--ink); border:none; border-radius:999px; padding:15px 26px; font-size:13.5px; font-weight:600; letter-spacing:.02em; text-transform:uppercase; flex:none; }
.herocta:hover{ background:var(--clay); }

/* ===== ticker ===== */
.ticker{ border-top:1px solid var(--line-soft); border-bottom:1px solid var(--line-soft); background:var(--ink-2); overflow:hidden; padding:12px 0; }
.tickinner{ display:flex; gap:48px; white-space:nowrap; animation:scroll 26s linear infinite; }
@keyframes scroll{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
.tickitem{ font-family:'JetBrains Mono',monospace; font-size:11.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--umber); display:flex; align-items:center; gap:14px; }
.tickitem b{ color:var(--bone-dim); font-weight:500; }

/* ===== section shell ===== */
.sect{ padding:90px 26px; max-width:1280px; margin:0 auto; }
.sect-h{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:44px; flex-wrap:wrap; gap:16px; }
.sect-num{ font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--clay); letter-spacing:.1em; text-transform:uppercase; margin-bottom:10px; display:block; }
.sect-title{ font-family:'Fraunces',serif; font-weight:400; font-size:clamp(32px,4.5vw,54px); letter-spacing:-.01em; }
.sect-tag{ font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--umber); letter-spacing:.03em; }

/* ===== product grid + volumetric cards ===== */
.grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--line-soft); border:1px solid var(--line-soft); }
@media(max-width:900px){ .grid{ grid-template-columns:1fr 1fr; } }
@media(max-width:600px){ .grid{ grid-template-columns:1fr; } }
.card{ background:var(--ink); position:relative; overflow:hidden; }
.vol{ aspect-ratio:4/5; position:relative; overflow:hidden; perspective:900px; cursor:pointer; touch-action:pan-y; }
.vlayer{ position:absolute; inset:-8%; will-change:transform; }
.vlayer.mid{ inset:14%; } .vlayer.fg{ inset:32%; }
.voltag{ position:absolute; top:14px; left:14px; z-index:3; font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--bone); background:rgba(16,13,10,.55); backdrop-filter:blur(4px); padding:5px 10px; border-radius:2px; border:1px solid rgba(237,231,219,.14); }
.volidx{ position:absolute; top:14px; right:48px; z-index:3; font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--bone-dim); opacity:.7; }
.volexpand{ position:absolute; top:10px; right:10px; z-index:4; width:30px; height:30px; border-radius:50%; background:rgba(16,13,10,.55); backdrop-filter:blur(4px); border:1px solid rgba(237,231,219,.16); color:var(--bone); display:grid; place-items:center; }
.cardbody{ padding:18px 18px 22px; border-top:1px solid var(--line-soft); }
.cardrow{ display:flex; justify-content:space-between; align-items:baseline; }
.cardname{ font-family:'Fraunces',serif; font-size:19px; font-weight:400; }
.cardprice{ font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--clay); }
.cardmeta{ font-size:12px; color:var(--umber); margin-top:6px; letter-spacing:.02em; }
.swatchrow{ display:flex; gap:6px; margin-top:12px; }
.sw{ width:15px; height:15px; border-radius:50%; border:1px solid rgba(237,231,219,.25); cursor:pointer; }
.sw.on{ box-shadow:0 0 0 2px var(--ink), 0 0 0 3px var(--bone); }

/* ===== orbit viewer ===== */
.orbitwrap{ position:fixed; inset:0; z-index:180; background:rgba(8,6,4,.92); backdrop-filter:blur(8px); display:grid; place-items:center; padding:20px; }
.orbitstage{ width:min(420px,88vw); aspect-ratio:4/5; perspective:1000px; position:relative; cursor:grab; touch-action:none; }
.orbitstage:active{ cursor:grabbing; }
.orbitcube{ position:absolute; inset:0; transform-style:preserve-3d; }
.olayer{ position:absolute; inset:0; } .olayer.mid{ inset:12%; } .olayer.fg{ inset:30%; }
.ohud{ position:absolute; top:-46px; left:0; right:0; display:flex; justify-content:space-between; align-items:center; color:var(--bone); }
.ohud .ot{ font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.04em; color:var(--bone-dim); }
.ohud button{ background:rgba(237,231,219,.08); border:1px solid var(--line); color:var(--bone); width:32px;height:32px;border-radius:50%; display:grid; place-items:center; }
.ohint{ position:absolute; bottom:-38px; left:0; right:0; text-align:center; font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--umber); letter-spacing:.06em; text-transform:uppercase; display:flex; align-items:center; justify-content:center; gap:7px; }

/* ===== lookbook ===== */
.look{ display:grid; grid-template-columns:1.3fr 1fr; gap:1px; background:var(--line-soft); border:1px solid var(--line-soft); }
@media(max-width:800px){ .look{ grid-template-columns:1fr; } }
.lookmain{ aspect-ratio:16/11; position:relative; overflow:hidden; }
.lookside{ display:flex; flex-direction:column; gap:1px; background:var(--line-soft); }
.looksm{ flex:1; position:relative; overflow:hidden; min-height:140px; }
.lookcap{ position:absolute; bottom:16px; left:16px; z-index:2; font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--bone); background:rgba(16,13,10,.5); backdrop-filter:blur(4px); padding:6px 10px; letter-spacing:.04em; }
.stilltone{ position:absolute; inset:0; }

/* ===== craft / palette ===== */
.craftgrid{ display:grid; grid-template-columns:.7fr 1.3fr; gap:64px; align-items:start; }
@media(max-width:820px){ .craftgrid{ grid-template-columns:1fr; gap:34px; } }
.pal-row{ display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--line-soft); }
.pal-sw{ width:20px;height:20px;border-radius:50%; border:1px solid rgba(237,231,219,.2); flex:none; }
.pal-name{ font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--bone-dim); }
.spec-list{ display:flex; flex-direction:column; }
.spec-row{ display:flex; justify-content:space-between; padding:16px 0; border-bottom:1px solid var(--line); gap:20px; }
.spec-row:first-child{ border-top:1px solid var(--line); }
.spec-k{ font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--umber); letter-spacing:.05em; text-transform:uppercase; flex:none; padding-top:2px; }
.spec-v{ font-size:13.5px; color:var(--bone-dim); line-height:1.5; text-align:right; max-width:26em; }

/* ===== terminal spec block ===== */
.termcard{ background:var(--ink-2); border:1px solid var(--line); border-radius:6px; overflow:hidden; }
.termhead{ display:flex; align-items:center; gap:8px; padding:11px 14px; border-bottom:1px solid var(--line); }
.termhead .dot{ width:8px;height:8px;border-radius:50%; }
.termbody{ padding:20px 22px; font-family:'JetBrains Mono',monospace; font-size:12.5px; line-height:1.9; color:var(--bone-dim); }
.termbody .k{ color:var(--clay); }
.termbody .v{ color:var(--bone); }

/* ===== drop / featured ===== */
.dropwrap{ background:var(--ink-3); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.dropinner{ max-width:1280px; margin:0 auto; padding:70px 26px; display:grid; grid-template-columns:1.1fr .9fr; gap:50px; align-items:center; }
@media(max-width:820px){ .dropinner{ grid-template-columns:1fr; } }
.dropstat{ display:flex; gap:28px; flex-wrap:wrap; margin-top:22px; }
.statnum{ font-family:'Fraunces',serif; font-size:44px; font-weight:400; color:var(--clay); line-height:1; }
.statlbl{ font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--umber); text-transform:uppercase; letter-spacing:.08em; margin-top:8px; }
.emailrow{ display:flex; gap:0; margin-top:26px; max-width:420px; border:1px solid var(--line); border-radius:999px; overflow:hidden; }
.emailrow input{ flex:1; background:transparent; border:none; padding:14px 18px; color:var(--bone); font-family:inherit; font-size:13.5px; outline:none; }
.emailrow input::placeholder{ color:var(--umber); }
.emailrow button{ background:var(--bone); color:var(--ink); border:none; padding:0 22px; font-size:12.5px; font-weight:600; letter-spacing:.03em; text-transform:uppercase; }
.emailrow button:hover{ background:var(--clay); }
.miniwrap{ cursor:pointer; }
.minivol{ aspect-ratio:4/5; border-radius:6px; overflow:hidden; position:relative; perspective:700px; border:1px solid var(--line); }
.minicap{ display:flex; justify-content:space-between; margin-top:10px; font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--umber); letter-spacing:.03em; }
.minicap b{ color:var(--bone-dim); font-weight:500; }

/* ===== footer ===== */
.foot{ padding:60px 26px 30px; max-width:1280px; margin:0 auto; }
.footgrid{ display:grid; grid-template-columns:1.4fr repeat(3,.8fr); gap:40px; padding-bottom:44px; border-bottom:1px solid var(--line); }
@media(max-width:760px){ .footgrid{ grid-template-columns:1fr 1fr; } }
.footh{ font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--umber); margin-bottom:14px; }
.footlink{ display:block; font-size:13.5px; color:var(--bone-dim); padding:5px 0; }
.footlink:hover{ color:var(--bone); }
.foottag{ font-size:12.5px; color:var(--umber); margin-top:12px; }
.footbottom{ display:flex; justify-content:space-between; align-items:center; padding-top:22px; flex-wrap:wrap; gap:12px; }
.footbottom .fm{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--umber); letter-spacing:.03em; }

/* ===== PDP drawer ===== */
.scrim{ position:fixed; inset:0; background:rgba(8,6,4,.75); backdrop-filter:blur(4px); z-index:150; display:flex; justify-content:flex-end; }
.drawer{ width:min(560px,100%); height:100%; background:var(--ink); border-left:1px solid var(--line); overflow-y:auto; animation:slidein .32s cubic-bezier(.16,1,.3,1); }
@keyframes slidein{ from{ transform:translateX(40px); opacity:.5; } to{ transform:none; opacity:1; } }
.drawertop{ position:sticky; top:0; display:flex; justify-content:space-between; align-items:center; padding:18px 22px; background:rgba(16,13,10,.9); backdrop-filter:blur(10px); border-bottom:1px solid var(--line-soft); z-index:2; }
.drawerclose{ background:none; border:1px solid var(--line); border-radius:50%; width:34px;height:34px; display:grid; place-items:center; }
.drawervol{ aspect-ratio:4/5; position:relative; overflow:hidden; border-bottom:1px solid var(--line-soft); perspective:900px; cursor:pointer; }
.drawerbody{ padding:26px 26px 56px; }
.drawername{ font-family:'Fraunces',serif; font-size:32px; font-weight:400; letter-spacing:-.01em; }
.drawerprice{ font-family:'JetBrains Mono',monospace; font-size:15px; color:var(--clay); margin-top:8px; }
.drawerdesc{ font-size:13.5px; color:var(--bone-dim); line-height:1.6; margin-top:16px; max-width:34em; }
.optlabel{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--umber); text-transform:uppercase; letter-spacing:.07em; margin:24px 0 12px; }
.sizerow{ display:flex; gap:8px; flex-wrap:wrap; }
.sizebtn{ border:1px solid var(--line); background:none; color:var(--bone-dim); padding:10px 16px; border-radius:4px; font-size:13px; font-family:'JetBrains Mono',monospace; }
.sizebtn.on{ border-color:var(--clay); color:var(--bone); background:rgba(181,101,45,.1); }
.sizebtn:disabled{ opacity:.3; text-decoration:line-through; cursor:default; }
.colorrow{ display:flex; gap:10px; }
.colorbtn{ width:34px;height:34px;border-radius:50%; border:2px solid transparent; position:relative; cursor:pointer; }
.colorbtn.on{ border-color:var(--bone); }
.colorbtn.on:after{ content:""; position:absolute; inset:-5px; border-radius:50%; border:1px solid var(--line); }
.addbtn{ width:100%; margin-top:28px; background:var(--bone); color:var(--ink); border:none; border-radius:999px; padding:16px; font-size:13.5px; font-weight:600; text-transform:uppercase; letter-spacing:.03em; display:flex; align-items:center; justify-content:center; gap:10px; }
.addbtn:hover{ background:var(--clay); }
.accordion{ margin-top:30px; border-top:1px solid var(--line); }
.accitem{ border-bottom:1px solid var(--line); }
.acchead{ width:100%; display:flex; justify-content:space-between; align-items:center; padding:15px 0; background:none; border:none; text-align:left; font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; color:var(--bone-dim); }
.accbody{ padding-bottom:16px; font-size:13px; color:var(--umber); line-height:1.6; max-width:34em; }

@media (prefers-reduced-motion: reduce){ *{ animation:none !important; transition:none !important; } }
`;

/* ---- depth-mapped tone system: bg / mid / fg planes per colorway ---- */
const HEX = { clay:"#8A4E23", bone:"#C9C0AE", umber:"#5C4530", moss:"#4A5240", ink:"#241E18", rust:"#9C5B3C" };
const DEPTH = {
  clay:  { bg:"linear-gradient(155deg,#8A4E23,#4A2E15 65%,#241408)", mid:"radial-gradient(closest-side,rgba(255,190,140,.5),rgba(138,78,35,.1) 70%,transparent)", fg:"radial-gradient(closest-side,rgba(255,225,190,.45),transparent 65%)" },
  umber: { bg:"linear-gradient(155deg,#5C4530,#332417 65%,#180F08)", mid:"radial-gradient(closest-side,rgba(210,170,130,.4),rgba(92,69,48,.1) 70%,transparent)", fg:"radial-gradient(closest-side,rgba(235,210,180,.4),transparent 65%)" },
  moss:  { bg:"linear-gradient(155deg,#4A5240,#2A3024 65%,#151810)", mid:"radial-gradient(closest-side,rgba(180,200,150,.4),rgba(74,82,64,.1) 70%,transparent)", fg:"radial-gradient(closest-side,rgba(215,230,190,.4),transparent 65%)" },
  bone:  { bg:"linear-gradient(155deg,#C9C0AE,#8F8471 65%,#4B4436)", mid:"radial-gradient(closest-side,rgba(255,250,235,.55),rgba(201,192,174,.15) 70%,transparent)", fg:"radial-gradient(closest-side,rgba(255,255,250,.5),transparent 65%)" },
  ink:   { bg:"linear-gradient(155deg,#241E18,#100D0A 65%,#000000)", mid:"radial-gradient(closest-side,rgba(181,101,45,.28),transparent 70%)", fg:"radial-gradient(closest-side,rgba(230,160,100,.22),transparent 65%)" },
  rust:  { bg:"linear-gradient(155deg,#9C5B3C,#5C3220 65%,#241408)", mid:"radial-gradient(closest-side,rgba(255,175,130,.5),rgba(156,91,60,.12) 70%,transparent)", fg:"radial-gradient(closest-side,rgba(255,215,190,.45),transparent 65%)" },
};

const PRODUCTS = [
  { id:"p01", name:"Fieldnote Hoodie", price:"$168", tag:"New", tone:"clay", colors:["clay","umber","ink"], desc:"620gsm brushed fleece, garment-dyed. Dropped shoulder, raw seams." },
  { id:"p02", name:"Ledger Hoodie", price:"$182", tag:"Drop 001", tone:"umber", colors:["umber","bone","moss"], desc:"Structured hood, ledger-stitched pocket. Double-layered peak." },
  { id:"p03", name:"Quarry Hoodie", price:"$168", tag:"New", tone:"moss", colors:["moss","ink","clay"], desc:"14oz loopback cotton, enzyme-washed. Oversized, boxed hem." },
  { id:"p04", name:"Ember Half-Zip", price:"$196", tag:"Limited", tone:"rust", colors:["rust","ink","bone"], desc:"Rust-clay quarter-zip, mock neck. Bonded seams throughout." },
  { id:"p05", name:"Sediment Hoodie", price:"$168", tag:"Drop 001", tone:"bone", colors:["bone","clay","umber"], desc:"Undyed greige base, mineral-washed. Tonal variance by batch." },
  { id:"p06", name:"Basalt Hoodie", price:"$168", tag:"New", tone:"ink", colors:["ink","umber","clay"], desc:"Near-black heather fleece. Debossed hem mark, no branding." },
];

/* ---- volumetric card: pointer-parallax across three depth planes ---- */
function VolCard({ tone, tag, idx, onOpen, onExpand, depth=12 }){
  const ref = useRef(null);
  const [t, setT] = useState({ x:0, y:0 });
  const d = DEPTH[tone] || DEPTH.ink;
  const move = useCallback(e=>{
    const r = ref.current?.getBoundingClientRect(); if(!r) return;
    setT({ x:(e.clientX-r.left)/r.width-.5, y:(e.clientY-r.top)/r.height-.5 });
  },[]);
  return (
    <div ref={ref} className="vol" onPointerMove={move} onPointerLeave={()=>setT({x:0,y:0})} onClick={onOpen}>
      <div className="vlayer" style={{ background:d.bg, transform:`translate(${t.x*-depth}px,${t.y*-depth}px) scale(1.05)` }}/>
      <div className="vlayer mid" style={{ background:d.mid, transform:`translate(${t.x*depth*1.4}px,${t.y*depth*1.4}px)` }}/>
      <div className="vlayer fg" style={{ background:d.fg, transform:`translate(${t.x*depth*2.4}px,${t.y*depth*2.4}px)` }}/>
      {tag && <span className="voltag">{tag}</span>}
      {idx && <span className="volidx mono">{idx}</span>}
      {onExpand && <button className="volexpand" onClick={e=>{ e.stopPropagation(); onExpand(); }} aria-label="Inspect in 3D"><Maximize2 size={13}/></button>}
    </div>
  );
}

/* ---- full orbit viewer: drag to rotate the layered volume ---- */
function OrbitViewer({ product, tone, onClose }){
  const [rot, setRot] = useState({ x:-6, y:10 });
  const drag = useRef(null);
  const d = DEPTH[tone] || DEPTH.ink;
  function down(e){ drag.current = { sx:e.clientX, sy:e.clientY, rx:rot.x, ry:rot.y }; e.currentTarget.setPointerCapture(e.pointerId); }
  function move(e){ if(!drag.current) return; const dx=e.clientX-drag.current.sx, dy=e.clientY-drag.current.sy;
    setRot({ x:Math.max(-30,Math.min(30,drag.current.rx-dy*0.2)), y:drag.current.ry+dx*0.25 }); }
  function up(){ drag.current=null; }
  const Z = 50;
  return (
    <div className="orbitwrap" onClick={onClose}>
      <div className="orbitstage" onClick={e=>e.stopPropagation()} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="ohud">
          <span className="ot">{product}</span>
          <button onClick={onClose} aria-label="Close"><X size={14}/></button>
        </div>
        <div className="orbitcube" style={{ transform:`rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
          <div className="olayer" style={{ background:d.bg, transform:`translateZ(${-Z}px) scale(1.1)` }}/>
          <div className="olayer mid" style={{ background:d.mid }}/>
          <div className="olayer fg" style={{ background:d.fg, transform:`translateZ(${Z}px)` }}/>
        </div>
        <div className="ohint"><Move3d size={12}/> drag to inspect</div>
      </div>
    </div>
  );
}

export default function App(){
  const [drawer, setDrawer] = useState(null);
  const [cart, setCart] = useState(0);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState(null);
  const [openAcc, setOpenAcc] = useState("materials");
  const [orbit, setOrbit] = useState(null); // { product, tone }
  const [now, setNow] = useState(0);

  useEffect(()=>{ const t=setInterval(()=>setNow(n=>n+1),1000); return ()=>clearInterval(t); },[]);

  function openProduct(p){ setDrawer(p); setColor(p.colors[0]); setSize("M"); }
  function addToCart(){ setCart(c=>c+1); setDrawer(null); }

  const bootLines = [
    { t:"æty.sys — init storefront", cls:"" },
    { t:"palette: clay / umber / moss / bone", cls:"dim" },
    { t:"drop_001: OK — 6 pieces indexed", cls:"ok" },
  ];
  const dd = Math.floor(now/86400), hh = 13, mm = 42, ss = now%60;
  const featured = PRODUCTS[1];

  return (
    <div className="a-root">
      <style>{STYLES}</style>
      <div className="grain"/><div className="vignette"/>

      <div className="bar">
        <div className="mark">
          <svg viewBox="0 0 22 22" width="22" height="22"><circle cx="11" cy="11" r="9.5" fill="none" stroke="#B5652D" strokeWidth="1.4"/><path d="M7 14 L11 6 L15 14 M8.6 11 H13.4" stroke="#EDE7DB" strokeWidth="1.3" fill="none"/></svg>
          ÆTY ONE
        </div>
        <nav className="navmid">
          <button>Shop</button><button>Drop 001</button><button>Journal</button><button>About</button>
        </nav>
        <button className="bagbtn"><ShoppingBag size={14}/> Bag {cart>0 && <span className="bagcount">{cart}</span>}</button>
      </div>

      {/* ===== hero ===== */}
      <section className="hero">
        <div className="console">
          {bootLines.map((l,i)=>(
            <div className="consoleline" key={i} style={{ animationDelay:`${i*0.35}s` }}>
              <span className={l.cls}>{l.cls==="ok" ? "✓" : "$"}</span>
              <span className={l.cls}>{l.t}</span>
              {i===bootLines.length-1 && <span className="cursor"/>}
            </div>
          ))}
          <h1 className="heroh">Weight,<br/>worn <em>in.</em></h1>
          <div className="herosub">
            <span className="herotag">DROP 001 — SIX PIECES, NO RESTOCK</span>
            <button className="herocta">Shop Drop 001 <ArrowRight size={16}/></button>
          </div>
        </div>
      </section>

      <div className="ticker">
        <div className="tickinner">
          {[...Array(2)].map((_,r)=>(
            <React.Fragment key={r}>
              <span className="tickitem"><b>620GSM</b> HEAVYWEIGHT FLEECE</span>
              <span className="tickitem">GARMENT-DYED, NOT PRINTED</span>
              <span className="tickitem"><b>DROP 001</b> — SIX PIECES ONLY</span>
              <span className="tickitem">CUT TO ORDER</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ===== shop grid ===== */}
      <section className="sect">
        <div className="sect-h">
          <div><span className="sect-num">// 01</span><h2 className="sect-title">Drop 001</h2></div>
          <span className="sect-tag">06/06 — no restock</span>
        </div>
        <div className="grid">
          {PRODUCTS.map((p,i)=>(
            <div className="card" key={p.id}>
              <VolCard tone={p.tone} tag={p.tag} idx={`0${i+1}`} onOpen={()=>openProduct(p)} onExpand={()=>setOrbit({ product:p.name, tone:p.tone })}/>
              <div className="cardbody">
                <div className="cardrow"><span className="cardname">{p.name}</span><span className="cardprice">{p.price}</span></div>
                <div className="cardmeta">Unisex · 620gsm fleece</div>
                <div className="swatchrow">
                  {p.colors.map(c=>(<span key={c} className="sw" style={{ background:HEX[c] }}/>))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== lookbook ===== */}
      <section className="sect" style={{paddingTop:0}}>
        <div className="sect-h">
          <div><span className="sect-num">// 02</span><h2 className="sect-title">In the field</h2></div>
        </div>
        <div className="look">
          <div className="lookmain"><div className="stilltone" style={{background:DEPTH.clay.bg}}/><span className="lookcap">FIELDNOTE — CLAY</span></div>
          <div className="lookside">
            <div className="looksm"><div className="stilltone" style={{background:DEPTH.umber.bg}}/><span className="lookcap">LEDGER — UMBER</span></div>
            <div className="looksm"><div className="stilltone" style={{background:DEPTH.moss.bg}}/><span className="lookcap">QUARRY — MOSS</span></div>
          </div>
        </div>
      </section>

      {/* ===== craft / palette ===== */}
      <section className="sect">
        <div className="sect-h">
          <div><span className="sect-num">// 03</span><h2 className="sect-title">The standard</h2></div>
        </div>
        <div className="craftgrid">
          <div>
            <span className="sect-num">Palette</span>
            {Object.entries(HEX).map(([name,hex])=>(
              <div className="pal-row" key={name}><span className="pal-sw" style={{background:hex}}/><span className="pal-name mono">{name}</span></div>
            ))}
          </div>
          <div className="spec-list">
            {[
              ["FABRIC","620gsm brushed cotton fleece, garment-dyed"],
              ["FIT","Boxy, dropped shoulder, oversized"],
              ["DYE","Small-batch earth tones — no two identical"],
              ["FINISH","Raw seams, debossed hem, no branding"],
              ["RUN","Fixed at 6 styles — archived on sellout"],
            ].map(([k,v])=>(
              <div className="spec-row" key={k}><span className="spec-k">{k}</span><span className="spec-v">{v}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== terminal spec block ===== */}
      <section className="sect" style={{paddingTop:0}}>
        <div className="termcard">
          <div className="termhead">
            <span className="dot" style={{background:"#8A4E23"}}/><span className="dot" style={{background:"#5C4530"}}/><span className="dot" style={{background:"#4A5240"}}/>
            <span className="mono" style={{fontSize:11.5,color:"var(--umber)",marginLeft:8}}>materials.log</span>
          </div>
          <div className="termbody">
            <div><span className="k">$</span> cat drop_001/spec.yaml</div>
            <div><span className="k">fabric:</span> <span className="v">620gsm cotton fleece</span></div>
            <div><span className="k">dye:</span> <span className="v">garment-dye, small-batch</span></div>
            <div><span className="k">construction:</span> <span className="v">raw-seam, dropped shoulder</span></div>
            <div><span className="k">palette:</span> <span className="v">clay · umber · moss · bone · rust · ink</span></div>
            <div><span className="k">restock:</span> <span className="v">none — archived on sellout</span></div>
          </div>
        </div>
      </section>

      {/* ===== drop counter + featured volumetric ===== */}
      <div className="dropwrap">
        <div className="dropinner">
          <div>
            <span className="sect-num">// 04</span>
            <h2 className="sect-title" style={{marginBottom:0}}>Drop 002 unindexed</h2>
            <div className="dropstat">
              <div><div className="statnum">{String(dd).padStart(2,"0")}</div><div className="statlbl">Days</div></div>
              <div><div className="statnum">{String(hh).padStart(2,"0")}</div><div className="statlbl">Hrs</div></div>
              <div><div className="statnum">{String(mm).padStart(2,"0")}</div><div className="statlbl">Min</div></div>
              <div><div className="statnum">{String(ss).padStart(2,"0")}</div><div className="statlbl">Sec</div></div>
            </div>
            <div className="emailrow"><input placeholder="your@email.com"/><button>Notify</button></div>
          </div>
          <div className="miniwrap" onClick={()=>openProduct(featured)}>
            <div className="minivol"><VolCard tone={featured.tone} idx="02" onOpen={()=>openProduct(featured)} onExpand={()=>setOrbit({ product:featured.name, tone:featured.tone })} depth={8}/></div>
            <div className="minicap"><b>{featured.name}</b><span>{featured.price}</span></div>
          </div>
        </div>
      </div>

      {/* ===== footer ===== */}
      <footer className="foot">
        <div className="footgrid">
          <div>
            <div className="mark" style={{marginBottom:10}}>
              <svg viewBox="0 0 22 22" width="22" height="22"><circle cx="11" cy="11" r="9.5" fill="none" stroke="#B5652D" strokeWidth="1.4"/><path d="M7 14 L11 6 L15 14 M8.6 11 H13.4" stroke="#EDE7DB" strokeWidth="1.3" fill="none"/></svg>
              ÆTY ONE
            </div>
            <p className="foottag">One drop. No filler.</p>
          </div>
          <div><div className="footh">Shop</div><a className="footlink">Drop 001</a><a className="footlink">Archive</a></div>
          <div><div className="footh">About</div><a className="footlink">Materials</a><a className="footlink">Contact</a></div>
          <div><div className="footh">Access</div><a className="footlink">Notify list</a><a className="footlink">Returns</a></div>
        </div>
        <div className="footbottom">
          <span className="fm">© {new Date().getFullYear()} ÆTY ONE</span>
          <span className="fm">ÆTY / ONE — 01 of ∞</span>
        </div>
      </footer>

      {/* ===== PDP drawer ===== */}
      {drawer && (
        <div className="scrim" onClick={()=>setDrawer(null)}>
          <div className="drawer" onClick={e=>e.stopPropagation()}>
            <div className="drawertop">
              <span className="mono" style={{fontSize:12,color:"var(--umber)"}}>{drawer.id.toUpperCase()}</span>
              <button className="drawerclose" onClick={()=>setDrawer(null)}><X size={16}/></button>
            </div>
            <div className="drawervol">
              <VolCard tone={color || drawer.tone} onOpen={()=>setOrbit({ product:drawer.name, tone:color || drawer.tone })} onExpand={()=>setOrbit({ product:drawer.name, tone:color || drawer.tone })} depth={10}/>
            </div>
            <div className="drawerbody">
              <div className="drawername">{drawer.name}</div>
              <div className="drawerprice">{drawer.price}</div>
              <p className="drawerdesc">{drawer.desc}</p>

              <div className="optlabel">Colorway</div>
              <div className="colorrow">
                {drawer.colors.map(c=>(
                  <button key={c} className={"colorbtn"+(color===c?" on":"")} style={{ background:HEX[c] }} onClick={()=>setColor(c)} aria-label={c}/>
                ))}
              </div>

              <div className="optlabel">Size</div>
              <div className="sizerow">
                {["XS","S","M","L","XL","XXL"].map(s=>(
                  <button key={s} className={"sizebtn"+(size===s?" on":"")} disabled={s==="XS"} onClick={()=>setSize(s)}>{s}</button>
                ))}
              </div>

              <button className="addbtn" onClick={addToCart}><ShoppingBag size={15}/> Add to bag — {drawer.price}</button>

              <div className="accordion">
                {[
                  ["materials","Materials","620gsm brushed cotton fleece, garment-dyed. Cold wash, hang dry."],
                  ["fit","Fit","Oversized by design. True to size for relaxed drape, size down for slim."],
                  ["shipping","Shipping","Cut-to-order, ships in 5–7 days. Final sale — no restock."],
                ].map(([k,t,b])=>(
                  <div className="accitem" key={k}>
                    <button className="acchead" onClick={()=>setOpenAcc(o=>o===k?null:k)}>{t}{openAcc===k ? <Minus size={14}/> : <Plus size={14}/>}</button>
                    {openAcc===k && <div className="accbody">{b}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {orbit && <OrbitViewer product={orbit.product} tone={orbit.tone} onClose={()=>setOrbit(null)}/>}
    </div>
  );
}
