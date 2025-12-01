/**
 * Test Harness for Alignment Verification
 *
 * Tests alignment calculation in export coordinates (accounting for cover-fit)
 *
 * Run with: npx tsx scripts/test-alignment.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, loadImage } from 'canvas';

// Constants
const VISIBILITY_THRESHOLD = 0.5;

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

type AnchorType = 'head' | 'shoulders' | 'hips' | 'full';

const anchorIndices: Record<AnchorType, number[]> = {
  head: [0],
  shoulders: [11, 12],
  hips: [23, 24],
  full: [0, 23, 24],
};

/**
 * Calculate cover-fit parameters
 */
function calculateCoverFit(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number
): { drawX: number; drawY: number; drawWidth: number; drawHeight: number } {
  const imgAspect = imgWidth / imgHeight;
  const targetAspect = targetWidth / targetHeight;

  let drawWidth: number;
  let drawHeight: number;
  let drawX: number;
  let drawY: number;

  if (imgAspect > targetAspect) {
    // Image is wider - fit to height
    drawHeight = targetHeight;
    drawWidth = targetHeight * imgAspect;
    drawX = (targetWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    // Image is taller - fit to width
    drawWidth = targetWidth;
    drawHeight = targetWidth / imgAspect;
    drawX = 0;
    drawY = (targetHeight - drawHeight) / 2;
  }

  return { drawX, drawY, drawWidth, drawHeight };
}

/**
 * Transform landmark from original image to export coordinates
 */
function transformLandmarkToExport(
  landmark: { x: number; y: number },
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number
): { x: number; y: number } {
  const fit = calculateCoverFit(imgWidth, imgHeight, targetWidth, targetHeight);
  return {
    x: fit.drawX + landmark.x * fit.drawWidth,
    y: fit.drawY + landmark.y * fit.drawHeight,
  };
}

/**
 * Calculate alignment in export coordinates
 */
function calculateExportAlignment(
  beforeLandmarks: Landmark[],
  afterLandmarks: Landmark[],
  beforeImgWidth: number,
  beforeImgHeight: number,
  afterImgWidth: number,
  afterImgHeight: number,
  targetWidth: number,
  targetHeight: number,
  anchor: AnchorType
): { scale: number; offsetX: number; offsetY: number } {
  const indices = anchorIndices[anchor];

  // Calculate anchor center for before image in export pixels
  let beforeX = 0, beforeY = 0, beforeCount = 0;
  for (const idx of indices) {
    const lm = beforeLandmarks[idx];
    if (lm && lm.visibility >= VISIBILITY_THRESHOLD) {
      const pos = transformLandmarkToExport(lm, beforeImgWidth, beforeImgHeight, targetWidth, targetHeight);
      beforeX += pos.x;
      beforeY += pos.y;
      beforeCount++;
    }
  }

  // Calculate anchor center for after image in export pixels
  let afterX = 0, afterY = 0, afterCount = 0;
  for (const idx of indices) {
    const lm = afterLandmarks[idx];
    if (lm && lm.visibility >= VISIBILITY_THRESHOLD) {
      const pos = transformLandmarkToExport(lm, afterImgWidth, afterImgHeight, targetWidth, targetHeight);
      afterX += pos.x;
      afterY += pos.y;
      afterCount++;
    }
  }

  if (beforeCount === 0 || afterCount === 0) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }

  beforeX /= beforeCount;
  beforeY /= beforeCount;
  afterX /= afterCount;
  afterY /= afterCount;

  // Calculate body height for scale (nose to hip center in export coordinates)
  const beforeNose = beforeLandmarks[0];
  const beforeLeftHip = beforeLandmarks[23];
  const beforeRightHip = beforeLandmarks[24];
  const afterNose = afterLandmarks[0];
  const afterLeftHip = afterLandmarks[23];
  const afterRightHip = afterLandmarks[24];

  let scale = 1;
  if (
    beforeNose?.visibility >= VISIBILITY_THRESHOLD &&
    beforeLeftHip?.visibility >= VISIBILITY_THRESHOLD &&
    beforeRightHip?.visibility >= VISIBILITY_THRESHOLD &&
    afterNose?.visibility >= VISIBILITY_THRESHOLD &&
    afterLeftHip?.visibility >= VISIBILITY_THRESHOLD &&
    afterRightHip?.visibility >= VISIBILITY_THRESHOLD
  ) {
    const beforeNosePos = transformLandmarkToExport(beforeNose, beforeImgWidth, beforeImgHeight, targetWidth, targetHeight);
    const beforeHipPos = {
      y: (transformLandmarkToExport(beforeLeftHip, beforeImgWidth, beforeImgHeight, targetWidth, targetHeight).y +
          transformLandmarkToExport(beforeRightHip, beforeImgWidth, beforeImgHeight, targetWidth, targetHeight).y) / 2,
    };

    const afterNosePos = transformLandmarkToExport(afterNose, afterImgWidth, afterImgHeight, targetWidth, targetHeight);
    const afterHipPos = {
      y: (transformLandmarkToExport(afterLeftHip, afterImgWidth, afterImgHeight, targetWidth, targetHeight).y +
          transformLandmarkToExport(afterRightHip, afterImgWidth, afterImgHeight, targetWidth, targetHeight).y) / 2,
    };

    const beforeBodyHeight = Math.abs(beforeHipPos.y - beforeNosePos.y);
    const afterBodyHeight = Math.abs(afterHipPos.y - afterNosePos.y);

    if (afterBodyHeight > 0) {
      scale = beforeBodyHeight / afterBodyHeight;
      scale = Math.max(0.5, Math.min(2, scale));
    }
  }

  // Calculate offset to align anchors
  const centerX = targetWidth / 2;
  const centerY = targetHeight / 2;

  // After scaling around center, anchor moves to:
  const scaledAfterX = centerX + (afterX - centerX) * scale;
  const scaledAfterY = centerY + (afterY - centerY) * scale;

  // Offset to move scaled anchor to before anchor position
  const offsetX = beforeX - scaledAfterX;
  const offsetY = beforeY - scaledAfterY;

  return { scale, offsetX, offsetY };
}

