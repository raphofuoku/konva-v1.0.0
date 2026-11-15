#!/usr/bin/env node
/**
 * fetch-model
 * Path: scripts/fetch-model.mjs
 *
 * Puts everything background removal needs under public/ so Konva can serve it from its own domain:
 *   public/models/onnx-community/ormbg-ONNX/  the ormbg model (8-bit), from the Hugging Face hub
 *   public/ort/                               the ONNX Runtime WASM files, copied from node_modules
 * Then set VITE_MODEL_BASE=/models/ and VITE_ORT_BASE=/ort/ (see .env.example) and rebuild.
 *
 * Usage: npm run model:fetch            (skips files that are already there)
 *        npm run model:fetch -- --force (downloads and copies everything again)
 * Both folders are in .gitignore; run this as part of the deploy build instead of committing them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORCE = process.argv.includes('--force');

const MODEL_ID = 'onnx-community/ormbg-ONNX'; // keep in sync with loadSegmenter in src/lib/konvaEngine.js
const MODEL_FILES = ['config.json', 'preprocessor_config.json', 'onnx/model_quantized.onnx'];
const MODEL_DIR = path.join(ROOT, 'public/models', MODEL_ID);

const ORT_SRC = path.join(ROOT, 'node_modules/onnxruntime-web/dist');
// Transformers.js loads the asyncify build, or the plain one on Safari before 26 without WebGPU.
const ORT_FILES = [
  'ort-wasm-simd-threaded.asyncify.mjs',
  'ort-wasm-simd-threaded.asyncify.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
];
const ORT_DIR = path.join(ROOT, 'public/ort');

const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
const have = (file) => !FORCE && fs.existsSync(file) && fs.statSync(file).size > 0;

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(`${dest}.part`, buf);
  fs.renameSync(`${dest}.part`, dest); // never leave a half-written file behind
  return buf.length;
}

async function fetchModel() {
  for (const name of MODEL_FILES) {
    const dest = path.join(MODEL_DIR, name);
    const rel = path.relative(ROOT, dest);
    if (have(dest)) {
      console.log(`  kept    ${rel}`);
      continue;
    }
    const size = await download(`https://huggingface.co/${MODEL_ID}/resolve/main/${name}`, dest);
    console.log(`  fetched ${rel} (${mb(size)})`);
  }
}

function copyRuntime() {
  if (!fs.existsSync(ORT_SRC)) {
    throw new Error('node_modules/onnxruntime-web is missing. Run npm install first.');
  }
  fs.mkdirSync(ORT_DIR, { recursive: true });
  for (const name of ORT_FILES) {
    const src = path.join(ORT_SRC, name);
    const dest = path.join(ORT_DIR, name);
    const rel = path.relative(ROOT, dest);
    if (!fs.existsSync(src)) {
      console.warn(`  missing ${path.relative(ROOT, src)} (this onnxruntime-web version may not ship it)`);
      continue;
    }
    if (have(dest) && fs.statSync(dest).size === fs.statSync(src).size) {
      console.log(`  kept    ${rel}`);
      continue;
    }
    fs.copyFileSync(src, dest);
    console.log(`  copied  ${rel} (${mb(fs.statSync(dest).size)})`);
  }
}

try {
  console.log('Background-removal model');
  await fetchModel();
  console.log('ONNX Runtime');
  copyRuntime();
  console.log('Done. Set VITE_MODEL_BASE=/models/ and VITE_ORT_BASE=/ort/, then rebuild.');
} catch (err) {
  console.error(`fetch-model: ${err.message}`);
  process.exit(1);
}
