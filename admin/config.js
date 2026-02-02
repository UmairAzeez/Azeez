// Configuration for admin dashboard
// This allows the admin to connect to the main site's API

// For local development, use relative URLs
// For production, set MAIN_SITE_URL environment variable in Netlify
const MAIN_SITE_URL = window.location.hostname === 'localhost'
    ? ''
    : (window.ENV?.MAIN_SITE_URL || '');

// API endpoints
const API_ENDPOINTS = {
    login: `${MAIN_SITE_URL}/.netlify/functions/admin-login`,
    getMessages: `${MAIN_SITE_URL}/.netlify/functions/get-messages`,
    reply: `${MAIN_SITE_URL}/.netlify/functions/reply`
};

// Export for use in other scripts
window.API_CONFIG = {
    endpoints: API_ENDPOINTS,
    mainSiteUrl: MAIN_SITE_URL
};
