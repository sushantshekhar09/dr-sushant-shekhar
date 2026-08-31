// ==========================================================================
// DR. SUSHANT SHEKHAR - JAVASCRIPT ENGINE
// Interactive Features: Publications Filter, Canvas Constellation,
// Stats Counters, BibTeX Exporter, vCard Generator, Command Palette
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initSpaceCanvas();
  initMetricsCounter();
  initPublicationsHub();
  initCommandPalette();
  initModals();
  initContactForm();
  initScrollSpy();
  initMobileMenu();
  initThemeToggle();
  initAITwin();
});

/* ==========================================================================
   1. SPACE GEODESY CONSTELLATION & ORBITAL CANVAS
   ========================================================================== */
function initSpaceCanvas() {
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let satellites = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Initialize Particles (Stars / Geodetic nodes)
  const particleCount = Math.min(Math.floor(window.innerWidth / 16), 85);
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.5 + 0.25,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      pulse: Math.random() * Math.PI
    });
  }

  // Initialize Orbiting Satellites (NavIC / GNSS / LEO)
  satellites = [
    { radius: 280, angle: 0, speed: 0.003, color: '#00e5ff', label: 'NavIC-1I' },
    { radius: 420, angle: 2.1, speed: 0.002, color: '#818cf8', label: 'CYGNSS' },
    { radius: 560, angle: 4.2, speed: 0.0014, color: '#f59e0b', label: 'EOS-04' }
  ];

  let pulseWave = 0;

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Dynamic Center (Top right on desktop, center on mobile)
    const centerX = width > 900 ? width * 0.72 : width * 0.5;
    const centerY = height > 900 ? height * 0.42 : height * 0.35;

    // Draw Subtle Orbital Coordinate Rings
    satellites.forEach(sat => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, sat.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw Satellites & Microwave Reflectometry Signal Rays
    satellites.forEach(sat => {
      sat.angle += sat.speed;
      const satX = centerX + Math.cos(sat.angle) * sat.radius;
      const satY = centerY + Math.sin(sat.angle) * (sat.radius * 0.65);

      // Satellite body
      ctx.beginPath();
      ctx.arc(satX, satY, 4, 0, Math.PI * 2);
      ctx.fillStyle = sat.color;
      ctx.shadowColor = sat.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Simulated Microwave Reflectometry beam to ground reflection point
      const reflectX = satX - 80;
      const reflectY = satY + 120;
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(reflectX, reflectY);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.fillText(sat.label, satX + 8, satY - 6);
    });

    // Draw & Connect Geodetic Reference Particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const alpha = p.baseAlpha + Math.sin(p.pulse) * 0.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${Math.max(0.1, alpha)})`;
      ctx.fill();

      // Connect near neighbors (Delaunay triangulation aesthetic)
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / 110) * 0.12})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. ANIMATED NUMBER COUNTERS
   ========================================================================== */
function initMetricsCounter() {
  const countElements = document.querySelectorAll('.counter-val');
  if (!countElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const decimals = target % 1 !== 0 ? 1 : 0;
        const duration = 1800;
        const startTime = performance.now();

        function updateNumber(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = (easeOut * target).toFixed(decimals);
          el.textContent = currentVal;

          if (progress < 1) {
            requestAnimationFrame(updateNumber);
          } else {
            el.textContent = target;
          }
        }

        requestAnimationFrame(updateNumber);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  countElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   3. PUBLICATIONS HUB: FILTER, SEARCH & RENDERING
   ========================================================================== */
let currentCategory = 'all';
let currentSearchQuery = '';

function initPublicationsHub() {
  const pubListContainer = document.getElementById('publications-list');
  const searchInput = document.getElementById('pub-search-input');
  const catButtons = document.querySelectorAll('.cat-btn');

  if (!pubListContainer) return;

  // Filter Button Clicks
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat') || 'all';
      renderPublications();
    });
  });

  // Search Input Debounce
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      renderPublications();
    });
  }

  renderPublications();
}

