// Environment configuration injector
// This script injects environment variables from Netlify into the window.ENV object
// Used for admin dashboard to know the main site URL

(function () {
    // In production, Netlify will inject environment variables
    // This is a placeholder that gets replaced during build
    window.ENV = {
        MAIN_SITE_URL: '' // Will be set via Netlify environment variable
    };
})();
