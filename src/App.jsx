import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ArrowRight, X, Plus, Minus, ShoppingBag, Maximize2, Move3d, Search,
  Heart, Trash2, SlidersHorizontal, Check,
} from "lucide-react";

/* ================================================================== *
 *  ÆTY ONE — hoodies, one collection at a time.                       *
 *  Real product photography, rendered as volumetric tilt cards with   *
 *  a full drag-to-orbit viewer (carried over from Lattice's spatial   *
 *  post system). Console/boot motif referenced from                   *
 *  thegithubshop.com. Dark-luxury earth tones over a faint space      *
 *  backdrop — cosmic depth behind the material, not on top of it.     *
 * ================================================================== */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,340;9..144,480;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box; margin:0; padding:0;}
html,body{ background:#100D0A; }
.a-root{
  --bone:#EDE7DB; --bone-dim:#C9C0AE; --clay:#B5652D; --clay-dim:#8A4E23;
  --ink:#100D0A; --ink-2:#17130F; --ink-3:#211B15; --line:#332B22; --line-soft:#241E18;
  --umber:#5C4530; --moss:#4A5240; --panel-light:#D8D2C3; --urgent:#C1503A;
  font-family:'Inter',sans-serif; color:var(--bone); position:relative;
  -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
.disp{ font-family:'Fraunces',serif; }
.mono{ font-family:'JetBrains Mono',monospace; }
button{ font-family:inherit; color:inherit; cursor:pointer; }
input{ font-family:inherit; }

/* ===== space backdrop — fixed behind everything ===== */
.spacebg{ position:fixed; inset:0; z-index:-2; background:var(--ink); overflow:hidden; }
.spacebg .stars{ position:absolute; inset:-10%; opacity:.55;
  background-image:
    radial-gradient(1px 1px at 8% 22%, rgba(237,231,219,.7), transparent),
    radial-gradient(1px 1px at 22% 68%, rgba(237,231,219,.5), transparent),
    radial-gradient(1.5px 1.5px at 38% 12%, rgba(237,231,219,.6), transparent),
    radial-gradient(1px 1px at 54% 78%, rgba(237,231,219,.4), transparent),
    radial-gradient(1px 1px at 68% 34%, rgba(237,231,219,.55), transparent),
    radial-gradient(1.5px 1.5px at 81% 58%, rgba(237,231,219,.45), transparent),
    radial-gradient(1px 1px at 91% 20%, rgba(237,231,219,.6), transparent),
    radial-gradient(1px 1px at 14% 88%, rgba(237,231,219,.4), transparent),
    radial-gradient(1px 1px at 63% 92%, rgba(237,231,219,.35), transparent); }
.spacebg .neb{ position:absolute; width:64vmax; height:64vmax; border-radius:50%; filter:blur(110px); }
.spacebg .neb.a{ background:#5C4530; opacity:.16; top:-28vmax; left:-16vmax; }
.spacebg .neb.b{ background:#4A5240; opacity:.13; bottom:-26vmax; right:-18vmax; }
.spacebg .neb.c{ background:#33305C; opacity:.14; top:14vmax; right:-24vmax; }

.grain{ position:fixed; inset:0; z-index:200; pointer-events:none; opacity:.05; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.vignette{ position:fixed; inset:0; z-index:199; pointer-events:none; background:radial-gradient(120% 90% at 50% 10%, transparent 55%, rgba(0,0,0,.55) 100%); }

/* ===== promo bar + top bar ===== */
.promo{ text-align:center; padding:8px 10px; font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--bone-dim); background:var(--ink-2); border-bottom:1px solid var(--line-soft); }
.bar{ position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; gap:14px;
  padding:16px 26px; background:rgba(16,13,10,.82); backdrop-filter:blur(14px); border-bottom:1px solid var(--line-soft); }
.mark{ display:flex; align-items:center; gap:10px; font-family:'Fraunces',serif; font-weight:600; font-size:20px; letter-spacing:.01em; flex:none; }
.navmid{ display:flex; gap:28px; font-size:12.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--bone-dim); }
.navmid button{ background:none; border:none; }
.navmid button:hover{ color:var(--bone); }
.navr{ display:flex; align-items:center; gap:10px; }
.iconbtn{ position:relative; background:none; border:1px solid var(--line); border-radius:50%; width:36px;height:36px; display:grid; place-items:center; }
.iconbtn:hover{ border-color:var(--clay); }
.iconbtn .dot{ position:absolute; top:-4px; right:-4px; background:var(--clay); color:var(--ink); width:16px;height:16px;border-radius:50%; font-size:9.5px; display:grid; place-items:center; font-family:'JetBrains Mono',monospace; }
.iconbtn.active{ border-color:var(--clay); color:var(--clay); }
.searchwrap{ display:flex; align-items:center; background:var(--ink-2); border:1px solid var(--line); border-radius:999px; overflow:hidden; transition:width .2s; }
.searchwrap input{ background:none; border:none; outline:none; color:var(--bone); font-size:12.5px; padding:8px 4px 8px 12px; width:150px; }
.searchwrap input::placeholder{ color:var(--umber); }
.searchwrap button{ background:none; border:none; padding:8px 12px; color:var(--bone-dim); }

/* ===== boot console hero ===== */
.hero{ min-height:82vh; display:flex; flex-direction:column; justify-content:center; position:relative; padding:56px 26px 40px; }
.console{ max-width:900px; margin:0 auto; width:100%; }
.consoleline{ font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--moss); display:flex; gap:10px; align-items:baseline; margin-bottom:7px; opacity:0; animation:fadeup .5s ease forwards; }
.consoleline .dim{ color:var(--umber); }
.consoleline .ok{ color:#8FA377; }
.cursor{ display:inline-block; width:8px; height:15px; background:var(--clay); margin-left:2px; animation:blink 1s step-end infinite; vertical-align:-2px; }
@keyframes blink{ 50%{ opacity:0; } }
@keyframes fadeup{ from{ opacity:0; transform:translateY(6px); } to{ opacity:1; transform:translateY(0); } }
.heroh{ font-family:'Fraunces',serif; font-weight:340; font-size:clamp(52px,9vw,140px); line-height:.92; letter-spacing:-.02em; margin-top:30px; color:var(--bone); }
.heroh em{ font-style:italic; color:var(--clay); }
.herosub{ display:flex; justify-content:space-between; align-items:center; margin-top:24px; flex-wrap:wrap; gap:18px; border-top:1px solid var(--line); padding-top:20px; }
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
.sect{ padding:80px 26px; max-width:1280px; margin:0 auto; }
.sect-h{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:36px; flex-wrap:wrap; gap:16px; }
.sect-num{ font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--clay); letter-spacing:.1em; text-transform:uppercase; margin-bottom:10px; display:block; }
.sect-title{ font-family:'Fraunces',serif; font-weight:400; font-size:clamp(30px,4.2vw,50px); letter-spacing:-.01em; }
.sect-tag{ font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--umber); letter-spacing:.03em; }

/* ===== toolbar: sort ===== */
.toolbar{ display:flex; justify-content:flex-end; align-items:center; gap:10px; margin-bottom:20px; }
.sortsel{ display:flex; align-items:center; gap:7px; background:var(--ink-2); border:1px solid var(--line); border-radius:999px; padding:8px 14px; font-size:11.5px; }
.sortsel select{ background:none; border:none; color:var(--bone); font-family:'JetBrains Mono',monospace; font-size:11.5px; outline:none; }
.sortsel select option{ background:var(--ink-2); }
.clearbtn{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--clay); background:none; border:none; text-decoration:underline; }

/* ===== product grid + volumetric cards ===== */
.grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--line-soft); border:1px solid var(--line-soft); }
@media(max-width:900px){ .grid{ grid-template-columns:1fr 1fr; } }
@media(max-width:600px){ .grid{ grid-template-columns:1fr; } }
.card{ position:relative; overflow:hidden; }
.vol{ aspect-ratio:4/5; position:relative; overflow:hidden; perspective:1000px; cursor:pointer; touch-action:pan-y; }
.volstage{ position:absolute; inset:0; transform-style:preserve-3d; transition:transform .12s ease-out; }
.volimg{ width:100%; height:100%; object-fit:contain; display:block; user-select:none; -webkit-user-drag:none; }
.volsheen{ position:absolute; inset:-20%; pointer-events:none; mix-blend-mode:screen; }
.voltag{ position:absolute; top:14px; left:14px; z-index:3; font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--bone); background:rgba(16,13,10,.6); backdrop-filter:blur(4px); padding:5px 10px; border-radius:2px; border:1px solid rgba(237,231,219,.14); }
.volstock{ position:absolute; top:44px; left:14px; z-index:3; font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:.05em; text-transform:uppercase; color:#F0B7A6; background:rgba(193,80,58,.16); border:1px solid rgba(193,80,58,.4); padding:4px 9px; border-radius:2px; }
.volidx{ position:absolute; bottom:14px; left:14px; z-index:3; font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--bone-dim); opacity:.75; }
.volexpand{ position:absolute; top:10px; right:44px; z-index:4; width:30px; height:30px; border-radius:50%; background:rgba(16,13,10,.55); backdrop-filter:blur(4px); border:1px solid rgba(237,231,219,.16); color:var(--bone); display:grid; place-items:center; }
.volheart{ position:absolute; top:10px; right:10px; z-index:4; width:30px; height:30px; border-radius:50%; background:rgba(16,13,10,.55); backdrop-filter:blur(4px); border:1px solid rgba(237,231,219,.16); color:var(--bone); display:grid; place-items:center; }
.volheart.on{ color:var(--urgent); border-color:rgba(193,80,58,.5); }
.cardbody{ padding:16px 18px 20px; border-top:1px solid var(--line-soft); background:var(--ink); }
.cardrow{ display:flex; justify-content:space-between; align-items:baseline; }
.cardname{ font-family:'Fraunces',serif; font-size:18px; font-weight:400; }
.cardprice{ font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--clay); }
.cardmeta{ font-size:12px; color:var(--umber); margin-top:6px; letter-spacing:.02em; }
.emptygrid{ padding:60px 20px; text-align:center; color:var(--umber); font-family:'JetBrains Mono',monospace; font-size:13px; grid-column:1/-1; }

