/**
 * What I See — Real-time Object Detection Demo
 * Uses TensorFlow.js + COCO-SSD model
 * Runs 100% in the browser — no server required
 *
 * Demo for Cambrian College — Azure Static Web Apps
 */

// ── DOM references ──────────────────────────────────────────────
const video        = document.getElementById('video');
const canvas       = document.getElementById('canvas');
const ctx          = canvas.getContext('2d');
const btnStart     = document.getElementById('btn-start');
const btnStop      = document.getElementById('btn-stop');
const statusDot    = document.getElementById('status-dot');
const statusText   = document.getElementById('status-text');
const detectionsList = document.getElementById('detections-list');
const overlayMsg   = document.getElementById('overlay-message');

// ── State ────────────────────────────────────────────────────────
let model       = null;   // loaded COCO-SSD model
let stream      = null;   // webcam MediaStream
let animFrameId = null;   // requestAnimationFrame handle
let isRunning   = false;

// ── Colour palette for bounding boxes (per-class) ────────────────
const CLASS_COLORS = [
  '#58a6ff','#3fb950','#f78166','#d2a8ff','#ffa657',
  '#79c0ff','#56d364','#ff7b72','#bc8cff','#e3b341'
];
const colorMap = {};
let colorIndex = 0;

function colorFor(label) {
  if (!colorMap[label]) {
    colorMap[label] = CLASS_COLORS[colorIndex % CLASS_COLORS.length];
    colorIndex++;
  }
  return colorMap[label];
}

// ── Status helpers ───────────────────────────────────────────────
function setStatus(state, text) {
  statusDot.className = 'dot ' + state;
  statusText.textContent = text;
}

// ── Step 1: Load the AI model ────────────────────────────────────
async function loadModel() {
  setStatus('loading', 'Loading AI model…');
  try {
    model = await cocoSsd.load();
    setStatus('ready', 'Model ready — click Start Camera');
  } catch (err) {
    setStatus('error', 'Failed to load model. Check your internet connection.');
    console.error('Model load error:', err);
  }
}

// ── Step 2: Start webcam ─────────────────────────────────────────
async function startCamera() {
  if (!model) {
    setStatus('error', 'Model not loaded yet — please wait.');
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();

    overlayMsg.classList.add('hidden');
    btnStart.disabled = true;
    btnStop.disabled  = false;
    isRunning = true;

    setStatus('running', 'Detecting objects…');
    detectLoop();
  } catch (err) {
    setStatus('error', 'Camera access denied. Please allow camera permission.');
    console.error('Camera error:', err);
  }
}

// ── Step 3: Stop webcam ──────────────────────────────────────────
function stopCamera() {
  isRunning = false;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (stream) stream.getTracks().forEach(t => t.stop());
  video.srcObject = null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlayMsg.classList.remove('hidden');

  btnStart.disabled = false;
  btnStop.disabled  = true;

  setStatus('stopped', 'Camera stopped — click Start Camera to restart');
  renderDetectionsList([]);
}

// ── Step 4: Detection loop ───────────────────────────────────────
async function detectLoop() {
  if (!isRunning) return;

  // Sync canvas size to actual video display size
  canvas.width  = video.videoWidth  || video.clientWidth;
  canvas.height = video.videoHeight || video.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  try {
    const predictions = await model.detect(video);
    drawBoxes(predictions);
    renderDetectionsList(predictions);
  } catch (err) {
    // silently skip a bad frame
  }

  animFrameId = requestAnimationFrame(detectLoop);
}

// ── Draw bounding boxes on canvas ───────────────────────────────
function drawBoxes(predictions) {
  predictions.forEach(pred => {
    const [x, y, w, h] = pred.bbox;
    const label  = pred.class;
    const conf   = Math.round(pred.score * 100);
    const color  = colorFor(label);
    const text   = `${label} ${conf}%`;

    // Box
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.stroke();

    // Label background
    ctx.font = 'bold 14px Segoe UI, system-ui, sans-serif';
    const textW = ctx.measureText(text).width;
    const padX  = 8, padY = 4, textH = 14;
    const labelX = x;
    const labelY = y > 28 ? y - textH - padY * 2 : y + h;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(labelX, labelY, textW + padX * 2, textH + padY * 2, 4);
    ctx.fill();

    // Label text
    ctx.fillStyle = '#0d1117';
    ctx.fillText(text, labelX + padX, labelY + textH + padY - 2);
  });
}

// ── Render sidebar list ──────────────────────────────────────────
function renderDetectionsList(predictions) {
  if (!predictions || predictions.length === 0) {
    detectionsList.innerHTML = isRunning
      ? '<p class="placeholder-text">Nothing detected yet — point the camera at objects.</p>'
      : '<p class="placeholder-text">Detected objects will appear here once camera starts.</p>';
    return;
  }

  // Sort by confidence descending, deduplicate by label (keep highest)
  const seen   = {};
  const unique = [];
  predictions
    .slice()
    .sort((a, b) => b.score - a.score)
    .forEach(p => {
      if (!seen[p.class]) {
        seen[p.class] = true;
        unique.push(p);
      }
    });

  detectionsList.innerHTML = unique.map(pred => {
    const conf  = Math.round(pred.score * 100);
    const tier  = conf >= 75 ? 'high' : conf >= 50 ? 'medium' : 'low';
    const color = colorFor(pred.class);
    return `
      <div class="detection-item">
        <span class="detection-label" style="color:${color}">${pred.class}</span>
        <span class="detection-badge ${tier}">${conf}%</span>
      </div>`;
  }).join('');
}

// ── Button listeners ─────────────────────────────────────────────
btnStart.addEventListener('click', startCamera);
btnStop.addEventListener('click', stopCamera);

// ── Kick off model load immediately ─────────────────────────────
loadModel();
