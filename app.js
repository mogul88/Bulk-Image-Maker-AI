const PRESETS = [
  { id: 'etsy-listing', label: 'Etsy Listing Image — 2000 × 2000', width: 2000, height: 2000, hint: 'square Etsy product listing thumbnail, clean mockup composition' },
  { id: 'etsy-banner', label: 'Etsy Big Shop Banner — 1600 × 400', width: 1600, height: 400, hint: 'wide Etsy shop banner, clean center text area, premium brand layout' },
  { id: 'etsy-receipt', label: 'Etsy Receipt Banner — 760 × 100', width: 760, height: 100, hint: 'very wide narrow Etsy receipt banner, minimal and readable' },
  { id: 'blog-feature-1200', label: 'Blog Feature Image — 1200 × 630', width: 1200, height: 630, hint: 'blog featured image, editorial hero composition, web preview friendly' },
  { id: 'blog-feature-1600', label: 'Blog Feature Image — 1600 × 900', width: 1600, height: 900, hint: '16:9 blog hero image, professional web article cover' },
  { id: 'facebook-story', label: 'Facebook Story — 1080 × 1920', width: 1080, height: 1920, hint: 'vertical story design, mobile-first, safe empty space for text' },
  { id: 'facebook-post', label: 'Facebook Page/Group Post — 1200 × 630', width: 1200, height: 630, hint: 'Facebook shared post image, clear focal point, readable on feed' },
  { id: 'facebook-square', label: 'Facebook / Instagram Square — 1080 × 1080', width: 1080, height: 1080, hint: 'square social media post, centered composition' },
  { id: 'linkedin-post', label: 'LinkedIn Post — 1200 × 1200', width: 1200, height: 1200, hint: 'professional LinkedIn square post, polished business style' },
  { id: 'linkedin-preview', label: 'LinkedIn Link Preview — 1200 × 627', width: 1200, height: 627, hint: 'LinkedIn link preview image, 1.91:1 ratio, professional headline safe space' },
  { id: 'pinterest-pin', label: 'Pinterest Pin — 1000 × 1500', width: 1000, height: 1500, hint: 'vertical Pinterest pin, premium product/lifestyle composition' },
  { id: 'custom', label: 'Custom Size', width: 2000, height: 2000, hint: 'custom image size' },
];

const SAMPLE_PROMPTS = [
  'Minimal Etsy listing mockup for a printable wedding budget spreadsheet, laptop showing Google Sheets, printed planner pages, soft beige desk, clean premium product photography, no watermark',
  'Facebook story image for a back to school printable sale, pastel stationery, planner sheets, backpack, warm natural light, vertical mobile layout with space for headline text',
  'Premium blog featured image for roof pitch calculator article, modern American house roof, subtle blueprint grid overlay, dark engineering color palette, realistic 3D render',
];

const els = {
  imageCount: document.getElementById('imageCount'),
  presetSelect: document.getElementById('presetSelect'),
  customSizeWrap: document.getElementById('customSizeWrap'),
  customWidth: document.getElementById('customWidth'),
  customHeight: document.getElementById('customHeight'),
  modelSelect: document.getElementById('modelSelect'),
  qualitySelect: document.getElementById('qualitySelect'),
  formatSelect: document.getElementById('formatSelect'),
  enhancePrompt: document.getElementById('enhancePrompt'),
  autoFileNames: document.getElementById('autoFileNames'),
  sizePreview: document.getElementById('sizePreview'),
  generateBtn: document.getElementById('generateBtn'),
  zipBtn: document.getElementById('zipBtn'),
  promptsWrap: document.getElementById('promptsWrap'),
  bulkPromptInput: document.getElementById('bulkPromptInput'),
  applyBulkBtn: document.getElementById('applyBulkBtn'),
  clearPromptsBtn: document.getElementById('clearPromptsBtn'),
  sampleBtn: document.getElementById('sampleBtn'),
  progressCard: document.getElementById('progressCard'),
  progressText: document.getElementById('progressText'),
  progressMeta: document.getElementById('progressMeta'),
  barFill: document.getElementById('barFill'),
  logBox: document.getElementById('logBox'),
  resultsGrid: document.getElementById('resultsGrid'),
  resultCount: document.getElementById('resultCount'),
  resetBtn: document.getElementById('resetBtn'),
  puterLoginBtn: document.getElementById('puterLoginBtn'),
  testBtn: document.getElementById('testBtn'),
  testMode: document.getElementById('testMode'),
};

let results = [];

