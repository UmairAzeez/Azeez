// Netlify build plugin to inject environment variables
// This creates env.js with the MAIN_SITE_URL from Netlify environment

module.exports = {
    onPreBuild: ({ utils }) => {
        const mainSiteUrl = process.env.MAIN_SITE_URL || '';

        const envContent = `// Auto-generated environment configuration
window.ENV = {
  MAIN_SITE_URL: '${mainSiteUrl}'
};`;

        const fs = require('fs');
        const path = require('path');

        fs.writeFileSync(
            path.join(__dirname, 'env.js'),
            envContent
        );

        console.log('✅ Generated env.js with MAIN_SITE_URL:', mainSiteUrl || '(empty - using relative URLs)');
    }
};
