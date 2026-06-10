import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- GLOBAL BLUR REVEAL ENGINE ---
const blurElements = document.querySelectorAll('.blur-reveal');
blurElements.forEach((el) => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      gsap.to(el, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 1.2,
        ease: "power3.out"
      });
      observer.unobserve(el);
    }
  }, { threshold: 0.1 });
  observer.observe(el);
});

// --- AMBIENT FLUID BACKGROUND TRACKING ---
const ambientBlobRed = document.querySelector('.blob-red');

if (ambientBlobRed) {
  // Use GSAP quickTo for smooth, liquid-like tracking of the ambient background blob
  // A longer duration (1.5s) creates that premium, heavy, fluid feeling
  const xToBlob = gsap.quickTo(ambientBlobRed, "left", { duration: 1.5, ease: "power3.out" });
  const yToBlob = gsap.quickTo(ambientBlobRed, "top", { duration: 1.5, ease: "power3.out" });

  window.addEventListener('mousemove', (e) => {
    xToBlob(e.clientX);
    yToBlob(e.clientY);
  });
}
// --- UTILS ---
function splitTextIntoWords(element) {
  if (!element) return [];
  const words = element.innerText.split(' ');
  element.innerHTML = '';
  const spans = [];
  words.forEach(word => {
    const span = document.createElement('span');
    span.innerText = word + ' ';
    span.style.display = 'inline-block';
    // Preserve 3D transforms
    span.style.transformStyle = "preserve-3d";
    element.appendChild(span);
    spans.push(span);
  });
  return spans;
}



