(function () {
  function getThemeFromCookie() {
    try {
      const match = document.cookie.match(/(^| )theme=([^;]+)/);
      return match ? decodeURIComponent(match[2]) : 'dark';
    } catch {
      return 'dark';
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme() {
    const savedTheme = getThemeFromCookie();
    const resolvedTheme =
      savedTheme === 'system' ? getSystemTheme() : savedTheme;

    // Apply theme immediately
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  }

  // Run immediately
  applyTheme();
})();
