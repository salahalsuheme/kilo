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
});