/* ===== orbit viewer ===== */
.orbitwrap{ position:fixed; inset:0; z-index:180; background:rgba(8,6,4,.92); backdrop-filter:blur(8px); display:grid; place-items:center; padding:20px; }
.orbitstage{ width:min(420px,88vw); aspect-ratio:4/5; perspective:1100px; position:relative; cursor:grab; touch-action:none; }
.orbitstage:active{ cursor:grabbing; }
.orbitcube{ position:absolute; inset:0; transform-style:preserve-3d; }
.oimg{ position:absolute; inset:0; width:100%; height:100%; object-fit:contain; user-select:none; -webkit-user-drag:none; }
.osheen{ position:absolute; inset:-20%; pointer-events:none; mix-blend-mode:screen; }
.ohud{ position:absolute; top:-46px; left:0; right:0; display:flex; justify-content:space-between; align-items:center; color:var(--bone); }
.ohud .ot{ font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.04em; color:var(--bone-dim); }
.ohud button{ background:rgba(237,231,219,.08); border:1px solid var(--line); color:var(--bone); width:32px;height:32px;border-radius:50%; display:grid; place-items:center; }
.ohint{ position:absolute; bottom:-38px; left:0; right:0; text-align:center; font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--umber); letter-spacing:.06em; text-transform:uppercase; display:flex; align-items:center; justify-content:center; gap:7px; }

