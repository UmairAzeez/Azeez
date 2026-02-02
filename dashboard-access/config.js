// Configuration for manager dashboard
// This allows the manager to connect to the main site's API

// For single-site deployment, always use relative URLs
const MAIN_SITE_URL = '';

// API endpoints
const API_ENDPOINTS = {
    login: `${MAIN_SITE_URL}/.netlify/functions/manager-login`,
    getMessages: `${MAIN_SITE_URL}/.netlify/functions/get-messages`,
    reply: `${MAIN_SITE_URL}/.netlify/functions/reply`
};

// Export for use in other scripts
window.API_CONFIG = {
    endpoints: API_ENDPOINTS,
    mainSiteUrl: MAIN_SITE_URL
};