function init() {
  PRESETS.forEach(preset => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.label;
    els.presetSelect.appendChild(option);
  });
  els.presetSelect.value = 'etsy-listing';

  els.imageCount.addEventListener('input', renderPromptBoxes);
  els.presetSelect.addEventListener('change', updateSizePreview);
  els.customWidth.addEventListener('input', updateSizePreview);
  els.customHeight.addEventListener('input', updateSizePreview);
  els.applyBulkBtn.addEventListener('click', applyBulkPrompts);
  els.clearPromptsBtn.addEventListener('click', clearPrompts);
  els.sampleBtn.addEventListener('click', addSamples);
  els.generateBtn.addEventListener('click', generateImages);
  els.zipBtn.addEventListener('click', downloadZip);
  els.resetBtn.addEventListener('click', resetApp);
  els.puterLoginBtn.addEventListener('click', connectPuter);
  els.testBtn.addEventListener('click', testPuter);

  renderPromptBoxes();
  updateSizePreview();

  window.addEventListener('load', () => {
    if (window.puter && puter.ai && typeof puter.ai.txt2img === 'function') {
      log('Puter.js loaded successfully. Ready to test.');
    } else {
      log('Puter.js not loaded. Use a standalone HTTPS page and check ad/script blockers.');
    }
  });
}

function getSelectedPreset() {
  const preset = PRESETS.find(p => p.id === els.presetSelect.value) || PRESETS[0];
  if (preset.id === 'custom') {
    return {
      ...preset,
      width: clampNumber(parseInt(els.customWidth.value, 10), 100, 4096, 2000),
      height: clampNumber(parseInt(els.customHeight.value, 10), 100, 4096, 2000),
    };
  }
  return preset;
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function updateSizePreview() {
  const preset = getSelectedPreset();
  els.customSizeWrap.hidden = els.presetSelect.value !== 'custom';
  els.sizePreview.textContent = `${preset.width} × ${preset.height} px`;
}

function renderPromptBoxes() {
  const count = clampNumber(parseInt(els.imageCount.value, 10), 1, 30, 3);
  els.imageCount.value = count;

  const existing = [...els.promptsWrap.querySelectorAll('textarea')].map(t => t.value);
  els.promptsWrap.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'prompt-item';
    item.innerHTML = `
      <div class="prompt-item-head">
        <strong>Image ${i + 1}</strong>
        <span class="status-warn">Prompt required</span>
      </div>
      <textarea class="prompt-box" data-index="${i}" placeholder="Describe image ${i + 1}..."></textarea>
    `;
    const textarea = item.querySelector('textarea');
    textarea.value = existing[i] || '';
    textarea.addEventListener('input', () => updatePromptStatus(item, textarea));
    els.promptsWrap.appendChild(item);
    updatePromptStatus(item, textarea);
  }
}

function updatePromptStatus(item, textarea) {
  const status = item.querySelector('span');
  if (textarea.value.trim().length > 10) {
    status.textContent = 'Ready';
    status.className = 'status-ok';
  } else {
    status.textContent = 'Prompt required';
    status.className = 'status-warn';
  }
}

function getPromptValues() {
  return [...els.promptsWrap.querySelectorAll('textarea')].map(t => t.value.trim());
}

function applyBulkPrompts() {
  const lines = els.bulkPromptInput.value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (!lines.length) return log('Paste prompts first.');
  els.imageCount.value = Math.min(lines.length, 30);
  renderPromptBoxes();

  const boxes = [...els.promptsWrap.querySelectorAll('textarea')];
  boxes.forEach((box, i) => {
    box.value = lines[i] || '';
    updatePromptStatus(box.closest('.prompt-item'), box);
  });
}

function addSamples() {
  els.imageCount.value = SAMPLE_PROMPTS.length;
  renderPromptBoxes();
  const boxes = [...els.promptsWrap.querySelectorAll('textarea')];
  boxes.forEach((box, i) => {
    box.value = SAMPLE_PROMPTS[i] || '';
    updatePromptStatus(box.closest('.prompt-item'), box);
  });
}

function clearPrompts() {
  [...els.promptsWrap.querySelectorAll('textarea')].forEach(box => {
    box.value = '';
    updatePromptStatus(box.closest('.prompt-item'), box);
  });
  els.bulkPromptInput.value = '';
}

function buildEnhancedPrompt(prompt, preset) {
  if (!els.enhancePrompt.checked) return prompt;
  const ratio = simplifyRatio(preset.width, preset.height);
  return `${prompt}\n\nIMPORTANT IMAGE SPECS: Create this as a professional digital marketing image for ${preset.label}. Target final canvas: ${preset.width}x${preset.height}px, aspect ratio ${ratio}. ${preset.hint}. Use clean composition, sharp details, premium lighting, no watermark, no distorted text, no extra logos unless explicitly requested.`;
}

function getRatioParts(w, h) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const g = gcd(w, h);
  return { w: Math.round(w / g), h: Math.round(h / g) };
}

