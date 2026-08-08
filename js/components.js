/**
 * PROJECT-1 Reusable Component Behaviours
 * Vanilla JavaScript — no dependencies
 */

(function () {
  "use strict";

  /**
   * Accordion — keyboard accessible, one panel open at a time
   */
  function initAccordions() {
    const accordions = document.querySelectorAll("[data-accordion]");

    accordions.forEach(function (accordion) {
      const triggers = accordion.querySelectorAll(".accordion__trigger");

      triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          togglePanel(trigger, triggers);
        });

        trigger.addEventListener("keydown", function (event) {
          const index = Array.from(triggers).indexOf(trigger);

          switch (event.key) {
            case "ArrowDown":
              event.preventDefault();
              triggers[(index + 1) % triggers.length].focus();
              break;
            case "ArrowUp":
              event.preventDefault();
              triggers[(index - 1 + triggers.length) % triggers.length].focus();
              break;
            case "Home":
              event.preventDefault();
              triggers[0].focus();
              break;
            case "End":
              event.preventDefault();
              triggers[triggers.length - 1].focus();
              break;
          }
        });
      });
    });
  }

  function togglePanel(trigger, allTriggers) {
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    const panelId = trigger.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);

    allTriggers.forEach(function (other) {
      const otherPanelId = other.getAttribute("aria-controls");
      const otherPanel = document.getElementById(otherPanelId);
      other.setAttribute("aria-expanded", "false");
      if (otherPanel) {
        otherPanel.hidden = true;
      }
    });

    if (!isExpanded && panel) {
      trigger.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    }
  }

  function initScrollToTop() {
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    if (!scrollToTopBtn) return;
    
    window.addEventListener("scroll", function() {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add("visible");
      } else {
        scrollToTopBtn.classList.remove("visible");
      }
    });
    
    scrollToTopBtn.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    initAccordions();
    initScrollToTop();
  });
})();