/* ===== lookbook ===== */
.look{ display:grid; grid-template-columns:1.3fr 1fr; gap:1px; background:var(--line-soft); border:1px solid var(--line-soft); }
@media(max-width:800px){ .look{ grid-template-columns:1fr; } }
.lookmain{ aspect-ratio:16/11; position:relative; overflow:hidden; background:var(--ink-2); }
.lookside{ display:flex; flex-direction:column; gap:1px; background:var(--line-soft); }
.looksm{ flex:1; position:relative; overflow:hidden; min-height:140px; background:var(--ink-2); }
.lookimg{ width:100%; height:100%; object-fit:cover; }
.lookcap{ position:absolute; bottom:16px; left:16px; z-index:2; font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--bone); background:rgba(16,13,10,.5); backdrop-filter:blur(4px); padding:6px 10px; letter-spacing:.04em; }

/* ===== craft / index ===== */
.craftgrid{ display:grid; grid-template-columns:.7fr 1.3fr; gap:64px; align-items:start; }
@media(max-width:820px){ .craftgrid{ grid-template-columns:1fr; gap:34px; } }
.idx-row{ display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--line-soft); cursor:pointer; background:none; border-left:none; border-right:none; border-top:none; width:100%; text-align:left; }
.idx-dot{ width:10px;height:10px;border-radius:50%; flex:none; }
.idx-name{ font-size:12.5px; letter-spacing:.03em; color:var(--bone-dim); }
.idx-name:hover{ color:var(--bone); }
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
.dropinner{ max-width:1280px; margin:0 auto; padding:64px 26px; display:grid; grid-template-columns:1.1fr .9fr; gap:50px; align-items:center; }
@media(max-width:820px){ .dropinner{ grid-template-columns:1fr; } }
.dropstat{ display:flex; gap:28px; flex-wrap:wrap; margin-top:22px; }
.statnum{ font-family:'Fraunces',serif; font-size:44px; font-weight:400; color:var(--clay); line-height:1; }
.statlbl{ font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--umber); text-transform:uppercase; letter-spacing:.08em; margin-top:8px; }
.emailrow{ display:flex; gap:0; margin-top:26px; max-width:420px; border:1px solid var(--line); border-radius:999px; overflow:hidden; }
.emailrow input{ flex:1; background:transparent; border:none; padding:14px 18px; color:var(--bone); font-size:13.5px; outline:none; }
.emailrow input::placeholder{ color:var(--umber); }
.emailrow button{ background:var(--bone); color:var(--ink); border:none; padding:0 22px; font-size:12.5px; font-weight:600; letter-spacing:.03em; text-transform:uppercase; }
.emailrow button:hover{ background:var(--clay); }
.miniwrap{ cursor:pointer; }
.minivol{ aspect-ratio:4/5; border-radius:6px; overflow:hidden; position:relative; perspective:900px; border:1px solid var(--line); background:var(--ink-2); }
.minicap{ display:flex; justify-content:space-between; margin-top:10px; font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--umber); letter-spacing:.03em; }
.minicap b{ color:var(--bone-dim); font-weight:500; }

