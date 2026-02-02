#!/usr/bin/env node

/**
 * Helper script to generate credentials for deployment
 * Run: node generate-credentials.js
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🔐 Portfolio Messaging System - Credential Generator\n');
console.log('This script will help you generate:');
console.log('1. Admin password hash (bcrypt)');
console.log('2. JWT secret (random)\n');

rl.question('Enter your desired admin password: ', (password) => {
    if (!password || password.length < 8) {
        console.error('\n❌ Password must be at least 8 characters long!');
        rl.close();
        return;
    }

    console.log('\n⏳ Generating credentials...\n');

    // Generate password hash
    const hash = bcrypt.hashSync(password, 10);

    // Generate JWT secret
    const jwtSecret = crypto.randomBytes(32).toString('hex');

    console.log('✅ Credentials generated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Add these to your .env file and Netlify environment variables:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log(`JWT_SECRET=${jwtSecret}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - Save your password: ' + password);
    console.log('   - Use the HASH in environment variables (not the password)');
    console.log('   - Keep the JWT_SECRET identical on both Netlify sites\n');

    rl.close();
});
