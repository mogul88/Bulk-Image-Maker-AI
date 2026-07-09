'use strict';

const PLATFORM_PRESETS = [
  { id: 'etsy_listing', label: 'Etsy Listing — 2000 × 2000', w: 2000, h: 2000, layout: 'etsy-main' },
  { id: 'etsy_banner', label: 'Etsy Banner — 1600 × 400', w: 1600, h: 400, layout: 'clean-banner' },
  { id: 'facebook_square', label: 'Facebook Square — 1080 × 1080', w: 1080, h: 1080, layout: 'facebook-promo' },
  { id: 'facebook_story', label: 'Facebook Story — 1080 × 1920', w: 1080, h: 1920, layout: 'story-sale' },
  { id: 'pinterest_pin', label: 'Pinterest Pin — 1000 × 1500', w: 1000, h: 1500, layout: 'pinterest-tall' },
  { id: 'linkedin_post', label: 'LinkedIn Post — 1200 × 1200', w: 1200, h: 1200, layout: 'clean-business' },
  { id: 'blog_feature', label: 'Blog Feature — 1200 × 630', w: 1200, h: 630, layout: 'website-hero' },
  { id: 'website_hero', label: 'Website Hero — 1600 × 900', w: 1600, h: 900, layout: 'website-hero' },
  { id: 'roofing_hero', label: 'Roofing Hero — 1600 × 900', w: 1600, h: 900, layout: 'roofing-hero' },
  { id: 'custom', label: 'Custom Size', w: 1200, h: 800, layout: 'etsy-main' }
];

const STYLE_PRESETS = [
  { id: 'clean-product', label: 'Clean Product Photo', add: 'clean commercial product photography, realistic lighting, professional camera angle, soft shadows, uncluttered scene' },
  { id: 'cozy-etsy', label: 'Cozy Etsy Mockup', add: 'warm cozy desk flat lay, beige neutral tones, soft natural morning light, premium Etsy product photography' },
  { id: 'facebook-bright', label: 'Bright Promo', add: 'bright lifestyle marketing image, clear empty space for promotional overlay, fresh modern small business style' },
  { id: 'pinterest-soft', label: 'Pinterest Soft Vertical', add: 'soft vertical lifestyle composition, elegant product area, pastel neutral palette, clean Pinterest-friendly layout' },
  { id: 'dark-engineering', label: 'Dark Engineering', add: 'dark navy premium engineering style, realistic architecture, cinematic dusk light, subtle blueprint lines, luxury website hero' },
  { id: 'wedding-neutral', label: 'Wedding Neutral', add: 'elegant wedding stationery mood, cream linen surface, dried flowers, soft luxury lighting, minimal styling' },
  { id: 'school-pastel', label: 'Back-to-School Pastel', add: 'bright school desk scene, pastel stationery, pencils and notebooks, cheerful clean organized look' }
];

const LAYOUT_PRESETS = [
  { id: 'etsy-main', label: 'Etsy Main Thumbnail' },
  { id: 'facebook-promo', label: 'Facebook Promo' },
  { id: 'story-sale', label: 'Story Sale Layout' },
  { id: 'pinterest-tall', label: 'Pinterest Tall Pin' },
  { id: 'website-hero', label: 'Website Hero' },
  { id: 'roofing-hero', label: 'Roofing Calculator Hero' },
  { id: 'clean-business', label: 'Clean Business Cards' },
  { id: 'clean-banner', label: 'Minimal Banner' }
];

const state = {
  backgrounds: [],
  finalImages: [],
  products: [],
  selectedBg: 0,
  selectedProduct: 0,
  isBusy: false
};

const els = {};
let ctx;

window.addEventListener('DOMContentLoaded', () => {
  bindElements();
  populateSelects();
  bindEvents();
  applyPlatformPreset('etsy_listing');
  applyLayoutPreset('etsy-main');
  resizeCanvasToInputs();
  drawCanvas();
  setStatus('Ready', 'VisualForge v10 loaded. Pollinations free background mode + local canvas overlay system ready.', 'success');
});

function bindElements() {
  const ids = [
    'platformPreset','widthInput','heightInput','imageCount','stylePreset','backgroundPrompts','enhancePrompt','safeArea','nologo',
    'generateBgBtn','clearBtn','statusPanel','statusTitle','statusMessage','designCanvas','thumbs','composeBtn','downloadOneBtn',
    'downloadZipBtn','exportFormat','layoutPreset','productMode','productUpload','productThumbs','titleText','subtitleText','badgeOne','badgeTwo',
    'ctaText','footerText','featureText','accentColor','buttonColor','textColor','cardColor','badgeColor','badgeTextColor','overlayOpacity',
    'productScale','productX','productY','productRotate','addVignette','glassCards'
  ];
  ids.forEach(id => els[id] = document.getElementById(id));
  ctx = els.designCanvas.getContext('2d');
}

