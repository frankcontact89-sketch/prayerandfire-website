(() => {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadScript('/admin-subscribers-core.js?v=20261008-mobile-confirm')
    .then(() => loadScript('/admin-campaign-actions.js?v=20261008-fix-actions'))
    .catch((error) => console.error('Unable to load subscriber admin tools:', error));
})();