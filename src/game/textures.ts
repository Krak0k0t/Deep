import * as THREE from 'three';

export interface SandTextures {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
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
 * Fine-grained deep-sea sand with gentle wave ripples and soft caustic mottling.
 */
export function createSandTextures(maxAnisotropy: number): SandTextures {
  const size = 512;
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

      const fbm =
        periodicNoise(u, v, 8) * 0.5 +
        periodicNoise(u, v, 16) * 0.3 +
        periodicNoise(u, v, 32) * 0.2;

      // Very gentle sandbar undulation instead of harsh stripes
      const ripple =
        Math.sin(u * Math.PI * 6 + fbm * 3.8) * 0.5 + 0.5;
      const fineGrain = hash2(x * 0.7, y * 0.7) * 0.14;
      const height = ripple * 0.38 + fbm * 0.52 + fineGrain;

      // Muted abyssal teal-sand palette
      imgData.data[idx] = Math.round(28 + height * 36);
      imgData.data[idx + 1] = Math.round(58 + height * 44);
      imgData.data[idx + 2] = Math.round(72 + height * 42);
      imgData.data[idx + 3] = 255;

      const bumpVal = Math.round(Math.min(255, Math.max(0, height * 255)));
      bumpData.data[idx] = bumpVal;
      bumpData.data[idx + 1] = bumpVal;
      bumpData.data[idx + 2] = bumpVal;
      bumpData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bCtx.putImageData(bumpData, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(10, 18);
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(10, 18);
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

/**
 * Natural organic limestone & coral micro-texture (subtle cellular relief, zero cartoon dots).
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
        periodicNoise(u, v, 12) * 0.55 +
        periodicNoise(u, v, 24) * 0.3 +
        periodicNoise(u, v, 48) * 0.15;
      const fine = hash2(x, y) * 0.12;
      const val = Math.min(1, Math.max(0, ridges * 0.88 + fine));

      const shade = Math.round(145 + val * 95);
      imgData.data[idx] = shade;
      imgData.data[idx + 1] = shade;
      imgData.data[idx + 2] = Math.min(255, shade + 10);
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
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

/**
 * Generates a realistic knotted rope trawler net texture.
 */
export function createTrawlerNetTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  const step = 42;
  ctx.lineCap = 'round';

  for (let i = -size; i <= size * 2; i += step) {
    ctx.strokeStyle = 'rgba(14, 24, 29, 0.92)';
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.moveTo(i, size);
    ctx.lineTo(i + size, 0);
    ctx.stroke();

    ctx.strokeStyle = '#736d54';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.moveTo(i, size);
    ctx.lineTo(i + size, 0);
    ctx.stroke();
  }

  for (let y = 0; y <= size; y += step / 2) {
    for (let x = 0; x <= size; x += step / 2) {
      if ((Math.round(x / (step / 2)) + Math.round(y / (step / 2))) % 2 === 0) {
        ctx.fillStyle = '#474334';
        ctx.beginPath();
        ctx.arc(x, y, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#918a6d';
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = maxAnisotropy;
  return texture;
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