function renderPublications() {
  const container = document.getElementById('publications-list');
  const countDisplay = document.getElementById('pub-count-display');
  if (!container || !window.publicationsData) return;

  const filtered = window.publicationsData.filter(pub => {
    // Category filter
    let matchesCategory = true;
    if (currentCategory === 'sci-journal') {
      matchesCategory = pub.type === 'journal';
    } else if (currentCategory === 'conference') {
      matchesCategory = pub.type === 'conference';
    } else if (currentCategory !== 'all') {
      matchesCategory = pub.category && pub.category.includes(currentCategory);
    }

    // Search query filter
    let matchesSearch = true;
    if (currentSearchQuery) {
      const fullContent = `${pub.title} ${pub.authors} ${pub.venue} ${pub.abstract || ''} ${pub.year}`.toLowerCase();
      matchesSearch = fullContent.includes(currentSearchQuery);
    }

    return matchesCategory && matchesSearch;
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${window.publicationsData.length} indexed publications`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
        <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1rem;">No publications found matching your filter criteria.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetPubFilter()">Clear Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(pub => {
    // Highlight author Sushant Shekhar
    const formattedAuthors = pub.authors
      .replace(/Shekhar,\s*S\.\*/g, '<span class="highlight-author">Sushant Shekhar*</span>')
      .replace(/Shekhar,\s*Sushant/g, '<span class="highlight-author">Sushant Shekhar</span>')
      .replace(/S\.\s*Shekhar/g, '<span class="highlight-author">S. Shekhar</span>');

    const badgeClass = pub.type === 'journal' ? 'journal' : 'conference';

    return `
      <article class="pub-card" id="${pub.id}">
        <div class="pub-top-row">
          <div class="pub-badge-wrapper">
            <span class="pub-badge ${badgeClass}">${pub.badge}</span>
            <span class="pub-year">${pub.year}</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">${pub.status}</span>
        </div>

        <h3 class="pub-title">${pub.title}</h3>
        <p class="pub-authors">${formattedAuthors}</p>
        <p class="pub-venue">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          ${pub.venue}
        </p>

        ${pub.abstract ? `
          <div class="pub-abstract">
            <strong>Key Insight:</strong> ${pub.abstract}
          </div>
        ` : ''}

        <div class="pub-bottom-actions">
          <div class="pub-links">
            ${pub.doi ? `
              <a href="${pub.doi}" target="_blank" rel="noopener noreferrer" class="action-pill primary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                View Paper / DOI
              </a>
            ` : ''}
            <button class="action-pill" onclick="openBibtexModal('${pub.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              Cite (BibTeX)
            </button>
          </div>

          <div class="pillar-tags" style="margin-top: 0;">
            ${(pub.category || []).map(c => `<span class="tag-badge">#${c}</span>`).join('')}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

window.resetPubFilter = function() {
  currentCategory = 'all';
  currentSearchQuery = '';
  const searchInput = document.getElementById('pub-search-input');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.cat-btn').forEach((b, i) => {
    if (i === 0) b.classList.add('active');
    else b.classList.remove('active');
  });
  renderPublications();
};

/* ==========================================================================
   4. BIBTEX CITATION MODAL & CLIPBOARD COPY
   ========================================================================== */
function initModals() {
  const closeButtons = document.querySelectorAll('.modal-close-trigger');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    });
  });

  // Close on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });
}

window.openBibtexModal = function(pubId) {
  if (!window.publicationsData) return;
  const pub = window.publicationsData.find(p => p.id === pubId);
  if (!pub || !pub.bibtex) return;

  const modal = document.getElementById('bibtex-modal');
  const codeBlock = document.getElementById('bibtex-code-content');
  const titleDisplay = document.getElementById('bibtex-pub-title');

  if (modal && codeBlock) {
    codeBlock.textContent = pub.bibtex;
    if (titleDisplay) titleDisplay.textContent = pub.title;
    modal.classList.add('open');
  }
};

