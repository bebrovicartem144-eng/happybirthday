// =========================================================================
// Персональный сайт-поздравление с 16-летием для любимой Насти от Артёма
// Файл скриптов: script.js
// =========================================================================

// ==========================================
// 1. АКУСТИЧЕСКИЙ РОМАНТИЧЕСКИЙ АУДИО-ДВИЖОК
//    (Grand Piano + Тёплые струнные + Концертный ревербератор)
// ==========================================
let audioCtx = null;
let masterBus = null;
let reverbNode = null;
let isMusicPlaying = false;
let schedulerTimer = null;
let currentSongKey = 'river';
let beatIndex = 0;

// Частоты нот (от 2-й до 6-й октавы)
const N = {
  A2: 110.00, B2: 123.47,
  C3: 130.81, Cs3: 138.59, D3: 146.83, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Gs3: 207.65, A3: 220.00, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.00, B5: 987.77
};

// Три многоголосные романтические композиции (фортепианные арпеджио + мелодия + тёплый струнный пэд)
const COMPOSITIONS = {
  // 1. В стиле лирического современного неоклассического пианино (F#m - D - A - E, в духе Yiruma)
  river: {
    stepMs: 310,
    steps: [
      // Такт 1: F#m9
      { pad: [N.Fs3, N.A3, N.Cs4], arp: N.Fs3, mel: N.A4, dur: 2.6 },
      { arp: N.Cs4, mel: N.Gs4, dur: 1.8 },
      { arp: N.Fs4, mel: N.A4, dur: 2.2 },
      { arp: N.Cs4, mel: N.B4, dur: 2.0 },
      { arp: N.Fs4, mel: N.Cs5, dur: 2.8 },
      { arp: N.A4, dur: 1.8 },
      { arp: N.Cs4, mel: N.E5, dur: 2.6 },
      { arp: N.Fs4, dur: 1.8 },
      // Такт 2: Dmaj7
      { pad: [N.D3, N.Fs3, N.A3], arp: N.D3, mel: N.D5, dur: 3.0 },
      { arp: N.A3, dur: 1.8 },
      { arp: N.D4, mel: N.Cs5, dur: 2.2 },
      { arp: N.Fs4, mel: N.B4, dur: 2.2 },
      { arp: N.A4, mel: N.A4, dur: 3.0 },
      { arp: N.Fs4, dur: 1.8 },
      { arp: N.D4, mel: N.B4, dur: 2.0 },
      { arp: N.A3, dur: 1.8 },
      // Такт 3: Amaj7
      { pad: [N.A2, N.E3, N.Cs4], arp: N.A2, mel: N.Cs5, dur: 3.0 },
      { arp: N.E3, dur: 1.8 },
      { arp: N.A3, mel: N.E5, dur: 2.4 },
      { arp: N.Cs4, mel: N.A5, dur: 2.8 },
      { arp: N.E4, mel: N.Gs5, dur: 2.2 },
      { arp: N.Cs4, mel: N.Fs5, dur: 2.2 },
      { arp: N.A3, mel: N.E5, dur: 2.6 },
      { arp: N.E3, dur: 1.8 },
      // Такт 4: E6
      { pad: [N.E3, N.Gs3, N.B3], arp: N.E3, mel: N.B4, dur: 3.2 },
      { arp: N.B3, dur: 1.8 },
      { arp: N.E4, mel: N.Cs5, dur: 2.2 },
      { arp: N.Gs4, mel: N.B4, dur: 2.2 },
      { arp: N.B4, mel: N.Gs4, dur: 2.8 },
      { arp: N.Gs4, dur: 1.8 },
      { arp: N.E4, mel: N.B4, dur: 2.2 },
      { arp: N.B3, dur: 1.8 }
    ]
  },

  // 2. Нежный романтический вальс 3/4 (Am - Dm - G - C - F - E7)
  waltz: {
    stepMs: 350,
    steps: [
      // Такт 1 (Am)
      { pad: [N.A2, N.E3, N.C4], arp: N.A2, mel: N.E5, dur: 2.8 },
      { arp: N.E3, dur: 1.8 },
      { arp: N.A3, mel: N.F5, dur: 1.9 },
      { arp: N.C4, mel: N.E5, dur: 2.6 },
      { arp: N.E3, mel: N.D5, dur: 1.9 },
      { arp: N.A3, mel: N.C5, dur: 2.0 },
      // Такт 2 (Dm7)
      { pad: [N.D3, N.A3, N.F4], arp: N.D3, mel: N.D5, dur: 3.0 },
      { arp: N.A3, dur: 1.8 },
      { arp: N.D4, mel: N.E5, dur: 1.9 },
      { arp: N.F4, mel: N.F5, dur: 2.6 },
      { arp: N.A3, mel: N.D5, dur: 1.9 },
      { arp: N.D4, mel: N.B4, dur: 2.0 },
      // Такт 3 (G7 -> Cmaj7)
      { pad: [N.G3, N.B3, N.D4], arp: N.G3, mel: N.E5, dur: 2.8 },
      { arp: N.B3, dur: 1.8 },
      { arp: N.D4, mel: N.D5, dur: 2.0 },
      { pad: [N.C3, N.G3, N.E4], arp: N.C3, mel: N.C5, dur: 3.0 },
      { arp: N.G3, dur: 1.8 },
      { arp: N.C4, mel: N.B4, dur: 2.0 },
      // Такт 4 (Fmaj7 -> E7)
      { pad: [N.F3, N.A3, N.C4], arp: N.F3, mel: N.A4, dur: 2.8 },
      { arp: N.C4, mel: N.B4, dur: 1.9 },
      { arp: N.F4, mel: N.C5, dur: 2.2 },
      { pad: [N.E3, N.Gs3, N.B3], arp: N.E3, mel: N.B4, dur: 3.2 },
      { arp: N.B3, mel: N.Gs4, dur: 2.0 },
      { arp: N.E4, mel: N.B4, dur: 2.2 }
    ]
  },

  // 3. Мечтательный вечерний ноктюрн (Cmaj7 - G/B - Am7 - Fmaj7)
  nocturne: {
    stepMs: 360,
    steps: [
      { pad: [N.C3, N.G3, N.E4], arp: N.C3, mel: N.E5, dur: 3.2 },
      { arp: N.G3, dur: 2.0 },
      { arp: N.C4, mel: N.G5, dur: 2.6 },
      { arp: N.E4, mel: N.D5, dur: 2.4 },
      { pad: [N.B2, N.G3, N.D4], arp: N.B2, mel: N.B4, dur: 3.0 },
      { arp: N.G3, dur: 2.0 },
      { arp: N.D4, mel: N.C5, dur: 2.2 },
      { arp: N.G4, mel: N.D5, dur: 2.4 },
      { pad: [N.A2, N.E3, N.C4], arp: N.A2, mel: N.C5, dur: 3.2 },
      { arp: N.E3, dur: 2.0 },
      { arp: N.A3, mel: N.E5, dur: 2.6 },
      { arp: N.C4, mel: N.A4, dur: 2.4 },
      { pad: [N.F3, N.C4, N.A4], arp: N.F3, mel: N.A4, dur: 3.0 },
      { arp: N.C4, mel: N.G4, dur: 2.2 },
      { pad: [N.G3, N.B3, N.D4], arp: N.G3, mel: N.B4, dur: 2.8 },
      { arp: N.D4, mel: N.D5, dur: 2.6 }
    ]
  }
};

