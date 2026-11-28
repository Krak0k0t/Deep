import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { unzipSync } from 'three/addons/libs/fflate.module.js';

export interface GLBModelConfig {
  fish: string | null;
  coral: string | null;
  rock: string | null;
}

/**
 * Paste your GitHub repository URL or Raw base URL here
 * (e.g. 'https://github.com/user/repo' or 'https://raw.githubusercontent.com/user/repo/main/').
 * Leave null to keep built-in procedural 3D models without 404 network errors.
 */
export const GITHUB_RAW_BASE_URL: string | null =
  'https://raw.githubusercontent.com/Krak0k0t/Deep/main/';

/**
 * Exact GLB / FBX-pack asset filenames stored in the user's GitHub repository.
 */
export const GITHUB_MODEL_CATALOG = {
  fish: null as string | null,
  tropicalFishPack: 'TropicalFish_FBX.zip',
  heroFishSpecies: '09',
  ambientFishSpecies: ['02', '04', '07', '10', '14'] as const,
  jellyfish: 'crystal_jellyfish_leptomedusae.glb',
  octopus: 'glass_octopus.glb',
  pufferfish: 'diodon_holocanthus_pufferfish.glb',
  squidPredator: 'lurker_-_rigged_and_animated.glb',
  fireflySquid: 'firefly-squid-glowing.glb',
  coral: 'coral_piece.glb',
  corals: ['coral_piece.glb'],
  rocks: [
    'sandy_rock.glb',
    'low_poly_rock.glb',
    'low_poly_rock_1.glb',
    'eroded_desert_rock.glb',
    'cyberpunk_rock.glb',
  ],
  stoneEntrance: 'stone_entrance.glb',
  turtle: 'loggerhead_turtle.glb',
  manta: 'manta_low_poly.glb',
} as const;

/**
 * Optional explicit per-asset URL overrides (Raw .glb links).
 * Leave null to resolve from GITHUB_RAW_BASE_URL or use built-in procedural 3D models.
 */
export const GLB_MODEL_URLS: GLBModelConfig = {
  fish: null,
  coral: null,
  rock: null,
};

export interface ResolvedAssetUrls {
  fish: string | null;
  tropicalFishPack: string | null;
  jellyfish: string | null;
  octopus: string | null;
  pufferfish: string | null;
  squidPredator: string | null;
  fireflySquid: string | null;
  coral: string | null;
  corals: string[];
  rocks: string[];
  stoneEntrance: string | null;
  turtle: string | null;
  manta: string | null;
}

/**
 * Converts a standard GitHub repo/tree URL into a raw.githubusercontent.com base URL
 * ending with a trailing slash. Already-raw or custom CDN URLs are preserved cleanly.
 */
export function normalizeGitHubRawBase(
  input: string,
  defaultBranch = 'main',
): string {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return '';

  const treeMatch = trimmed.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)(?:\/(.*))?$/i,
  );
  if (treeMatch) {
    const [, owner, repo, branch, subpath] = treeMatch;
    const suffix = subpath ? `${subpath.replace(/^\/+|\/+$/g, '')}/` : '';
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${suffix}`;
  }

  const repoMatch = trimmed.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/i,
  );
  if (repoMatch) {
    const [, owner, repo] = repoMatch;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/`;
  }

  return `${trimmed}/`;
}

const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();
const textureLoader = new THREE.TextureLoader();

const gltfCache = new Map<string, Promise<GLTF>>();
const zipCache = new Map<string, Promise<Record<string, Uint8Array>>>();
const fishSpeciesCache = new Map<string, Promise<THREE.Group>>();

export function loadCachedGLTF(url: string): Promise<GLTF> {
  const existing = gltfCache.get(url);
  if (existing) return existing;

  const promise = new Promise<GLTF>((resolve, reject) => {
    gltfLoader.load(url, resolve, undefined, reject);
  }).catch((err) => {
    gltfCache.delete(url);
    throw err;
  });

  gltfCache.set(url, promise);
  return promise;
}