/* ===== footer ===== */
.foot{ padding:56px 26px 30px; max-width:1280px; margin:0 auto; }
.footgrid{ display:grid; grid-template-columns:1.4fr repeat(3,.8fr); gap:40px; padding-bottom:40px; border-bottom:1px solid var(--line); }
@media(max-width:760px){ .footgrid{ grid-template-columns:1fr 1fr; } }
.footh{ font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--umber); margin-bottom:14px; }
.footlink{ display:block; font-size:13.5px; color:var(--bone-dim); padding:5px 0; background:none; border:none; text-align:left; }
.footlink:hover{ color:var(--bone); }
.foottag{ font-size:12.5px; color:var(--umber); margin-top:12px; }
.footbottom{ display:flex; justify-content:space-between; align-items:center; padding-top:20px; flex-wrap:wrap; gap:12px; }
.footbottom .fm{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--umber); letter-spacing:.03em; }

/* ===== PDP drawer ===== */
.scrim{ position:fixed; inset:0; background:rgba(8,6,4,.75); backdrop-filter:blur(4px); z-index:150; display:flex; justify-content:flex-end; }
.drawer{ width:min(560px,100%); height:100%; background:var(--ink); border-left:1px solid var(--line); overflow-y:auto; animation:slidein .32s cubic-bezier(.16,1,.3,1); }
@keyframes slidein{ from{ transform:translateX(40px); opacity:.5; } to{ transform:none; opacity:1; } }
.drawertop{ position:sticky; top:0; display:flex; justify-content:space-between; align-items:center; padding:18px 22px; background:rgba(16,13,10,.9); backdrop-filter:blur(10px); border-bottom:1px solid var(--line-soft); z-index:2; }
.drawerclose{ background:none; border:1px solid var(--line); border-radius:50%; width:34px;height:34px; display:grid; place-items:center; }
.drawervol{ aspect-ratio:4/5; position:relative; overflow:hidden; border-bottom:1px solid var(--line-soft); perspective:1000px; cursor:pointer; }
.drawerbody{ padding:24px 26px 50px; }
.drawername{ font-family:'Fraunces',serif; font-size:30px; font-weight:400; letter-spacing:-.01em; }
.drawerprice{ font-family:'JetBrains Mono',monospace; font-size:15px; color:var(--clay); margin-top:8px; }
.drawerdesc{ font-size:13.5px; color:var(--bone-dim); line-height:1.6; margin-top:14px; max-width:34em; }
.optlabel{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--umber); text-transform:uppercase; letter-spacing:.07em; margin:22px 0 12px; }
.sizerow{ display:flex; gap:8px; flex-wrap:wrap; }
.sizebtn{ border:1px solid var(--line); background:none; color:var(--bone-dim); padding:10px 16px; border-radius:4px; font-size:13px; font-family:'JetBrains Mono',monospace; }
.sizebtn.on{ border-color:var(--clay); color:var(--bone); background:rgba(181,101,45,.1); }
.sizebtn:disabled{ opacity:.3; text-decoration:line-through; cursor:default; }
.addrow{ display:flex; gap:10px; margin-top:26px; }
.addbtn{ flex:1; background:var(--bone); color:var(--ink); border:none; border-radius:999px; padding:15px; font-size:13.5px; font-weight:600; text-transform:uppercase; letter-spacing:.03em; display:flex; align-items:center; justify-content:center; gap:10px; }
.addbtn:hover{ background:var(--clay); }
.wishbtn2{ width:50px; border:1px solid var(--line); border-radius:999px; background:none; color:var(--bone-dim); display:grid; place-items:center; }
.wishbtn2.on{ color:var(--urgent); border-color:rgba(193,80,58,.5); }
.accordion{ margin-top:26px; border-top:1px solid var(--line); }
.accitem{ border-bottom:1px solid var(--line); }
.acchead{ width:100%; display:flex; justify-content:space-between; align-items:center; padding:15px 0; background:none; border:none; text-align:left; font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; color:var(--bone-dim); }
.accbody{ padding-bottom:16px; font-size:13px; color:var(--umber); line-height:1.6; max-width:34em; }
.relwrap{ margin-top:34px; }
.rellbl{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--umber); text-transform:uppercase; letter-spacing:.07em; margin-bottom:12px; }
.relrow{ display:flex; gap:10px; }
.relcard{ flex:1; cursor:pointer; }
.relimg{ aspect-ratio:4/5; border-radius:4px; overflow:hidden; background:var(--ink-2); border:1px solid var(--line-soft); }
.relimg img{ width:100%;height:100%;object-fit:contain; }
.relname{ font-size:11px; color:var(--bone-dim); margin-top:6px; }
.relprice{ font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--clay); }

