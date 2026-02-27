// ==================== SOUND SYSTEM ====================
const bgMusic = document.getElementById('bgMusic');
const giftSound = document.getElementById('giftSound');
const blowSound = document.getElementById('blowSound');
const confettiSound = document.getElementById('confettiSound');
const pageTurnSound = document.getElementById('pageTurnSound');
const revealSound = document.getElementById('revealSound');
const gateAudio = document.getElementById('gateAudio');

let musicPlaying = false;

// Play sound helper
function playSound(soundElement, volume = 0.5) {
  if (!soundElement) return;
  const sound = soundElement.cloneNode();
  sound.volume = volume;
  sound.play().catch(function(e) { console.log('Sound play failed:', e); });
  sound.addEventListener('ended', function() { sound.remove(); });
}

// Play gate birthday song
function playAudio() {
  if (!gateAudio) return;
  gateAudio.volume = 0.7;
  gateAudio.play().catch(function(err) { console.log('Audio play failed:', err); });
}

// ==================== PAGE NAVIGATION ====================
var pages = document.querySelectorAll('.page');
var pagesArr = [];
for (var i = 0; i < pages.length; i++) { pagesArr.push(pages[i]); }
var current = 0;

function showPage(n) {
  if (pageTurnSound && n !== current) playSound(pageTurnSound, 0.3);
  current = Math.max(0, Math.min(pagesArr.length - 1, n));
  for (var i = 0; i < pagesArr.length; i++) {
    var p = pagesArr[i];
    if (Number(p.dataset.page) === current) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;
  var action = btn.dataset.action;
  if (action === 'next') showPage(current + 1);
  if (action === 'back') showPage(current - 1);
  if (action === 'prevSlide') setSlide(slideIndex - 1);
  if (action === 'nextSlide') setSlide(slideIndex + 1);
});

// ==================== GATE PAGE ====================
var openGateBtn = document.getElementById('openGateBtn');
var gateTitle = document.getElementById('gateTitle');
var balloonsContainer = document.getElementById('balloonsContainer');

if (openGateBtn) {
  openGateBtn.addEventListener('click', function() {
    burstConfetti(true);
    playAudio();

    // Show balloons with smooth fade
    if (balloonsContainer) {
      balloonsContainer.classList.add('show');
      balloonsContainer.style.opacity = '1';

      setTimeout(function() {
        balloonsContainer.style.transition = 'opacity 1.5s ease';
        balloonsContainer.style.opacity = '0';
      }, 7800);

      setTimeout(function() {
        balloonsContainer.classList.remove('show');
        balloonsContainer.style.transition = '';
        balloonsContainer.style.opacity = '1';
      }, 9300);
    }

    if (gateTitle) {
      gateTitle.classList.remove('animate__tada');
      void gateTitle.offsetWidth;
      gateTitle.classList.add('animate__tada');
    }

    setTimeout(function() { showPage(1); }, 1100);
  });
}

// ==================== SLIDE SHOW ====================
var slides = [
  { img: './us.png', caption: 'Our first cute moment together.' },
  {
    img: 'https://via.placeholder.com/600x400/FFB6C1/FF4FA3?text=Memory+2',
    caption: 'Every day with you feels lighter.',
  },
  {
    img: 'https://via.placeholder.com/600x400/FFC0CB/FF4FA3?text=Memory+3',
    caption: 'Still my favorite person.',
  },
];
var slideIndex = 0;
var slideImg = document.getElementById('slideImg');
var slideCaption = document.getElementById('slideCaption');
var slideDots = document.getElementById('slideDots');

// Build slide dots
function buildDots() {
  if (!slideDots) return;
  slideDots.innerHTML = '';
  for (var i = 0; i < slides.length; i++) {
    var dot = document.createElement('span');
    dot.className = 'slide-dot' + (i === slideIndex ? ' active' : '');
    dot.dataset.slideIdx = i;
    dot.addEventListener('click', function() {
      setSlide(Number(this.dataset.slideIdx));
    });
    slideDots.appendChild(dot);
  }
}