function populateSelects() {
  els.platformPreset.innerHTML = PLATFORM_PRESETS.map(p => `<option value="${p.id}">${p.label}</option>`).join('');
  els.stylePreset.innerHTML = STYLE_PRESETS.map(p => `<option value="${p.id}">${p.label}</option>`).join('');
  els.layoutPreset.innerHTML = LAYOUT_PRESETS.map(p => `<option value="${p.id}">${p.label}</option>`).join('');
  els.platformPreset.value = 'etsy_listing';
  els.stylePreset.value = 'cozy-etsy';
  els.layoutPreset.value = 'etsy-main';
}

function bindEvents() {
  els.platformPreset.addEventListener('change', () => applyPlatformPreset(els.platformPreset.value));
  els.layoutPreset.addEventListener('change', () => applyLayoutPreset(els.layoutPreset.value));
  ['widthInput','heightInput'].forEach(id => els[id].addEventListener('input', () => { resizeCanvasToInputs(); drawCanvas(); }));
  ['titleText','subtitleText','badgeOne','badgeTwo','ctaText','footerText','featureText','accentColor','buttonColor','textColor','cardColor','badgeColor','badgeTextColor','overlayOpacity','productScale','productX','productY','productRotate','productMode','addVignette','glassCards'].forEach(id => {
    els[id].addEventListener('input', drawCanvas);
    els[id].addEventListener('change', drawCanvas);
  });
  els.generateBgBtn.addEventListener('click', generateBackgrounds);
  els.clearBtn.addEventListener('click', resetTool);
  els.composeBtn.addEventListener('click', () => { drawCanvas(); setStatus('Preview updated', 'Canvas overlay refreshed.', 'success'); });
  els.downloadOneBtn.addEventListener('click', downloadCurrentImage);
  els.downloadZipBtn.addEventListener('click', downloadZip);
  els.productUpload.addEventListener('change', handleProductUpload);
}

function applyPlatformPreset(id) {
  const preset = PLATFORM_PRESETS.find(p => p.id === id) || PLATFORM_PRESETS[0];
  els.widthInput.value = preset.w;
  els.heightInput.value = preset.h;
  els.layoutPreset.value = preset.layout;
  applyLayoutPreset(preset.layout);
  resizeCanvasToInputs();
  drawCanvas();
}

function applyLayoutPreset(id) {
  const presets = {
    'etsy-main': { title:'Weekly Planner Bundle', subtitle:'Editable Canva Template + Printable PDF', badge1:'Editable in Canva', badge2:'Instant Download', cta:'Download Today', footer:'ThePrintableSeason', mode:'right-card', colors:['#f59e0b','#10b981','#ffffff','#0f172a','#fff7ed','#111827'] },
    'facebook-promo': { title:'New Printable Bundle', subtitle:'Simple, editable, and ready to use', badge1:'50% OFF', badge2:'Limited Time', cta:'Shop Now', footer:'Digital Download', mode:'left-card', colors:['#fb7185','#7c3aed','#ffffff','#111827','#ffffff','#111827'] },
    'story-sale': { title:'Back to School Bundle', subtitle:'Editable templates for busy parents & students', badge1:'SALE', badge2:'Instant Access', cta:'Tap to Shop', footer:'Printable + Canva', mode:'center-card', colors:['#f59e0b','#ec4899','#ffffff','#111827','#fff7ed','#111827'] },
    'pinterest-tall': { title:'Printable Planner', subtitle:'Organize your week beautifully', badge1:'Editable', badge2:'PDF Included', cta:'Save This', footer:'ThePrintableSeason', mode:'center-card', colors:['#d97706','#059669','#ffffff','#0f172a','#fffbeb','#111827'] },
    'website-hero': { title:'Build Smarter. Estimate Faster.', subtitle:'Premium calculators and visual guides for better project planning', badge1:'Fast Estimates', badge2:'Clean Reports', cta:'Open Calculator', footer:'RoofPitchCalculators.com', mode:'right-card', colors:['#f59e0b','#2563eb','#ffffff','#0b1120','#fef3c7','#111827'] },
    'roofing-hero': { title:'Roof Pitch Calculator', subtitle:'Measure slope, angle, area, rafters, and roofing squares with confidence', badge1:'6/12 Pitch', badge2:'26.57° Angle', cta:'Calculate Now', footer:'RoofPitchCalculators.com', mode:'none', colors:['#f59e0b','#3b82f6','#ffffff','#0b1120','#fef3c7','#111827'] },
    'clean-business': { title:'Professional Template', subtitle:'Clean visuals for social media and blog posts', badge1:'Editable', badge2:'Ready to Use', cta:'Learn More', footer:'VisualForge AI', mode:'right-card', colors:['#38bdf8','#10b981','#ffffff','#0f172a','#e0f2fe','#0f172a'] },
    'clean-banner': { title:'Premium Digital Templates', subtitle:'Editable, printable, and ready in minutes', badge1:'Canva', badge2:'Instant', cta:'Shop Now', footer:'', mode:'right-card', colors:['#f59e0b','#10b981','#ffffff','#0f172a','#fffbeb','#111827'] }
  };
  const p = presets[id] || presets['etsy-main'];
  els.titleText.value = p.title; els.subtitleText.value = p.subtitle; els.badgeOne.value = p.badge1; els.badgeTwo.value = p.badge2; els.ctaText.value = p.cta; els.footerText.value = p.footer; els.productMode.value = p.mode;
  [els.accentColor.value, els.buttonColor.value, els.textColor.value, els.cardColor.value, els.badgeColor.value, els.badgeTextColor.value] = p.colors;
  drawCanvas();
}