/* ===== cart drawer ===== */
.cartempty{ padding:60px 26px; text-align:center; color:var(--umber); font-family:'JetBrains Mono',monospace; font-size:13px; }
.cartitem{ display:flex; gap:14px; padding:16px 0; border-bottom:1px solid var(--line-soft); }
.cartimg{ width:76px; height:92px; border-radius:4px; overflow:hidden; background:var(--ink-2); flex:none; border:1px solid var(--line-soft); }
.cartimg img{ width:100%;height:100%;object-fit:contain; }
.cartinfo{ flex:1; display:flex; flex-direction:column; }
.cartname{ font-family:'Fraunces',serif; font-size:15.5px; }
.cartmeta{ font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--umber); margin-top:3px; }
.cartbot{ display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:8px; }
.qtystep{ display:flex; align-items:center; gap:0; border:1px solid var(--line); border-radius:999px; overflow:hidden; }
.qtystep button{ background:none; border:none; color:var(--bone-dim); width:26px;height:26px; display:grid; place-items:center; }
.qtystep span{ font-family:'JetBrains Mono',monospace; font-size:12px; width:22px; text-align:center; }
.cartprice2{ font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--clay); }
.cartrm{ background:none; border:none; color:var(--umber); }
.cartfoot{ position:sticky; bottom:0; background:rgba(16,13,10,.94); backdrop-filter:blur(10px); border-top:1px solid var(--line-soft); padding:20px 26px calc(20px + env(safe-area-inset-bottom)); }
.subrow{ display:flex; justify-content:space-between; font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--bone-dim); margin-bottom:14px; }
.subrow b{ color:var(--bone); font-size:16px; }
.checkoutbtn{ width:100%; background:var(--bone); color:var(--ink); border:none; border-radius:999px; padding:15px; font-size:13.5px; font-weight:600; text-transform:uppercase; letter-spacing:.03em; }
.checkoutbtn:hover{ background:var(--clay); }
.checkoutnote{ text-align:center; font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--umber); margin-top:10px; }

@media (prefers-reduced-motion: reduce){ *{ animation:none !important; transition:none !important; } }
`;

/* ---- product data — six real prints ---- */
const PRODUCTS = [
  { id:"p01", name:"Ronin Hoodie", price:178, tag:"New", stock:"Only 4 left", image:"/products/ronin.png", accent:"#B5482F", base:"Black", desc:"Blood-moon print, cherry-blossom sleeves. 620gsm fleece, dropped shoulder." },
  { id:"p02", name:"Senbazuru Hoodie", price:172, tag:"Drop 001", stock:null, image:"/products/senbazuru.png", accent:"#A23B2E", base:"Black", desc:"Origami crane over a torn-paper sun. Raw seams, boxed hem." },
  { id:"p03", name:"Transit Hoodie", price:168, tag:"New", stock:"Only 2 left", image:"/products/transit.png", accent:"#C1503A", base:"Bone", desc:"Line-art metro graphic, single red diagonal. Oversized fit." },
  { id:"p04", name:"Flight Path Hoodie", price:158, tag:"Drop 001", stock:null, image:"/products/flightpath.png", accent:"#C9C0AE", base:"Black", desc:"Minimal embroidered flight line. Clean, no back print." },
  { id:"p05", name:"Marble Tide Hoodie", price:196, tag:"Limited", stock:"Only 3 left", image:"/products/marbletide.png", accent:"#3B5A78", base:"Bone", desc:"Indigo marble wash, utility chest pocket. Heavyweight cotton." },
  { id:"p06", name:"Orbit Hoodie", price:188, tag:"New", stock:null, image:"/products/orbit.png", accent:"#5A4E9C", base:"Black", desc:"Topographic starfield with a galaxy stripe. Shot under the dome." },
];
const PANEL = { p01:"dark", p02:"dark", p03:"dark", p04:"light", p05:"light", p06:"dark" };

/* ---- volumetric card: pointer-parallax tilt + moving sheen on real photography ---- */
function VolCard({ product, idx, wished, onOpen, onExpand, onWish, depth=8 }){
  const ref = useRef(null);
  const [t, setT] = useState({ x:0, y:0 });
  const panel = PANEL[product.id] === "light" ? "var(--panel-light)" : "var(--ink-2)";
  const move = useCallback(e=>{
    const r = ref.current?.getBoundingClientRect(); if(!r) return;
    setT({ x:(e.clientX-r.left)/r.width-.5, y:(e.clientY-r.top)/r.height-.5 });
  },[]);
  return (
    <div ref={ref} className="vol" style={{ background:panel }} onPointerMove={move} onPointerLeave={()=>setT({x:0,y:0})} onClick={onOpen}>
      <div className="volstage" style={{ transform:`rotateX(${-t.y*depth}deg) rotateY(${t.x*depth}deg) scale(1.02)` }}>
        <img src={product.image} alt={product.name} className="volimg" draggable={false}/>
        <div className="volsheen" style={{ background:`linear-gradient(115deg, transparent 38%, ${product.accent}30 50%, transparent 62%)`, transform:`translate(${t.x*24}px,${t.y*24}px)` }}/>
      </div>
      {product.tag && <span className="voltag">{product.tag}</span>}
      {product.stock && <span className="volstock">{product.stock}</span>}
      {idx && <span className="volidx mono">{idx}</span>}
      {onWish && <button className={"volheart"+(wished?" on":"")} onClick={e=>{ e.stopPropagation(); onWish(); }} aria-label="Wishlist"><Heart size={13} fill={wished?"currentColor":"none"}/></button>}
      {onExpand && <button className="volexpand" onClick={e=>{ e.stopPropagation(); onExpand(); }} aria-label="Inspect in 3D"><Maximize2 size={13}/></button>}
    </div>
  );
}

/* ---- full orbit viewer: drag to rotate the real photo in 3D space ---- */
function OrbitViewer({ product, onClose }){
  const [rot, setRot] = useState({ x:-5, y:8 });
  const drag = useRef(null);
  function down(e){ drag.current = { sx:e.clientX, sy:e.clientY, rx:rot.x, ry:rot.y }; e.currentTarget.setPointerCapture(e.pointerId); }
  function move(e){ if(!drag.current) return; const dx=e.clientX-drag.current.sx, dy=e.clientY-drag.current.sy;
    setRot({ x:Math.max(-25,Math.min(25,drag.current.rx-dy*0.18)), y:drag.current.ry+dx*0.22 }); }
  function up(){ drag.current=null; }
  return (
    <div className="orbitwrap" onClick={onClose}>
      <div className="orbitstage" onClick={e=>e.stopPropagation()} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="ohud"><span className="ot">{product.name}</span><button onClick={onClose} aria-label="Close"><X size={14}/></button></div>
        <div className="orbitcube" style={{ transform:`rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
          <img src={product.image} alt={product.name} className="oimg" draggable={false}/>
          <div className="osheen" style={{ background:`linear-gradient(115deg, transparent 38%, ${product.accent}35 50%, transparent 62%)` }}/>
        </div>
        <div className="ohint"><Move3d size={12}/> drag to inspect</div>
      </div>
    </div>
  );
}

