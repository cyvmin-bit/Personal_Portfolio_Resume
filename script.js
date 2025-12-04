// Wait until the HTML document is fully loaded and parsed
// before running any JavaScript that interacts with the DOM
document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------
     HELPER FUNCTIONS
     q  -> querySelector
     qa -> querySelectorAll (as array)
  --------------------------------------------------- */
  const q = (sel, ctx=document) => ctx.querySelector(sel);
  const qa = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------
     UPDATE CURRENT YEAR IN FOOTER
  --------------------------------------------------- */
  const yearEl = q('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ---------------------------------------------------
     THEME TOGGLE
     Handles dark/light mode with localStorage support
  --------------------------------------------------- */
  const themeToggle = q('#themeToggle');
  const userPref = localStorage.getItem('theme');

  const applyTheme = (theme) => {
    document.body.classList.toggle('dark', theme === 'dark');
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  };

  // Apply saved theme or system preference
  if (userPref) applyTheme(userPref);
  else applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // Listen for system theme changes, but only auto-switch when user hasn't set a preference
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  } else if (mq && mq.addListener) {
    // fallback for older browsers
    mq.addListener((e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    const theme = isDark ? 'dark' : 'light';
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  });


  /* ---------------------------------------------------
     MOBILE MENU TOGGLE
     Handles opening/closing of mobile nav
  --------------------------------------------------- */
  const menuToggle = q('#menuToggle');
  const mobileMenu = q('#mobileMenu');

  if (menuToggle && mobileMenu) {
    // Toggle menu visibility
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
    });

    // Close mobile menu when a link is clicked
    qa('.nav-link', mobileMenu).forEach(a =>
      a.addEventListener('click', () => {
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }


  /* ====================================================
     SCROLLSPY
     Highlights nav links based on scroll position
  ===================================================== */
  const sectionsNEW = document.querySelectorAll("section");
  const navLinksNEW = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";

    sectionsNEW.forEach((section) => {
      const top = window.scrollY;
      const offset = section.offsetTop - 140; // Adjust for header height
      const height = section.offsetHeight;

      if (top >= offset && top < offset + height) {
        current = section.getAttribute("id");
      }
    });

    navLinksNEW.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });


  /* ---------------------------------------------------
     PROJECT MODAL
     Handles opening/closing project details modal
  --------------------------------------------------- */
  const projectCards = qa('.project-card');
  const modal = q('#projectModal');
  const modalTitle = q('#modalTitle');
  const modalBody = q('#modalBody');
  const modalLink = q('#modalLink');
  const modalClose = q('.modal-close');

  const openModal = (data) => {
    modalTitle.textContent = data.title;
    modalBody.textContent = data.details || data.desc || 'No details provided.';
    modalLink.href = data.link || "#";
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    modalClose.focus();
  };

  const closeModal = () => {
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  };

  // Bind click events on project cards
  projectCards.forEach(card => {
    const btn = card.querySelector('.view-details');
    if (btn) {
      btn.addEventListener('click', () => {
        const raw = card.getAttribute('data-project');
        let data = {};
        try { data = JSON.parse(raw); }
        catch(e){ data = { title: card.querySelector('h3').textContent }; }
        openModal(data);
      });
    }
  });

  // Modal close buttons and outside click
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });


  /* ---------------------------------------------------
     CONTACT FORM
     Front-end validation + mailto button
  --------------------------------------------------- */
  const contactForm = q('#contactForm');
  const formStatus = q('#formStatus');
  const mailtoBtn = q('#mailtoBtn');

  // Helper: show/hide field error
  function showFieldError(id, message) {
    const el = q(`#${id}`);
    const err = q(`#error-${id}`);
    if (err) err.textContent = message || '';
    if (el) el.setAttribute('aria-invalid', !!message);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Reset errors
      ['name','email','message'].forEach(id => showFieldError(id,''));

      const name = q('#name').value.trim();
      const email = q('#email').value.trim();
      const message = q('#message').value.trim();
      let valid = true;

      // Validate fields
      if (name.length < 2) { showFieldError('name','Please enter your name.'); valid = false; }
      if (!/^\S+@\S+\.\S+$/.test(email)) { showFieldError('email','Invalid email.'); valid = false; }
      if (message.length < 10) { showFieldError('message','Message too short.'); valid = false; }

      if (!valid) {
        formStatus.textContent = 'Fix errors and try again.';
        return;
      }

      formStatus.textContent = 'Message validated (front-end only).';
      contactForm.reset();
    });

    // Mailto button click
    if (mailtoBtn) {
      mailtoBtn.addEventListener('click', () => {
        window.location.href =
          `mailto:chaihuiqing@example.com?subject=Contact&body=Hi`;
      });
    }
  }


  /* ---------------------------------------------------
     ACCESSIBILITY FOCUS TRAP
     Prevent focus from leaving modal when open
  --------------------------------------------------- */
  document.addEventListener('focus', function(e){
    if (modal.getAttribute('aria-hidden') === 'false' && !modal.contains(e.target)) {
      e.stopPropagation();
      modalClose.focus();
    }
  }, true);

  // Show focus outlines only when tabbing
  (function keyboardOutline(){
    function handleFirstTab(e){ 
      if (e.key === 'Tab') {
        document.body.classList.add('show-focus');
        window.removeEventListener('keydown', handleFirstTab);
      }
    }
    window.addEventListener('keydown', handleFirstTab);
  })();


  /* ---------------------------------------------------
     CLOSE MOBILE MENU ON SCROLL
  --------------------------------------------------- */
  window.addEventListener('scroll', () => {
    if (mobileMenu && !mobileMenu.hidden) {
      mobileMenu.hidden = true;
      menuToggle.setAttribute('aria-expanded','false');
    }
  });


  /* ---------------------------------------------------
     SIMPLE PAGE ROUTER
     Shows one page at a time based on hash
  --------------------------------------------------- */
  const allPages = qa('.page');

  function showPage(pageID) {
    allPages.forEach(p => p.style.display = 'none');
    const page = q(`#${pageID}`);
    if (page) page.style.display = 'block';
  }

  function handleRoute() {
    let hash = location.hash.replace('#', '').trim();
    if (!hash) hash = 'home';
    showPage(hash);
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();


  /* ---------------------------------------------------
     Optional: resume download click handler (non-essential)
     Placed here so it can use q() helper
  --------------------------------------------------- */
  const downloadResumeBtn = q('#downloadResume');
  if (downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', () => {
      // simple console log for debugging; remove if not needed
      console.log('Resume download clicked');
    });
  }

}); // end DOMContentLoaded

var s=document.createElement('style');
s.id='temp-fix';
s.innerHTML = `
  *{box-sizing:border-box}
  body{font-family: Arial, Helvetica, sans-serif; line-height:1.6; padding:0; margin:0; color:#111}
  .container{max-width:1080px;margin:0 auto;padding:1.25rem}
  header.site-header{position:sticky;top:0;background:#fff;padding:.75rem 0;border-bottom:1px solid rgba(0,0,0,.06)}
  h1{font-size:2rem;margin:1rem 0}
  .btn{display:inline-block;padding:.6rem 1rem;border-radius:8px;background:#6c63ff;color:#fff;text-decoration:none}
`;
document.head.appendChild(s);
console.log('temporary style injected');