function resizeCanvasToInputs() {
  const w = clamp(parseInt(els.widthInput.value, 10) || 1200, 320, 4096);
  const h = clamp(parseInt(els.heightInput.value, 10) || 800, 320, 4096);
  els.designCanvas.width = w;
  els.designCanvas.height = h;
}

async function generateBackgrounds() {
  clearFieldErrors();
  try {
    const w = clamp(parseInt(els.widthInput.value, 10), 320, 4096);
    const h = clamp(parseInt(els.heightInput.value, 10), 320, 4096);
    const count = parseInt(els.imageCount.value, 10);
    if (!count || count < 1) return failField(els.imageCount, 'Missing image count', 'Enter how many images you want. Example: 3');
    if (count > 12) return failField(els.imageCount, 'Too many images', 'For browser stability, generate maximum 12 images at a time.');
    if (!w || !h) return failField(els.widthInput, 'Invalid size', 'Width and height must be valid numbers.');
    const promptLines = els.backgroundPrompts.value.split('\n').map(s => s.trim()).filter(Boolean);
    if (!promptLines.length) return failField(els.backgroundPrompts, 'Missing prompt', 'Write at least one background prompt.');

    setBusy(true);
    resizeCanvasToInputs();
    state.backgrounds = [];
    state.finalImages = [];
    state.selectedBg = 0;
    renderThumbs();
    setStatus('Generating backgrounds...', `0 / ${count} complete.`, '');

    for (let i = 0; i < count; i++) {
      const userPrompt = promptLines[i] || promptLines[0];
      const finalPrompt = buildBackgroundPrompt(userPrompt, w, h, i);
      setStatus('Generating backgrounds...', `Image ${i + 1} of ${count}: requesting Pollinations Free image.`, '');
      try {
        const dataUrl = await pollinationsImage(finalPrompt, w, h, i);
        state.backgrounds.push({ dataUrl, prompt: userPrompt, finalPrompt, width: w, height: h, error: null });
        state.selectedBg = state.backgrounds.length - 1;
        renderThumbs();
        drawCanvas();
      } catch (err) {
        state.backgrounds.push({ dataUrl: '', prompt: userPrompt, finalPrompt, width: w, height: h, error: cleanError(err) });
        renderThumbs();
        setStatus('One image failed', `Image ${i + 1} error: ${cleanError(err)}`, 'error');
      }
    }

    const ok = state.backgrounds.filter(b => b.dataUrl).length;
    els.downloadOneBtn.disabled = ok === 0;
    els.downloadZipBtn.disabled = ok === 0;
    if (ok) {
      state.selectedBg = state.backgrounds.findIndex(b => b.dataUrl);
      if (state.selectedBg < 0) state.selectedBg = 0;
      renderThumbs(); drawCanvas();
      setStatus('Backgrounds ready', `${ok}/${count} backgrounds generated. Add/adjust overlay and export.`, 'success');
    } else {
      setStatus('Generation failed', 'No backgrounds were generated. Try a shorter prompt or check internet connection.', 'error');
    }
  } finally {
    setBusy(false);
  }
}