export function loadCachedZip(url: string): Promise<Record<string, Uint8Array>> {
  const existing = zipCache.get(url);
  if (existing) return existing;

  const promise = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} loading ${url}`);
      }
      const buf = await res.arrayBuffer();
      return unzipSync(new Uint8Array(buf));
    })
    .catch((err) => {
      zipCache.delete(url);
      throw err;
    });

  zipCache.set(url, promise);
  return promise;
}

async function loadTextureFromBytes(
  bytes: Uint8Array,
  colorSpace: THREE.ColorSpace,
): Promise<THREE.Texture> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: 'image/jpeg' });
  const blobUrl = URL.createObjectURL(blob);
  try {
    const tex = await textureLoader.loadAsync(blobUrl);
    tex.colorSpace = colorSpace;
    tex.needsUpdate = true;
    return tex;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export interface LoadedFishModel {
  group: THREE.Group;
  swimHandle: FishSwimHandle;
}

/**
 * Extracts and builds a wet-PBR, nose-along-+Z normalized TropicalFishXX model
 * from the cached TropicalFish_FBX.zip archive with diffuse + normal maps.
 */
export async function loadTropicalFishFromZip(
  zipUrl: string,
  speciesId: string,
  targetSize: number,
  lowQuality = false,
): Promise<LoadedFishModel> {
  const cacheKey = `${zipUrl}#${speciesId}`;
  let basePromise = fishSpeciesCache.get(cacheKey);
  if (!basePromise) {
    basePromise = (async () => {
      const files = await loadCachedZip(zipUrl);
      const fbxPath = `TropicalFish_FBX/TropicalFish${speciesId}.fbx`;
      const diffusePath = `TropicalFish_FBX/TropicalFish${speciesId}.jpg`;
      const normalPath = `TropicalFish_FBX/NormalMaps/TropicalFish${speciesId}_NormalMap.jpg`;

      const fbxBytes = files[fbxPath];
      if (!fbxBytes) {
        throw new Error(`Missing ${fbxPath} in ${zipUrl}`);
      }

      const ab = fbxBytes.buffer.slice(
        fbxBytes.byteOffset,
        fbxBytes.byteOffset + fbxBytes.byteLength,
      ) as ArrayBuffer;
      const parsed = fbxLoader.parse(ab, '');

      const [diffuseMap, normalMap] = await Promise.all([
        files[diffusePath]
          ? loadTextureFromBytes(files[diffusePath], THREE.SRGBColorSpace)
          : Promise.resolve(null),
        files[normalPath]
          ? loadTextureFromBytes(files[normalPath], THREE.NoColorSpace)
          : Promise.resolve(null),
      ]);

      // Normalize scale & center, then bake transforms into geometry so +Z is ALWAYS nose -> -Z tail
      const normalized = prepareNormalizedModel(parsed, {
        targetSize: 1.0,
        alignBottomToZero: false,
      });
      normalized.updateMatrixWorld(true);

      const cleanGroup = new THREE.Group();
      normalized.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const srcMesh = obj as THREE.Mesh;
          const bakedGeo = srcMesh.geometry.clone();
          bakedGeo.applyMatrix4(srcMesh.matrixWorld);
          bakedGeo.computeBoundingBox();

          const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: diffuseMap,
            normalMap,
            side: THREE.DoubleSide,
          });

          const bakedMesh = new THREE.Mesh(bakedGeo, mat);
          bakedMesh.castShadow = true;
          bakedMesh.receiveShadow = true;
          cleanGroup.add(bakedMesh);
        }
      });
      return cleanGroup;
    })().catch((err) => {
      fishSpeciesCache.delete(cacheKey);
      throw err;
    });
    fishSpeciesCache.set(cacheKey, basePromise);
  }

  const template = await basePromise;
  const instance = template.clone();
  instance.scale.setScalar(targetSize);

  const swimHandle = tuneFishMaterial(instance, 'z', lowQuality);
  return { group: instance, swimHandle };
}

export function enableShadowsRecursive(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
}

