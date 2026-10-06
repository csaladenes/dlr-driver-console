// DLR Pretend Driver Console Interactive Playground
// Web Audio API Synth Engine + Authentic Audio Samples + Dancing Knobs + Hyperspace Warp Canvas

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.sounds = {};
    this.audioBuffers = {};
    this.soundUrls = {
      mindTheGap: 'sounds/mind_the_gap.wav',
      mindTheGapShort: 'sounds/mind_the_gap_short.wav',
      woolwichFerry: 'sounds/woolwich_ferry.wav',
      bowChurchBells: 'sounds/bow_church_bells.wav',
      hyperdriveWarp: 'sounds/hyperdrive_warp.wav',
      dlrChime: 'sounds/dlr_bing_bong.wav'
    };
    this.isLoaded = false;
  }

  async init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (!this.isLoaded) {
      await this.loadSounds();
      this.isLoaded = true;
    }
  }

  async loadSounds() {
    for (const [key, url] of Object.entries(this.soundUrls)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        this.audioBuffers[key] = await this.ctx.decodeAudioData(arrayBuffer);
      } catch (err) {
        console.warn(`Failed to preload audio sample ${key}:`, err);
      }
    }
  }

  playBuffer(bufferKey, gainVal = 1.0, loop = false) {
    if (!this.ctx) return null;
    const buffer = this.audioBuffers[bufferKey];
    if (!buffer) return null;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(gainVal, this.ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    source.start();
    return { source, gainNode };
  }

  // Authentic DLR Bing-Bong chime followed immediately by announcement
  async playMindTheGap() {
    await this.init();
    // Play the signature DLR Bing-Bong chime first!
    this.playBuffer('dlrChime', 0.85);

    setTimeout(() => {
      this.playBuffer('mindTheGap', 1.0);
    }, 650);
  }

  async playWoolwichFerry() {
    await this.init();
    // Maritime deep horn blast
    this.playBuffer('woolwichFerry', 1.0);
    // Also trigger subtle mechanical steam synth swell
    this.triggerSubmarineRumble();
  }

  async playBowChurchBells() {
    await this.init();
    // Authentic St Mary-le-Bow carillon peal
    this.playBuffer('bowChurchBells', 1.0);
  }

  startWarpSound() {
    if (!this.ctx) return;
    this.warpSoundObj = this.playBuffer('hyperdriveWarp', 1.0, true);
    // Add real-time sci-fi pitch climb oscillator
    this.startWarpOscillator();
  }

  stopWarpSound() {
    if (this.warpSoundObj && this.warpSoundObj.source) {
      try {
        this.warpSoundObj.gainNode.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.2);
        setTimeout(() => {
          this.warpSoundObj.source.stop();
          this.warpSoundObj = null;
        }, 250);
      } catch (e) {}
    }
    this.stopWarpOscillator();
  }

  startWarpOscillator() {
    try {
      this.warpOsc = this.ctx.createOscillator();
      this.warpGain = this.ctx.createGain();
      this.warpOsc.type = 'sawtooth';
      this.warpOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
      this.warpOsc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 3.0);

      this.warpGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.warpGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.8);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(4500, this.ctx.currentTime + 2.5);

      this.warpOsc.connect(filter);
      filter.connect(this.warpGain);
      this.warpGain.connect(this.ctx.destination);
      this.warpOsc.start();
    } catch (e) {}
  }

  stopWarpOscillator() {
    if (this.warpOsc) {
      try {
        this.warpGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
        setTimeout(() => {
          this.warpOsc.stop();
          this.warpOsc.disconnect();
          this.warpOsc = null;
        }, 150);
      } catch (e) {}
    }
  }

  // Click & switch click sound
  playClick(pitch = 600, duration = 0.04) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Keypad blip
  playKeypadBlip(freq = 880) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  triggerSubmarineRumble() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 2.5);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 2.8);
  }
}