function buildBackgroundPrompt(userPrompt, w, h, index) {
  const style = STYLE_PRESETS.find(s => s.id === els.stylePreset.value) || STYLE_PRESETS[0];
  const parts = [userPrompt];
  if (els.enhancePrompt.checked) parts.push(style.add);
  if (els.safeArea.checked) parts.push('leave clean empty space for overlay text and product card, balanced composition, main background should not contain readable words');
  parts.push('no text, no labels, no numbers, no logo, no watermark, no fake typography, no gibberish, no distorted objects, realistic high quality');
  parts.push(`aspect ratio ${w}:${h}, composition suitable for final ${w}x${h} marketing image, variation ${index + 1}`);
  return parts.join(', ');
}

async function pollinationsImage(prompt, width, height, index) {
  const seed = Date.now() + index * 1117;
  const params = new URLSearchParams({ width: String(width), height: String(height), model: 'flux', seed: String(seed), enhance: 'false', safe: 'true' });
  if (els.nologo.checked) params.set('nologo', 'true');
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  if (!res.ok) throw new Error(`Pollinations returned ${res.status}. Try again or simplify prompt.`);
  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) throw new Error('Provider did not return an image.');
  return blobToDataUrl(blob);
}

async function handleProductUpload(event) {
  const files = Array.from(event.target.files || []);
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    if (file.size > 15 * 1024 * 1024) { setStatus('File skipped', `${file.name} is larger than 15MB.`, 'error'); continue; }
    const dataUrl = await fileToDataUrl(file);
    state.products.push({ id: randId(), name: file.name, dataUrl });
  }
  event.target.value = '';
  if (state.products.length) state.selectedProduct = Math.max(0, state.products.length - files.length);
  renderProductThumbs();
  drawCanvas();
}

function renderProductThumbs() {
  els.productThumbs.innerHTML = state.products.map((p, i) => `
    <div class="product-thumb ${i === state.selectedProduct ? 'active' : ''}" data-product="${i}" title="${escapeHtml(p.name)}">
      <img src="${p.dataUrl}" alt="Product ${i + 1}">
      <button type="button" data-remove-product="${p.id}">×</button>
    </div>`).join('');
  els.productThumbs.querySelectorAll('[data-product]').forEach(el => el.addEventListener('click', e => {
    if (e.target.matches('button')) return;
    state.selectedProduct = parseInt(el.dataset.product, 10); renderProductThumbs(); drawCanvas();
  }));
  els.productThumbs.querySelectorAll('[data-remove-product]').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation(); state.products = state.products.filter(p => p.id !== btn.dataset.removeProduct); state.selectedProduct = 0; renderProductThumbs(); drawCanvas();
  }));
}

function renderThumbs() {
  if (!state.backgrounds.length) {
    els.thumbs.classList.add('empty');
    els.thumbs.innerHTML = '<div class="empty-card">Generated backgrounds will appear here.</div>';
    return;
  }
  els.thumbs.classList.remove('empty');
  els.thumbs.innerHTML = state.backgrounds.map((b, i) => {
    if (b.error) return `<div class="thumb-card" data-bg="${i}"><div class="empty-card">Failed</div><span>Image ${i + 1}</span></div>`;
    return `<div class="thumb-card ${i === state.selectedBg ? 'active' : ''}" data-bg="${i}"><img src="${b.dataUrl}" alt="Background ${i + 1}"><span>Image ${i + 1}</span></div>`;
  }).join('');
  els.thumbs.querySelectorAll('[data-bg]').forEach(card => card.addEventListener('click', () => {
    state.selectedBg = parseInt(card.dataset.bg, 10); renderThumbs(); drawCanvas();
  }));
}

async function drawCanvas() {
  resizeCanvasToInputs();
  const w = els.designCanvas.width;
  const h = els.designCanvas.height;
  ctx.clearRect(0, 0, w, h);

  const bg = state.backgrounds[state.selectedBg];
  if (bg && bg.dataUrl) {
    const img = await loadImage(bg.dataUrl);
    drawCover(img, 0, 0, w, h);
  } else {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#111827'); grad.addColorStop(0.52, '#0f172a'); grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    drawPlaceholder(w, h);
  }

  if (els.addVignette.checked) drawVignette(w, h);
  await drawProduct(w, h);
  drawOverlay(w, h);
}

function drawPlaceholder(w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  roundedRect(w*.08, h*.14, w*.84, h*.72, Math.min(w,h)*.035, true, false);
  ctx.fillStyle = 'rgba(255,255,255,.70)';
  ctx.font = `${Math.max(22, w*.028)}px system-ui`;
  ctx.textAlign = 'center';
  ctx.fillText('Generate or upload background to preview final design', w/2, h/2);
  ctx.restore();
}