function simplifyRatio(w, h) {
  const r = getRatioParts(w, h);
  return `${r.w}:${r.h}`;
}

function getExt(mime) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/webp') return 'webp';
  return 'png';
}

function slugify(text, fallback = 'ai-image') {
  const clean = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 9)
    .join('-')
    .replace(/-+/g, '-');
  return clean || fallback;
}

function setBusy(isBusy) {
  els.generateBtn.disabled = isBusy;
  els.zipBtn.disabled = isBusy || results.length === 0;
  els.generateBtn.textContent = isBusy ? 'Generating...' : 'Generate Images';
}

function setProgress(current, total, text) {
  els.progressCard.hidden = false;
  els.progressText.textContent = text;
  els.progressMeta.textContent = `${current} / ${total}`;
  const pct = total ? Math.round((current / total) * 100) : 0;
  els.barFill.style.width = `${pct}%`;
}

function log(message) {
  els.progressCard.hidden = false;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  els.logBox.textContent += `[${time}] ${message}\n`;
  els.logBox.scrollTop = els.logBox.scrollHeight;
}

async function testPuter() {
  if (!window.puter || !puter.ai || typeof puter.ai.txt2img !== 'function') {
    log('Test failed: Puter.js is not loaded.');
    alert('Puter.js is not loaded. Test on GitHub Pages / Netlify / Vercel, not inside WordPress editor.');
    return;
  }

  try {
    setBusy(true);
    setProgress(0, 1, 'Testing Puter...');
    log('Running Puter test image with test_mode=true.');
    const preset = getSelectedPreset();
    const ratio = getRatioParts(preset.width, preset.height);
    const imageElement = await puter.ai.txt2img('Simple clean test image: a small orange star on a dark background', {
      model: els.modelSelect.value,
      quality: els.qualitySelect.value,
      ratio,
      test_mode: true,
    });
    await waitForImage(imageElement);
    const blob = await resizeToBlob(imageElement, preset.width, preset.height, els.formatSelect.value);
    const url = URL.createObjectURL(blob);
    results.push({
      index: results.length + 1,
      prompt: 'Puter test image',
      enhancedPrompt: 'Puter test image',
      filename: `puter-test-${preset.width}x${preset.height}.${getExt(els.formatSelect.value)}`,
      blob,
      url,
      width: preset.width,
      height: preset.height,
      mime: els.formatSelect.value,
      model: els.modelSelect.value,
      quality: els.qualitySelect.value,
    });
    renderResults();
    setProgress(1, 1, 'Puter test passed');
    log('Puter test passed. If this works, real generation should work after login/credits.');
  } catch (error) {
    console.error(error);
    log(`Puter test failed: ${error.message || error}`);
    alert(`Puter test failed: ${error.message || error}`);
  } finally {
    setBusy(false);
  }
}

async function connectPuter() {
  try {
    if (!window.puter) {
      log('Puter.js did not load. Check internet connection or CDN blocking.');
      return;
    }
    if (puter.auth && typeof puter.auth.signIn === 'function') {
      await puter.auth.signIn();
      log('Puter connected.');
    } else {
      log('Puter auth button is not available, but image generation may still prompt login automatically.');
    }
  } catch (error) {
    log(`Puter login skipped or failed: ${error.message || error}`);
  }
}

async function generateImages() {
  if (!window.puter || !puter.ai || typeof puter.ai.txt2img !== 'function') {
    alert('Puter.js is not loaded. Check your internet connection and try again.');
    return;
  }

  const preset = getSelectedPreset();
  const prompts = getPromptValues().filter(Boolean);
  if (!prompts.length) {
    alert('Please add at least one prompt.');
    return;
  }

  const model = els.modelSelect.value;
  const quality = els.qualitySelect.value;
  const mime = els.formatSelect.value;
  const ext = getExt(mime);

  results.forEach(item => URL.revokeObjectURL(item.url));
  results = [];
  renderResults();
  els.logBox.textContent = '';
  setBusy(true);
  setProgress(0, prompts.length, 'Starting...');

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const enhancedPrompt = buildEnhancedPrompt(prompt, preset);
    setProgress(i, prompts.length, `Generating image ${i + 1}`);
    log(`Image ${i + 1}: sending prompt to ${model} (${quality})`);

    try {
      const ratio = getRatioParts(preset.width, preset.height);
      const options = { model, quality, ratio };
      if (els.testMode.checked) options.test_mode = true;
      const imageElement = await puter.ai.txt2img(enhancedPrompt, options);
      await waitForImage(imageElement);
      const blob = await resizeToBlob(imageElement, preset.width, preset.height, mime);
      const url = URL.createObjectURL(blob);
      const baseName = els.autoFileNames.checked
        ? slugify(prompt, `ai-image-${i + 1}`)
        : `ai-image-${String(i + 1).padStart(2, '0')}`;
      const filename = `${String(i + 1).padStart(2, '0')}-${baseName}-${preset.width}x${preset.height}.${ext}`;

      results.push({
        index: i + 1,
        prompt,
        enhancedPrompt,
        filename,
        blob,
        url,
        width: preset.width,
        height: preset.height,
        mime,
        model,
        quality,
      });
      log(`Image ${i + 1}: done → ${filename}`);
      renderResults();
    } catch (error) {
      console.error(error);
      log(`Image ${i + 1}: failed — ${error.message || error}`);
    }
    setProgress(i + 1, prompts.length, `Completed ${i + 1} of ${prompts.length}`);
  }

  setBusy(false);
  els.zipBtn.disabled = results.length === 0;
  log(`Finished. ${results.length} image(s) generated.`);
}

