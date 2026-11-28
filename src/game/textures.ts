import * as THREE from 'three';

export interface SandTextures {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
}

export interface CoralTextures {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function periodicNoise(u: number, v: number, scale: number): number {
  const x = u * scale;
  const y = v * scale;
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const ix0 = ((ix % scale) + scale) % scale;
  const iy0 = ((iy % scale) + scale) % scale;
  const ix1 = (ix0 + 1) % scale;
  const iy1 = (iy0 + 1) % scale;

  const a = hash2(ix0, iy0);
  const b = hash2(ix1, iy0);
  const c = hash2(ix0, iy1);
  const d = hash2(ix1, iy1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/**
 * Fine-grained deep-sea sand & silt textures (albedo map + tangent-space normalMap)
 * built purely from multi-octave periodic noise + mineral grain (zero sinusoidal rows),
 * tiled finely at (24, 44) so sand grains look crisp and natural.
 */
export function createSandTextures(maxAnisotropy: number): SandTextures {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const normalData = nCtx.createImageData(size, size);
  const heightField = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const u = x / size;
      const v = y / size;

      // Multi-octave periodic noise (organic silt pockets + subtle drift, no regular bands)
      const fbm =
        periodicNoise(u, v, 6) * 0.44 +
        periodicNoise(u + 0.37, v + 0.19, 14) * 0.3 +
        periodicNoise(u + 0.11, v + 0.63, 28) * 0.16 +
        periodicNoise(u, v, 56) * 0.1;

      const fineGrain = hash2(x * 0.91, y * 0.91) * 0.22;
      const shellFlecks =
        hash2(x * 1.7 + 13.0, y * 1.7 + 7.0) > 0.982 ? 0.2 : 0.0;
      const h = Math.min(1, fbm * 0.78 + fineGrain + shellFlecks);
      heightField[y * size + x] = h;

      // Uniform dark blue-green deep-sea sand/silt palette
      imgData.data[idx] = Math.round(20 + h * 26);
      imgData.data[idx + 1] = Math.round(44 + h * 34);
      imgData.data[idx + 2] = Math.round(52 + h * 32);
      imgData.data[idx + 3] = 255;
    }
  }

  // Convert heightfield into a seamless tangent-space Normal Map
  const strength = 2.6;
  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;

      const hL = heightField[y * size + xPrev];
      const hR = heightField[y * size + xNext];
      const hU = heightField[yPrev * size + x];
      const hD = heightField[yNext * size + x];

      const dx = (hL - hR) * strength;
      const dy = (hU - hD) * strength;
      const dz = 1.0;
      const invLen = 1 / Math.hypot(dx, dy, dz);