// --- ENTRANCE ANIMATIONS ---
document.addEventListener("DOMContentLoaded", () => {
  const mainTl = gsap.timeline({ paused: true });

  function startSite() {
    mainTl.play();
    const video = document.getElementById('heroVideo');
    if (video) {
      video.play();
      
      // Hero Hidden Text Looping Animation
      const hiddenText = document.getElementById('heroHiddenText');
      if (hiddenText) {
        gsap.timeline({ repeat: -1 })
          .to({}, { duration: 5 }) // Wait 5 seconds
          .to(hiddenText, { opacity: 0.25, duration: 0.5, ease: "power2.inOut" }) // Fade in to 75% transparent (0.25 opacity)
          .to({}, { duration: 2 }) // Hold for 2 seconds
          .to(hiddenText, { opacity: 0, duration: 0.5, ease: "power2.inOut" }); // Fade out
      }
    }
  }

  // Main Site Entrance Animations
  mainTl.from("#header", { y: -50, opacity: 0, duration: 1, ease: "power3.out" })
    .from(".scroll-indicator", { opacity: 0, duration: 1.5 }, "-=0.4");

  // --- PARTICLE PRELOADER SYSTEM ---
  const canvas = document.getElementById('preloader-canvas');
  if (!canvas) {
    document.getElementById('preloader').style.display = 'none';
    startSite();
    return;
  }
  const ctx = canvas.getContext('2d');
  
  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const colors = ['#ffffff', '#f5f5f5', '#e0dcd3', '#c4bfb5']; // White and dust colors
  const offCanvas = document.createElement('canvas');
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
  
  function getPointsFromImage(img, maxWidth, maxHeight, yOffset) {
    offCanvas.width = w;
    offCanvas.height = h;
    offCtx.clearRect(0, 0, w, h);
    
    let imgW = img.width;
    let imgH = img.height;
    const ratio = Math.min(maxWidth / imgW, maxHeight / imgH);
    imgW *= ratio;
    imgH *= ratio;
    
    const x = (w - imgW) / 2;
    const y = (h - imgH) / 2 + yOffset;
    offCtx.drawImage(img, x, y, imgW, imgH);
    
    return extractPoints(6); // Step size 6 for massive image to optimize point count
  }
  
  function getPointsFromText(text, fontSize, step, yOffset) {
    offCanvas.width = w;
    offCanvas.height = h;
    offCtx.clearRect(0, 0, w, h);
    offCtx.fillStyle = 'white';
    offCtx.font = `bold ${fontSize}px 'Outfit', sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, w / 2, h / 2 + yOffset);
    
    return extractPoints(step);
  }
  
  function extractPoints(step) {
    const points = [];
    const imgData = offCtx.getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const idx = (y * w + x) * 4;
        if (imgData[idx + 3] > 128) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }

  const logoImg = new Image();
  logoImg.src = '/public/purescribe_logo_v6_transparent.png';
  
  logoImg.onload = () => {
    // 1. Logo targets (Massive bird, moved up)
    const logoPoints = getPointsFromImage(logoImg, Math.min(w * 0.8, 600), Math.min(h * 0.5, 500), -h * 0.15);
    // 2. Text 1 targets (Larger text, moved down below bird)
    const text1Points = getPointsFromText("Purescribe Innovations", Math.min(w * 0.065, 70), 4, h * 0.18);
    // 3. Text 2 targets (Massive text, moved further down)
    const text2Points = getPointsFromText("Are you ready?", Math.min(w * 0.1, 110), 4, h * 0.35);
    
    // Combine all into one massive target array
    let currentTargets = [...logoPoints, ...text1Points, ...text2Points];
    
    // Shuffle the final target array so particles assemble organically
    for (let i = currentTargets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentTargets[i], currentTargets[j]] = [currentTargets[j], currentTargets[i]];
    }
    
    const numParticles = currentTargets.length;
    const particles = [];
    
    for (let i = 0; i < numParticles; i++) {
      // Start randomly around the edges
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(w, h) / 2 + 200 + Math.random() * 500;
      particles.push({
        x: w / 2 + Math.cos(angle) * radius,
        y: h / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 1.5 + 1.5,
        spring: 0.02 + Math.random() * 0.03,
        friction: 0.85 + Math.random() * 0.05
      });
    }

    let exploding = false;
    
    const tl = gsap.timeline();
    
    // Hold on the combined screen for ~3 seconds
    tl.to({}, { duration: 3.5 })
    // Explode outwards
      .call(() => { 
        exploding = true; 
        particles.forEach(p => {
          p.vx = (Math.random() - 0.5) * 60;
          p.vy = (Math.random() - 0.5) * 60;
        });
      })
    // Slide preloader up and start site
      .to("#preloader", { y: "-100%", duration: 1.0, ease: "power3.inOut", delay: 0.2, onComplete: () => {
        document.getElementById('preloader').style.display = 'none';
        gsap.ticker.remove(render);
        startSite();
      }});

    function render() {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.4)';
      ctx.fillRect(0, 0, w, h);
      
      particles.forEach((p, i) => {
        if (!exploding) {
          let tx, ty;
          if (i < currentTargets.length) {
            tx = currentTargets[i].x;
            ty = currentTargets[i].y;
          } else {
            tx = p.x + Math.sin(Date.now()*0.002 + i) * 10;
            ty = p.y + Math.cos(Date.now()*0.002 + i) * 10;
          }
          p.vx += (tx - p.x) * p.spring;
          p.vy += (ty - p.y) * p.spring;
        }
        
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx;
        p.y += p.vy;
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    gsap.ticker.add(render);
  };
  
  logoImg.onerror = () => { 
    document.getElementById('preloader').style.display = 'none';
    startSite(); 
  };
});





// --- MANIFESTO SCROLL ANIMATION (PINNED) ---
const manifestoSection = document.getElementById('manifesto');
if (manifestoSection) {
  const manifestoTl = gsap.timeline({
    scrollTrigger: {
      trigger: manifestoSection,
      start: "center center", // Pin when the section hits the center of the viewport
      end: "+=150%", // Keep it pinned for 150% of the viewport height (determines scrub length)
      pin: true,
      scrub: 1, // Smooth scrubbing
    }
  });

  manifestoTl
    // 1. Draw the strike line across the text
    .to('.strike-line', { width: '110%', duration: 1, ease: 'power2.inOut' })
    // 2. Dim the primary text concurrently
    .to('.manifesto-primary', { opacity: 0.3, duration: 0.5 }, "-=0.8");

  // 3. Canvas Particle Engine (Nothing Phone Swarm Assembly)
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const text = "We build digital experiences.";
    
    // Setup canvas resolution for crisp rendering
    const width = 1200;
    const height = 200;
    canvas.width = width;
    canvas.height = height;
    
    // Draw text to an offscreen canvas to extract pixel data
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offCtx = offscreenCanvas.getContext('2d');
    
    offCtx.fillStyle = "white";
    offCtx.font = "bold 90px 'Outfit', sans-serif"; 
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillText(text, width / 2, height / 2);
    
    // Read the pixel data
    const imageData = offCtx.getImageData(0, 0, width, height).data;
    const particles = [];
    const step = 5; // The density of the dots. Lower = more dots, higher = fewer dots
    
    // Generate particle for every opaque pixel
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const alpha = imageData[index + 3];
        if (alpha > 128) {
          particles.push({
            targetX: x,
            targetY: y,
            // Scatter start positions randomly far off-screen
            startX: (Math.random() > 0.5 ? width + (Math.random() * 800 + 400) : -(Math.random() * 800 + 400)), 
            startY: (Math.random() - 0.5) * height * 4 + height/2,
            currentX: 0,
            currentY: 0,
            size: 1.5,
            // Random offset so they don't all move at the exact same uniform speed
            speedOffset: Math.random() * 0.2 + 0.8
          });
        }
      }
    }
    
    // Proxy object for GSAP to animate
    const proxy = { progress: 0 };
    
    // Bind the proxy's progress to the scroll timeline
    manifestoTl.to(proxy, {
      progress: 1,
      duration: 2,
      ease: 'power2.inOut'
    }, "-=0.4"); // Starts right before the red strike finishes
    
    // The high-performance render loop
    gsap.ticker.add(() => {
      // Optimization: Only render if the canvas is within the viewport
      const rect = canvas.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#0055ff"; // Electric blue dots
      
      const pProgress = proxy.progress;
      
      particles.forEach(p => {
        // Add a slight stagger effect based on individual speed offset
        let adjustedProgress = pProgress * p.speedOffset;
        if (adjustedProgress > 1) adjustedProgress = 1;

        // Easing for organic snapping
        const easeProgress = gsap.parseEase('power3.out')(adjustedProgress);
        
        p.currentX = p.startX + (p.targetX - p.startX) * easeProgress;
        p.currentY = p.startY + (p.targetY - p.startY) * easeProgress;
        
        // Draw the dot
        ctx.beginPath();
        ctx.arc(p.currentX, p.currentY, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }
}

// --- DIGITAL ARSENAL CARD FAN SCROLL ANIMATION ---
const servicesSection = document.getElementById('services');
if (servicesSection) {
  // Title entrance reveal
  gsap.from('.services-title', {
    scrollTrigger: {
      trigger: servicesSection,
      start: "top 80%",
    },
    y: 50, opacity: 0, duration: 1, ease: "power3.out"
  });
  
  gsap.from('.services-subtitle', {
    scrollTrigger: {
      trigger: servicesSection,
      start: "top 80%",
    },
    y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2
  });

  // Pinned Card Fan Timeline (Desktop Only)
  let mm = gsap.matchMedia();
  
  mm.add("(min-width: 769px)", () => {
    const cardFanTl = gsap.timeline({
      scrollTrigger: {
        trigger: servicesSection,
        start: "center center",
        end: "+=120%", // Keep pinned for smooth scrubbing
        pin: true,
        scrub: 1
      }
    });

    // Animate cards from stacked (default) to fanned out
    cardFanTl.to('.card-1', { rotation: -15, x: -180, duration: 1 }, 0)
             .to('.card-2', { rotation: -5, x: -60, duration: 1 }, 0)
             .to('.card-3', { rotation: 5, x: 60, duration: 1 }, 0)
             .to('.card-4', { rotation: 15, x: 180, duration: 1 }, 0);
  });

  mm.add("(max-width: 768px)", () => {
    // Mobile: Simple vertical stagger reveal, no pinning
    gsap.from('.arsenal-card', {
      scrollTrigger: {
        trigger: servicesSection,
        start: "top 70%"
      },
      y: 30,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: "power2.out"
    });
  });
           
  // Add hover interactions safely to pull a card out of the "hand"
  const serviceCards = document.querySelectorAll('.arsenal-card');
  serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Translate Y upward to "pull" the card, keeping its scroll-driven rotation/x
      gsap.to(card, { y: -50, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.3, ease: "power2.inOut", overwrite: "auto" });
    });
  });
}

// --- DECOMPRESS MINI-GAME ENGINE ---
const gameBoard = document.getElementById('game-board');
const gameCursor = document.getElementById('game-cursor');
const football = document.getElementById('football');
const scoreEl = document.getElementById('anomaly-score');

if (gameBoard && gameCursor && football) {
  let score = 0;
  let mouseX = -1000; 
  let mouseY = -1000;
  let prevMouseX = -1000;
  let prevMouseY = -1000;
  let mouseVx = 0;
  let mouseVy = 0;
  let ballX = 300;
  let ballY = 200;
  let ballVx = 0;
  let ballVy = 0;
  
  const ballRadius = 15;
  const cursorRadius = 20;
  
  const xTo = gsap.quickTo(gameCursor, "x", {duration: 0.05, ease: "power3.out"});
  const yTo = gsap.quickTo(gameCursor, "y", {duration: 0.05, ease: "power3.out"});
  
  gameBoard.addEventListener("mouseenter", () => {
    gsap.to(gameCursor, { opacity: 1, duration: 0.3 });
  });
  
  gameBoard.addEventListener("mouseleave", () => {
    gsap.to(gameCursor, { opacity: 0, duration: 0.3 });
    mouseX = -1000; 
    mouseY = -1000;
  });

  gameBoard.addEventListener("mousemove", (e) => {
    const rect = gameBoard.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    xTo(mouseX);
    yTo(mouseY);
  });
  
  function spawnBall() {
    const rect = gameBoard.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 400;
    
    ballX = w / 2;
    ballY = h / 2 + 50; // Start slightly below center
    ballVx = 0;
    ballVy = 0;
    
    gsap.set(football, { x: ballX, y: ballY, scale: 0, opacity: 0 });
    gsap.to(football, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });
  }
  
  function createBurst(x, y) {
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.classList.add('burst-particle');
      gameBoard.appendChild(particle);
      gsap.set(particle, { x: x, y: y });
      const angle = (Math.PI * 2 / 12) * i;
      const distance = 50 + Math.random() * 80;
      gsap.to(particle, {
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        opacity: 0, scale: 0, duration: 0.6 + Math.random() * 0.4,
        ease: "power2.out", onComplete: () => particle.remove()
      });
    }
  }

  // Initial spawn
  setTimeout(spawnBall, 1000);

  // The Physics Game Loop
  gsap.ticker.add(() => {
    const rect = gameBoard.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight || !rect.width) return;
    
    // Calculate ultra-smooth cursor velocity inside the 60fps loop instead of sporadic mousemove events
    if (prevMouseX !== -1000 && mouseX !== -1000) {
      mouseVx = mouseX - prevMouseX;
      mouseVy = mouseY - prevMouseY;
    }
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    
    // 1. Friction (slows ball down over time - increased slightly for smoother glide)
    ballVx *= 0.985;
    ballVy *= 0.985;
    
    // 2. Apply Velocity
    ballX += ballVx;
    ballY += ballVy;
    
    // 3. Wall Collisions & Goal Logic (Smoother bounces)
    if (ballX < ballRadius) { ballX = ballRadius; ballVx *= -0.9; } // Left wall
    if (ballX > rect.width - ballRadius) { ballX = rect.width - ballRadius; ballVx *= -0.9; } // Right wall
    
    if (ballY < ballRadius) { 
      // Top wall collision - Check for GOAL!
      // Goal post is top-center, width 200px
      const goalLeft = rect.width / 2 - 100;
      const goalRight = rect.width / 2 + 100;
      
      if (ballX > goalLeft && ballX < goalRight) {
        // GOAL SCORED!
        score += 1;
        if (scoreEl) scoreEl.innerText = score;
        
        // Massive explosion at the goal
        createBurst(ballX, ballRadius);
        
        // Hide ball and reset
        gsap.to(football, { scale: 0, duration: 0.1 });
        ballX = -2000; ballY = -2000; ballVx = 0; ballVy = 0;
        
        setTimeout(spawnBall, 1000);
      } else {
        // Normal bounce off top wall
        ballY = ballRadius; 
        ballVy *= -0.9; 
      }
    }
    
    if (ballY > rect.height - ballRadius) { ballY = rect.height - ballRadius; ballVy *= -0.9; } // Bottom wall
    
    // 4. Cursor Collision (The "Kick")
    if (mouseX !== -1000) {
      const dx = ballX - mouseX;
      const dy = ballY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = ballRadius + cursorRadius;
      
      if (distance < minDistance) {
        // Collision detected! Calculate kick trajectory
        const angle = Math.atan2(dy, dx);
        
        // Separate the objects to prevent getting stuck
        const overlap = minDistance - distance;
        ballX += Math.cos(angle) * overlap;
        ballY += Math.sin(angle) * overlap;
        
        // Transfer momentum (Mouse Velocity)
        // Ensure even slow movements trigger a smooth bump
        const mouseSpeed = Math.sqrt(mouseVx * mouseVx + mouseVy * mouseVy);
        const kickForce = Math.min(Math.max(mouseSpeed * 0.7, 8), 25); 
        
        ballVx = Math.cos(angle) * kickForce;
        ballVy = Math.sin(angle) * kickForce;
        
        // Reset mouse velocity to prevent instant double-kicking
        mouseVx = 0;
        mouseVy = 0;
      }
    }
    
    // Render
    gsap.set(football, { x: ballX, y: ballY });
  });
}

// --- VELOCITY-DRIVEN "NOTHING" MARQUEE ---
const marqueeTracks = document.querySelectorAll('.marquee-content');
if (marqueeTracks.length > 0) {
  let scrollVelocity = 0;
  
  // Track scroll velocity using ScrollTrigger
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      // getVelocity() returns pixels per second. Scale it down to a usable multiplier.
      scrollVelocity = self.getVelocity() / 200;
    }
  });

  // Setup loop for each track
  marqueeTracks.forEach((track, index) => {
    // Top track moves left (-1), bottom moves right (1)
    const direction = index === 0 ? -1 : 1; 
    let xPercent = 0;
    
    gsap.ticker.add(() => {
      // Base crawling speed is 0.02 (slower). Add absolute scroll velocity to speed it up slightly when scrolling.
      let speedIncrement = (0.02 + Math.abs(scrollVelocity * 0.1)) * direction;
      xPercent += speedIncrement;
      
      // The track contains 4 identical spans. 
      // Wrapping at 50% works if we move the container by exactly half its width seamlessly.
      // But because text width depends on font-size/viewport, a standard GSAP horizontalLoop is complex.
      // Since we just translate the flex container, we wrap at -25% (because 4 spans = 100%, 1 span = 25%).
      // Actually, to be safe, wrap at 50% assuming the first 2 spans equal the last 2 spans.
      if (xPercent <= -50) xPercent += 50;
      if (xPercent >= 0) xPercent -= 50;
      
      // Calculate dynamic skew based on scroll speed
      // Cap maximum skew to 15 degrees to prevent text breaking
      let skewAmount = scrollVelocity * 2; 
      skewAmount = Math.max(Math.min(skewAmount, 15), -15);
      
      // Smoothly decay the velocity back to zero when user stops scrolling
      scrollVelocity *= 0.9;
      
      gsap.set(track, { 
        xPercent: xPercent,
        skewX: skewAmount * direction
      });
    });
  });
}

// --- SCROLL REVEALS FOR CARDS ---
const cards = document.querySelectorAll('.bento-card');
const flipCards = document.querySelectorAll('.flip-card-wrapper');
const contactContainer = document.querySelector('.contact-container');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      gsap.fromTo(entry.target, 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

cards.forEach(card => {
  // Avoid duplicating animation on inner glass-cards of flip-cards and the unique moto-cards
  if (!card.closest('.flip-card') && !card.classList.contains('moto-card')) {
    observer.observe(card);
  }
});

flipCards.forEach((card, index) => {
  const flipObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      gsap.fromTo(card,
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: index * 0.15 }
      );
      flipObserver.unobserve(card);
    }
  }, { threshold: 0.2 });
  flipObserver.observe(card);
});

// --- BULLETPROOF JS 3D FLIP LOGIC ---
const flipCardElements = document.querySelectorAll('.flip-card');
flipCardElements.forEach(card => {
  const inner = card.querySelector('.flip-card-inner');
  
  card.addEventListener('mouseenter', () => {
    gsap.to(inner, { rotationY: 180, duration: 0.8, ease: "power3.out", overwrite: true });
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(inner, { rotationY: 0, duration: 0.8, ease: "power3.out", overwrite: true });
  });
});

// --- MOTO SECTION UNIQUE ANIMATION ---
const motoCards = document.querySelectorAll('.moto-card');
if (motoCards.length > 0) {
  const motoObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      gsap.fromTo(motoCards, 
        { opacity: 0, scale: 0.8, rotationX: 45 },
        { opacity: 1, scale: 1, rotationX: 0, duration: 1.2, stagger: 0.15, ease: "elastic.out(1, 0.7)" }
      );
      motoObserver.unobserve(entries[0].target);
    }
  }, { threshold: 0.3 });
  
  const motoContainer = document.querySelector('.about-container');
  if (motoContainer) motoObserver.observe(motoContainer);
}

if (contactContainer) {
  observer.observe(contactContainer);
}



// --- 5-POINT EXPERT UPGRADES ---

// 1. BREATHING ROOM FADES
const spacers = document.querySelectorAll('.spacer-text');
spacers.forEach(spacer => {
  gsap.from(spacer, {
    scrollTrigger: {
      trigger: spacer,
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    y: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
  });
});

// 2. SHOW AI: TEXT SCRAMBLE EFFECT
const chars = '!<>-_\\/[]{}—=+*^?#_';
const scrambleElements = document.querySelectorAll('.scramble');

scrambleElements.forEach(el => {
  const originalText = el.innerText;
  el.dataset.original = originalText;
  
  el.addEventListener('mouseenter', () => {
    let iteration = 0;
    clearInterval(el.interval);
    
    el.interval = setInterval(() => {
      el.innerText = originalText
        .split('')
        .map((letter, index) => {
          if(index < iteration) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      if(iteration >= originalText.length) {
        clearInterval(el.interval);
        el.innerText = originalText; // Ensure it finishes perfectly
      }
      
      iteration += 1 / 3; // Controls speed of unscrambling
    }, 30);
  });
});

// 4. MAGNETIC MICRO-INTERACTIONS
const magnetics = document.querySelectorAll('.magnetic');

magnetics.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const h = rect.width / 2;
    const v = rect.height / 2;
    
    // Vector math to find distance from center of element
    const x = e.clientX - rect.left - h;
    const y = e.clientY - rect.top - v;
    
    // Pull the element towards the cursor
    gsap.to(btn, {
      x: x * 0.4,
      y: y * 0.4,
      duration: 0.5,
      ease: "power3.out"
    });
  });

  btn.addEventListener('mouseleave', () => {
    // Snap back elastically
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.3)"
    });
  });
});

// --- PARTICLE ASSEMBLY IDEAS SECTION ---
const ideasSection = document.querySelector('.ideas-section');
const ideaCards = document.querySelectorAll('.idea-card');

if (ideasSection && ideaCards.length > 0) {
  // Hide cards initially
  gsap.set(ideaCards, { opacity: 0, scale: 0.95 });

  // Create a master scrubbed timeline pinned to the section
  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: ideasSection,
      start: "top top", // Pin when section reaches top
      end: "+=3000", // Require 3000px of scrolling to complete the animation
      pin: true,
      scrub: 1, // Smooth scrub tied to scroll velocity
      invalidateOnRefresh: true
    }
  });

  const numDots = 40; // 40 dots per card = 160 total

  // We must calculate relative positions before adding to timeline
  // This is safe because relTop/relLeft is constant regardless of scroll position
  const sectionRect = ideasSection.getBoundingClientRect();
  
  ideaCards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect();
    const relTop = cardRect.top - sectionRect.top;
    const relLeft = cardRect.left - sectionRect.left;

    const dots = [];
    const dests = [];
    
    // Pre-generate dots for this card
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('div');
      dot.classList.add('assembly-dot');
      dot.style.position = 'absolute';
      ideasSection.appendChild(dot);
      
      // Start randomly off-screen or widely scattered
      const startX = (Math.random() - 0.5) * window.innerWidth * 2.5;
      const startY = (Math.random() - 0.5) * window.innerHeight * 2.5;
      
      // Setup initial state. left:50% top:50% means x=0 y=0 is the exact center of the section.
      gsap.set(dot, { 
        left: '50%',
        top: '50%',
        x: startX, 
        y: startY,
        opacity: 0,
        scale: Math.random() * 1.5 + 0.5
      });
      dots.push(dot);

      // Calculate destination coordinates inside the card's bounding box relative to the section center
      dests.push({
        x: relLeft + (Math.random() * cardRect.width) - (ideasSection.offsetWidth / 2),
        y: relTop + (Math.random() * cardRect.height) - (ideasSection.offsetHeight / 2)
      });
    }

    // Sequence for this card in the scrub timeline:
    
    // 1. Fade in the scattered dots (short pause before starting)
    masterTl.to(dots, { opacity: 1, duration: 0.2 }, "+=0.1");
    
    // 2. Fly all dots simultaneously to their destination inside the card
    dots.forEach((dot, i) => {
      masterTl.to(dot, {
        x: dests[i].x,
        y: dests[i].y,
        duration: 1,
        ease: "power2.inOut" // Smooth acceleration/deceleration
      }, "<"); // "<" syncs with previous animation
    });
    
    // 3. Fade out the dots and fade in the card
    masterTl.to(dots, { opacity: 0, scale: 0, duration: 0.3 })
            .to(card, { 
              opacity: 1, 
              scale: 1, 
              duration: 0.5, 
              boxShadow: "0 0 50px rgba(0, 85, 255, 0.4), inset 0 0 20px rgba(0, 85, 255, 0.2)" 
            }, "<");
  });
}

// --- PORTFOLIO HOVER LIST REVEAL / MAGNIFYING GLASS ---
const portfolioSection = document.querySelector('.portfolio-list-section');
const portfolioItems = document.querySelectorAll('.portfolio-list-item');
const magGlass = document.querySelector('.magnifying-glass-cursor');
const magText = document.querySelector('.glass-text');

if (portfolioSection && portfolioItems.length > 0 && magGlass && magText) {
  let xTo = gsap.quickTo(magGlass, "left", { duration: 0.4, ease: "power3" }),
      yTo = gsap.quickTo(magGlass, "top", { duration: 0.4, ease: "power3" });

  // Track mouse inside the section (we keep this so it follows the mouse)
  portfolioSection.addEventListener('mousemove', (e) => {
    xTo(e.clientX - 125); // Center the 250px circle
    yTo(e.clientY - 125);
  });

  // Handle specific item hovers to show description text and the magnifying glass itself
  portfolioItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      // Dim non-hovered items
      portfolioItems.forEach(i => { if (i !== item) i.style.opacity = 0.2; });
      
      const desc = item.getAttribute('data-desc');
      magText.innerText = desc;
      gsap.to(magText, { opacity: 1, duration: 0.3 });
      
      // Show and scale up the glass
      gsap.to(magGlass, { opacity: 1, scale: 1.2, backgroundColor: "rgba(0, 85, 255, 0.1)", duration: 0.4, ease: "back.out(2)" });
    });
    
    item.addEventListener('mouseleave', () => {
      // Restore all items
      portfolioItems.forEach(i => i.style.opacity = 1);
      
      gsap.to(magText, { opacity: 0, duration: 0.2 });
      
      // Hide and scale down the glass
      gsap.to(magGlass, { opacity: 0, scale: 0, backgroundColor: "radial-gradient(circle, rgba(0, 85, 255, 0.1), rgba(10, 10, 10, 0.9))", duration: 0.4, ease: "power2.in" });
    });
  });
}

// --- CONTACT FORM AJAX SUBMIT & POPUP ---
const form = document.querySelector('.contact-form');
const successPopup = document.getElementById('success-popup');

if (form && successPopup) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop default redirect
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    const formData = new FormData(form);
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show popup
        successPopup.classList.add('show');
        form.reset();
        
        // Setup close button to dismiss popup and contact modal
        const closeSuccessBtn = document.getElementById('closeSuccessBtn');
        if (closeSuccessBtn) {
          closeSuccessBtn.addEventListener('click', () => {
            successPopup.classList.remove('show');
            const contactModal = document.getElementById('contactModal');
            if (contactModal) {
              contactModal.classList.remove('active');
              document.body.style.overflow = '';
            }
          }, { once: true });
        }
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error. Please try again.");
    } finally {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  });
}

// --- CONTACT MODAL LOGIC ---
const initiateBtn = document.getElementById('initiateProjectBtn');
const contactModal = document.getElementById('contactModal');
const closeContactModal = document.getElementById('closeContactModal');
const contactOverlay = document.getElementById('contactOverlay');

if (initiateBtn && contactModal && closeContactModal && contactOverlay) {
  const openModal = () => {
    contactModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent scrolling behind modal
  };

  const closeModal = () => {
    contactModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  initiateBtn.addEventListener('click', openModal);
  closeContactModal.addEventListener('click', closeModal);
  contactOverlay.addEventListener('click', closeModal);
}

// --- INTERACTIVE ROBOT LOGIC ---
const roboHead = document.getElementById('robo-head');
const roboEyes = document.getElementById('robo-eyes');

if (roboHead && roboEyes) {
  // Set the transform origin of the head to the neck joint
  gsap.set(roboHead, { transformOrigin: "100px 95px" });
  
  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Normalize mouse coordinates from -1 to 1
    const xPos = (clientX / innerWidth - 0.5) * 2;
    const yPos = (clientY / innerHeight - 0.5) * 2;
    
    // Rotate head in 3D based on X and Y
    gsap.to(roboHead, {
      rotationY: xPos * 40, // look left/right in 3D
      rotationX: -yPos * 30, // look up/down in 3D
      y: yPos * 5, 
      transformPerspective: 500, // add 3D depth
      duration: 0.5,
      ease: "power2.out"
    });
    
    // Move eyes more dramatically within the face screen
    gsap.to(roboEyes, {
      x: xPos * 15,
      y: yPos * 10,
      duration: 0.2,
      ease: "power2.out"
    });
  });
}
