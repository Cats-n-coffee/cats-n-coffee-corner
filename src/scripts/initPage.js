import { readOrSetDefaultLocalStorage } from "./common/localStorage";

window.addEventListener('DOMContentLoaded', () => {
    // Gets the theme choice from storage and sets it
    const themeValue = document.body.classList.contains('light') ? 'light' : 'dark';
    const storedValue = readOrSetDefaultLocalStorage('themeValue', themeValue);

    if (storedValue === 'light') {
        document.body.classList.add('light');

        const themeToggle = document.querySelector('[data-theme-toggle]');
        themeToggle.setAttribute('aria-pressed', 'true');
    }
});