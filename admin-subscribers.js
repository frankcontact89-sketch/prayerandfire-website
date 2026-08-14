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

  loadScript('/admin-subscribers-core.js?v=20260814')
    .then(() => loadScript('/admin-campaign-actions.js?v=20260814'))
    .catch((error) => console.error('Unable to load subscriber admin tools:', error));
})();