window.copyBibtexCode = function() {
  const codeBlock = document.getElementById('bibtex-code-content');
  const copyBtn = document.getElementById('bibtex-copy-btn');
  if (!codeBlock) return;

  navigator.clipboard.writeText(codeBlock.textContent).then(() => {
    if (copyBtn) {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied to Clipboard!
      `;
      copyBtn.classList.add('btn-primary');
      setTimeout(() => {
        copyBtn.innerHTML = origText;
        copyBtn.classList.remove('btn-primary');
      }, 2000);
    }
  });
};

/* ==========================================================================
   5. COMMAND PALETTE (Ctrl + K / Cmd + K)
   ========================================================================== */
function initCommandPalette() {
  const modal = document.getElementById('cmd-palette-modal');
  const openBtn = document.getElementById('cmd-palette-btn');
  const searchInput = document.getElementById('cmd-palette-input');
  const resultsContainer = document.getElementById('cmd-results-list');

  const navigationCommands = [
    { title: 'Home / Overview', category: 'Section', target: '#hero' },
    { title: 'Research Pillars & Areas of Interest', category: 'Section', target: '#research' },
    { title: 'Research Innovations & Software', category: 'Section', target: '#innovations' },
    { title: 'Browse All Publications (45+)', category: 'Section', target: '#publications' },
    { title: 'Academic & Career Timeline', category: 'Section', target: '#experience' },
    { title: 'Awards, Honors & Recognitions', category: 'Section', target: '#awards' },
    { title: 'Education & Certifications', category: 'Section', target: '#education' },
    { title: 'Contact & Collaboration', category: 'Section', target: '#contact' },
    { title: 'Download Official Resume (PDF)', category: 'Action', action: 'downloadResume' },
    { title: 'Save Contact Card (vCard)', category: 'Action', action: 'downloadVcard' },
    { title: 'Open Google Scholar Profile', category: 'External', url: 'https://scholar.google.com/citations?view_op=list_works&hl=en&user=CSpUmgYAAAAJ' },
    { title: 'Open LinkedIn Profile', category: 'External', url: 'https://www.linkedin.com/in/sushant-shekhar-10298854/' }
  ];

  function openPalette() {
    if (modal) {
      modal.classList.add('open');
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        renderCmdResults(navigationCommands);
      }
    }
  }

  function closePalette() {
    if (modal) modal.classList.remove('open');
  }

  if (openBtn) openBtn.addEventListener('click', openPalette);

  // Keyboard shortcut listener
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal && modal.classList.contains('open')) closePalette();
      else openPalette();
    }
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closePalette();
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = navigationCommands.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
      renderCmdResults(filtered);
    });
  }

  function renderCmdResults(items) {
    if (!resultsContainer) return;
    if (items.length === 0) {
      resultsContainer.innerHTML = '<li style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No matching commands or sections found.</li>';
      return;
    }

    resultsContainer.innerHTML = items.map((item, index) => `
      <li class="cmd-result-item ${index === 0 ? 'selected' : ''}" data-index="${index}">
        <div class="cmd-item-main">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          ${item.title}
        </div>
        <span class="cmd-item-category">${item.category}</span>
      </li>
    `).join('');

    // Attach click triggers
    resultsContainer.querySelectorAll('.cmd-result-item').forEach((li, idx) => {
      li.addEventListener('click', () => {
        const item = items[idx];
        closePalette();
        if (item.target) {
          const el = document.querySelector(item.target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (item.url) {
          window.open(item.url, '_blank');
        } else if (item.action === 'downloadResume') {
          downloadResumeFile();
        } else if (item.action === 'downloadVcard') {
          downloadVCard();
        }
      });
    });
  }
}

/* ==========================================================================
   6. VCARD GENERATOR & RESUME DOWNLOAD
   ========================================================================== */
window.downloadVCard = function() {
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:Shekhar;Sushant;;Dr.;PhD
FN:Dr. Sushant Shekhar
ORG:National Centre of Geodesy (NCG), IIT Kanpur
TITLE:Research Establishment Officer (REO), Grade 1, Level 11
TEL;TYPE=CELL:+918882866254
EMAIL;TYPE=INTERNET,WORK:sushantshekhar09@gmail.com
URL;TYPE=WORK:https://www.linkedin.com/in/sushant-shekhar-10298854/
URL;TYPE=SCHOLAR:https://scholar.google.com/citations?view_op=list_works&hl=en&user=CSpUmgYAAAAJ
ADR;TYPE=WORK:;;National Centre of Geodesy, IIT Kanpur;Kanpur;Uttar Pradesh;208016;India
NOTE:Specialist in Space Geodesy, NavIC GNSS-IR Reflectometry, Remote Sensing, DInSAR, and Machine Learning.
END:VCARD`;

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Dr_Sushant_Shekhar_IITK.vcf');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

window.downloadResumeFile = function() {
  const link = document.createElement('a');
  link.href = 'assets/Resume_Dr_Sushant_Shekhar.pdf';
  link.download = 'Dr_Sushant_Shekhar_Resume.pdf';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/* ==========================================================================
   7. INTERACTIVE CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('contact-alert');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !message) {
      showContactAlert('Please fill in all required fields.', 'error');
      return;
    }

    // Construct Mailto for immediate client-side delivery
    const mailtoSubject = encodeURIComponent(`[Website Collaboration] ${subject || 'Research Inquiry'}`);
    const mailtoBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailtoLink = `mailto:sushantshekhar09@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    showContactAlert('Opening your default email client to send message to Dr. Sushant Shekhar...', 'success');
    window.location.href = mailtoLink;
    form.reset();
  });

  function showContactAlert(msg, type) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.style.display = 'block';
    alertBox.style.background = type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    alertBox.style.border = `1px solid ${type === 'success' ? '#10b981' : '#ef4444'}`;
    alertBox.style.color = type === 'success' ? '#34d399' : '#f87171';
    alertBox.style.padding = '0.75rem 1rem';
    alertBox.style.borderRadius = '8px';
    alertBox.style.marginBottom = '1rem';
    alertBox.style.fontSize = '0.88rem';

    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 5000);
  }
}

/* ==========================================================================
   8. SCROLLSPY, THEME & MOBILE NAV
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-toggle-btn');
  const navLinks = document.getElementById('nav-links-menu');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
    });
  });
}

function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.body.removeAttribute('data-theme');
      themeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    } else {
      document.body.setAttribute('data-theme', 'light');
      themeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
  });
}

/* ==========================================================================
   9. AI DIGITAL TWIN CONVERSATIONAL ENGINE
   ========================================================================== */
let aiConversationHistory = [];
let isTTSEnabled = false;
let isVoiceListening = false;
let speechRecognizer = null;

function initAITwin() {
  const initialTimeEl = document.getElementById('initial-msg-time');
  if (initialTimeEl) {
    const now = new Date();
    initialTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const backdrop = document.getElementById('ai-twin-backdrop');
      if (backdrop && backdrop.classList.contains('active')) {
        closeAITwin();
      }
    }
  });

  // Auto-resize textarea
  const textarea = document.getElementById('ai-user-input');
  if (textarea) {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
  }

  // Check speech recognition support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    speechRecognizer = new SpeechRecognition();
    speechRecognizer.continuous = false;
    speechRecognizer.interimResults = false;
    speechRecognizer.lang = 'en-US';

    speechRecognizer.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('ai-user-input');
      if (input) {
        input.value = transcript;
        input.dispatchEvent(new Event('input'));
      }
      setVoiceListening(false);
    };

    speechRecognizer.onerror = () => {
      setVoiceListening(false);
    };

    speechRecognizer.onend = () => {
      setVoiceListening(false);
    };
  } else {
    const micBtn = document.getElementById('ai-voice-input-btn');
    if (micBtn) micBtn.style.display = 'none';
  }
}

function openAITwin(initialQuery = '') {
  const backdrop = document.getElementById('ai-twin-backdrop');
  if (!backdrop) return;

  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  const input = document.getElementById('ai-user-input');
  if (input) {
    setTimeout(() => input.focus(), 300);
    if (initialQuery) {
      input.value = initialQuery;
      input.dispatchEvent(new Event('input'));
      handleAIChatSubmit(new Event('submit'));
    }
  }
}

function closeAITwin() {
  const backdrop = document.getElementById('ai-twin-backdrop');
  if (!backdrop) return;

  backdrop.classList.remove('active');
  document.body.style.overflow = '';

  // Cancel any ongoing speech synthesis
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  setVoiceListening(false);
}

function toggleAITwin() {
  const backdrop = document.getElementById('ai-twin-backdrop');
  if (!backdrop) return;

  if (backdrop.classList.contains('active')) {
    closeAITwin();
  } else {
    openAITwin();
  }
}

function handleAITwinBackdropClick(e) {
  if (e.target.id === 'ai-twin-backdrop') {
    closeAITwin();
  }
}

function sendPromptFromChip(promptText) {
  const input = document.getElementById('ai-user-input');
  if (!input) return;

  input.value = promptText;
  input.dispatchEvent(new Event('input'));
  handleAIChatSubmit(new Event('submit'));
}

function handleInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleAIChatSubmit(e);
  }
}