function drawVignette(w, h) {
  const g = ctx.createRadialGradient(w*.55,h*.45,Math.min(w,h)*.1,w*.5,h*.5,Math.max(w,h)*.72);
  g.addColorStop(0,'rgba(0,0,0,0)');
  g.addColorStop(1,'rgba(0,0,0,.50)');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  const lg = ctx.createLinearGradient(0,0,w,0);
  lg.addColorStop(0,'rgba(0,0,0,.48)'); lg.addColorStop(.45,'rgba(0,0,0,.06)'); lg.addColorStop(1,'rgba(0,0,0,.28)');
  ctx.fillStyle = lg; ctx.fillRect(0,0,w,h);
}

async function drawProduct(w, h) {
  const mode = els.productMode.value;
  if (mode === 'none' || !state.products.length) return;
  const p = state.products[state.selectedProduct] || state.products[0];
  if (!p) return;
  const img = await loadImage(p.dataUrl);
  const scalePct = parseInt(els.productScale.value, 10) / 100;
  const targetW = Math.min(w, h) * scalePct;
  const aspect = img.naturalHeight / img.naturalWidth;
  const targetH = targetW * aspect;
  let x = w * (parseInt(els.productX.value, 10) / 100);
  let y = h * (parseInt(els.productY.value, 10) / 100);
  if (mode === 'left-card') { x = w*.28; y = h*.55; }
  if (mode === 'right-card') { x = w*.72; y = h*.55; }
  if (mode === 'center-card') { x = w*.50; y = h*.56; }
  if (mode === 'bottom-stack') { x = w*.50; y = h*.68; }
  const rot = parseInt(els.productRotate.value, 10) * Math.PI / 180;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,.44)'; ctx.shadowBlur = Math.min(w,h)*.035; ctx.shadowOffsetY = Math.min(w,h)*.018;
  ctx.fillStyle = 'rgba(255,255,255,.96)';
  roundedRect(-targetW/2 - w*.014, -targetH/2 - w*.014, targetW + w*.028, targetH + w*.028, Math.min(w,h)*.022, true, false);
  ctx.shadowColor = 'transparent';
  roundedClip(-targetW/2, -targetH/2, targetW, targetH, Math.min(w,h)*.014);
  ctx.drawImage(img, -targetW/2, -targetH/2, targetW, targetH);
  ctx.restore();

  if (mode === 'bottom-stack' && state.products.length > 1) {
    // Small secondary cards for quick collage feeling
    for (let i=1;i<Math.min(state.products.length,3);i++) {
      const im = await loadImage(state.products[i].dataUrl);
      const sw = targetW*.55, sh = sw * (im.naturalHeight/im.naturalWidth);
      ctx.save(); ctx.translate(w*(.28+i*.22), h*.80); ctx.rotate((i%2? -8: 8)*Math.PI/180);
      ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=28;ctx.fillStyle='rgba(255,255,255,.96)';roundedRect(-sw/2-14,-sh/2-14,sw+28,sh+28,22,true,false);ctx.shadowColor='transparent';roundedClip(-sw/2,-sh/2,sw,sh,14);ctx.drawImage(im,-sw/2,-sh/2,sw,sh);ctx.restore();
    }
  }
}

function drawOverlay(w, h) {
  const layout = els.layoutPreset.value;
  const colors = getColors();
  const title = els.titleText.value.trim();
  const subtitle = els.subtitleText.value.trim();
  const badge1 = els.badgeOne.value.trim();
  const badge2 = els.badgeTwo.value.trim();
  const cta = els.ctaText.value.trim();
  const footer = els.footerText.value.trim();
  const bullets = els.featureText.value.split('\n').map(x=>x.trim()).filter(Boolean);

  if (layout === 'roofing-hero') return drawRoofingHero(w,h,colors,title,subtitle,badge1,badge2,cta,footer,bullets);
  if (layout === 'website-hero') return drawWebsiteHero(w,h,colors,title,subtitle,badge1,badge2,cta,footer,bullets);
  if (layout === 'facebook-promo') return drawFacebookPromo(w,h,colors,title,subtitle,badge1,badge2,cta,footer,bullets);
  if (layout === 'story-sale' || layout === 'pinterest-tall') return drawTallLayout(w,h,colors,title,subtitle,badge1,badge2,cta,footer,bullets);
  if (layout === 'clean-banner') return drawCleanBanner(w,h,colors,title,subtitle,badge1,badge2,cta,footer,bullets);
  return drawEtsyMain(w,h,colors,title,subtitle,badge1,badge2,cta,footer,bullets);
}