interface TestConfig {
  beforeImagePath: string;
  afterImagePath: string;
  beforeLandmarks: Landmark[];
  afterLandmarks: Landmark[];
  outputPath: string;
  format: '1:1' | '4:5' | '9:16';
  anchor: AnchorType;
}

async function runAlignmentTest(config: TestConfig): Promise<void> {
  console.log('\n========================================');
  console.log(`Testing anchor: ${config.anchor.toUpperCase()}`);
  console.log('========================================');

  // Load images
  const beforeImg = await loadImage(config.beforeImagePath);
  const afterImg = await loadImage(config.afterImagePath);

  console.log(`Before: ${beforeImg.width}x${beforeImg.height}`);
  console.log(`After: ${afterImg.width}x${afterImg.height}`);

  // Calculate export dimensions
  const resolution = 1080;
  const halfWidth = resolution;
  let height: number;
  switch (config.format) {
    case '1:1': height = resolution; break;
    case '4:5': height = Math.round(resolution * 1.25); break;
    case '9:16': height = Math.round((resolution * 16) / 9); break;
    default: height = resolution;
  }

  console.log(`Export size per panel: ${halfWidth}x${height}`);

  // Calculate alignment in export coordinates
  const alignment = calculateExportAlignment(
    config.beforeLandmarks,
    config.afterLandmarks,
    beforeImg.width,
    beforeImg.height,
    afterImg.width,
    afterImg.height,
    halfWidth,
    height,
    config.anchor
  );

  console.log(`\nAlignment (in export coordinates):`);
  console.log(`  Scale: ${alignment.scale.toFixed(3)}`);
  console.log(`  OffsetX: ${alignment.offsetX.toFixed(1)}px`);
  console.log(`  OffsetY: ${alignment.offsetY.toFixed(1)}px`);

  // Create canvas
  const canvas = createCanvas(halfWidth * 2, height);
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, halfWidth * 2, height);

  // Draw BEFORE photo (left half) - simple cover fit
  const beforeFit = calculateCoverFit(beforeImg.width, beforeImg.height, halfWidth, height);
  ctx.drawImage(
    beforeImg,
    beforeFit.drawX,
    beforeFit.drawY,
    beforeFit.drawWidth,
    beforeFit.drawHeight
  );

  // Draw AFTER photo (right half) - with alignment
  ctx.save();
  ctx.beginPath();
  ctx.rect(halfWidth, 0, halfWidth, height);
  ctx.clip();

  const afterFit = calculateCoverFit(afterImg.width, afterImg.height, halfWidth, height);
  const scaledWidth = afterFit.drawWidth * alignment.scale;
  const scaledHeight = afterFit.drawHeight * alignment.scale;

  // Center of target area, then apply scale and offset
  const centerX = halfWidth + halfWidth / 2;
  const centerY = height / 2;
  const drawX = centerX - scaledWidth / 2 + alignment.offsetX;
  const drawY = centerY - scaledHeight / 2 + alignment.offsetY;

  ctx.drawImage(afterImg, drawX, drawY, scaledWidth, scaledHeight);
  ctx.restore();

  // Draw debug markers - BEFORE anchor (red circles with crosshairs)
  const indices = anchorIndices[config.anchor];
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 4;

  for (const idx of indices) {
    const lm = config.beforeLandmarks[idx];
    if (lm && lm.visibility >= VISIBILITY_THRESHOLD) {
      const pos = transformLandmarkToExport(lm, beforeImg.width, beforeImg.height, halfWidth, height);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pos.x - 25, pos.y);
      ctx.lineTo(pos.x + 25, pos.y);
      ctx.moveTo(pos.x, pos.y - 25);
      ctx.lineTo(pos.x, pos.y + 25);
      ctx.stroke();
    }
  }

  // Draw debug markers - AFTER anchor (green circles) - where they END UP after alignment
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 4;

  for (const idx of indices) {
    const lm = config.afterLandmarks[idx];
    if (lm && lm.visibility >= VISIBILITY_THRESHOLD) {
      // Landmark position in the scaled+offset drawn image
      const px = drawX + lm.x * scaledWidth;
      const py = drawY + lm.y * scaledHeight;

      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Draw labels
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 10;
  ctx.textAlign = 'center';
  ctx.fillText('Before', halfWidth / 2, 60);
  ctx.fillText('After', halfWidth + halfWidth / 2, 60);

  // Legend
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#ff0000';
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  ctx.fillText('● Before anchor', 20, height - 60);
  ctx.fillStyle = '#00ff00';
  ctx.fillText('● After anchor (aligned)', 20, height - 30);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(config.outputPath, buffer);
  console.log(`\nSaved: ${config.outputPath}`);

  // Measure alignment error
  console.log('\nAlignment verification:');
  for (const idx of indices) {
    const lm1 = config.beforeLandmarks[idx];
    const lm2 = config.afterLandmarks[idx];
    if (lm1 && lm2 && lm1.visibility >= VISIBILITY_THRESHOLD && lm2.visibility >= VISIBILITY_THRESHOLD) {
      // Before landmark position in export
      const beforePos = transformLandmarkToExport(lm1, beforeImg.width, beforeImg.height, halfWidth, height);

      // After landmark position after alignment (in right half)
      const afterPx = drawX + lm2.x * scaledWidth;
      const afterPy = drawY + lm2.y * scaledHeight;

      // Compare relative positions (subtract halfWidth from after to compare)
      const errorX = (afterPx - halfWidth) - beforePos.x;
      const errorY = afterPy - beforePos.y;
      const errorDist = Math.sqrt(errorX * errorX + errorY * errorY);
      const errorPct = (errorDist / height) * 100;

      console.log(`  Landmark ${idx}: error = ${errorDist.toFixed(1)}px (${errorPct.toFixed(2)}%)`);
    }
  }
}

// Mock landmarks - carefully estimated from visual inspection
const mockBeforeLandmarks: Landmark[] = Array(33).fill(null).map(() => ({
  x: 0.5, y: 0.5, z: 0, visibility: 0.3,
}));

// Before: 2048x2048 square image
mockBeforeLandmarks[0] = { x: 0.50, y: 0.15, z: 0, visibility: 0.99 };  // nose
mockBeforeLandmarks[11] = { x: 0.35, y: 0.26, z: 0, visibility: 0.95 }; // left shoulder
mockBeforeLandmarks[12] = { x: 0.65, y: 0.26, z: 0, visibility: 0.95 }; // right shoulder
mockBeforeLandmarks[23] = { x: 0.42, y: 0.48, z: 0, visibility: 0.90 }; // left hip
mockBeforeLandmarks[24] = { x: 0.58, y: 0.48, z: 0, visibility: 0.90 }; // right hip

const mockAfterLandmarks: Landmark[] = Array(33).fill(null).map(() => ({
  x: 0.5, y: 0.5, z: 0, visibility: 0.3,
}));

// After: 1536x2048 portrait (3:4 aspect ratio)
mockAfterLandmarks[0] = { x: 0.50, y: 0.13, z: 0, visibility: 0.99 };  // nose
mockAfterLandmarks[11] = { x: 0.32, y: 0.23, z: 0, visibility: 0.95 }; // left shoulder
mockAfterLandmarks[12] = { x: 0.68, y: 0.23, z: 0, visibility: 0.95 }; // right shoulder
mockAfterLandmarks[23] = { x: 0.38, y: 0.46, z: 0, visibility: 0.90 }; // left hip
mockAfterLandmarks[24] = { x: 0.62, y: 0.46, z: 0, visibility: 0.90 }; // right hip

async function main() {
  const testDir = path.join(process.cwd(), 'test_images');
  const beforePath = path.join(testDir, 'before.jpeg');
  const afterPath = path.join(testDir, 'after.jpeg');

  if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) {
    console.error('Test images not found!');
    process.exit(1);
  }

  // Test each anchor type
  const anchors: AnchorType[] = ['shoulders', 'full', 'head', 'hips'];

  for (const anchor of anchors) {
    await runAlignmentTest({
      beforeImagePath: beforePath,
      afterImagePath: afterPath,
      beforeLandmarks: mockBeforeLandmarks,
      afterLandmarks: mockAfterLandmarks,
      outputPath: path.join(testDir, `test_export_${anchor}.png`),
      format: '1:1',
      anchor,
    });
  }

  console.log('\n✓ All tests complete');
}

main().catch(console.error);