function toggleTTS() {
  isTTSEnabled = !isTTSEnabled;
  const btn = document.getElementById('tts-toggle-btn');
  const icon = document.getElementById('tts-icon');
  const label = document.getElementById('tts-label-text');

  if (btn) {
    btn.classList.toggle('tts-active', isTTSEnabled);
  }
  if (icon) {
    icon.textContent = isTTSEnabled ? '🔊' : '🔈';
  }
  if (label) {
    label.textContent = isTTSEnabled ? 'Voice On' : 'Voice Off';
  }

  if (!isTTSEnabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function toggleVoiceInput() {
  if (!speechRecognizer) return;

  if (isVoiceListening) {
    speechRecognizer.stop();
    setVoiceListening(false);
  } else {
    try {
      speechRecognizer.start();
      setVoiceListening(true);
    } catch (e) {
      setVoiceListening(false);
    }
  }
}

function setVoiceListening(state) {
  isVoiceListening = state;
  const micBtn = document.getElementById('ai-voice-input-btn');
  if (micBtn) {
    micBtn.classList.toggle('listening', state);
  }
}

function clearAITwinChat() {
  aiConversationHistory = [];
  const container = document.getElementById('ai-chat-messages');
  if (!container) return;

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  container.innerHTML = `
    <div class="chat-msg ai-msg">
      <div class="msg-avatar">
        <img src="assets/avatar.jpg" alt="Dr. Sushant Shekhar">
      </div>
      <div class="msg-bubble">
        <div class="msg-sender-name">Dr. Sushant Shekhar (AI Twin)</div>
        <div class="msg-content">
          <p>👋 Conversation reset. I am ready to answer any questions about my <strong>career</strong>, <strong>IIT Kanpur role</strong>, <strong>ISRO NavIC project</strong>, <strong>publications</strong>, or <strong>awards</strong>.</p>
        </div>
        <div class="msg-timestamp">${now}</div>
      </div>
    </div>
  `;

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function renderFormattedMarkdown(text) {
  if (!text) return '';

  // Escape raw HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([\s\S]*?)__/g, '<strong>$1</strong>');

  // Italics
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bullet points
  const lines = html.split('\n');
  let inList = false;
  let processedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (trimmed.length > 0) {
        processedLines.push(`<p>${trimmed}</p>`);
      }
    }
  }

  if (inList) {
    processedLines.push('</ul>');
  }

  // Links
  let result = processedLines.join('');
  result = result.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

  return result || `<p>${text}</p>`;
}

function speakText(text) {
  if (!isTTSEnabled || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  // Strip markdown characters and tags for clean speech
  const cleanText = text
    .replace(/<[^>]*>/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/#/g, '')
    .replace(/https?:\/\/\S+/g, 'link');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.02;
  utterance.pitch = 1.0;

  // Try to pick an English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India')) ||
                         voices.find(v => v.lang.includes('en-US')) ||
                         voices.find(v => v.lang.includes('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// Client Knowledge Synthesizer (Offline Fallback)
function synthesizeLocalResponse(query) {
  const q = query.toLowerCase();

  if (q.includes('phd') || q.includes('doctor') || q.includes('isro') || q.includes('navic') || q.includes('reflectometry')) {
    return `I completed my **Ph.D. in Space Geodesy and Satellite Remote Sensing** from Graphic Era Deemed to be University, working as a **Senior Research Fellow (SRF)** and **Junior Research Fellow (JRF)** on an ISRO-sponsored project.\n\nKey highlights of my ISRO & PhD research:\n- **NavIC Reflectometry Preprocessor**: Developed a proprietary MATLAB software suite for extracting multipath SNR observables from India's NavIC constellation for high-precision soil moisture inversion.\n- **SAC ISRO Adoption**: My preprocessing software engine was directly utilized and adopted inside the **Space Applications Centre (SAC), ISRO Ahmedabad**.\n- Conferred the **Innovator of the Year Award** (UCOST) and **Best Paper Award** (IIRS & ISRO) for this work.`;
  }

  if (q.includes('role') || q.includes('iit') || q.includes('kanpur') || q.includes('current') || q.includes('position') || q.includes('reo') || q.includes('ncg')) {
    return `I currently serve as **Research Establishment Officer (REO - Grade 1, Level 11)** at the **National Centre of Geodesy (NCG), IIT Kanpur**.\n\nIn this capacity, my core responsibilities include:\n- Leading sovereign space geodetic engineering and national reference network benchmarks.\n- Satellite Laser Ranging (SLR) and multi-constellation GNSS data analysis.\n- Radar remote sensing (DInSAR) and microwave reflectometry research across India.\n- Mentoring research scholars and collaborating with national agencies like ISRO, Survey of India, and DST.`;
  }

  if (q.includes('publication') || q.includes('paper') || q.includes('journal') || q.includes('sci') || q.includes('scholar')) {
    return `I have authored and co-authored **45+ peer-reviewed publications**:\n\n- **7 SCI-Indexed Journal Articles** in top international journals such as *Advances in Space Research (Elsevier)*, *Current Science*, and *IEEE Geoscience and Remote Sensing Letters*.\n- **36+ International IEEE & Scopus Conference Papers** (including InGARSS, IGARSS, and ICACCM).\n\nYou can explore all 45+ papers with BibTeX citations directly in the **Publications Hub** on this site, or check my complete citation profile on [Google Scholar](https://scholar.google.com/citations?view_op=list_works&hl=en&user=CSpUmgYAAAAJ).`;
  }

  if (q.includes('award') || q.includes('honor') || q.includes('gate') || q.includes('achievement')) {
    return `Here are some of my major awards and honors:\n\n1. **GATE Qualified (99.7th Percentile)** in Electronics & Communication.\n2. **Innovator of the Year Award (2022)** at the 16th Uttarakhand State Science & Technology Congress (UCOST).\n3. **Best Paper Award (2021)** from the Indian Institute of Remote Sensing (IIRS) & ISRO.\n4. **Young Scientist Award (2020)** at the 14th Uttarakhand State Science & Technology Congress (UCOST).\n5. **Best Researcher Award for Environmental Studies** at the 3rd World Conference on Innovations in Management Science and Engineering.\n6. **SAC ISRO Technology Adoption** for the NavIC signal processing framework.`;
  }

  if (q.includes('contact') || q.includes('collaborat') || q.includes('email') || q.includes('phone') || q.includes('hire') || q.includes('seminar') || q.includes('connect')) {
    return `I am always delighted to discuss academic partnerships, joint research programs, technical consultancy, and keynote seminars.\n\n**Direct Contact Details:**\n- **Official Email**: [sushantshekhar09@gmail.com](mailto:sushantshekhar09@gmail.com)\n- **Direct Phone**: [+91-8882866254](tel:+918882866254)\n- **LinkedIn**: [Dr. Sushant Shekhar](https://www.linkedin.com/in/sushant-shekhar-10298854/)\n- **Location**: National Centre of Geodesy, IIT Kanpur, Uttar Pradesh, India.\n\nYou can also download my vCard (.vcf) or leave a message through the contact section on this site!`;
  }

  if (q.includes('education') || q.includes('degree') || q.includes('mtech') || q.includes('btech') || q.includes('certif')) {
    return `**Academic Degrees:**\n- **Ph.D. in Space Geodesy & Remote Sensing**: Graphic Era Deemed to be University (ISRO Projects).\n- **M.Tech in Microelectronics**: Jaypee Institute of Information Technology (JIIT), Noida-62.\n- **B.Tech in Electronics Engineering**: Bharati Vidyapeeth College of Engineering, Pune.\n\n**Advanced Certifications:**\n- **AI & Deep Learning Post Graduate Certification**: IIT Roorkee (6 Months).\n- **Data Science Professional Certification**: IBM & Microsoft.\n- **IIRS ISRO Certifications**: Remote Sensing & GIS for Government Officials, Basics of RS/GIS/GNSS, and Planetary Geosciences (Moon & Mars).`;
  }

  return `Thank you for your question! As **Dr. Sushant Shekhar (PhD)**, Research Establishment Officer at the National Centre of Geodesy, IIT Kanpur, my research bridges **Space Geodesy (NavIC, GNSS-R, SLR)**, **Radar Remote Sensing (SAR/DInSAR)**, and **Artificial Intelligence/Machine Learning**.\n\nWith **45+ peer-reviewed publications** and recognition from **ISRO** and **UCOST**, I am committed to advancing high-precision Earth observation infrastructure.\n\nPlease feel free to ask about any specific paper, my work at IIT Kanpur, ISRO collaborations, or how we can connect!`;
}

async function handleAIChatSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const input = document.getElementById('ai-user-input');
  if (!input) return;

  const userQuery = input.value.trim();
  if (!userQuery) return;

  // Clear input & reset height
  input.value = '';
  input.style.height = 'auto';

  const messagesContainer = document.getElementById('ai-chat-messages');
  const typingIndicator = document.getElementById('ai-typing-indicator');
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Render User Message
  const userMsgEl = document.createElement('div');
  userMsgEl.className = 'chat-msg user-msg';
  userMsgEl.innerHTML = `
    <div class="msg-avatar">You</div>
    <div class="msg-bubble">
      <div class="msg-sender-name">You</div>
      <div class="msg-content"><p>${userQuery.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>
      <div class="msg-timestamp">${now}</div>
    </div>
  `;
  messagesContainer.appendChild(userMsgEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Add to conversation history
  aiConversationHistory.push({ role: 'user', content: userQuery });

  // Show typing indicator
  if (typingIndicator) {
    typingIndicator.style.display = 'flex';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  let aiReplyText = '';

  try {
    // Attempt backend call to /api/chat
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: aiConversationHistory
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.reply) {
        aiReplyText = data.reply;
        if (data.model) {
          const modelBadge = document.getElementById('ai-model-badge');
          if (modelBadge) {
            modelBadge.textContent = data.model.includes('gemini') ? 'Gemini 2.5 Flash' : 'Gemini AI';
          }
        }
      } else {
        throw new Error(data.error || 'Server error');
      }
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    console.warn('[AI Twin] Falling back to intelligent local corpus synthesizer:', err.message);
    // Use high-fidelity local semantic synthesizer
    aiReplyText = synthesizeLocalResponse(userQuery);
  } finally {
    // Hide typing indicator
    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }

    // Add assistant response to history
    aiConversationHistory.push({ role: 'assistant', content: aiReplyText });

    // Render AI response
    const aiMsgEl = document.createElement('div');
    aiMsgEl.className = 'chat-msg ai-msg';
    const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    aiMsgEl.innerHTML = `
      <div class="msg-avatar">
        <img src="assets/avatar.jpg" alt="Dr. Sushant Shekhar">
      </div>
      <div class="msg-bubble">
        <div class="msg-sender-name">Dr. Sushant Shekhar (AI Twin)</div>
        <div class="msg-content">${renderFormattedMarkdown(aiReplyText)}</div>
        <div class="msg-timestamp">${replyTime}</div>
      </div>
    `;
    messagesContainer.appendChild(aiMsgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Speak response if TTS is on
    speakText(aiReplyText);
  }
}