function drawEtsyMain(w,h,c,title,subtitle,b1,b2,cta,footer,bullets){
  const pad=w*.06; const cardW=w*.43; const cardH=h*.72; const x=pad; const y=h*.14;
  glassCard(x,y,cardW,cardH,c,Math.min(w,h)*.035);
  drawBadges(x+w*.025,y+h*.045,b1,b2,c);
  drawTitleBlock(title,subtitle,x+w*.035,y+h*.20,cardW-w*.07,c,w*.055,w*.023);
  drawBullets(bullets,x+w*.04,y+h*.45,cardW-w*.08,c,w*.021);
  drawButton(cta,x+w*.04,y+cardH-h*.16,cardW*.55,h*.075,c);
  drawFooter(footer,w,h,c);
}
function drawFacebookPromo(w,h,c,title,subtitle,b1,b2,cta,footer,bullets){
  drawAccentBlob(w*.08,h*.09,w*.42,h*.82,c.accent,.22);
  drawBadges(w*.07,h*.08,b1,b2,c);
  drawTitleBlock(title,subtitle,w*.07,h*.24,w*.52,c,w*.070,w*.030);
  drawButton(cta,w*.07,h*.70,w*.28,h*.08,c);
  drawFooter(footer,w,h,c);
}
function drawTallLayout(w,h,c,title,subtitle,b1,b2,cta,footer,bullets){
  glassCard(w*.07,h*.06,w*.86,h*.28,c,Math.min(w,h)*.035);
  drawBadges(w*.10,h*.085,b1,b2,c);
  drawTitleBlock(title,subtitle,w*.10,h*.16,w*.80,c,w*.080,w*.032);
  glassCard(w*.10,h*.70,w*.80,h*.20,c,Math.min(w,h)*.028);
  drawBullets(bullets,w*.14,h*.735,w*.72,c,w*.030);
  drawButton(cta,w*.25,h*.90,w*.50,h*.045,c);
  drawFooter(footer,w,h,c);
}
function drawWebsiteHero(w,h,c,title,subtitle,b1,b2,cta,footer,bullets){
  glassCard(w*.055,h*.16,w*.49,h*.58,c,Math.min(w,h)*.034);
  drawBadges(w*.085,h*.205,b1,b2,c);
  drawTitleBlock(title,subtitle,w*.085,h*.31,w*.42,c,w*.060,w*.026);
  drawBullets(bullets,w*.09,h*.54,w*.38,c,w*.020);
  drawButton(cta,w*.085,h*.66,w*.24,h*.070,c);
  drawFooter(footer,w,h,c);
}
function drawRoofingHero(w,h,c,title,subtitle,b1,b2,cta,footer,bullets){
  drawWebsiteHero(w,h,c,title,subtitle,b1,b2,cta,footer,bullets);
  const cardW=w*.18, cardH=h*.13;
  const stats = bullets.length ? bullets.slice(0,4) : ['Roof Area 1,562 sq ft','Rafter Length 15.4 ft','Roof Squares 16','Estimate Ready'];
  stats.forEach((s,i)=>{
    const x = w*(.62 + (i%2)*.20), y = h*(.14 + Math.floor(i/2)*.18);
    glassCard(x,y,cardW,cardH,c,Math.min(w,h)*.020);
    ctx.fillStyle=c.accent; ctx.font=`900 ${w*.015}px system-ui`; ctx.fillText(String(i+1).padStart(2,'0'),x+cardW*.10,y+cardH*.34);
    ctx.fillStyle=c.text; ctx.font=`800 ${w*.018}px system-ui`; wrapText(s,x+cardW*.10,y+cardH*.62,cardW*.78,w*.020,2);
  });
  drawTechLines(w,h,c);
}
function drawCleanBanner(w,h,c,title,subtitle,b1,b2,cta,footer,bullets){
  glassCard(w*.05,h*.14,w*.55,h*.72,c,Math.min(w,h)*.08);
  drawBadges(w*.08,h*.24,b1,b2,c);
  drawTitleBlock(title,subtitle,w*.08,h*.40,w*.46,c,w*.055,w*.024);
  drawButton(cta,w*.08,h*.68,w*.22,h*.13,c);
  drawFooter(footer,w,h,c);
}