export default function App(){
  const [drawer, setDrawer] = useState(null);
  const [orbit, setOrbit] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [wishOnly, setWishOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [size, setSize] = useState("M");
  const [openAcc, setOpenAcc] = useState("materials");
  const [now, setNow] = useState(0);
  const [checkoutMsg, setCheckoutMsg] = useState(false);

  useEffect(()=>{ const t=setInterval(()=>setNow(n=>n+1),1000); return ()=>clearInterval(t); },[]);

  function openProduct(p){ setDrawer(p); setSize("M"); setOpenAcc("materials"); }
  function toggleWish(id){ setWishlist(w => w.includes(id) ? w.filter(x=>x!==id) : [...w, id]); }
  function addToCart(){
    setCart(c=>{
      const i = c.findIndex(x=>x.id===drawer.id && x.size===size);
      if(i>-1){ const n=[...c]; n[i]={...n[i],qty:n[i].qty+1}; return n; }
      return [...c, { id:drawer.id, name:drawer.name, price:drawer.price, image:drawer.image, size, qty:1 }];
    });
    setDrawer(null); setCartOpen(true); setCheckoutMsg(false);
  }
  function updateQty(id,size,delta){ setCart(c=>c.map(it=> it.id===id&&it.size===size ? {...it, qty:Math.max(1,it.qty+delta)} : it).filter(it=>it.qty>0)); }
  function removeItem(id,size){ setCart(c=>c.filter(it=>!(it.id===id&&it.size===size))); }

  const cartCount = cart.reduce((a,c)=>a+c.qty,0);
  const cartTotal = cart.reduce((a,c)=>a+c.price*c.qty,0);

  const displayed = useMemo(()=>{
    let list = PRODUCTS.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
    if(wishOnly) list = list.filter(p=>wishlist.includes(p.id));
    if(sortBy==="low") list = [...list].sort((a,b)=>a.price-b.price);
    if(sortBy==="high") list = [...list].sort((a,b)=>b.price-a.price);
    return list;
  },[search, wishOnly, wishlist, sortBy]);

  const bootLines = [
    { t:"æty.sys — init storefront", cls:"" },
    { t:"drop_001: OK — 6 pieces indexed", cls:"ok" },
  ];
  const dd = Math.floor(now/86400), hh = 13, mm = 42, ss = now%60;
  const featured = PRODUCTS[5]; // Orbit — anchors the space theme
  const related = drawer ? PRODUCTS.filter(p=>p.id!==drawer.id).slice(0,3) : [];

  return (
    <div className="a-root">
      <style>{STYLES}</style>
      <div className="spacebg"><div className="stars"/><div className="neb a"/><div className="neb b"/><div className="neb c"/></div>
      <div className="grain"/><div className="vignette"/>

      <div className="promo">FREE SHIPPING OVER $200 · CUT TO ORDER · FINAL SALE, NO RESTOCK</div>

      <div className="bar">
        <div className="mark">
          <svg viewBox="0 0 22 22" width="22" height="22"><circle cx="11" cy="11" r="9.5" fill="none" stroke="#B5652D" strokeWidth="1.4"/><path d="M7 14 L11 6 L15 14 M8.6 11 H13.4" stroke="#EDE7DB" strokeWidth="1.3" fill="none"/></svg>
          ÆTY ONE
        </div>
        <nav className="navmid">
          <button>Shop</button><button>Drop 001</button><button>Journal</button><button>About</button>
        </nav>
        <div className="navr">
          {searchOpen ? (
            <div className="searchwrap">
              <input autoFocus placeholder="Search designs…" value={search} onChange={e=>setSearch(e.target.value)}/>
              <button onClick={()=>{ setSearchOpen(false); setSearch(""); }}><X size={14}/></button>
            </div>
          ) : (
            <button className="iconbtn" onClick={()=>setSearchOpen(true)} aria-label="Search"><Search size={15}/></button>
          )}
          <button className={"iconbtn"+(wishOnly?" active":"")} onClick={()=>setWishOnly(w=>!w)} aria-label="Wishlist">
            <Heart size={15} fill={wishOnly?"currentColor":"none"}/>
            {wishlist.length>0 && <span className="dot">{wishlist.length}</span>}
          </button>
          <button className="iconbtn" onClick={()=>setCartOpen(true)} aria-label="Bag">
            <ShoppingBag size={15}/>
            {cartCount>0 && <span className="dot">{cartCount}</span>}
          </button>
        </div>
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
            <button className="herocta" onClick={()=>document.getElementById("shop")?.scrollIntoView({behavior:"smooth"})}>Shop Drop 001 <ArrowRight size={16}/></button>
          </div>
        </div>
      </section>

      <div className="ticker">
        <div className="tickinner">
          {[...Array(2)].map((_,r)=>(
            <React.Fragment key={r}>
              <span className="tickitem"><b>620GSM</b> HEAVYWEIGHT FLEECE</span>
              <span className="tickitem">SIX ORIGINAL PRINTS</span>
              <span className="tickitem"><b>DROP 001</b> — SIX PIECES ONLY</span>
              <span className="tickitem">CUT TO ORDER</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ===== shop grid ===== */}
      <section className="sect" id="shop">
        <div className="sect-h">
          <div><span className="sect-num">// 01</span><h2 className="sect-title">Drop 001</h2></div>
          <span className="sect-tag">{displayed.length}/06{wishOnly?" — wishlist":""}{search?` — “${search}”`:""}</span>
        </div>
        <div className="toolbar">
          {(wishOnly || search) && <button className="clearbtn" onClick={()=>{ setWishOnly(false); setSearch(""); }}>Clear filters</button>}
          <div className="sortsel">
            <SlidersHorizontal size={12}/>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="low">Price: Low–High</option>
              <option value="high">Price: High–Low</option>
            </select>
          </div>
        </div>
        <div className="grid">
          {displayed.length===0 && <div className="emptygrid">No pieces match — try clearing filters.</div>}
          {displayed.map((p)=>{
            const i = PRODUCTS.findIndex(x=>x.id===p.id);
            return (
              <div className="card" key={p.id}>
                <VolCard product={p} idx={`0${i+1}`} wished={wishlist.includes(p.id)}
                  onOpen={()=>openProduct(p)} onExpand={()=>setOrbit(p)} onWish={()=>toggleWish(p.id)}/>
                <div className="cardbody">
                  <div className="cardrow"><span className="cardname">{p.name}</span><span className="cardprice">${p.price}</span></div>
                  <div className="cardmeta">{p.base} · unisex · 620gsm fleece</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== lookbook ===== */}
      <section className="sect" style={{paddingTop:0}}>
        <div className="sect-h"><div><span className="sect-num">// 02</span><h2 className="sect-title">In the field</h2></div></div>
        <div className="look">
          <div className="lookmain"><img className="lookimg" src="/products/orbit.png" alt="Orbit"/><span className="lookcap">ORBIT — UNDER THE DOME</span></div>
          <div className="lookside">
            <div className="looksm"><img className="lookimg" src="/products/ronin.png" alt="Ronin" style={{objectPosition:"center 20%"}}/><span className="lookcap">RONIN — BLOOD MOON</span></div>
            <div className="looksm"><img className="lookimg" src="/products/marbletide.png" alt="Marble Tide"/><span className="lookcap">MARBLE TIDE — DETAIL</span></div>
          </div>
        </div>
      </section>

      {/* ===== craft / index ===== */}
      <section className="sect">
        <div className="sect-h"><div><span className="sect-num">// 03</span><h2 className="sect-title">The standard</h2></div></div>
        <div className="craftgrid">
          <div>
            <span className="sect-num">Index</span>
            {PRODUCTS.map(p=>(
              <button className="idx-row" key={p.id} onClick={()=>openProduct(p)}>
                <span className="idx-dot" style={{ background:p.accent }}/>
                <span className="idx-name">{p.name}</span>
              </button>
            ))}
          </div>
          <div className="spec-list">
            {[
              ["FABRIC","620gsm brushed cotton fleece"],
              ["PRINT","Direct-to-garment, six original designs"],
              ["FIT","Boxy, dropped shoulder, oversized"],
              ["FINISH","Raw seams, debossed hem, no branding"],
              ["RUN","Fixed at 6 pieces — archived on sellout"],
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
            <div><span className="k">print:</span> <span className="v">direct-to-garment, six originals</span></div>
            <div><span className="k">construction:</span> <span className="v">raw-seam, dropped shoulder</span></div>
            <div><span className="k">restock:</span> <span className="v">none — archived on sellout</span></div>
          </div>
        </div>
      </section>

      {/* ===== drop counter + featured ===== */}
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
            <div className="minivol"><VolCard product={featured} onOpen={()=>openProduct(featured)} onExpand={()=>setOrbit(featured)} depth={6}/></div>
            <div className="minicap"><b>{featured.name}</b><span>${featured.price}</span></div>
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
          <div><div className="footh">Shop</div><button className="footlink" onClick={()=>document.getElementById("shop")?.scrollIntoView({behavior:"smooth"})}>Drop 001</button><button className="footlink">Archive</button></div>
          <div><div className="footh">About</div><button className="footlink">Materials</button><button className="footlink">Contact</button></div>
          <div><div className="footh">Access</div><button className="footlink">Notify list</button><button className="footlink">Returns</button></div>
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
            <div className="drawervol" style={{ background: PANEL[drawer.id]==="light" ? "var(--panel-light)" : "var(--ink-2)" }} onClick={()=>setOrbit(drawer)}>
              <VolCard product={drawer} onOpen={()=>setOrbit(drawer)} onExpand={()=>setOrbit(drawer)} depth={7}/>
            </div>
            <div className="drawerbody">
              <div className="drawername">{drawer.name}</div>
              <div className="drawerprice">${drawer.price}</div>
              <p className="drawerdesc">{drawer.desc}</p>

              <div className="optlabel">Size</div>
              <div className="sizerow">
                {["XS","S","M","L","XL","XXL"].map(s=>(
                  <button key={s} className={"sizebtn"+(size===s?" on":"")} disabled={s==="XS"} onClick={()=>setSize(s)}>{s}</button>
                ))}
              </div>

              <div className="addrow">
                <button className="addbtn" onClick={addToCart}><ShoppingBag size={15}/> Add to bag — ${drawer.price}</button>
                <button className={"wishbtn2"+(wishlist.includes(drawer.id)?" on":"")} onClick={()=>toggleWish(drawer.id)} aria-label="Wishlist">
                  <Heart size={16} fill={wishlist.includes(drawer.id)?"currentColor":"none"}/>
                </button>
              </div>

              <div className="accordion">
                {[
                  ["materials","Materials","620gsm brushed cotton fleece. Cold wash, hang dry."],
                  ["fit","Fit","Oversized by design. True to size for relaxed drape, size down for slim."],
                  ["shipping","Shipping","Cut-to-order, ships in 5–7 days. Final sale — no restock."],
                ].map(([k,t,b])=>(
                  <div className="accitem" key={k}>
                    <button className="acchead" onClick={()=>setOpenAcc(o=>o===k?null:k)}>{t}{openAcc===k ? <Minus size={14}/> : <Plus size={14}/>}</button>
                    {openAcc===k && <div className="accbody">{b}</div>}
                  </div>
                ))}
              </div>

              <div className="relwrap">
                <div className="rellbl">You may also like</div>
                <div className="relrow">
                  {related.map(r=>(
                    <div className="relcard" key={r.id} onClick={()=>openProduct(r)}>
                      <div className="relimg"><img src={r.image} alt={r.name}/></div>
                      <div className="relname">{r.name}</div>
                      <div className="relprice">${r.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== cart drawer ===== */}
      {cartOpen && (
        <div className="scrim" onClick={()=>setCartOpen(false)}>
          <div className="drawer" onClick={e=>e.stopPropagation()} style={{ display:"flex", flexDirection:"column" }}>
            <div className="drawertop">
              <span className="mono" style={{fontSize:12,color:"var(--umber)"}}>YOUR BAG ({cartCount})</span>
              <button className="drawerclose" onClick={()=>setCartOpen(false)}><X size={16}/></button>
            </div>
            {cart.length===0 ? (
              <div className="cartempty">Your bag is empty.<br/>Six pieces are waiting.</div>
            ) : (
              <div style={{ padding:"6px 26px", flex:1, overflowY:"auto" }}>
                {cart.map(it=>(
                  <div className="cartitem" key={it.id+it.size}>
                    <div className="cartimg"><img src={it.image} alt={it.name}/></div>
                    <div className="cartinfo">
                      <div className="cartname">{it.name}</div>
                      <div className="cartmeta">SIZE {it.size}</div>
                      <div className="cartbot">
                        <div className="qtystep">
                          <button onClick={()=>updateQty(it.id,it.size,-1)}><Minus size={12}/></button>
                          <span>{it.qty}</span>
                          <button onClick={()=>updateQty(it.id,it.size,1)}><Plus size={12}/></button>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span className="cartprice2">${it.price*it.qty}</span>
                          <button className="cartrm" onClick={()=>removeItem(it.id,it.size)}><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cart.length>0 && (
              <div className="cartfoot">
                <div className="subrow"><span>Subtotal</span><b>${cartTotal}</b></div>
                <button className="checkoutbtn" onClick={()=>setCheckoutMsg(true)}>
                  {checkoutMsg ? <><Check size={14} style={{verticalAlign:-2,marginRight:6}}/> Demo bag — no payment taken</> : "Checkout"}
                </button>
                {!checkoutMsg && <div className="checkoutnote">Cut to order · ships in 5–7 days</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {orbit && <OrbitViewer product={orbit} onClose={()=>setOrbit(null)}/>}
    </div>
  );
}
