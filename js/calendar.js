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

  // 3. Time-based fill for Snapshot Timeline
  const timelineItems = document.querySelectorAll(".snapshot-timeline__item");
  const progressBar = document.querySelector(".snapshot-timeline__progress-bar");

  function calculateTimeProgress() {
    if (!progressBar || timelineItems.length < 2) return;

    // We use a simulated "today" for the mock environment, or Date.now() in production
    // The design shows "TODAY (Aug 04)" for 2026, so let's simulate a date around mid-August
    // as per the user's request, or just use the system date if it's within the semester.
    const currentYear = 2026; 
    let now = new Date();
    // For demonstration, if we are in 2026, let's use the actual date. 
    // If not, mock it so the calendar looks nice.
    if (now.getFullYear() !== 2026) {
      now = new Date("August 15, 2026");
    }

    const parsedDates = [];
    timelineItems.forEach(item => {
      const dateEl = item.querySelector('.snapshot-timeline__date');
      if (dateEl) {
        const text = dateEl.textContent; 
        const match = text.match(/([a-zA-Z]{3})\s+(\d+)/);
        if (match) {
           const d = new Date(`${match[1]} ${match[2]}, ${currentYear}`);
           parsedDates.push({ date: d, item: item });
        }
      }
    });

    if (parsedDates.length !== timelineItems.length) return;

    const startTime = parsedDates[0].date.getTime();
    const endTime = parsedDates[parsedDates.length - 1].date.getTime();
    const currentTime = now.getTime();

    let percentage = 0;
    
    if (currentTime <= startTime) {
      percentage = 0;
      parsedDates[0].item.classList.add('snapshot-timeline__item--today');
    } else if (currentTime >= endTime) {
      percentage = 100;
      parsedDates.forEach(p => p.item.classList.add('passed'));
      parsedDates[parsedDates.length - 1].item.classList.add('snapshot-timeline__item--today');
    } else {
      let activeIndex = 0;
      for (let i = 0; i < parsedDates.length - 1; i++) {
        const d1 = parsedDates[i].date.getTime();
        const d2 = parsedDates[i+1].date.getTime();
        
        if (currentTime >= d1 && currentTime <= d2) {
          activeIndex = i;
          const segmentFraction = (currentTime - d1) / (d2 - d1);
          const visualStep = 100 / (parsedDates.length - 1);
          percentage = (activeIndex * visualStep) + (segmentFraction * visualStep);
          break;
        }
      }
      
      parsedDates.forEach((p, idx) => {
        if (idx < activeIndex) {
          p.item.classList.add('passed');
          p.item.classList.remove('snapshot-timeline__item--today');
        } else if (idx === activeIndex) {
          // If we are exactly between nodes, the previous node is 'today' or 'passed'
          // We will mark the last passed node as the active/today one
          p.item.classList.add('snapshot-timeline__item--today');
          p.item.classList.remove('passed');
        } else {
          p.item.classList.remove('passed', 'snapshot-timeline__item--today');
        }
      });
    }

    progressBar.style.width = `${percentage}%`;
    
    // Update the "TODAY" label to reflect the current mocked date
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const todayLabel = `TODAY (${monthNames[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')})`;
    
    // Update the label of the active node to include TODAY
    parsedDates.forEach(p => {
       const text = p.item.querySelector('.snapshot-timeline__date').textContent;
       if (text.includes("TODAY")) {
         p.item.querySelector('.snapshot-timeline__date').textContent = text.replace(/TODAY \([^\)]+\)/, '').trim();
       }
    });
    
    const activeItem = document.querySelector('.snapshot-timeline__item--today .snapshot-timeline__date');
    if (activeItem && !activeItem.textContent.includes("TODAY")) {
       activeItem.textContent = `TODAY (${activeItem.textContent})`;
    }
  }

  calculateTimeProgress();

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
    
    // Check if we are at the bottom of the page
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
    
    if (isAtBottom) {
      // Default to the last visible month if at the bottom
      for (let i = monthSections.length - 1; i >= 0; i--) {
        if (monthSections[i].style.display !== "none") {
          currentId = monthSections[i].id;
          break;
        }
      }
    } else {
      monthSections.forEach(section => {
        if (section.style.display === "none") return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200) {
          currentId = section.id;
        }
      });
    }

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