export function tuneCoralMaterial(
  material: THREE.Material | THREE.Material[],
  coralTextures?: { map?: THREE.Texture; bumpMap?: THREE.Texture },
): void {
  const list = Array.isArray(material) ? material : [material];
  for (const mat of list) {
    if (mat instanceof THREE.MeshStandardMaterial) {
      mat.roughness = 0.85;
      mat.metalness = 0.0;
      mat.roughnessMap = null;
      mat.envMapIntensity = 0.08;
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0;
      if (coralTextures?.bumpMap) {
        mat.bumpMap = coralTextures.bumpMap;
        mat.bumpScale = 0.68;
      }
      if (!mat.map && coralTextures?.map) {
        mat.map = coralTextures.map;
      }
      // Muted deep-sea coral plum/stone rather than bright pink plastic
      mat.color.multiply(new THREE.Color('#5d3c4e'));
      mat.needsUpdate = true;
    }
  }
}

export interface FishSwimHandle {
  updateSwim: (phase: number, amplitude01: number) => void;
  updateCallGlow: (boost01: number) => void;
}

/**
 * Upgrades fish materials to wet-scale MeshPhysicalMaterial (roughness 0.2, metalness 0.1, normalMap)
 * and injects vertex-level tail undulation along the fish body axis ('z' for TropicalFish FBX, 'x' for GLB).
 */
export function tuneFishMaterial(
  root: THREE.Object3D,
  forwardAxis: 'x' | 'z' = 'z',
  lowQuality = false,
): FishSwimHandle {
  const swimUniforms: Array<{
    uSwimPhase: { value: number };
    uSwimAmp: { value: number };
    baseAmp: number;
  }> = [];
  const fishMaterials: THREE.MeshStandardMaterial[] = [];

  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.geometry.computeBoundingBox();
      const bbox = mesh.geometry.boundingBox;
      const minA = bbox ? (forwardAxis === 'z' ? bbox.min.z : bbox.min.x) : -1;
      const maxA = bbox ? (forwardAxis === 'z' ? bbox.max.z : bbox.max.x) : 1;
      const spanA = Math.max(0.001, maxA - minA);

      const rawMats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      const upgraded = rawMats.map((rawMat) => {
        const src = rawMat as THREE.MeshStandardMaterial & THREE.MeshBasicMaterial;
        const pbr = lowQuality
          ? new THREE.MeshStandardMaterial({
              color: src.color ? src.color.clone() : new THREE.Color(0xffffff),
              map: src.map ?? null,
              normalMap: (src as THREE.MeshStandardMaterial).normalMap ?? null,
              side: src.side ?? THREE.DoubleSide,
              roughness: 0.28,
              metalness: 0.1,
              emissive: new THREE.Color('#136972'),
              emissiveIntensity: 0.24,
            })
          : new THREE.MeshPhysicalMaterial({
              color: src.color ? src.color.clone() : new THREE.Color(0xffffff),
              map: src.map ?? null,
              normalMap: (src as THREE.MeshStandardMaterial).normalMap ?? null,
              roughnessMap: (src as THREE.MeshStandardMaterial).roughnessMap ?? null,
              metalnessMap: (src as THREE.MeshStandardMaterial).metalnessMap ?? null,
              aoMap: (src as THREE.MeshStandardMaterial).aoMap ?? null,
              side: src.side ?? THREE.DoubleSide,
              roughness: 0.2,
              metalness: 0.1,
              clearcoat: 0.55,
              clearcoatRoughness: 0.18,
              iridescence: 0.28,
              iridescenceIOR: 1.33,
              emissive: new THREE.Color('#136972'),
              emissiveIntensity: 0.22,
            });

        // Blend tropical albedo cleanly into cold deep-sea lighting while staying legible
        pbr.color.multiply(new THREE.Color('#a6c2cf'));
        if (pbr.normalMap) {
          pbr.normalScale.set(1.25, 1.25);
        }
        if (src.transparent) {
          pbr.alphaTest = 0.25;
          pbr.transparent = false;
          pbr.depthWrite = true;
        }

        const baseAmp = spanA * 0.06;
        const uniforms = {
          uSwimPhase: { value: 0 },
          uSwimAmp: { value: baseAmp },
          uMinAxis: { value: minA },
          uMaxAxis: { value: maxA },
          uSpanAxis: { value: spanA },
        };
        swimUniforms.push({ ...uniforms, baseAmp });

        pbr.onBeforeCompile = (shader) => {
          shader.uniforms.uSwimPhase = uniforms.uSwimPhase;
          shader.uniforms.uSwimAmp = uniforms.uSwimAmp;
          shader.uniforms.uMinAxis = uniforms.uMinAxis;
          shader.uniforms.uMaxAxis = uniforms.uMaxAxis;
          shader.uniforms.uSpanAxis = uniforms.uSpanAxis;

          const tailExpr =
            forwardAxis === 'z'
              ? `float tailRatio = clamp((uMaxAxis - position.z) / uSpanAxis, 0.0, 1.0);
              float wave = sin(uSwimPhase - tailRatio * 3.8) * (tailRatio * tailRatio) * uSwimAmp;
              transformed.x += wave;`
              : `float tailRatio = clamp((position.x - uMinAxis) / uSpanAxis, 0.0, 1.0);
              float wave = sin(uSwimPhase - tailRatio * 3.5) * (tailRatio * tailRatio) * uSwimAmp;
              transformed.z += wave;`;

          shader.vertexShader = shader.vertexShader
            .replace(
              '#include <common>',
              `#include <common>
              uniform float uSwimPhase;
              uniform float uSwimAmp;
              uniform float uMinAxis;
              uniform float uMaxAxis;
              uniform float uSpanAxis;`,
            )
            .replace(
              '#include <begin_vertex>',
              `#include <begin_vertex>
              ${tailExpr}`,
            );
        };
        pbr.customProgramCacheKey = () =>
          `fish-swim-${forwardAxis}-${minA.toFixed(2)}-${spanA.toFixed(2)}`;
        pbr.needsUpdate = true;
        fishMaterials.push(pbr);
        return pbr;
      });

      mesh.material = Array.isArray(mesh.material) ? upgraded : upgraded[0];
    }
  });

  return {
    updateSwim(phase: number, amplitude01: number) {
      const ampMult = 0.65 + 0.75 * Math.min(1.5, Math.max(0, amplitude01));
      for (const u of swimUniforms) {
        u.uSwimPhase.value = phase;
        u.uSwimAmp.value = u.baseAmp * ampMult;
      }
    },
    updateCallGlow(boost01: number) {
      const clamped = Math.max(0, Math.min(1.5, boost01));
      for (const m of fishMaterials) {
        m.emissiveIntensity = 0.22 + clamped * 0.95;
      }
    },
  };
}