// Создаём импульсный отклик концертного зала для мягкого объёмного ревербератора
function createConcertHallReverb(ctx) {
  const duration = 3.2;
  const decay = 2.6;
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const channelData = impulse.getChannelData(ch);
    let lastOut = 0.0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      // Мягкий розовый фильтр для естественной теплоты зала
      lastOut = (lastOut + (0.04 * white)) / 1.04;
      const env = Math.pow(1 - i / length, decay);
      channelData[i] = lastOut * env * 1.8;
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

function initAudioEngine() {
  if (!audioCtx) {
    const AudioConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioConstructor) return;
    audioCtx = new AudioConstructor();

    // Мастер-компрессор для мягкого склеивания звука без клиппинга
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, audioCtx.currentTime);
    compressor.knee.setValueAtTime(24, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0.01, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
    compressor.connect(audioCtx.destination);

    // Стерео-ревербератор зала
    reverbNode = createConcertHallReverb(audioCtx);
    const wetGain = audioCtx.createGain();
    wetGain.gain.setValueAtTime(0.55, audioCtx.currentTime);
    reverbNode.connect(wetGain);
    wetGain.connect(compressor);

    const dryGain = audioCtx.createGain();
    dryGain.gain.setValueAtTime(0.75, audioCtx.currentTime);
    dryGain.connect(compressor);

    masterBus = audioCtx.createGain();
    masterBus.gain.setValueAtTime(0.85, audioCtx.currentTime);
    masterBus.connect(dryGain);
    masterBus.connect(reverbNode);
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Реалистичный синтез ноты акустического рояля с обертонами, фильтром молоточка и педалью сустейна
function playGrandPianoNote(freq, durationSec = 2.4, velocity = 0.085) {
  if (!audioCtx || !masterBus || !freq) return;
  const now = audioCtx.currentTime;

  const noteGain = audioCtx.createGain();
  // Динамический фильтр низких частот (имитирует мягкий фетр молоточка рояля и естественное затухание)
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(freq * 5.5, 3200), now);
  filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.4, 380), now + durationSec * 0.85);
  filter.Q.setValueAtTime(0.7, now);

  // Огибающая громкости рояля с мягкой атакой и долгим педальным послезвучием
  noteGain.gain.setValueAtTime(0.0001, now);
  noteGain.gain.linearRampToValueAtTime(velocity, now + 0.018);
  noteGain.gain.exponentialRampToValueAtTime(velocity * 0.42, now + 0.38);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  filter.connect(noteGain);
  noteGain.connect(masterBus);

  // Гармонический ряд струны рояля (основной тон + 2-я, 3-я и 4-я гармоники с лёгким расстроением унисона)
  const partials = [
    { mult: 1.0, detune: -1.2, amp: 0.65, type: 'triangle', decayMult: 1.0 },
    { mult: 1.0, detune: 1.2,  amp: 0.45, type: 'sine',     decayMult: 1.0 },
    { mult: 2.0, detune: 0.8,  amp: 0.22, type: 'sine',     decayMult: 0.65 },
    { mult: 3.0, detune: -1.5, amp: 0.07, type: 'sine',     decayMult: 0.40 },
    { mult: 4.0, detune: 2.0,  amp: 0.025, type: 'sine',    decayMult: 0.25 }
  ];

  partials.forEach((p) => {
    const osc = audioCtx.createOscillator();
    const pGain = audioCtx.createGain();
    osc.type = p.type;
    osc.frequency.setValueAtTime(freq * p.mult, now);
    osc.detune.setValueAtTime(p.detune, now);

    const pDur = durationSec * p.decayMult;
    pGain.gain.setValueAtTime(p.amp, now);
    pGain.gain.exponentialRampToValueAtTime(0.0001, now + pDur);

    osc.connect(pGain);
    pGain.connect(filter);
    osc.start(now);
    osc.stop(now + pDur + 0.05);
  });
}