// ============================================================================
// STAR WARS HYPERSPACE WARP CANVAS ENGINE
// ============================================================================
class HyperspaceWarp {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.numStars = 900;
    this.active = false;
    this.speed = 1.0;
    this.maxSpeed = 55.0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initStars();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * this.width * 2,
        y: (Math.random() - 0.5) * this.height * 2,
        z: Math.random() * 1000 + 1,
        prevZ: 1000,
        color: this.getRandomColor()
      });
    }
  }

  getRandomColor() {
    const colors = ['#ffffff', '#a5f3fc', '#bae6fd', '#38bdf8', '#c4b5fd', '#fde047'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  start() {
    this.active = true;
    document.body.classList.add('warp-active');
  }

  stop() {
    this.active = false;
    document.body.classList.remove('warp-active');
  }

  render() {
    if (!this.active && this.speed <= 1.05) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      return;
    }

    // Target speed ramp
    const targetSpeed = this.active ? this.maxSpeed : 1.0;
    this.speed += (targetSpeed - this.speed) * 0.12;

    // Motion blur fade
    this.ctx.fillStyle = this.active ? 'rgba(5, 10, 20, 0.35)' : 'rgba(5, 10, 20, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.prevZ = star.z;
      star.z -= this.speed;

      if (star.z <= 0) {
        star.z = 1000;
        star.prevZ = 1000;
        star.x = (Math.random() - 0.5) * this.width * 2;
        star.y = (Math.random() - 0.5) * this.height * 2;
      }

      const k = 280 / star.z;
      const px = star.x * k + this.cx;
      const py = star.y * k + this.cy;

      const prevK = 280 / star.prevZ;
      const prevX = star.x * prevK + this.cx;
      const prevY = star.y * prevK + this.cy;

      if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
        const size = Math.max(0.8, (1 - star.z / 1000) * 3);
        this.ctx.beginPath();
        this.ctx.moveTo(prevX, prevY);
        this.ctx.lineTo(px, py);
        this.ctx.strokeStyle = star.color;
        this.ctx.lineWidth = this.active ? size * 2 : size;
        this.ctx.stroke();

        if (this.active && this.speed > 20) {
          // Add cyan/blue warp streaking glow
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = '#38bdf8';
        } else {
          this.ctx.shadowBlur = 0;
        }
      }
    }
  }
}

// ============================================================================
// OSCILLOSCOPE CRT CANVAS RENDERING
// ============================================================================
class OscilloscopeScreens {
  constructor(canvas1, canvas2) {
    this.c1 = canvas1;
    this.ctx1 = canvas1.getContext('2d');
    this.c2 = canvas2;
    this.ctx2 = canvas2.getContext('2d');
    this.t = 0;
    this.boost = 1.0;
  }

  setBoost(val) {
    this.boost = val;
  }