function getColors(){return{accent:els.accentColor.value,button:els.buttonColor.value,text:els.textColor.value,card:hexToRgba(els.cardColor.value,parseInt(els.overlayOpacity.value,10)/100),cardSolid:els.cardColor.value,badge:els.badgeColor.value,badgeText:els.badgeTextColor.value,glass:els.glassCards.checked};}
function drawBadges(x,y,b1,b2,c){let cur=x;[b1,b2].filter(Boolean).forEach(t=>{ctx.font=`900 ${Math.max(14,els.designCanvas.width*.017)}px system-ui`;const tw=ctx.measureText(t).width;const bw=tw+els.designCanvas.width*.04,bh=els.designCanvas.height*.055;ctx.fillStyle=c.badge;roundedRect(cur,y,bw,bh,bh/2,true,false);ctx.fillStyle=c.badgeText;ctx.textBaseline='middle';ctx.fillText(t,cur+bw/2-tw/2,y+bh/2);cur+=bw+els.designCanvas.width*.014;});ctx.textBaseline='alphabetic';}
function drawTitleBlock(title,subtitle,x,y,maxW,c,titleSize,subSize){ctx.fillStyle=c.text;ctx.font=`950 ${Math.max(24,titleSize)}px system-ui`;ctx.textBaseline='top';wrapText(title,x,y,maxW,Math.max(28,titleSize*1.05),3);ctx.font=`700 ${Math.max(14,subSize)}px system-ui`;ctx.fillStyle='rgba(255,255,255,.82)';wrapText(subtitle,x,y+Math.max(74,titleSize*2.15),maxW,Math.max(22,subSize*1.45),3);ctx.textBaseline='alphabetic';}
function drawBullets(items,x,y,maxW,c,size){ctx.font=`850 ${Math.max(14,size)}px system-ui`;ctx.fillStyle='rgba(255,255,255,.88)';let yy=y;items.forEach(item=>{ctx.fillStyle=c.accent;ctx.beginPath();ctx.arc(x+size*.35,yy-size*.25,size*.22,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.88)';wrapText(item,x+size*1.2,yy-size*.85,maxW-size*1.2,size*1.55,2);yy += size*2.15;});}
function drawButton(text,x,y,w,h,c){if(!text)return;ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=22;ctx.shadowOffsetY=8;ctx.fillStyle=c.button;roundedRect(x,y,w,h,h/2,true,false);ctx.shadowColor='transparent';ctx.fillStyle='#031411';ctx.font=`950 ${Math.max(14,h*.32)}px system-ui`;ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillText(text,x+w/2,y+h/2);ctx.textAlign='left';ctx.textBaseline='alphabetic';}
function drawFooter(text,w,h,c){if(!text)return;ctx.fillStyle='rgba(255,255,255,.74)';ctx.font=`800 ${Math.max(13,w*.014)}px system-ui`;ctx.textAlign='right';ctx.fillText(text,w*.95,h*.94);ctx.textAlign='left';}
function glassCard(x,y,w,h,c,r){ctx.save();ctx.shadowColor='rgba(0,0,0,.38)';ctx.shadowBlur=Math.min(w,h)*.18;ctx.shadowOffsetY=Math.min(w,h)*.055;ctx.fillStyle=c.card;roundedRect(x,y,w,h,r,true,false);ctx.shadowColor='transparent';ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=Math.max(1,els.designCanvas.width*.0012);roundedRect(x,y,w,h,r,false,true);ctx.restore();}
function drawAccentBlob(x,y,w,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;roundedRect(x,y,w,h,Math.min(w,h)*.16,true,false);ctx.restore();}
function drawTechLines(w,h,c){ctx.save();ctx.strokeStyle=hexToRgba(c.accent,.40);ctx.lineWidth=Math.max(1,w*.0012);for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(w*(.58+i*.07),h*.72);ctx.lineTo(w*(.70+i*.04),h*(.56-i*.04));ctx.stroke();}ctx.restore();}

async function downloadCurrentImage(){drawCanvas();await waitFrame();const mime=els.exportFormat.value;const url=els.designCanvas.toDataURL(mime,mime==='image/jpeg'?0.92:0.96);downloadDataUrl(url,buildExportName(state.selectedBg,mime));}
async function downloadZip(){try{if(!window.JSZip)throw new Error('JSZip not loaded. Refresh and try again.');if(!state.backgrounds.filter(b=>b.dataUrl).length)throw new Error('Generate at least one background first.');setBusy(true);const zip=new JSZip();let n=0;for(let i=0;i<state.backgrounds.length;i++){if(!state.backgrounds[i].dataUrl)continue;state.selectedBg=i;renderThumbs();await drawCanvas();await waitFrame();const mime=els.exportFormat.value;const dataUrl=els.designCanvas.toDataURL(mime,mime==='image/jpeg'?0.92:0.96);zip.file(buildExportName(i,mime),dataUrl.split(',')[1],{base64:true});n++;}zip.file('visualforge-settings.json',JSON.stringify(buildManifest(),null,2));const blob=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`visualforge-ai-v10-${Date.now()}.zip`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);setStatus('ZIP downloaded',`${n} final image(s) exported successfully.`,'success');}catch(err){setStatus('ZIP failed',cleanError(err),'error');}finally{setBusy(false);}}
function buildExportName(index,mime){const ext=mime==='image/jpeg'?'jpg':mime==='image/webp'?'webp':'png';const base=slugify(els.titleText.value||'visualforge-image')||'visualforge-image';return `${String(index+1).padStart(2,'0')}-${base}-${els.designCanvas.width}x${els.designCanvas.height}.${ext}`;}
function buildManifest(){return{created_at:new Date().toISOString(),tool:'VisualForge AI v10',platform:els.platformPreset.value,size:{width:els.designCanvas.width,height:els.designCanvas.height},layout:els.layoutPreset.value,text:{title:els.titleText.value,subtitle:els.subtitleText.value,badgeOne:els.badgeOne.value,badgeTwo:els.badgeTwo.value,cta:els.ctaText.value,footer:els.footerText.value,features:els.featureText.value},products:state.products.map(p=>p.name),backgrounds:state.backgrounds.map(b=>({prompt:b.prompt,error:b.error}))};}

function resetTool(){state.backgrounds=[];state.finalImages=[];state.products=[];state.selectedBg=0;state.selectedProduct=0;els.backgroundPrompts.value='';els.imageCount.value='';renderThumbs();renderProductThumbs();drawCanvas();els.downloadOneBtn.disabled=true;els.downloadZipBtn.disabled=true;setStatus('Reset complete','Start a new design from setup.', 'success');}
function setBusy(v){state.isBusy=v;els.generateBgBtn.disabled=v;els.clearBtn.disabled=v;els.composeBtn.disabled=v;els.downloadZipBtn.disabled=v || !state.backgrounds.some(b=>b.dataUrl);els.downloadOneBtn.disabled=v || !state.backgrounds.some(b=>b.dataUrl);els.generateBgBtn.textContent=v?'Working...':'Generate Backgrounds';if(v)els.generateBgBtn.classList.add('loading-pulse');else els.generateBgBtn.classList.remove('loading-pulse');}
function setStatus(title,msg,type){els.statusTitle.textContent=title;els.statusMessage.textContent=msg;els.statusPanel.classList.remove('error','success');if(type)els.statusPanel.classList.add(type);}
function failField(el,title,msg){el.classList.add('field-error');el.scrollIntoView({behavior:'smooth',block:'center'});el.focus();setStatus(title,msg,'error');}
function clearFieldErrors(){document.querySelectorAll('.field-error').forEach(x=>x.classList.remove('field-error'));}

function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Could not load image.'));img.src=src;});}
function drawCover(img,x,y,w,h){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;const s=Math.max(w/iw,h/ih);const dw=iw*s,dh=ih*s;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);}
function roundedRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill)ctx.fill();if(stroke)ctx.stroke();}
function roundedClip(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.clip();}
function wrapText(text,x,y,maxW,lineH,maxLines=4){if(!text)return 0;const words=String(text).split(/\s+/);let line='',lines=0;for(let n=0;n<words.length;n++){const test=line?line+' '+words[n]:words[n];if(ctx.measureText(test).width>maxW && n>0){ctx.fillText(line,x,y);line=words[n];y+=lineH;lines++;if(lines>=maxLines-1){line += n<words.length-1?'…':'';break;}}else{line=test;}}ctx.fillText(line,x,y);return y+lineH;}
function hexToRgba(hex,a){const h=hex.replace('#','');const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return `rgba(${r},${g},${b},${a})`;}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Could not read generated image.'));r.readAsDataURL(blob);});}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error(`Could not read ${file.name}`));r.readAsDataURL(file);});}
function downloadDataUrl(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();}
function waitFrame(){return new Promise(r=>requestAnimationFrame(()=>setTimeout(r,60)));}
function clamp(n,min,max){return Math.min(max,Math.max(min,n||min));}
function slugify(s){return String(s).toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,72);}
function randId(){return `${Date.now()}-${Math.random().toString(16).slice(2)}`;}
function cleanError(e){return (e && e.message ? e.message : String(e||'Unknown error')).replace(/\s+/g,' ').trim();}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
