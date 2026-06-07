import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Custom cursor removed site-wide. Magnifying glass handles its own interaction in Featured Work.

// --- ENTRANCE ANIMATIONS ---
document.addEventListener("DOMContentLoaded", () => {
  const preloaderTl = gsap.timeline();
  const mainTl = gsap.timeline({ paused: true });

  // Main Site Entrance Animations (Paused initially)
  mainTl.from("#header", { y: -50, opacity: 0, duration: 1, ease: "power3.out" })
    .from(".hero-title", { y: 100, scale: 0.8, opacity: 0, rotationX: -30, transformOrigin: "center top", duration: 1.5, ease: "power4.out" }, "-=0.5")
    .from(".hero-subtitle", { y: 40, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=1")
    .from(".hero-btn", { scale: 0.5, y: 20, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)" }, "-=0.8")
    .from(".scroll-indicator", { opacity: 0, duration: 1.5 }, "-=0.4");

  // Preloader Intro Animations (Fast 1-second version)
  preloaderTl.from(".preloader-logo", { scale: 0, rotationY: 180, opacity: 0, duration: 0.5, ease: "back.out(1.5)" })
    .from(".preloader-text", { y: 30, opacity: 0, duration: 0.4, ease: "power3.out" }, "-=0.3")
    .to(".preloader-logo", { filter: "drop-shadow(0 0 40px rgba(112, 0, 255, 1))", duration: 0.3, yoyo: true, repeat: 1 })
    .to("#preloader", { y: "-100%", duration: 0.5, delay: 0.1, ease: "power2.inOut", onComplete: () => {
      document.getElementById('preloader').style.display = 'none';
      mainTl.play(); // Trigger the rest of the site animations
    }});
});


// --- CANVAS SCROLL ANIMATION ---
const canvas = document.getElementById('sequence-canvas');
const context = canvas.getContext('2d');
const canvasSection = document.getElementById('showcase');
const sequenceOverlay = document.querySelector('.sequence-overlay');

const frameCount = 300;
const currentFrame = index => (
  `/ezgif-7f060c333d433487-jpg/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
);

const images = [];
const sequence = { frame: 0 };

// Resize canvas to fit window while maintaining aspect ratio or covering
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render();
}
window.addEventListener('resize', resizeCanvas);

// Preload images
let loadedImages = 0;
for (let i = 1; i <= frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  img.onload = () => {
    loadedImages++;
    if(loadedImages === 1) {
      // Once the first image is loaded, draw it and set sizes
      resizeCanvas();
    }
  };
  images.push(img);
}

// Draw the current frame
function render() {
  if (!images[sequence.frame] || !images[sequence.frame].complete) return;
  
  const img = images[sequence.frame];
  
  // Calculate cover dimensions
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
  const x = (canvas.width / 2) - (img.width / 2) * scale;
  const y = (canvas.height / 2) - (img.height / 2) * scale;
  
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, x, y, img.width * scale, img.height * scale);
}

// Scroll logic using Vanilla JS for tight coupling to Canvas
window.addEventListener('scroll', () => {
  // Check if we are in the canvas section bounds
  const rect = canvasSection.getBoundingClientRect();
  const html = document.documentElement;
  
  // The distance from the top of the canvasSection to the viewport top
  const scrollPosition = -rect.top;
  const scrollHeight = rect.height - window.innerHeight;
  
  if (scrollPosition >= 0 && scrollPosition <= scrollHeight) {
    // Calculate progress (0 to 1)
    const scrollFraction = scrollPosition / scrollHeight;
    const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));
    
    // Request animation frame for smooth drawing
    requestAnimationFrame(() => {
      sequence.frame = frameIndex;
      render();
      
      // Animate text overlay in the middle of the scroll
      if (scrollFraction > 0.4 && scrollFraction < 0.6) {
        gsap.to(sequenceOverlay, { opacity: 1, duration: 0.5 });
      } else {
        gsap.to(sequenceOverlay, { opacity: 0, duration: 0.5 });
      }
    });
  }
});


// --- SCROLL REVEALS FOR CARDS ---
const cards = document.querySelectorAll('.glass-card');
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

// --- SERVICES (WHAT WE CAN DO) ANIMATION ---
const servicesTrack = document.querySelector('.services-track');
const serviceCards = gsap.utils.toArray('.service-card');

if (servicesTrack && serviceCards.length > 0) {
  const servicesTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#services",
      start: "top top",
      end: "+=3000", // Adjusted scroll distance to eliminate any remaining gap
      scrub: 1, // Smooth scrubbing
      pin: true,
    }
  });

  // Set the first card to be fully visible and active immediately
  gsap.set(serviceCards[0], { opacity: 1, x: 0, rotationY: 0, rotationX: 0, scale: 1, filter: "blur(0px)" });

  // Set initial states for remaining cards (offscreen, blurred, rotated)
  gsap.set(serviceCards.slice(1), { x: window.innerWidth, rotationY: -15, scale: 0.85, opacity: 0, filter: "blur(20px)" });

  // Animate the rest of the cards entering from right to left with premium 3D depth of field
  serviceCards.forEach((card, index) => {
    if (index === 0) return; // Skip first card

    // The new card slides in rapidly but smoothly decelerates, snapping into absolute focus
    servicesTl.to(card, {
      x: 0,
      opacity: 1,
      rotationY: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 1.5,
      ease: "power4.out" // High-end snappy deceleration
    }, "+=1.5"); // <-- Adds a significant gap/pause on the scroll before the next card enters

    // Simultaneously push the previous card backward, tilting it and applying a bokeh blur
    servicesTl.to(serviceCards[index - 1], {
      scale: 0.85,
      opacity: 0.3,
      rotationX: 10, // Tilt it back
      y: -50, // Move it up slightly in the background
      filter: "blur(15px)", // Realistic depth of field
      duration: 1.5,
      ease: "power4.out"
    }, "<"); // start at the exact same time
  });
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

// --- ANIMATED PROCESS TIMELINE ---
const timelineProgress = document.querySelector('.timeline-progress');
const timelineNodes = document.querySelectorAll('.timeline-node');

if (timelineProgress) {
  gsap.to(timelineProgress, {
    height: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: ".timeline-container",
      start: "top center",
      end: "bottom center",
      scrub: 0.5
    }
  });

  timelineNodes.forEach(node => {
    const dot = node.querySelector('.node-dot');
    const content = node.querySelector('.node-content');
    
    const nodeTl = gsap.timeline({
      scrollTrigger: {
        trigger: node,
        start: "top center+=100",
        toggleActions: "play none none reverse"
      }
    });

    nodeTl.to(dot, { scale: 1, duration: 0.5, ease: "back.out(2)" })
          .to(content, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.2");
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

  // Show magnifying glass when entering the whole section
  portfolioSection.addEventListener('mouseenter', () => {
    gsap.to(magGlass, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" });
  });

  // Track mouse inside the section
  portfolioSection.addEventListener('mousemove', (e) => {
    xTo(e.clientX - 125); // Center the 250px circle
    yTo(e.clientY - 125);
  });

  // Hide magnifying glass when leaving the section
  portfolioSection.addEventListener('mouseleave', () => {
    gsap.to(magGlass, { opacity: 0, scale: 0, duration: 0.4, ease: "power2.in" });
  });

  // Handle specific item hovers to show description text
  portfolioItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      // Dim non-hovered items
      portfolioItems.forEach(i => { if (i !== item) i.style.opacity = 0.2; });
      
      const desc = item.getAttribute('data-desc');
      magText.innerText = desc;
      gsap.to(magText, { opacity: 1, duration: 0.3 });
      gsap.to(magGlass, { scale: 1.2, backgroundColor: "rgba(0, 240, 255, 0.1)", duration: 0.4, ease: "back.out(2)" });
    });
    
    item.addEventListener('mouseleave', () => {
      // Restore all items
      portfolioItems.forEach(i => i.style.opacity = 1);
      
      gsap.to(magText, { opacity: 0, duration: 0.2 });
      gsap.to(magGlass, { scale: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", duration: 0.4, ease: "power2.out" });
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
        
        // Hide after 1 second
        setTimeout(() => {
          successPopup.classList.remove('show');
        }, 1000);
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