/**
 * Upgrades crystal_jellyfish_leptomedusae.glb into soft gelatinous translucent tissue
 * (opacity 0.4 + GPU transmission, removing harsh wireframe grid lines).
 */
export function tuneJellyfishMaterial(
  root: THREE.Object3D,
  isSoftwareGl = false,
  lowQuality = false,
): void {
  const skipTransmission = isSoftwareGl || lowQuality;
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      const rawMats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      const upgraded = rawMats.map((rawMat) => {
        const src = rawMat as THREE.MeshStandardMaterial & THREE.MeshBasicMaterial;
        const isTentacle = (src.name || '').toLowerCase().includes('tentacle');

        const mat = lowQuality
          ? new THREE.MeshStandardMaterial({
              color: isTentacle
                ? new THREE.Color('#9e85eb')
                : new THREE.Color('#957ae8'),
              map: isTentacle ? src.map ?? null : null,
              emissive: isTentacle
                ? new THREE.Color('#6a4ac7')
                : new THREE.Color('#7f5de0'),
              emissiveIntensity: isTentacle ? 0.36 : 0.48,
              roughness: 0.22,
              metalness: 0.0,
              transparent: true,
              opacity: isTentacle ? 0.34 : 0.42,
              depthWrite: false,
              side: THREE.DoubleSide,
            })
          : new THREE.MeshPhysicalMaterial({
              color: isTentacle
                ? new THREE.Color('#9e85eb')
                : new THREE.Color('#957ae8'),
              // Drop the wireframe/grid baseColor map on the bell so it reads as smooth gelatinous tissue
              map: isTentacle ? src.map ?? null : null,
              emissive: isTentacle
                ? new THREE.Color('#6a4ac7')
                : new THREE.Color('#7f5de0'),
              emissiveIntensity: isTentacle ? 0.36 : 0.48,
              roughness: 0.14,
              metalness: 0.0,
              clearcoat: 0.85,
              clearcoatRoughness: 0.1,
              transparent: true,
              opacity: isTentacle ? 0.34 : 0.4,
              depthWrite: false,
              transmission: skipTransmission || isTentacle ? 0 : 0.78,
              ior: 1.38,
              thickness: 1.4,
              attenuationColor: new THREE.Color('#b694ff'),
              attenuationDistance: 2.5,
              side: THREE.DoubleSide,
            });

        mat.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
            float rimFresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.5);
            totalEmissiveRadiance *= (0.18 + 0.95 * rimFresnel);`,
          );
        };
        mat.customProgramCacheKey = () =>
          `crystal-jelly-gelatin-${isTentacle ? 't' : 'b'}-${skipTransmission ? 'sw' : 'hw'}-${lowQuality ? 'lo' : 'hi'}`;
        mat.needsUpdate = true;
        return mat;
      });

      mesh.material = Array.isArray(mesh.material) ? upgraded : upgraded[0];
    }
  });
}

/**
 * Removes giant outer studio skybox/backdrop spheres bundled in some Sketchfab GLBs
 * (e.g. material_4 [-20530..+20530] in glass_octopus.glb) before bounding-box normalization.
 */
export function stripGiantBackdropMeshes(
  root: THREE.Object3D,
  maxExtentThreshold = 5000,
): void {
  const toRemove: THREE.Object3D[] = [];
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.geometry.computeBoundingBox();
      const bbox = mesh.geometry.boundingBox;
      if (bbox) {
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const isBackdropMat = mats.some(
          (m) => (m as THREE.MeshStandardMaterial).name === 'material_4',
        );
        if (maxDim > maxExtentThreshold || isBackdropMat) {
          toRemove.push(mesh);
        }
      }
    }
  });
  for (const m of toRemove) {
    m.parent?.remove(m);
  }
}

/**
 * Tunes glass_octopus.glb materials for translucent deep-sea bioluminescent glass tissues
 * while keeping dark eyes crisp and avoiding harsh shadows on transparent layers.
 */
export function tuneGlassOctopusMaterial(
  root: THREE.Object3D,
  isSoftwareGl = false,
  lowQuality = false,
): void {
  const skipTransmission = isSoftwareGl || lowQuality;
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      const rawMats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      let hasTransparent = false;
      const tuned = rawMats.map((rawMat) => {
        const src = rawMat as THREE.MeshStandardMaterial & THREE.MeshPhysicalMaterial;
        const isGlass =
          src.transparent === true ||
          (src.opacity !== undefined && src.opacity < 0.99);

        if (isGlass) {
          hasTransparent = true;
          const pbr = lowQuality
            ? new THREE.MeshStandardMaterial({
                color: src.color ? src.color.clone().lerp(new THREE.Color('#9ee8ff'), 0.45) : new THREE.Color('#9ee8ff'),
                map: src.map ?? null,
                normalMap: src.normalMap ?? null,
                roughness: 0.22,
                metalness: 0.02,
                transparent: true,
                opacity: Math.max(0.28, Math.min(0.62, src.opacity ?? 0.42)),
                depthWrite: false,
                emissive: new THREE.Color('#329ec2'),
                emissiveIntensity: 0.42,
                side: THREE.DoubleSide,
              })
            : new THREE.MeshPhysicalMaterial({
                color: src.color ? src.color.clone().lerp(new THREE.Color('#9ee8ff'), 0.45) : new THREE.Color('#9ee8ff'),
                map: src.map ?? null,
                normalMap: src.normalMap ?? null,
                roughness: 0.14,
                metalness: 0.02,
                clearcoat: 0.88,
                clearcoatRoughness: 0.1,
                transparent: true,
                opacity: Math.max(0.28, Math.min(0.62, src.opacity ?? 0.42)),
                depthWrite: false,
                transmission: skipTransmission ? 0 : 0.45,
                ior: 1.38,
                emissive: new THREE.Color('#329ec2'),
                emissiveIntensity: 0.42,
                side: THREE.DoubleSide,
              });
          pbr.needsUpdate = true;
          return pbr;
        }

        // Preserve opaque eyes / inner organs cleanly
        if (src.isMeshStandardMaterial || src.isMeshPhysicalMaterial) {
          src.roughness = Math.min(0.45, src.roughness ?? 0.3);
          if (!src.emissive || src.emissive.getHex() === 0) {
            src.emissive = new THREE.Color('#1f262e');
          }
          src.emissiveIntensity = Math.max(0.22, src.emissiveIntensity ?? 0.25);
          src.needsUpdate = true;
        }
        return rawMat;
      });

      mesh.castShadow = !hasTransparent && !lowQuality;
      mesh.receiveShadow = !lowQuality;
      mesh.material = Array.isArray(mesh.material) ? tuned : tuned[0];
    }
  });
}

export interface TunedSquidPredatorMaterials {
  eyeMaterials: THREE.MeshStandardMaterial[];
  bodyMaterials: THREE.MeshStandardMaterial[];
}

/**
 * Tunes lurker_-_rigged_and_animated.glb into a wet deep-sea predator with
 * controllable glowing eyes for telegraph/dash alerts.
 */
export function tuneSquidPredatorMaterial(
  root: THREE.Object3D,
): TunedSquidPredatorMaterials {
  const eyeMaterials: THREE.MeshStandardMaterial[] = [];
  const bodyMaterials: THREE.MeshStandardMaterial[] = [];

  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const isEye = (mesh.name || '').toLowerCase().includes('eye');

      const rawMats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      for (const rawMat of rawMats) {
        if (rawMat instanceof THREE.MeshStandardMaterial) {
          const matIsEye = isEye || (rawMat.name || '').toLowerCase().includes('eye');
          rawMat.roughness = matIsEye ? 0.16 : 0.34;
          rawMat.metalness = matIsEye ? 0.05 : 0.14;
          rawMat.envMapIntensity = 0.28;
          rawMat.side = THREE.DoubleSide;
          if (matIsEye) {
            rawMat.emissive = new THREE.Color('#ff4f28');
            rawMat.emissiveIntensity = 1.25;
            eyeMaterials.push(rawMat);
          } else {
            if (!rawMat.emissive || rawMat.emissive.getHex() === 0) {
              rawMat.emissive = new THREE.Color('#210a10');
            }
            rawMat.emissiveIntensity = Math.max(0.28, rawMat.emissiveIntensity ?? 0.28);
            bodyMaterials.push(rawMat);
          }
          rawMat.needsUpdate = true;
        }
      }
    }
  });

  return { eyeMaterials, bodyMaterials };
}

/**
 * Tunes firefly-squid-glowing.glb for bioluminescent cyan-violet underwater glow.
 */
export function tuneFireflySquidMaterial(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = true;

      const rawMats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      for (const rawMat of rawMats) {
        if (rawMat instanceof THREE.MeshStandardMaterial) {
          rawMat.roughness = 0.25;
          rawMat.metalness = 0.08;
          rawMat.side = THREE.DoubleSide;
          // Preserve glowing emissiveMap spots while ensuring silhouette reads softly in dark water
          if (!rawMat.emissive || rawMat.emissive.getHex() === 0) {
            rawMat.emissive = new THREE.Color('#26b4e8');
          }
          rawMat.emissiveIntensity = Math.max(1.35, rawMat.emissiveIntensity ?? 1.35);
          if (rawMat.color.getHex() === 0) {
            rawMat.color.set('#3d6d8c');
          }
          rawMat.needsUpdate = true;
        }
      }
    }
  });
}

/**
 * Tunes diodon_holocanthus_pufferfish.glb for wet marine skin sheen, sharp glossy eyes,
 * and subtle deep-twilight silhouette readability while preserving original spotted textures.
 */
export function tunePufferfishMaterial(
  root: THREE.Object3D,
  lowQuality = false,
): void {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = !lowQuality;
      mesh.receiveShadow = !lowQuality;

      const meshName = (mesh.name || '').toLowerCase();
      const isEye = meshName.includes('eye');
      const isSpine = meshName.includes('spine');

      const rawMats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      const upgraded = rawMats.map((rawMat) => {
        if (!(rawMat instanceof THREE.MeshStandardMaterial)) return rawMat;
        const pbr = lowQuality
          ? new THREE.MeshStandardMaterial({
              color: rawMat.color ? rawMat.color.clone() : new THREE.Color(0xffffff),
              map: rawMat.map ?? null,
              normalMap: rawMat.normalMap ?? null,
              side: rawMat.side ?? THREE.FrontSide,
              roughness: isEye
                ? 0.16
                : isSpine
                  ? 0.5
                  : Math.min(0.66, Math.max(0.32, rawMat.roughness ?? 0.48)),
              metalness: isEye ? 0.05 : Math.min(0.12, rawMat.metalness ?? 0.04),
              envMapIntensity: 0.0,
              emissive: isEye ? new THREE.Color('#2a1c0a') : new THREE.Color('#1a140a'),
              emissiveIntensity: isEye ? 0.22 : 0.18,
            })
          : new THREE.MeshPhysicalMaterial({
              color: rawMat.color ? rawMat.color.clone() : new THREE.Color(0xffffff),
              map: rawMat.map ?? null,
              normalMap: rawMat.normalMap ?? null,
              roughnessMap: rawMat.roughnessMap ?? null,
              metalnessMap: rawMat.metalnessMap ?? null,
              aoMap: rawMat.aoMap ?? null,
              side: rawMat.side ?? THREE.FrontSide,
              roughness: isEye
                ? 0.08
                : isSpine
                  ? 0.45
                  : Math.min(0.62, Math.max(0.28, rawMat.roughness ?? 0.45)),
              metalness: isEye ? 0.05 : Math.min(0.12, rawMat.metalness ?? 0.04),
              clearcoat: isEye ? 1.0 : isSpine ? 0.2 : 0.48,
              clearcoatRoughness: isEye ? 0.06 : 0.26,
              envMapIntensity: isEye ? 0.85 : 0.42,
              emissive: isEye ? new THREE.Color('#2a1c0a') : new THREE.Color('#1a140a'),
              emissiveIntensity: isEye ? 0.22 : 0.18,
            });
        pbr.needsUpdate = true;
        return pbr;
      });

      mesh.material = Array.isArray(mesh.material) ? upgraded : upgraded[0];
    }
  });
}

export interface NormalizeOptions {
  targetSize: number;
  alignBottomToZero?: boolean;
  yawOffsetRad?: number;
}

/**
 * Centers, uniformly scales, and aligns any imported GLB/FBX into a clean pivot Group.
 */
export function prepareNormalizedModel(
  source: THREE.Object3D,
  options: NormalizeOptions,
): THREE.Group {
  enableShadowsRecursive(source);

  const pivot = new THREE.Group();
  const wrapper = new THREE.Group();
  wrapper.add(source);

  wrapper.updateMatrixWorld(true);
  let hasSkinnedMesh = false;
  wrapper.traverse((obj) => {
    if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
      hasSkinnedMesh = true;
      const sm = obj as THREE.SkinnedMesh;
      sm.skeleton?.update();
      sm.computeBoundingBox();
    }
  });

  const box = new THREE.Box3().setFromObject(wrapper, hasSkinnedMesh);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
  const scale = options.targetSize / maxDim;
  wrapper.scale.setScalar(scale);

  wrapper.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(wrapper, hasSkinnedMesh);
  const scaledCenter = new THREE.Vector3();
  scaledBox.getCenter(scaledCenter);

  wrapper.position.x -= scaledCenter.x;
  wrapper.position.z -= scaledCenter.z;
  if (options.alignBottomToZero) {
    wrapper.position.y -= scaledBox.min.y;
  } else {
    wrapper.position.y -= scaledCenter.y;
  }

  if (options.yawOffsetRad) {
    pivot.rotation.y = options.yawOffsetRad;
  }
  pivot.add(wrapper);
  pivot.updateMatrixWorld(true);
  return pivot;
}

export interface ExtractedMeshPart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
}

/**
 * Extracts normalized sub-mesh geometries (with world transforms baked) so multi-part GLBs
 * can be rendered as high-performance THREE.InstancedMesh instances.
 */
export function extractInstancedMeshParts(
  normalizedGroup: THREE.Group,
): ExtractedMeshPart[] {
  normalizedGroup.updateMatrixWorld(true);
  const parts: ExtractedMeshPart[] = [];

  normalizedGroup.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      const geo = mesh.geometry.clone();
      geo.applyMatrix4(mesh.matrixWorld);
      parts.push({
        geometry: geo,
        material: mesh.material,
      });
    }
  });

  return parts;
}

export function resolveConfiguredModelUrls(): GLBModelConfig {
  const resolved = resolveAssetUrls();
  return {
    fish: resolved.fish,
    coral: resolved.coral,
    rock: resolved.rocks[0] ?? null,
  };
}

export function resolveAssetUrls(searchStr?: string): ResolvedAssetUrls {
  const params =
    searchStr !== undefined
      ? new URLSearchParams(searchStr)
      : typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

  const rawBaseInput = params.get('githubBase') || GITHUB_RAW_BASE_URL;
  const base = rawBaseInput ? normalizeGitHubRawBase(rawBaseInput) : null;
  const fromBase = (filename: string) => (base ? `${base}${filename}` : null);

  const explicitFish = params.get('fishUrl') || GLB_MODEL_URLS.fish;
  const explicitCoral = params.get('coralUrl') || GLB_MODEL_URLS.coral;
  const explicitRock = params.get('rockUrl') || GLB_MODEL_URLS.rock;

  const corals: string[] = [];
  if (explicitCoral) {
    corals.push(explicitCoral);
  } else if (base) {
    for (const filename of GITHUB_MODEL_CATALOG.corals) {
      corals.push(`${base}${filename}`);
    }
  }

  const rocks: string[] = [];
  if (explicitRock) {
    rocks.push(explicitRock);
  } else if (base) {
    rocks.push(
      `${base}${GITHUB_MODEL_CATALOG.rocks[1]}`,
      `${base}${GITHUB_MODEL_CATALOG.rocks[2]}`,
    );
  }

  return {
    fish: explicitFish || null,
    tropicalFishPack:
      params.get('fishPackUrl') || fromBase(GITHUB_MODEL_CATALOG.tropicalFishPack),
    jellyfish:
      params.get('jellyfishUrl') || fromBase(GITHUB_MODEL_CATALOG.jellyfish),
    octopus:
      params.get('octopusUrl') || fromBase(GITHUB_MODEL_CATALOG.octopus),
    pufferfish:
      params.get('pufferfishUrl') || fromBase(GITHUB_MODEL_CATALOG.pufferfish),
    squidPredator:
      params.get('squidPredatorUrl') || fromBase(GITHUB_MODEL_CATALOG.squidPredator),
    fireflySquid:
      params.get('fireflySquidUrl') || fromBase(GITHUB_MODEL_CATALOG.fireflySquid),
    coral: corals[0] ?? null,
    corals,
    rocks,
    stoneEntrance:
      params.get('entranceUrl') || fromBase(GITHUB_MODEL_CATALOG.stoneEntrance),
    turtle: params.get('turtleUrl') || fromBase(GITHUB_MODEL_CATALOG.turtle),
    manta: params.get('mantaUrl') || fromBase(GITHUB_MODEL_CATALOG.manta),
  };
}