  render() {
    this.t += 0.05 * this.boost;

    // Screen 1: Green radar / audio wave monitor
    const w1 = this.c1.width;
    const h1 = this.c1.height;
    this.ctx1.fillStyle = 'rgba(0, 18, 12, 0.25)';
    this.ctx1.fillRect(0, 0, w1, h1);

    // Green grid
    this.ctx1.strokeStyle = 'rgba(0, 255, 102, 0.12)';
    this.ctx1.lineWidth = 1;
    for (let x = 0; x < w1; x += 18) {
      this.ctx1.beginPath(); this.ctx1.moveTo(x, 0); this.ctx1.lineTo(x, h1); this.ctx1.stroke();
    }
    for (let y = 0; y < h1; y += 18) {
      this.ctx1.beginPath(); this.ctx1.moveTo(0, y); this.ctx1.lineTo(w1, y); this.ctx1.stroke();
    }

    // Audio frequency bars / pulse
    this.ctx1.fillStyle = '#00ff66';
    const numBars = 11;
    const barW = 8;
    const spacing = 14;
    const startX = (w1 - (numBars * spacing)) / 2;

    for (let i = 0; i < numBars; i++) {
      const bh = (Math.sin(this.t * 2 + i * 0.7) * 0.5 + 0.5) * 45 * this.boost + 12;
      const x = startX + i * spacing;
      const y = (h1 - bh) / 2;
      this.ctx1.fillRect(x, y, barW, bh);
    }

    // Horizontal scanline
    this.ctx1.strokeStyle = '#22c55e';
    this.ctx1.lineWidth = 2;
    this.ctx1.beginPath();
    this.ctx1.moveTo(0, h1 / 2);
    this.ctx1.lineTo(w1, h1 / 2);
    this.ctx1.stroke();

    // Screen 2: Cyan track telemetry & data wave
    const w2 = this.c2.width;
    const h2 = this.c2.height;
    this.ctx2.fillStyle = 'rgba(2, 18, 38, 0.25)';
    this.ctx2.fillRect(0, 0, w2, h2);

    // Cyan grid
    this.ctx2.strokeStyle = 'rgba(0, 229, 255, 0.12)';
    this.ctx2.lineWidth = 1;
    for (let x = 0; x < w2; x += 18) {
      this.ctx2.beginPath(); this.ctx2.moveTo(x, 0); this.ctx2.lineTo(x, h2); this.ctx2.stroke();
    }
    for (let y = 0; y < h2; y += 18) {
      this.ctx2.beginPath(); this.ctx2.moveTo(0, y); this.ctx2.lineTo(w2, y); this.ctx2.stroke();
    }

    // Telemetry wave lines
    this.ctx2.strokeStyle = '#00e5ff';
    this.ctx2.lineWidth = 2;
    this.ctx2.beginPath();
    for (let x = 0; x < w2; x += 4) {
      const y = h2 / 2 + Math.sin(x * 0.08 + this.t * 3) * (20 * this.boost) + Math.cos(x * 0.03 - this.t * 1.5) * 10;
      if (x === 0) this.ctx2.moveTo(x, y);
      else this.ctx2.lineTo(x, y);
    }
    this.ctx2.stroke();

    // Digital readout text on Screen 2
    this.ctx2.fillStyle = '#38bdf8';
    this.ctx2.font = '9px monospace';
    this.ctx2.fillText(`PWR: ${(88 * this.boost).toFixed(1)}%`, 8, 14);
    this.ctx2.fillText(`SIG: CH-4`, w2 - 55, 14);
  }
}

