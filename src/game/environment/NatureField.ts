import * as THREE from 'three';
import { ChapterId } from '../campaign';
import { fbm2D, getChapterFloorHeight } from '../physics';

/**
 * Generates an eroded, vertex-colored seabed boulder geometry with natural mineral strata.
 */
export function createSculptedBoulderGeometry(
  radius = 1.15,
  detail = 2,
): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cBottom = new THREE.Color('#1c333d');
  const cMid = new THREE.Color('#2d5461');
  const cTopMoss = new THREE.Color('#2d6b62');
  const tmpColor = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ridge = fbm2D(x * 1.45 + y * 0.9, z * 1.45 - y * 0.7);
    const scale = 1.0 + ridge * 0.24;
    const ny = y * 0.72; // natural settled boulder squatness
    pos.setXYZ(i, x * scale, ny * scale, z * scale);

    const h01 = THREE.MathUtils.clamp((ny / radius + 1) * 0.5, 0, 1);
    if (h01 < 0.5) {
      tmpColor.lerpColors(cBottom, cMid, h01 * 2);
    } else {
      tmpColor.lerpColors(cMid, cTopMoss, (h01 - 0.5) * 2);
    }
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

export interface NatureFieldBuildResult {
  group: THREE.Group;
  disposables: Array<{ dispose: () => void }>;
}

/**
 * Builds instanced mossy cushions, glowing-tip kelp/seagrass tufts, and sculpted reef arches
 * scaled cleanly by the active graphics quality preset.
 */
