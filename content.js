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
  // Select the Shorts sidebar link (works for both full and mini sidebars)
  const elements = document.querySelectorAll('a[title="Shorts"]');

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

      // Create img element with chains.svg
      const chainImg = document.createElement('img');
      chainImg.src = chrome.runtime.getURL('chains.svg');
      chainImg.alt = 'Locked';

      overlayDiv.appendChild(chainImg);
      renderer.appendChild(overlayDiv);

      // Add click interceptor as defensive measure
      const clickHandler = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
      };
      renderer.addEventListener('click', clickHandler, true); // capture phase
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