function updateDots() {
  if (!slideDots) return;
  var dots = slideDots.querySelectorAll('.slide-dot');
  for (var i = 0; i < dots.length; i++) {
    if (i === slideIndex) {
      dots[i].classList.add('active');
    } else {
      dots[i].classList.remove('active');
    }
  }
}

function setSlide(i) {
  slideIndex = (i + slides.length) % slides.length;
  var s = slides[slideIndex];
  if (slideImg) {
    slideImg.style.opacity = 0;
    setTimeout(function() {
      slideImg.src = s.img;
      if (slideCaption) slideCaption.textContent = s.caption;
      slideImg.style.opacity = 1;
    }, 180);
  }
  updateDots();
}

buildDots();
setSlide(0);

// ==================== REASONS ====================
var reasons = [
  'You make me feel calm and safe.',
  'You are kind, thoughtful, and strong.',
  'Your smile is my favorite thing.',
  'You inspire me to be better.',
  'I love our little moments together.',
];
var reasonsList = document.getElementById('reasonsList');
var revealBtn = document.getElementById('revealBtn');
var revealed = 0;

function revealNextReason() {
  if (!reasonsList || revealed >= reasons.length) return;
  playSound(revealSound, 0.3);
  var li = document.createElement('li');
  li.textContent = reasons[revealed];
  li.classList.add('animate__animated', 'animate__fadeInUp');
  reasonsList.appendChild(li);
  revealed++;
  if (revealed >= reasons.length && revealBtn) {
    revealBtn.textContent = 'All reasons revealed';
    revealBtn.disabled = true;
    revealBtn.style.opacity = '0.6';
  }
}
if (revealBtn) revealBtn.addEventListener('click', revealNextReason);

// ==================== GIFT ====================
var giftBtn = document.getElementById('giftBtn');
var hiddenMessage = document.getElementById('hiddenMessage');
var opened = false;

