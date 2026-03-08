/**
 * YouTube Shorts Limiter - Content Script
 * Disables the Shorts sidebar link and overlays it with a chain graphic
 */

// Debounce utility to prevent excessive function calls during rapid DOM updates
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Apply the chain overlay to YouTube Shorts sidebar entries
 * Handles both full sidebar (ytd-guide-entry-renderer) and mini sidebar (ytd-mini-guide-entry-renderer)
 */
function applyChain() {
  // Select both full and mini sidebar Shorts entries
  const selectors = [
    'ytd-guide-entry-renderer:has(a[href="/shorts"])',
    'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])'
  ];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(renderer => {
      // Skip if already processed
      if (renderer.classList.contains('shorts-chained')) {
        return;
      }

      // Mark as processed
      renderer.classList.add('shorts-chained');

      // Remove any existing overlay (cleanup in case of re-injection)
      const existingOverlay = renderer.querySelector('.shorts-chain-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }

      // Create and inject the chain overlay
      const overlayDiv = document.createElement('div');
      overlayDiv.className = 'shorts-chain-overlay';

      // Inline SVG with repeating chain link pattern
      overlayDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="chain-pattern-${Math.random()}" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <!-- Left link: tilted -40 degrees -->
              <ellipse cx="9" cy="14" rx="7" ry="4"
                       transform="rotate(-40 9 14)"
                       stroke="#b8860b" stroke-width="2.5"
                       fill="none" opacity="0.85"/>
              <!-- Right link: tilted +40 degrees, interlocked -->
              <ellipse cx="19" cy="14" rx="7" ry="4"
                       transform="rotate(40 19 14)"
                       stroke="#8b6914" stroke-width="2.5"
                       fill="none" opacity="0.85"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chain-pattern-${Math.random()})"/>
        </svg>
      `;

      renderer.appendChild(overlayDiv);

      // Add click interceptor as defensive measure
      const clickHandler = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
      };
      renderer.addEventListener('click', clickHandler, true); // capture phase
    });
  });
}

// Initialize on script load
applyChain();

// Re-apply chain after YouTube's SPA navigation completes
window.addEventListener('yt-navigate-finish', applyChain);

// Re-apply chain when DOM is mutated (handles async sidebar injection)
const observer = new MutationObserver(debounce(applyChain, 150));
observer.observe(document.body, {
  childList: true,
  subtree: true
});