export function buildNatureField(options: {
  chapterId: ChapterId;
  densityScale: number;
  isSoftwareGl: boolean;
  seagrassTimeUniform: { value: number };
  coralMap?: THREE.Texture;
  coralBumpMap?: THREE.Texture;
  shadowsEnabled?: boolean;
  envMapIntensity?: number;
}): NatureFieldBuildResult {
  const {
    chapterId,
    densityScale,
    isSoftwareGl,
    seagrassTimeUniform,
    coralMap,
    coralBumpMap,
    shadowsEnabled = true,
    envMapIntensity = 0.16,
  } = options;
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  const effectiveDensity = isSoftwareGl ? Math.min(0.45, densityScale) : densityScale;
  const isLowTier = effectiveDensity <= 0.4;

  // 1. Soft seabed moss pads with 2-tier geometric LOD (near sculptural sheen vs far low-poly silhouettes)
  const mossCount = Math.max(4, Math.round(52 * effectiveDensity));
  const nearMossList: number[] = [];
  const farMossList: number[] = [];
  for (let i = 0; i < mossCount; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const rx = side * (3.5 + ((i * 29.3) % 100) / 100 * 12.2);
    if (!isLowTier && Math.abs(rx) > 9.5) {
      farMossList.push(i);
    } else {
      nearMossList.push(i);
    }
  }

  const mossPalette =
    chapterId === 10
      ? ['#266e5e', '#32826c', '#205b5c', '#3c8f73']
      : chapterId === 9 || chapterId === 2
        ? ['#163638', '#1d4240', '#1c3b47', '#234a45']
        : chapterId === 8 || chapterId === 3
          ? ['#0e382f', '#13473c', '#185445', '#103b36']
          : chapterId === 6
            ? ['#092238', '#0d3247', '#0f3d4d', '#0b293b']
            : chapterId === 5
              ? ['#29181c', '#362022', '#261e26', '#3d241f']
              : chapterId === 4 || chapterId === 7
                ? ['#14283d', '#1c3752', '#173047', '#213f5c']
                : ['#1f574b', '#276656', '#1c4a4a', '#2f6e5c'];

  const buildMossBatch = (indices: number[], useHighDetail: boolean) => {
    if (indices.length === 0) return;
    const geo = new THREE.SphereGeometry(
      0.65,
      useHighDetail ? 10 : 5,
      useHighDetail ? 6 : 3,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.55,
    );
    geo.scale(1.25, 0.36, 1.15);
    const mat = useHighDetail
      ? new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.9,
          metalness: 0.0,
          sheen: 0.45,
          sheenColor: new THREE.Color('#47c4a6'),
          envMapIntensity,
        })
      : new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.92,
          metalness: 0.0,
          envMapIntensity: envMapIntensity * 0.5,
        });
    const inst = new THREE.InstancedMesh(geo, mat, indices.length);
    inst.receiveShadow = shadowsEnabled && useHighDetail;
    indices.forEach((origIdx, k) => {
      const side = origIdx % 2 === 0 ? 1 : -1;
      const rx = side * (3.5 + ((origIdx * 29.3) % 100) / 100 * 12.2);
      const rz = 10 - ((origIdx * 19.7) % 98);
      const ry = getChapterFloorHeight(chapterId, rx, rz) - 0.08;
      dummy.position.set(rx, ry, rz);
      dummy.rotation.set(0, ((origIdx * 59) % 360) * (Math.PI / 180), 0);
      const s = 0.75 + ((origIdx * 17) % 100) / 100 * 1.3;
      dummy.scale.set(s, s * (0.7 + (origIdx % 3) * 0.2), s);
      dummy.updateMatrix();
      inst.setMatrixAt(k, dummy.matrix);
      color.set(mossPalette[origIdx % mossPalette.length]);
      inst.setColorAt(k, color);
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.frustumCulled = true;
    inst.matrixAutoUpdate = false;
    inst.updateMatrix();
    inst.computeBoundingSphere();
    group.add(inst);
    disposables.push(geo, mat);
  };
  buildMossBatch(nearMossList, !isLowTier);
  buildMossBatch(farMossList, false);

  // 2. Curved kelp ribbons with 2-tier geometric LOD, subtle bioluminescent tips & current sway
  const isKelpBiome = chapterId === 3 || chapterId === 8;
  const kelpCount = Math.max(
    5,
    Math.round((isKelpBiome ? 92 : chapterId === 4 || chapterId === 5 || chapterId === 6 ? 48 : 76) * effectiveDensity),
  );
  const baseCol = new THREE.Color(
    chapterId === 5
      ? '#261414'
      : chapterId === 6
        ? '#0a2236'
        : chapterId === 4 || chapterId === 7
          ? '#13243b'
          : isKelpBiome
            ? '#0e3d32'
            : chapterId === 2 || chapterId === 9
              ? '#12383b'
              : '#164d47',
  );
  const tipCol = new THREE.Color(
    chapterId === 5
      ? '#ff8547'
      : chapterId === 6
        ? '#26e8d4'
        : chapterId === 10
          ? '#7bf5e2'
          : chapterId === 4 || chapterId === 7
            ? '#5eb4ff'
            : isKelpBiome
              ? '#46f2bc'
              : chapterId === 2 || chapterId === 9
                ? '#34d1bf'
                : '#4af2d8',
  );
  const kTmp = new THREE.Color();

  const makeKelpGeo = (segs: number) => {
    const geo = new THREE.PlaneGeometry(0.26, 2.2, 1, segs);
    geo.translate(0, 1.05, 0);
    const kPos = geo.attributes.position;
    const kColors = new Float32Array(kPos.count * 3);
    for (let i = 0; i < kPos.count; i++) {
      const y = kPos.getY(i);
      const h01 = THREE.MathUtils.clamp(y / 2.2, 0, 1);
      const taper = 1 - h01 * 0.78;
      kPos.setX(i, kPos.getX(i) * taper);
      kPos.setZ(i, Math.sin(h01 * Math.PI) * 0.28);

      kTmp.lerpColors(baseCol, tipCol, Math.pow(h01, 1.9));
      kColors[i * 3] = kTmp.r;
      kColors[i * 3 + 1] = kTmp.g;
      kColors[i * 3 + 2] = kTmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(kColors, 3));
    geo.computeVertexNormals();
    return geo;
  };

  const kelpMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.65,
    metalness: 0.0,
    envMapIntensity,
    emissive: new THREE.Color(
      chapterId === 5
        ? '#8f3818'
        : chapterId === 6
          ? '#158f85'
          : chapterId === 4 || chapterId === 7
            ? '#28568f'
            : isKelpBiome
              ? '#157d62'
              : chapterId === 2 || chapterId === 9
                ? '#146b65'
                : '#1b857b',
    ),
    emissiveIntensity: chapterId === 4 || chapterId === 5 || chapterId === 6 ? 0.36 : isKelpBiome ? 0.34 : 0.26,
    side: THREE.DoubleSide,
  });
  kelpMat.onBeforeCompile = (shader) => {
    shader.uniforms.uSeagrassTime = seagrassTimeUniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uSeagrassTime;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float kh = clamp(position.y / 2.2, 0.0, 1.0);
        #ifdef USE_INSTANCING
          float kPhase = instanceMatrix[3][0] * 0.55 + instanceMatrix[3][2] * 0.45;
        #else
          float kPhase = 0.0;
        #endif
        transformed.x += sin(uSeagrassTime * 1.2 + kPhase + kh * 2.4) * kh * 0.28;`,
      );
  };
  kelpMat.customProgramCacheKey = () => `kelp-glow-sway-ch${chapterId}`;
  disposables.push(kelpMat);

  const nearKelpIdx: number[] = [];
  const farKelpIdx: number[] = [];
  for (let i = 0; i < kelpCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const rx = side * (4.8 + ((i * 23.1) % 100) / 100 * 11.2);
    if (!isLowTier && Math.abs(rx) > 10.5) {
      farKelpIdx.push(i);
    } else {
      nearKelpIdx.push(i);
    }
  }

  const spawnKelpBatch = (indices: number[], segs: number) => {
    if (indices.length === 0) return;
    const kGeo = makeKelpGeo(segs);
    const kInst = new THREE.InstancedMesh(kGeo, kelpMat, indices.length);
    indices.forEach((origIdx, k) => {
      const side = origIdx % 2 === 0 ? -1 : 1;
      const rx = side * (4.8 + ((origIdx * 23.1) % 100) / 100 * 11.2);
      const rz = 8 - ((origIdx * 15.7) % 94);
      const ry = getChapterFloorHeight(chapterId, rx, rz) - 0.1;
      dummy.position.set(rx, ry, rz);
      dummy.rotation.set(0, ((origIdx * 47) % 360) * (Math.PI / 180), 0);
      const s = 0.75 + ((origIdx * 31) % 100) / 100 * 1.15;
      dummy.scale.set(s, s * (0.85 + (origIdx % 4) * 0.24), s);
      dummy.updateMatrix();
      kInst.setMatrixAt(k, dummy.matrix);
    });
    kInst.instanceMatrix.needsUpdate = true;
    kInst.frustumCulled = true;
    kInst.matrixAutoUpdate = false;
    kInst.updateMatrix();
    kInst.computeBoundingSphere();
    group.add(kInst);
    disposables.push(kGeo);
  };
  spawnKelpBatch(nearKelpIdx, isLowTier ? 3 : 7);
  spawnKelpBatch(farKelpIdx, 3);

  // 2b. Chapter 3 & 8 Towering Giant Kelp Forest Canopy (7-14m undulating emerald stalks)
  if (isKelpBiome) {
    const giantCount = Math.max(10, Math.round(84 * effectiveDensity));
    const frondSegs = isLowTier ? 5 : 9;
    const basePlaneA = new THREE.PlaneGeometry(0.82, 10.2, 1, frondSegs);
    basePlaneA.translate(0, 5.05, 0);
    const basePlaneB = basePlaneA.clone();
    basePlaneB.rotateY(Math.PI * 0.46);

    // Merge two crossed kelp blades into one instanced geometry (single draw call)
    const posA = basePlaneA.attributes.position;
    const posB = basePlaneB.attributes.position;
    const idxA = basePlaneA.getIndex()!;
    const idxB = basePlaneB.getIndex()!;
    const vCountA = posA.count;
    const totalVerts = vCountA + posB.count;
    const mergedPos = new Float32Array(totalVerts * 3);
    const mergedUv = new Float32Array(totalVerts * 2);
    const gCols = new Float32Array(totalVerts * 3);
    const gBase = new THREE.Color('#0c3329');
    const gMid = new THREE.Color('#1d6e58');
    const gTip = new THREE.Color('#4cf2c0');
    const gTmp = new THREE.Color();

    const fillBlade = (posAttr: THREE.BufferAttribute, uvAttr: THREE.BufferAttribute, offset: number) => {
      for (let i = 0; i < posAttr.count; i++) {
        const y = posAttr.getY(i);
        const h01 = THREE.MathUtils.clamp(y / 10.2, 0, 1);
        const wave = 0.5 + 0.5 * Math.sin(h01 * Math.PI * 3.5);
        const x = posAttr.getX(i) * (1 - h01 * 0.42) * wave;
        const z = posAttr.getZ(i) * (1 - h01 * 0.42) * wave + Math.sin(h01 * Math.PI * 2.0) * 0.42;
        const vi = offset + i;
        mergedPos[vi * 3] = x;
        mergedPos[vi * 3 + 1] = y;
        mergedPos[vi * 3 + 2] = z;
        mergedUv[vi * 2] = uvAttr.getX(i);
        mergedUv[vi * 2 + 1] = uvAttr.getY(i);

        if (h01 < 0.62) {
          gTmp.lerpColors(gBase, gMid, h01 / 0.62);
        } else {
          gTmp.lerpColors(gMid, gTip, (h01 - 0.62) / 0.38);
        }
        gCols[vi * 3] = gTmp.r;
        gCols[vi * 3 + 1] = gTmp.g;
        gCols[vi * 3 + 2] = gTmp.b;
      }
    };
    fillBlade(posA as THREE.BufferAttribute, basePlaneA.attributes.uv as THREE.BufferAttribute, 0);
    fillBlade(posB as THREE.BufferAttribute, basePlaneB.attributes.uv as THREE.BufferAttribute, vCountA);

    const mergedIdx = new Uint16Array(idxA.count + idxB.count);
    for (let i = 0; i < idxA.count; i++) mergedIdx[i] = idxA.getX(i);
    for (let i = 0; i < idxB.count; i++) mergedIdx[idxA.count + i] = idxB.getX(i) + vCountA;

    const giantGeo = new THREE.BufferGeometry();
    giantGeo.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
    giantGeo.setAttribute('uv', new THREE.BufferAttribute(mergedUv, 2));
    giantGeo.setAttribute('color', new THREE.BufferAttribute(gCols, 3));
    giantGeo.setIndex(new THREE.BufferAttribute(mergedIdx, 1));
    giantGeo.computeVertexNormals();
    basePlaneA.dispose();
    basePlaneB.dispose();

    const giantMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.62,
      metalness: 0.0,
      envMapIntensity,
      emissive: new THREE.Color('#147059'),
      emissiveIntensity: 0.32,
      side: THREE.DoubleSide,
    });
    giantMat.onBeforeCompile = (shader) => {
      shader.uniforms.uSeagrassTime = seagrassTimeUniform;
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uSeagrassTime;`,
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float gh = clamp(position.y / 10.2, 0.0, 1.0);
          #ifdef USE_INSTANCING
            float gPhase = instanceMatrix[3][0] * 0.4 + instanceMatrix[3][2] * 0.35;
          #else
            float gPhase = 0.0;
          #endif
          transformed.x += sin(uSeagrassTime * 0.85 + gPhase + gh * 3.2) * gh * 0.85;
          transformed.z += cos(uSeagrassTime * 0.72 + gPhase + gh * 2.5) * gh * 0.55;`,
        );
    };
    giantMat.customProgramCacheKey = () => 'giant-kelp-forest-sway-ch3';

    const giantInst = new THREE.InstancedMesh(giantGeo, giantMat, giantCount);
    giantInst.castShadow = shadowsEnabled && !isSoftwareGl;
    for (let i = 0; i < giantCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const rx = side * (4.6 + ((i * 27.9) % 100) / 100 * 12.2);
      const rz = 8 - ((i * 19.3) % 94);
      const ry = getChapterFloorHeight(chapterId, rx, rz) - 0.2;
      dummy.position.set(rx, ry, rz);
      dummy.rotation.set(0, ((i * 61) % 360) * (Math.PI / 180), 0);
      const sx = 0.88 + ((i * 13) % 100) / 100 * 0.72;
      const sy = 0.85 + ((i * 37) % 100) / 100 * 0.7;
      dummy.scale.set(sx, sy, sx);
      dummy.updateMatrix();
      giantInst.setMatrixAt(i, dummy.matrix);
    }
    giantInst.instanceMatrix.needsUpdate = true;
    giantInst.matrixAutoUpdate = false;
    giantInst.updateMatrix();
    giantInst.computeBoundingSphere();
    group.add(giantInst);
    disposables.push(giantGeo, giantMat);
  }

  // 3. Framing opening Reef Archway at z = -7 for Ch.1 & sunlit finale Ch.10
  if (chapterId === 1 || chapterId === 10) {
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8.2, -3.4, -7.0),
      new THREE.Vector3(-7.4, 2.8, -7.4),
      new THREE.Vector3(0.0, 7.6, -7.8),
      new THREE.Vector3(7.4, 2.8, -7.2),
      new THREE.Vector3(8.2, -3.4, -6.8),
    ]);
    const archGeo = new THREE.TubeGeometry(archCurve, isLowTier ? 14 : 26, 1.05, isLowTier ? 6 : 10, false);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x385769,
      map: coralMap ?? null,
      bumpMap: isLowTier ? null : (coralBumpMap ?? null),
      bumpScale: isLowTier ? 0 : 0.75,
      roughness: 0.88,
      metalness: 0.04,
      envMapIntensity,
    });
    const archMesh = new THREE.Mesh(archGeo, archMat);
    archMesh.castShadow = shadowsEnabled && !isSoftwareGl;
    archMesh.receiveShadow = shadowsEnabled;
    group.add(archMesh);
    disposables.push(archGeo, archMat);
  }

  return { group, disposables };
}