if (giftBtn) {
  giftBtn.addEventListener('click', function() {
    if (opened) return;
    opened = true;
    giftBtn.classList.add('open');
    playSound(giftSound, 0.5);
    burstConfetti(true);

    setTimeout(function() {
      if (hiddenMessage) {
        hiddenMessage.style.display = 'block';
        hiddenMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 350);
  });
}

// ==================== MUSIC BUTTON ====================
var musicBtn = document.getElementById('musicBtn');
if (musicBtn) {
  musicBtn.addEventListener('click', function() {
    if (!bgMusic) return alert('Missing background-music.mp3 file!');
    musicPlaying = !musicPlaying;

    if (musicPlaying) {
      bgMusic.play().catch(function(e) { console.log('Music failed:', e); });
      musicBtn.textContent = 'Pause music';
      musicBtn.style.background = 'linear-gradient(135deg, #ff4fa3, #ff2e8b)';
      musicBtn.style.color = 'white';
      musicBtn.style.borderColor = 'transparent';
      burstConfetti(false);
    } else {
      bgMusic.pause();
      musicBtn.textContent = 'Play music';
      musicBtn.style.background = 'rgba(255, 255, 255, 0.9)';
      musicBtn.style.color = '#2B1B2B';
      musicBtn.style.borderColor = 'rgba(255, 79, 163, 0.2)';
    }
  });
}

// ==================== CANDLE (blow out) ====================
var flame = document.getElementById('flame');
var blowBtn = document.getElementById('blowBtn');
var candleBlown = false;

function blowOut() {
  if (!flame || candleBlown) return;
  candleBlown = true;
  flame.classList.add('off');
  playSound(blowSound, 0.6);
  burstConfetti(true);
  if (blowBtn) blowBtn.textContent = 'Blown!';
}
if (blowBtn) blowBtn.addEventListener('click', blowOut);

// ==================== CONFETTI (canvas) ====================
var canvas = document.getElementById('confetti');
var ctx = canvas ? canvas.getContext('2d') : null;
var confetti = [];
var rafId = null;

function resize() {
  if (!canvas || !ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function burstConfetti(playSoundEffect) {
  if (!canvas || !ctx) return;
  if (playSoundEffect && confettiSound) playSound(confettiSound, 0.3);

  // Ensure canvas is transparent – never paint background
  canvas.style.background = 'transparent';

  var colors = ['#FF4FA3', '#FFC94A', '#FFD6E8', '#B983FF', '#FF8DA1', '#FFB347', '#FFFFFF'];
  var count = 120;

  for (var i = 0; i < count; i++) {
    confetti.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14 - 4,
      g: 0.15 + Math.random() * 0.05,
      r: 3 + Math.random() * 4,
      a: 1,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }
  if (!rafId) tick();
}

function tick() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < confetti.length; i++) {
    var p = confetti[i];
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.a *= 0.985;

    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;

    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2.4, p.r * 1.2);
    }

    ctx.restore();
  }

  // Filter out dead particles
  var alive = [];
  for (var j = 0; j < confetti.length; j++) {
    if (confetti[j].a > 0.03 && confetti[j].y < window.innerHeight + 100) {
      alive.push(confetti[j]);
    }
  }
  confetti = alive;

  if (confetti.length) {
    rafId = requestAnimationFrame(tick);
  } else {
    cancelAnimationFrame(rafId);
    rafId = null;
    // Clear canvas completely when done
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ==================== REPLAY BUTTON ====================
var replayBtn = document.getElementById('replayBtn');
if (replayBtn) {
  replayBtn.addEventListener('click', function() {
    // Reset everything to start again
    revealed = 0;
    if (reasonsList) reasonsList.innerHTML = '';
    if (revealBtn) {
      revealBtn.textContent = 'Reveal reason';
      revealBtn.disabled = false;
      revealBtn.style.opacity = '1';
    }
    if (giftBtn) {
      giftBtn.classList.remove('open');
      opened = false;
    }
    if (hiddenMessage) hiddenMessage.style.display = 'none';
    candleBlown = false;
    if (flame) flame.classList.remove('off');
    if (blowBtn) blowBtn.textContent = 'Blow candle';
    if (musicBtn) {
      musicPlaying = false;
      if (bgMusic) bgMusic.pause();
      musicBtn.textContent = 'Play music';
      musicBtn.style.background = 'rgba(255, 255, 255, 0.9)';
      musicBtn.style.color = '#2B1B2B';
      musicBtn.style.borderColor = 'rgba(255, 79, 163, 0.2)';
    }
    showPage(0);
  });
}

// ==================== FALLING CONFETTI GENERATOR ====================
var fallingConfettiContainer = document.querySelector('.falling-confetti');

function createFallingConfetti() {
  if (!fallingConfettiContainer) return;
  var confettiColors = ['#FF4FA3', '#FFC94A', '#FFD6E8', '#B983FF', '#FF8DA1'];
  var confettiCount = 25;

  for (var i = 0; i < confettiCount; i++) {
    createOneConfettiPiece(confettiColors, true);
  }
}

function createOneConfettiPiece(colors, withDelay) {
  if (!fallingConfettiContainer) return;
  if (!colors) colors = ['#FF4FA3', '#FFC94A', '#FFD6E8', '#B983FF', '#FF8DA1'];

  var conf = document.createElement('div');
  conf.classList.add('confetti-piece');
  conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  conf.style.left = (Math.random() * 100) + 'vw';
  conf.style.animationDelay = withDelay ? (Math.random() * 5) + 's' : '0s';
  conf.style.animationDuration = (3 + Math.random() * 3) + 's';
  conf.style.width = (6 + Math.random() * 6) + 'px';
  conf.style.height = (6 + Math.random() * 6) + 'px';
  conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
  fallingConfettiContainer.appendChild(conf);

  conf.addEventListener('animationend', function() {
    conf.remove();
    createOneConfettiPiece(colors, false);
  });
}

createFallingConfetti();

// ==================== INIT ====================
showPage(0);

// Ensure heart animation starts immediately
setTimeout(function() {
  var heart = document.querySelector('.heart-placeholder');
  if (heart) heart.style.animationDelay = '0s';
}, 100);