      const idx = (y * size + x) * 4;
      normalData.data[idx] = Math.round((dx * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 1] = Math.round((dy * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 2] = Math.round((dz * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  nCtx.putImageData(normalData, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(24, 44);
  map.anisotropy = maxAnisotropy;

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(24, 44);
  normalMap.anisotropy = maxAnisotropy;

  return { map, normalMap };
}

export interface TrawlerNetTextures {
  map: THREE.CanvasTexture;
  alphaMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

/**
 * Natural porous limestone & coral micro-texture (organic stony cavities, zero plastic smoothness).
 */
export function createCoralTextures(maxAnisotropy: number): CoralTextures {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const bumpData = bCtx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const u = x / size;
      const v = y / size;

      const ridges =
        periodicNoise(u, v, 10) * 0.48 +
        periodicNoise(u, v, 24) * 0.32 +
        periodicNoise(u, v, 48) * 0.2;
      // Stony coral pores / pitted limestone cavities
      const poreCell = periodicNoise(u + 0.17, v + 0.31, 36);
      const pore = poreCell < 0.32 ? (0.32 - poreCell) * 2.1 : 0;
      const fine = hash2(x, y) * 0.16;
      const val = Math.min(1, Math.max(0, ridges * 0.85 + fine - pore * 0.72));

      const shade = Math.round(122 + val * 108);
      imgData.data[idx] = shade;
      imgData.data[idx + 1] = Math.round(shade * 0.94);
      imgData.data[idx + 2] = Math.min(255, shade + 8);
      imgData.data[idx + 3] = 255;

      const bVal = Math.round(val * 255);
      bumpData.data[idx] = bVal;
      bumpData.data[idx + 1] = bVal;
      bumpData.data[idx + 2] = bVal;
      bumpData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bCtx.putImageData(bumpData, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

/**
 * Generates weathered wet hemp/nylon fishing net textures: color map, crisp AlphaMap, and knot BumpMap.
 */
export function createTrawlerNetTexture(maxAnisotropy: number): TrawlerNetTextures {
  const size = 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const alphaCanvas = document.createElement('canvas');
  alphaCanvas.width = size;
  alphaCanvas.height = size;
  const aCtx = alphaCanvas.getContext('2d', { willReadFrequently: true })!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Solid rope color background avoids edge-bleed halos where alpha transitions to 0
  ctx.fillStyle = '#384147';
  ctx.fillRect(0, 0, size, size);

  aCtx.fillStyle = '#000000';
  aCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#000000';
  bCtx.fillRect(0, 0, size, size);

  const step = 64;
  ctx.lineCap = 'round';
  aCtx.lineCap = 'round';
  bCtx.lineCap = 'round';

  for (let i = -size; i <= size * 2; i += step) {
    // 1. Alpha mask (solid white where rope fibers sit, black in open water holes)
    aCtx.strokeStyle = '#ffffff';
    aCtx.lineWidth = 7.5;
    aCtx.beginPath();
    aCtx.moveTo(i, 0);
    aCtx.lineTo(i + size, size);
    aCtx.moveTo(i, size);
    aCtx.lineTo(i + size, 0);
    aCtx.stroke();

    // 2. Bump height (rounded rope ridge + braided twist dashes)
    bCtx.strokeStyle = '#999999';
    bCtx.lineWidth = 7.5;
    bCtx.beginPath();
    bCtx.moveTo(i, 0);
    bCtx.lineTo(i + size, size);
    bCtx.moveTo(i, size);
    bCtx.lineTo(i + size, 0);
    bCtx.stroke();

    bCtx.save();
    bCtx.setLineDash([7, 5]);
    bCtx.strokeStyle = '#ffffff';
    bCtx.lineWidth = 3.2;
    bCtx.beginPath();
    bCtx.moveTo(i, 0);
    bCtx.lineTo(i + size, size);
    bCtx.moveTo(i, size);
    bCtx.lineTo(i + size, 0);
    bCtx.stroke();
    bCtx.restore();

    // 3. Rope color (wet dark olive-grey outer shade + lighter twisted strands)
    ctx.strokeStyle = '#252c31';
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.moveTo(i, size);
    ctx.lineTo(i + size, 0);
    ctx.stroke();

    ctx.strokeStyle = '#535e63';
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.moveTo(i, size);
    ctx.lineTo(i + size, 0);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([7, 5]);
    ctx.strokeStyle = '#7b878c';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(i + 1, 0);
    ctx.lineTo(i + size + 1, size);
    ctx.moveTo(i - 1, size);
    ctx.lineTo(i + size - 1, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Frayed loose micro-fibers sticking slightly out of the ropes
  for (let n = 0; n < 220; n++) {
    const px = hash2(n, 3.1) * size;
    const py = hash2(n, 9.7) * size;
    const ang = hash2(n, 17.3) * Math.PI * 2;
    const gx = Math.round(px);
    const gy = Math.round(py);
    const alphaPixel = aCtx.getImageData(
      Math.max(0, Math.min(size - 1, gx)),
      Math.max(0, Math.min(size - 1, gy)),
      1,
      1,
    ).data[0];
    if (alphaPixel > 120) {
      ctx.strokeStyle = 'rgba(110, 118, 120, 0.65)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(ang) * 7, py + Math.sin(ang) * 7);
      ctx.stroke();

      aCtx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
      aCtx.lineWidth = 1.0;
      aCtx.beginPath();
      aCtx.moveTo(px, py);
      aCtx.lineTo(px + Math.cos(ang) * 7, py + Math.sin(ang) * 7);
      aCtx.stroke();
    }
  }

  // Thick tied knots at every diamond intersection
  for (let y = 0; y <= size; y += step / 2) {
    for (let x = 0; x <= size; x += step / 2) {
      if ((Math.round(x / (step / 2)) + Math.round(y / (step / 2))) % 2 === 0) {
        aCtx.fillStyle = '#ffffff';
        aCtx.beginPath();
        aCtx.arc(x, y, 7.2, 0, Math.PI * 2);
        aCtx.fill();

        bCtx.fillStyle = '#ffffff';
        bCtx.beginPath();
        bCtx.arc(x, y, 7.2, 0, Math.PI * 2);
        bCtx.fill();

        ctx.fillStyle = '#20262b';
        ctx.beginPath();
        ctx.arc(x, y, 7.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6c777c';
        ctx.beginPath();
        ctx.arc(x - 1.4, y - 1.4, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const setupTex = (canvas: HTMLCanvasElement, colorSpace: THREE.ColorSpace) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = colorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = maxAnisotropy;
    return tex;
  };

  return {
    map: setupTex(colorCanvas, THREE.SRGBColorSpace),
    alphaMap: setupTex(alphaCanvas, THREE.NoColorSpace),
    bumpMap: setupTex(bumpCanvas, THREE.NoColorSpace),
  };
}

export function createParticleGlowTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    2,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.35, 'rgba(180, 255, 245, 0.65)');
  grad.addColorStop(1, 'rgba(38, 232, 212, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface PBRSurfaceTextures {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

/**
 * Generates weathered sunken-ship naval steel textures: oxidized blue-slate plates,
 * rust corrosion streaks, salt patina, riveted panel seams, normalMap, and roughnessMap.
 */
export function createRustedHullTextures(maxAnisotropy: number): PBRSurfaceTextures {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const normalData = nCtx.createImageData(size, size);
  const roughData = rCtx.createImageData(size, size);
  const heightField = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const u = x / size;
      const v = y / size;

      const baseNoise =
        periodicNoise(u, v, 8) * 0.45 +
        periodicNoise(u + 0.21, v + 0.43, 18) * 0.35 +
        periodicNoise(u, v, 40) * 0.2;
      const rustMask = Math.max(
        0,
        Math.min(
          1,
          (periodicNoise(u * 1.1, v * 0.55, 6) * 0.65 +
            periodicNoise(u, v * 0.4, 16) * 0.35 -
            0.44) *
            2.4,
        ),
      );

      // Panel grid seams + vertical corrosion drips
      const seamX = x % 128 < 4 || x % 128 > 125 ? 1 : 0;
      const seamY = y % 128 < 4 || y % 128 > 125 ? 1 : 0;
      const seam = Math.max(seamX, seamY);

      // Rivet bumps near panel borders
      const localX = x % 128;
      const localY = y % 128;
      const nearBorder =
        ((localX === 12 || localX === 116) && localY % 24 < 6) ||
        ((localY === 12 || localY === 116) && localX % 24 < 6);
      const rivet = nearBorder ? 0.25 : 0;

      const microScratch = hash2(x * 0.73, y * 1.41) * 0.08;
      const h = Math.max(
        0,
        Math.min(1, 0.52 + baseNoise * 0.25 - seam * 0.38 + rivet + rustMask * 0.14 + microScratch),
      );
      heightField[y * size + x] = h;

      // Blend weathered naval slate-steel (#385263) with warm oxidized rust (#9e5638)
      const steelR = 54 + baseNoise * 26;
      const steelG = 78 + baseNoise * 30;
      const steelB = 94 + baseNoise * 34;

      const rustR = 148 + baseNoise * 46;
      const rustG = 82 + baseNoise * 28;
      const rustB = 54 + baseNoise * 20;

      const r = steelR * (1 - rustMask) + rustR * rustMask - seam * 18 + rivet * 38;
      const g = steelG * (1 - rustMask) + rustG * rustMask - seam * 20 + rivet * 34;
      const b = steelB * (1 - rustMask) + rustB * rustMask - seam * 22 + rivet * 30;

      imgData.data[idx] = Math.max(12, Math.min(255, Math.round(r)));
      imgData.data[idx + 1] = Math.max(14, Math.min(255, Math.round(g)));
      imgData.data[idx + 2] = Math.max(16, Math.min(255, Math.round(b)));
      imgData.data[idx + 3] = 255;

      // Roughness: polished wet steel is ~0.36, flaky rust is ~0.92
      const roughVal = Math.max(
        0.3,
        Math.min(0.95, 0.44 + rustMask * 0.44 + seam * 0.2 - rivet * 0.16 + microScratch),
      );
      const roughByte = Math.round(roughVal * 255);
      roughData.data[idx] = roughByte;
      roughData.data[idx + 1] = roughByte;
      roughData.data[idx + 2] = roughByte;
      roughData.data[idx + 3] = 255;
    }
  }

  const strength = 3.6;
  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const dx = (heightField[y * size + xPrev] - heightField[y * size + xNext]) * strength;
      const dy = (heightField[yPrev * size + x] - heightField[yNext * size + x]) * strength;
      const dz = 1.0;
      const invLen = 1 / Math.hypot(dx, dy, dz);
      const idx = (y * size + x) * 4;
      normalData.data[idx] = Math.round((dx * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 1] = Math.round((dy * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 2] = Math.round((dz * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  nCtx.putImageData(normalData, 0, 0);
  rCtx.putImageData(roughData, 0, 0);

  const setup = (canvas: HTMLCanvasElement, cs: THREE.ColorSpace) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = cs;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    t.anisotropy = maxAnisotropy;
    return t;
  };

  return {
    map: setup(colorCanvas, THREE.SRGBColorSpace),
    normalMap: setup(normalCanvas, THREE.NoColorSpace),
    roughnessMap: setup(roughCanvas, THREE.NoColorSpace),
  };
}

/**
 * Generates waterlogged ship-crate timber textures with fibrous wood grain,
 * dark salt stains, plank gaps, normalMap, and roughnessMap.
 */
export function createWeatheredWoodTextures(maxAnisotropy: number): PBRSurfaceTextures {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const normalData = nCtx.createImageData(size, size);
  const roughData = rCtx.createImageData(size, size);
  const heightField = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const u = x / size;
      const v = y / size;

      const grain =
        periodicNoise(u * 0.25, v * 3.5, 12) * 0.55 +
        periodicNoise(u * 0.5, v * 7.0, 24) * 0.3 +
        hash2(x, y) * 0.15;
      const algae = Math.max(0, periodicNoise(u, v, 6) - 0.55) * 1.6;
      const plankGap = y % 64 < 3 ? 1 : 0;

      const h = Math.max(0, Math.min(1, grain * 0.85 - plankGap * 0.5));
      heightField[y * size + x] = h;

      const r = 92 + grain * 48 - plankGap * 32 - algae * 20;
      const g = 74 + grain * 38 - plankGap * 26 + algae * 18;
      const b = 56 + grain * 28 - plankGap * 20 + algae * 12;

      imgData.data[idx] = Math.max(10, Math.min(255, Math.round(r)));
      imgData.data[idx + 1] = Math.max(10, Math.min(255, Math.round(g)));
      imgData.data[idx + 2] = Math.max(10, Math.min(255, Math.round(b)));
      imgData.data[idx + 3] = 255;

      const roughByte = Math.round(Math.max(0.55, Math.min(0.95, 0.72 + (1 - grain) * 0.22)) * 255);
      roughData.data[idx] = roughByte;
      roughData.data[idx + 1] = roughByte;
      roughData.data[idx + 2] = roughByte;
      roughData.data[idx + 3] = 255;
    }
  }

  const strength = 2.8;
  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const dx = (heightField[y * size + xPrev] - heightField[y * size + xNext]) * strength;
      const dy = (heightField[yPrev * size + x] - heightField[yNext * size + x]) * strength;
      const dz = 1.0;
      const invLen = 1 / Math.hypot(dx, dy, dz);
      const idx = (y * size + x) * 4;
      normalData.data[idx] = Math.round((dx * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 1] = Math.round((dy * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 2] = Math.round((dz * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  nCtx.putImageData(normalData, 0, 0);
  rCtx.putImageData(roughData, 0, 0);

  const setup = (canvas: HTMLCanvasElement, cs: THREE.ColorSpace) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = cs;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAnisotropy;
    return t;
  };

  return {
    map: setup(colorCanvas, THREE.SRGBColorSpace),
    normalMap: setup(normalCanvas, THREE.NoColorSpace),
    roughnessMap: setup(roughCanvas, THREE.NoColorSpace),
  };
}

/**
 * Generates fluted clam-shell nacre textures for pearl pickups & seabed shells.
 */
export function createNacreTextures(maxAnisotropy: number): SandTextures {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const normalData = nCtx.createImageData(size, size);
  const heightField = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const u = x / size;
      const v = y / size;
      const ridge = 0.5 + 0.5 * Math.sin(u * Math.PI * 16);
      const ring = 0.5 + 0.5 * Math.sin(v * Math.PI * 10 + periodicNoise(u, v, 8) * 1.4);
      const h = ridge * 0.65 + ring * 0.25 + hash2(x, y) * 0.1;
      heightField[y * size + x] = h;

      imgData.data[idx] = Math.round(92 + h * 58);
      imgData.data[idx + 1] = Math.round(104 + h * 62);
      imgData.data[idx + 2] = Math.round(118 + h * 64);
      imgData.data[idx + 3] = 255;
    }
  }

  const strength = 2.4;
  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const dx = (heightField[y * size + xPrev] - heightField[y * size + xNext]) * strength;
      const dy = (heightField[yPrev * size + x] - heightField[yNext * size + x]) * strength;
      const dz = 1.0;
      const invLen = 1 / Math.hypot(dx, dy, dz);
      const idx = (y * size + x) * 4;
      normalData.data[idx] = Math.round((dx * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 1] = Math.round((dy * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 2] = Math.round((dz * invLen * 0.5 + 0.5) * 255);
      normalData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  nCtx.putImageData(normalData, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = maxAnisotropy;

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.anisotropy = maxAnisotropy;

  return { map, normalMap };
}

/**
 * Builds a procedural miniature underwater light dome for PMREMGenerator so metallic brass,
 * wet fish scales, glass octopus tissues, and pearls reflect rich aquatic cyan zeniths,
 * warm lantern accents, and deep abyssal ocean gradients instead of generic white studio cards.
 */
export function createUnderwaterEnvironmentScene(): THREE.Scene {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#041c2c');

  // Sun-filtered turquoise-cyan surface skylight disc overhead
  const skyPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#74ecff'), side: THREE.DoubleSide }),
  );
  skyPanel.position.set(0, 8, 0);
  skyPanel.rotation.x = Math.PI / 2;
  envScene.add(skyPanel);

  // Secondary caustic bounce ring
  const sideCyan = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#1d84a6'), side: THREE.DoubleSide }),
  );
  sideCyan.position.set(-9, 2, -4);
  sideCyan.lookAt(0, 0, 0);
  envScene.add(sideCyan);

  // Warm bioluminescent / galley lantern reflection accent
  const warmAccent = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 4),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffbe66'), side: THREE.DoubleSide }),
  );
  warmAccent.position.set(9, 0.5, 4);
  warmAccent.lookAt(0, 0, 0);
  envScene.add(warmAccent);

  // Dark abyssal seabed bounce
  const floorBounce = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#061a24'), side: THREE.DoubleSide }),
  );
  floorBounce.position.set(0, -8, 0);
  floorBounce.rotation.x = -Math.PI / 2;
  envScene.add(floorBounce);

  return envScene;
}