// Тёплый бархатный струнный пэд (виолончели и скрипки на фоне)
function playWarmStringPad(chordFreqs, durationSec = 3.2, volume = 0.024) {
  if (!audioCtx || !masterBus || !chordFreqs) return;
  const now = audioCtx.currentTime;

  const padFilter = audioCtx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.setValueAtTime(520, now);
  padFilter.Q.setValueAtTime(0.5, now);

  const padGain = audioCtx.createGain();
  padGain.gain.setValueAtTime(0.0001, now);
  padGain.gain.linearRampToValueAtTime(volume, now + 0.95);
  padGain.gain.setValueAtTime(volume * 0.9, now + durationSec * 0.6);
  padGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  padFilter.connect(padGain);
  padGain.connect(masterBus);

  chordFreqs.forEach((freq) => {
    [-7, 0, 7].forEach((det) => {
      const osc = audioCtx.createOscillator();
      osc.type = det === 0 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(det, now);
      osc.connect(padFilter);
      osc.start(now);
      osc.stop(now + durationSec + 0.1);
    });
  });
}

function playRomanticChime() {
  initAudioEngine();
  if (!audioCtx) return;
  const notes = [N.A4, N.Cs5, N.E5, N.A5];
  notes.forEach((f, idx) => {
    setTimeout(() => playGrandPianoNote(f, 2.2, 0.065), idx * 110);
  });
}

