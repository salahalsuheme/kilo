document.addEventListener("DOMContentLoaded", () => {
  const titles = document.querySelectorAll(".section-title--accent");
  if (titles.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("section-title--accent-visible");
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    for (const title of titles) {
      observer.observe(title);
    }
  }

  const scrollHint = document.querySelector(".scroll-hint");
  if (scrollHint) {
    const onScroll = () => {
      scrollHint.classList.toggle("scroll-hint--hidden", window.scrollY > 80);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");

  const setNavOpen = (open) => {
    if (!header || !navToggle) return;
    header.classList.toggle("is-nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    const label = open
      ? navToggle.getAttribute("data-label-close")
      : navToggle.getAttribute("data-label-open");
    if (label) {
      navToggle.setAttribute("aria-label", label);
    }
  };

  if (header && navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      setNavOpen(!header.classList.contains("is-nav-open"));
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target.closest(".site-nav__link")) {
        setNavOpen(false);
      }
    });

    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) {
        setNavOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 767) {
        setNavOpen(false);
      }
    });
  }
});
