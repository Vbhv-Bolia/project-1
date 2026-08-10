document.addEventListener("DOMContentLoaded", function () {
  const filterContainer = document.getElementById("category-filters");
  const filterChips = filterContainer ? filterContainer.querySelectorAll("button[data-filter-category]") : [];
  const calendarCards = document.querySelectorAll(".calendar-card[data-category]");
  const monthSections = document.querySelectorAll(".month-section");

  // 1. Category Filtering
  filterChips.forEach(chip => {
    chip.addEventListener("click", function () {
      const category = this.getAttribute("data-filter-category");

      // Update chip styles
      filterChips.forEach(c => {
        c.classList.remove("btn--primary");
        c.classList.add("btn--secondary");
      });
      this.classList.remove("btn--secondary");
      this.classList.add("btn--primary");

      // Filter cards
      calendarCards.forEach(card => {
        const cardCategory = card.getAttribute("data-category");
        if (category === "all" || cardCategory === category) {
          card.style.display = ""; // Reset to default
        } else {
          card.style.display = "none";
        }
      });

      // Hide empty months
      monthSections.forEach(section => {
        const visibleCards = section.querySelectorAll(".calendar-card[data-category]:not([style*='display: none'])");
        if (visibleCards.length === 0) {
          section.style.display = "none";
        } else {
          section.style.display = "";
        }
      });

      // Re-run scroll spy to update timeline progress
      updateScrollSpy();
    });
  });

  // 2. Smooth Scrolling & Target Expansion
  const timelineLinks = document.querySelectorAll('a[href^="#evt-"]');
  timelineLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      if (!href) return;
      const targetId = href.substring(1);
      const targetCard = document.getElementById(targetId);

      if (targetCard) {
        // If the card is hidden by filter, we might want to reset filters or just do nothing.
        // For now, if it's hidden, let's reset to "All Categories"
        if (targetCard.style.display === "none") {
          const allChip = document.querySelector('button[data-filter-category="all"]');
          if (allChip) allChip.click();
        }

        // Sticky header offsets: header is ~72px, filter bar is ~70px.
        const yOffset = -150; 
        const y = targetCard.getBoundingClientRect().top + window.scrollY + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });

        // Open details
        const details = targetCard.querySelector("details");
        if (details) {
          details.open = true;
        }

        // Close other details
        calendarCards.forEach(card => {
          if (card.id !== targetId) {
            const otherDetails = card.querySelector("details");
            if (otherDetails) {
              otherDetails.open = false;
            }
          }
        });
      }
    });
  });

  // 3. Scroll Spy for Timeline
  const timelineItems = document.querySelectorAll(".snapshot-timeline__item");
  const progressBar = document.querySelector(".snapshot-timeline__progress-bar");

  function updateScrollSpy() {
    let currentId = null;

    calendarCards.forEach(card => {
      if (card.style.display === "none") return;
      const rect = card.getBoundingClientRect();
      // 250px is roughly the bottom of the sticky filter bar
      if (rect.top <= 250) { 
        currentId = card.id;
      }
    });
    
    // If we haven't scrolled past any, default to the first visible one
    if (!currentId) {
      for (const card of calendarCards) {
        if (card.style.display !== "none") {
          currentId = card.id;
          break;
        }
      }
    }

    if (currentId) {
      let activeIndex = -1;
      
      timelineItems.forEach((item, index) => {
        const href = item.getAttribute("href");
        if (href && href.substring(1) === currentId) {
          activeIndex = index;
          item.classList.add("snapshot-timeline__item--today");
        } else {
          item.classList.remove("snapshot-timeline__item--today");
        }
      });

      timelineItems.forEach((item, index) => {
        if (index < activeIndex) {
          item.classList.add("passed");
        } else {
          item.classList.remove("passed");
        }
      });

      if (progressBar && timelineItems.length > 1 && activeIndex >= 0) {
        const percentage = (activeIndex / (timelineItems.length - 1)) * 100;
        progressBar.style.width = `${percentage}%`;
      }
    }
  }

  window.addEventListener("scroll", updateScrollSpy, { passive: true });
  updateScrollSpy();

  // 4. Accordion behavior for details (only one open at a time)
  calendarCards.forEach(card => {
    const details = card.querySelector("details");
    if (details) {
      details.addEventListener("toggle", function (e) {
        if (details.open) {
          calendarCards.forEach(otherCard => {
            const otherDetails = otherCard.querySelector("details");
            if (otherDetails && otherDetails !== details) {
              otherDetails.open = false;
            }
          });
        }
      });
    }
  });

  // 5. Vertical Timeline Scroll Spy & Scrolling
  const verticalLinks = document.querySelectorAll(".vertical-timeline-link");
  
  verticalLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const yOffset = -180;
        const y = targetSection.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  function updateVerticalScrollSpy() {
    let currentId = null;
    monthSections.forEach(section => {
      if (section.style.display === "none") return;
      const rect = section.getBoundingClientRect();
      if (rect.top <= 200) {
        currentId = section.id;
      }
    });

    if (!currentId) {
      for (const section of monthSections) {
        if (section.style.display !== "none") {
          currentId = section.id;
          break;
        }
      }
    }

    if (currentId) {
      verticalLinks.forEach(link => {
        const node = link.closest('.timeline__item').querySelector('.timeline__node');
        if (link.getAttribute("href").substring(1) === currentId) {
          link.style.color = "var(--color-primary)";
          link.style.fontWeight = "var(--font-weight-bold)";
          if (node) node.style.background = "var(--color-primary)";
        } else {
          link.style.color = "var(--color-text)";
          link.style.fontWeight = "var(--font-weight-medium)";
          if (node) node.style.background = "";
        }
      });
    }
  }

  window.addEventListener("scroll", updateVerticalScrollSpy, { passive: true });
  updateVerticalScrollSpy();

});
