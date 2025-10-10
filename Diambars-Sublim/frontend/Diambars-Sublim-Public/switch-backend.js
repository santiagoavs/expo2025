#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

// Get command line argument
const mode = process.argv[2];

if (!mode || !['local', 'render'].includes(mode)) {
  console.log('❌ Usage: node switch-backend.js [local|render]');
  console.log('');
  console.log('Examples:');
  console.log('  node switch-backend.js render  # Switch to Render backend (default)');
  console.log('  node switch-backend.js local   # Switch to local backend (testing)');
  process.exit(1);
}

try {
  // Read current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update VITE_BACKEND_MODE
  envContent = envContent.replace(
    /VITE_BACKEND_MODE=.*/,
    `VITE_BACKEND_MODE=${mode}`
  );
  
  // Write back to .env file
  fs.writeFileSync(envPath, envContent);
  
  const backendUrl = mode === 'local' 
    ? 'http://localhost:4000/api'
    : 'https://expo2025-8bjn.onrender.com/api';
    
  console.log(`✅ Backend switched to: ${mode.toUpperCase()}`);
  console.log(`🎯 API URL: ${backendUrl}`);
  console.log('');
  console.log('⚠️  Remember to restart your dev server: npm run dev');
  
} catch (error) {
  console.error('❌ Error switching backend:', error.message);
  process.exit(1);
}