function waitForImage(img) {
  return new Promise((resolve, reject) => {
    if (!img) return reject(new Error('No image returned by Puter.'));
    if (img.complete && img.naturalWidth) return resolve();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Generated image could not load.'));
  });
}

function resizeToBlob(img, targetW, targetH, mime) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
      } else {
        ctx.clearRect(0, 0, targetW, targetH);
      }

      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;
      const srcRatio = srcW / srcH;
      const dstRatio = targetW / targetH;
      let drawW, drawH, offsetX, offsetY;

      if (srcRatio > dstRatio) {
        drawH = targetH;
        drawW = targetH * srcRatio;
        offsetX = (targetW - drawW) / 2;
        offsetY = 0;
      } else {
        drawW = targetW;
        drawH = targetW / srcRatio;
        offsetX = 0;
        offsetY = (targetH - drawH) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Canvas export failed. Browser may have blocked cross-origin image resizing.'));
        resolve(blob);
      }, mime, mime === 'image/png' ? undefined : 0.92);
    } catch (error) {
      reject(error);
    }
  });
}

function renderResults() {
  els.resultCount.textContent = `${results.length} image${results.length === 1 ? '' : 's'}`;
  els.zipBtn.disabled = results.length === 0;

  if (!results.length) {
    els.resultsGrid.className = 'results-grid empty-state';
    els.resultsGrid.innerHTML = '<p>No images yet. Add prompts and click Generate Images.</p>';
    return;
  }

  els.resultsGrid.className = 'results-grid';
  els.resultsGrid.innerHTML = '';

  results.forEach(item => {
    const card = document.createElement('article');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-image-wrap">
        <img src="${item.url}" alt="${escapeHtml(item.prompt)}" loading="lazy" />
      </div>
      <div class="result-body">
        <h3>${item.width} × ${item.height}</h3>
        <p>${escapeHtml(truncate(item.prompt, 135))}</p>
        <div class="result-actions">
          <a href="${item.url}" download="${escapeHtml(item.filename)}">Download</a>
          <button class="ghost copy-prompt" type="button">Copy Prompt</button>
        </div>
      </div>
    `;
    card.querySelector('.copy-prompt').addEventListener('click', async () => {
      await navigator.clipboard.writeText(item.prompt);
      log(`Copied prompt for image ${item.index}.`);
    });
    els.resultsGrid.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncate(value, max) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

async function downloadZip() {
  if (!results.length) return;
  if (!window.JSZip) {
    alert('JSZip did not load. Download images one by one or check internet connection.');
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder('bulk-image-maker-ai');
  const manifest = [];

  results.forEach(item => {
    folder.file(item.filename, item.blob);
    manifest.push({
      file: item.filename,
      prompt: item.prompt,
      width: item.width,
      height: item.height,
      model: item.model,
      quality: item.quality,
      mime: item.mime,
    });
  });

  folder.file('prompts-and-settings.json', JSON.stringify(manifest, null, 2));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bulk-image-maker-ai-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
  log('ZIP downloaded.');
}

function resetApp() {
  results.forEach(item => URL.revokeObjectURL(item.url));
  results = [];
  els.imageCount.value = 3;
  els.presetSelect.value = 'etsy-listing';
  els.modelSelect.value = 'gpt-image-2';
  els.qualitySelect.value = 'medium';
  els.formatSelect.value = 'image/png';
  els.enhancePrompt.checked = true;
  els.autoFileNames.checked = true;
  els.testMode.checked = false;
  els.bulkPromptInput.value = '';
  els.logBox.textContent = '';
  els.progressCard.hidden = true;
  els.barFill.style.width = '0%';
  renderPromptBoxes();
  updateSizePreview();
  renderResults();
}

init();
