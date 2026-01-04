#!/usr/bin/env node
/**
 * Copy MediaPipe assets to public folder for self-hosting
 * Run during build: npm run copy-mediapipe
 *
 * This script copies WASM files from node_modules and downloads the pose model
 * to eliminate dependency on external CDNs (jsdelivr, Google Storage)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DEST_WASM = path.join(__dirname, '../public/mediapipe/wasm');
const DEST_MODELS = path.join(__dirname, '../public/mediapipe/models');

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/**
 * Copy WASM files from node_modules to public directory
 */
async function copyWasmFiles() {
  const sourceDir = path.join(__dirname, '../node_modules/@mediapipe/tasks-vision/wasm');

  if (!fs.existsSync(sourceDir)) {
    console.error('❌ MediaPipe WASM files not found. Run npm install first.');
    process.exit(1);
  }

  // Create destination directory
  fs.mkdirSync(DEST_WASM, { recursive: true });

  const files = fs.readdirSync(sourceDir);
  let copiedCount = 0;

  for (const file of files) {
    // Copy WASM, JS, and data files
    if (file.endsWith('.wasm') || file.endsWith('.js') || file.endsWith('.data')) {
      fs.copyFileSync(
        path.join(sourceDir, file),
        path.join(DEST_WASM, file)
      );
      console.log(`✓ Copied: ${file}`);
      copiedCount++;
    }
  }

  console.log(`✓ Copied ${copiedCount} WASM files`);
}

/**
 * Download pose landmarker model from Google Storage
 */
async function downloadModel() {
  fs.mkdirSync(DEST_MODELS, { recursive: true });
  const dest = path.join(DEST_MODELS, 'pose_landmarker_lite.task');

  // Skip if model already exists
  if (fs.existsSync(dest)) {
    const stats = fs.statSync(dest);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`✓ Model already exists (${sizeMB} MB), skipping download`);
    return;
  }

  console.log('⬇ Downloading pose landmarker model...');

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(MODEL_URL, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            const stats = fs.statSync(dest);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`✓ Model downloaded successfully (${sizeMB} MB)`);
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(dest);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`✓ Model downloaded successfully (${sizeMB} MB)`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('📦 Copying MediaPipe assets for self-hosting...\n');

  try {
    await copyWasmFiles();
    await downloadModel();
    console.log('\n✅ MediaPipe assets ready for self-hosting!');
  } catch (error) {
    console.error('\n❌ Error copying MediaPipe assets:', error.message);
    process.exit(1);
  }
}

main();