function startMusicLoop() {
  initAudioEngine();
  if (!audioCtx) return;
  if (schedulerTimer) clearInterval(schedulerTimer);

  isMusicPlaying = true;
  updateMusicUI();

  const song = COMPOSITIONS[currentSongKey] || COMPOSITIONS.river;

  const triggerStep = () => {
    if (!isMusicPlaying) return;
    const step = song.steps[beatIndex % song.steps.length];
    if (step.pad) {
      playWarmStringPad(step.pad, (song.stepMs / 1000) * 7.5, 0.022);
    }
    if (step.arp) {
      playGrandPianoNote(step.arp, step.dur || 2.0, 0.052);
    }
    if (step.mel) {
      // Лёгкая задержка правой руки пианиста (18 мс) для живого человеческого исполнения
      setTimeout(() => {
        if (isMusicPlaying) {
          playGrandPianoNote(step.mel, (step.dur || 2.2) * 1.15, 0.088);
        }
      }, 18);
    }
    beatIndex++;
  };

  triggerStep();
  schedulerTimer = setInterval(triggerStep, song.stepMs);
}

function stopMusicLoop() {
  isMusicPlaying = false;
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  updateMusicUI();
}

function updateMusicUI() {
  const eqContainer = document.getElementById('eqContainer');
  const label = document.getElementById('musicStatusLabel');
  if (isMusicPlaying) {
    eqContainer.classList.add('playing');
    label.textContent = 'Звучит';
  } else {
    eqContainer.classList.remove('playing');
    label.textContent = 'Музыка';
  }
}

// ==========================================
// 2. ИНТЕРАКТИВНОСТЬ КОНВЕРТА И ОТКРЫТКИ
// ==========================================
const envelopeBox = document.getElementById('envelopeBox');
const envelopeStage = document.getElementById('envelopeStage');
const letterStage = document.getElementById('letterStage');
const openTagBtn = document.getElementById('openTagBtn');
const foldBackBtn = document.getElementById('foldBackBtn');
const heartFireworkBtn = document.getElementById('heartFireworkBtn');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const melodySelect = document.getElementById('melodySelect');
const themeCycleBtn = document.getElementById('themeCycleBtn');

let isOpening = false;

function openGreetingLetter() {
  if (isOpening) return;
  isOpening = true;

  playRomanticChime();
  if (!isMusicPlaying) {
    setTimeout(() => startMusicLoop(), 350);
  }

  envelopeBox.classList.add('opening');
  spawnHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 24);

  setTimeout(() => {
    envelopeStage.classList.add('hidden');
    letterStage.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    isOpening = false;
  }, 1050);
}

function foldGreetingLetter() {
  letterStage.classList.add('hidden');
  envelopeBox.classList.remove('opening');
  envelopeStage.classList.remove('hidden');
}

openTagBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  openGreetingLetter();
});

foldBackBtn.addEventListener('click', () => {
  playRomanticChime();
  foldGreetingLetter();
});

heartFireworkBtn.addEventListener('click', (e) => {
  playRomanticChime();
  const rect = e.currentTarget.getBoundingClientRect();
  spawnHeartBurst(rect.left + rect.width / 2, rect.top, 32);
});