// ============================================================================
// MAIN CONSOLE LOGIC & DANCING KNOBS CONTROLLER
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const audio = new AudioEngine();

  // Hyperspace Canvas Init
  const hyperspaceCanvas = document.getElementById('hyperspaceCanvas');
  const hyperspace = new HyperspaceWarp(hyperspaceCanvas);

  // CRT Displays Init
  const oscillo1 = document.getElementById('canvasOscillo1');
  const oscillo2 = document.getElementById('canvasOscillo2');
  const oscScreens = new OscilloscopeScreens(oscillo1, oscillo2);

  // Knob Auto-Dance Controller
  let autoDanceEnabled = true;
  let danceTimer = 0;

  // Collect all dancing knobs and dials
  const dancingKnobs = Array.from(document.querySelectorAll('.dancing-knob'));
  // Store individual dancing phase & frequencies for organic choreographies
  const knobConfigs = dancingKnobs.map((knob, idx) => ({
    el: knob,
    phase: (idx * 0.42) % (Math.PI * 2),
    speed: 1.0 + (idx % 5) * 0.28,
    angle: 0,
    amplitude: 150 + (idx % 3) * 60,
    userOffset: 0
  }));

  // Center Gauge Needle & Speedo elements
  const handCenter = document.getElementById('handCenter');
  const speedoNeedle = document.getElementById('speedoNeedle');
  const speedoOdo = document.getElementById('speedoOdo');
  const speedText = document.getElementById('speedText');
  const meter1 = document.getElementById('meter1');
  const meter2 = document.getElementById('meter2');
  const vuSegments = Array.from(document.querySelectorAll('#vuMeter .v-segment'));

  // Micro LEDs
  const mleds = [
    document.getElementById('mled1'),
    document.getElementById('mled2'),
    document.getElementById('mled3'),
    document.getElementById('mled4')
  ];

  // Sliders
  const fader1 = document.getElementById('fader1');
  const fader2 = document.getElementById('fader2');
  const sensSlider1 = document.getElementById('sensSlider1');
  const sensSlider2 = document.getElementById('sensSlider2');

  // Populate Membrane Keyboard Grid (3x10 = 30 interactive tactile buttons)
  const membraneGrid = document.getElementById('membraneGrid');
  const keyboardNotes = [
    261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25,
    277.18, 311.13, 369.99, 415.30, 466.16, 554.37, 622.25, 739.99, 830.61, 932.33,
    523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51
  ];

  for (let i = 0; i < 30; i++) {
    const key = document.createElement('div');
    key.className = 'membrane-key';
    key.dataset.idx = i;
    key.title = `Train Telemetry Key #${i + 1}`;
    key.addEventListener('pointerdown', () => {
      audio.init();
      audio.playKeypadBlip(keyboardNotes[i % keyboardNotes.length]);
      key.classList.add('active');
      setTimeout(() => key.classList.remove('active'), 180);
    });
    membraneGrid.appendChild(key);
  }

  // Keyhole Lock Switch - Toggles Auto-Dance Mode
  const keyholeBtn = document.getElementById('keyholeBtn');
  keyholeBtn.addEventListener('click', () => {
    audio.init();
    audio.playClick(800, 0.08);
    autoDanceEnabled = !autoDanceEnabled;
    keyholeBtn.classList.toggle('active-dance', autoDanceEnabled);
  });
  keyholeBtn.classList.add('active-dance');

  // Manual Knob rotation on click / drag
  dancingKnobs.forEach((knob, idx) => {
    knob.addEventListener('click', () => {
      audio.init();
      audio.playClick(500 + idx * 30, 0.03);
      knobConfigs[idx].userOffset += 45;
    });
  });

  // Stalk toggles (click to throw lever)
  const stalk1 = document.getElementById('stalk1');
  const stalk2 = document.getElementById('stalk2');
  [stalk1, stalk2].forEach(stalk => {
    stalk.addEventListener('click', () => {
      audio.init();
      audio.playClick(320, 0.06);
      stalk.classList.toggle('thrown');
    });
  });

  // Rocker Switches
  const rockers = [document.getElementById('rocker1'), document.getElementById('rocker2'), document.getElementById('rocker3')];
  rockers.forEach(rocker => {
    rocker.addEventListener('click', () => {
      audio.init();
      audio.playClick(440, 0.05);
      rocker.classList.toggle('active');
    });
  });

  // D-Pad buttons
  const dpadBtns = [
    { el: document.getElementById('dpadUp'), pitch: 700 },
    { el: document.getElementById('dpadDown'), pitch: 350 },
    { el: document.getElementById('dpadLeft'), pitch: 520 },
    { el: document.getElementById('dpadRight'), pitch: 620 }
  ];
  dpadBtns.forEach(({ el, pitch }) => {
    el.addEventListener('click', () => {
      audio.init();
      audio.playClick(pitch, 0.05);
    });
  });

  // 2x2 Blue Push Buttons
  const blueBtns = [
    { btn: document.getElementById('btnB1'), led: document.getElementById('ledB1'), pitch: 400 },
    { btn: document.getElementById('btnB2'), led: document.getElementById('ledB2'), pitch: 500 },
    { btn: document.getElementById('btnB3'), led: document.getElementById('ledB3'), pitch: 600 },
    { btn: document.getElementById('btnB4'), led: document.getElementById('ledB4'), pitch: 700 }
  ];
  blueBtns.forEach(({ btn, led, pitch }) => {
    btn.addEventListener('click', () => {
      audio.init();
      audio.playClick(pitch, 0.06);
      btn.classList.add('pushed');
      led.classList.toggle('active');
      setTimeout(() => btn.classList.remove('pushed'), 140);
    });
  });

  // QR Code Badge (Tap triggers fun easter egg chime)
  const qrCard = document.getElementById('qrCard');
  qrCard.addEventListener('click', () => {
    audio.init();
    audio.playBuffer('dlrChime', 0.9);
  });

  // Redrawn Docklands Roundel (Tap triggers cheerful chime)
  const docklandsRoundel = document.getElementById('docklandsRoundel');
  docklandsRoundel.addEventListener('click', () => {
    audio.init();
    audio.playBuffer('dlrChime', 1.0);
  });

  // ==========================================================================
  // THE 4 HERO DRIVER BUTTONS
  // ==========================================================================
  
  // 1. Mind the Gap Button (Authentic DLR Bing-Bong + Loud TfL Announcement)
  const btnMindTheGap = document.getElementById('btnMindTheGap');
  btnMindTheGap.addEventListener('pointerdown', async () => {
    btnMindTheGap.classList.add('is-pressed');
    await audio.playMindTheGap();
  });
  window.addEventListener('pointerup', () => btnMindTheGap.classList.remove('is-pressed'));

  // 2. Woolwich Ferry Horn Button (Low resonant maritime horn)
  const btnWoolwichFerry = document.getElementById('btnWoolwichFerry');
  btnWoolwichFerry.addEventListener('pointerdown', async () => {
    btnWoolwichFerry.classList.add('is-pressed');
    await audio.playWoolwichFerry();
  });
  window.addEventListener('pointerup', () => btnWoolwichFerry.classList.remove('is-pressed'));

  // 3. Bow Church Bells Button (St Mary-le-Bow carillon chime)
  const btnBowChurch = document.getElementById('btnBowChurch');
  btnBowChurch.addEventListener('pointerdown', async () => {
    btnBowChurch.classList.add('is-pressed');
    await audio.playBowChurchBells();
  });
  window.addEventListener('pointerup', () => btnBowChurch.classList.remove('is-pressed'));

  // 4. High Speed Warp Button (Hold down for Star Wars Hyperdrive Warp!)
  const btnHighSpeed = document.getElementById('btnHighSpeed');
  let isWarping = false;

  const startWarp = async (e) => {
    e.preventDefault();
    if (isWarping) return;
    isWarping = true;
    btnHighSpeed.classList.add('is-pressed');
    await audio.init();
    audio.startWarpSound();
    hyperspace.start();
    oscScreens.setBoost(2.8);
  };

  const stopWarp = () => {
    if (!isWarping) return;
    isWarping = false;
    btnHighSpeed.classList.remove('is-pressed');
    audio.stopWarpSound();
    hyperspace.stop();
    oscScreens.setBoost(1.0);
  };

  btnHighSpeed.addEventListener('pointerdown', startWarp);
  window.addEventListener('pointerup', stopWarp);
  window.addEventListener('pointercancel', stopWarp);

  // Train Stations Rotation
  const stations = [
    'NEXT: SHADOWS TUNNEL',
    'NEXT: CANARY WHARF',
    'NEXT: HERRON QUAYS',
    'NEXT: CUTTY SARK',
    'NEXT: WOOLWICH ARSENAL',
    'NEXT: STRATFORD INT.',
    'NEXT: TOWER GATEWAY'
  ];
  let stationIndex = 0;
  const nextStationSign = document.getElementById('nextStation');
  setInterval(() => {
    if (!isWarping) {
      stationIndex = (stationIndex + 1) % stations.length;
      nextStationSign.textContent = stations[stationIndex];
    } else {
      nextStationSign.textContent = 'WARP SECTOR 001 - HYPERLANE';
    }
  }, 6000);

  // ==========================================================================
  // REAL-TIME ANIMATION LOOP (Dancing Knobs, Speedometer, Gauges, Canvas)
  // ==========================================================================
  let currentSpeed = 38;
  let targetSpeed = 38;

  function animationLoop() {
    danceTimer += 0.04;

    // 1. Hyperspace Warp Canvas
    hyperspace.render();

    // 2. Oscilloscope CRT Monitors
    oscScreens.render();

    // 3. Train Speed & Speedometer
    if (isWarping) {
      targetSpeed = 1080 + Math.random() * 40;
    } else {
      targetSpeed = 45 + Math.sin(danceTimer * 0.5) * 25;
    }
    currentSpeed += (targetSpeed - currentSpeed) * 0.08;
    speedText.textContent = `${Math.round(currentSpeed)} km/h`;
    speedoOdo.textContent = `${(currentSpeed * 1.2).toFixed(1)}`;

    // Needle rotation: map 0-100 km/h (or warp) to -65deg to +65deg
    const needleDeg = Math.min(75, Math.max(-65, -65 + (currentSpeed / 80) * 130));
    speedoNeedle.style.transform = `rotate(${needleDeg}deg)`;

    // 4. Center Gauge (Pressure / Flux)
    const centerDeg = Math.sin(danceTimer * 1.5) * 110 + (isWarping ? 70 : 0);
    handCenter.style.transform = `rotate(${centerDeg}deg)`;

    // 5. Meters & VU Segment dancing
    meter1.style.width = `${Math.min(100, 30 + Math.sin(danceTimer * 2) * 35 + (isWarping ? 40 : 0))}%`;
    meter2.style.width = `${Math.min(100, 50 + Math.cos(danceTimer * 1.8) * 40)}%`;

    vuSegments.forEach((seg, sIdx) => {
      const activeThreshold = Math.sin(danceTimer * 3 + sIdx * 0.8);
      seg.classList.toggle('active', activeThreshold > -0.2 || isWarping);
    });

    // Micro LEDs flickering
    mleds.forEach((m, mIdx) => {
      if (m) {
        m.classList.toggle('active', Math.sin(danceTimer * 4 + mIdx) > 0.1);
      }
    });

    // 6. AUTO-DANCING KNOBS
    if (autoDanceEnabled) {
      knobConfigs.forEach((k, idx) => {
        // Organic sinusoidal dancing angle with unique speed and phase
        const danceAngle = Math.sin(danceTimer * k.speed + k.phase) * (k.amplitude * (isWarping ? 1.8 : 1.0));
        k.angle = danceAngle + k.userOffset;
        k.el.style.transform = `rotate(${k.angle}deg)`;
      });

      // Pie dials needles dancing
      const pieNeedle1 = document.getElementById('pieNeedle1');
      const pieNeedle2 = document.getElementById('pieNeedle2');
      if (pieNeedle1) pieNeedle1.style.transform = `rotate(${danceTimer * 90}deg)`;
      if (pieNeedle2) pieNeedle2.style.transform = `rotate(${-danceTimer * 120}deg)`;

      // Sliders slight gentle bobbing
      if (!isWarping) {
        fader1.value = 65 + Math.sin(danceTimer * 1.2) * 20;
        fader2.value = 40 + Math.cos(danceTimer * 1.4) * 25;
        sensSlider1.value = 35 + Math.sin(danceTimer * 0.9) * 25;
        sensSlider2.value = 60 + Math.cos(danceTimer * 1.1) * 20;
      } else {
        fader1.value = 98;
        fader2.value = 95;
      }
    }

    requestAnimationFrame(animationLoop);
  }

  // Kick off render loop
  requestAnimationFrame(animationLoop);
});