musicToggleBtn.addEventListener('click', () => {
  if (isMusicPlaying) {
    stopMusicLoop();
  } else {
    startMusicLoop();
  }
});

melodySelect.addEventListener('change', (e) => {
  currentSongKey = e.target.value;
  beatIndex = 0;
  if (isMusicPlaying) {
    startMusicLoop();
  }
});

// Секретные карточки-комплименты для Насти внутри письма
document.querySelectorAll('.secret-wish-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const secretText = btn.querySelector('.secret-text');
    const isHidden = secretText.classList.contains('hidden');
    secretText.classList.toggle('hidden');
    initAudioEngine();
    playGrandPianoNote(isHidden ? N.E5 : N.Cs5, 1.6, 0.06);
    const rect = btn.getBoundingClientRect();
    spawnHeartBurst(rect.left + rect.width / 2, rect.top + 15, 10);
  });
});

// Переключатель романтической атмосферы фона
const themes = ['', 'theme-twilight', 'theme-dawn'];
let currentThemeIdx = 0;
themeCycleBtn.addEventListener('click', () => {
  if (themes[currentThemeIdx]) {
    document.body.classList.remove(themes[currentThemeIdx]);
  }
  currentThemeIdx = (currentThemeIdx + 1) % themes.length;
  if (themes[currentThemeIdx]) {
    document.body.classList.add(themes[currentThemeIdx]);
  }
  initAudioEngine();
  playGrandPianoNote(N.A5, 1.4, 0.045);
});

// ==========================================
// 3. АНИМАЦИЯ ФОНА (Лепестки роз и золотые искорки)
// ==========================================
const canvas = document.getElementById('romanticCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  const isPetal = Math.random() > 0.38;
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: isPetal ? 5 + Math.random() * 7 : 1.5 + Math.random() * 2.5,
    speedY: 0.45 + Math.random() * 1.1,
    speedX: -0.4 + Math.random() * 0.8,
    angle: Math.random() * Math.PI * 2,
    spin: -0.02 + Math.random() * 0.04,
    isPetal,
    alpha: 0.35 + Math.random() * 0.55,
    hue: isPetal ? (335 + Math.random() * 20) : (42 + Math.random() * 12)
  };
}

function initParticles() {
  resizeCanvas();
  particles = [];
  const count = Math.min(55, Math.floor(window.innerWidth / 24));
  for (let i = 0; i < count; i++) {
    const p = createParticle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(p.angle) * 0.35;
    p.angle += p.spin;

    if (p.y > canvas.height + 20) {
      particles[i] = createParticle();
      particles[i].y = -15;
    }
    if (p.x > canvas.width + 20) p.x = -15;
    if (p.x < -20) p.x = canvas.width + 15;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;

    if (p.isPetal) {
      ctx.fillStyle = `hsl(${p.hue}, 82%, 82%)`;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size, -p.size, p.size, p.size, 0, p.size);
      ctx.bezierCurveTo(-p.size, p.size, -p.size, -p.size, 0, -p.size);
      ctx.fill();
    } else {
      ctx.fillStyle = `hsl(${p.hue}, 95%, 78%)`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
  initParticles();
  requestAnimationFrame(drawParticles);
});

// ==========================================
// 4. САЛЮТ ИЗ СЕРДЕЧЕК ПРИ НАЖАТИИ
// ==========================================
const SYMBOLS = ['♥', '✨', '💖', '🌸', '16 ✨', '🎂'];

function spawnHeartBurst(x, y, count = 7) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'click-heart';
    el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const offsetX = (Math.random() - 0.5) * 150;
    const offsetY = (Math.random() - 0.5) * 65;
    el.style.left = `${x + offsetX}px`;
    el.style.top = `${y + offsetY}px`;
    el.style.fontSize = `${14 + Math.random() * 14}px`;
    el.style.color = Math.random() > 0.4 ? '#fb7185' : '#fde68a';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
}

document.addEventListener('click', (e) => {
  if (e.target.closest('button, select')) return;
  spawnHeartBurst(e.clientX, e.clientY, 6);
});
