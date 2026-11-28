import * as THREE from 'three';
import { PBRSurfaceTextures, SandTextures } from './textures';

export interface PlayerFishRig {
  group: THREE.Group;
  tailPivot: THREE.Group;
  leftFin: THREE.Mesh;
  rightFin: THREE.Mesh;
  lureMesh: THREE.Mesh;
  bodyMat: THREE.MeshPhysicalMaterial;
  lureMat: THREE.MeshStandardMaterial;
  pointLight: THREE.PointLight;
}

/**
 * Composite 7-part procedural Mother Fish with sculpted Lathe body, fins, glowing Call lure, and internal turquoise light.
 */
export function createPlayerFishRig(): PlayerFishRig {
  const group = new THREE.Group();

  // 1. Primary silhouette: sleek sculpted fish body via LatheGeometry
  const lathePoints: THREE.Vector2[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 = nose (+z), 1 = tail base (-z)
    const r =
      Math.sin(Math.pow(t, 0.55) * Math.PI) *
      (0.46 - 0.16 * t);
    const z = (0.5 - t) * 2.55;
    lathePoints.push(new THREE.Vector2(Math.max(0.01, r), z));
  }
  const bodyGeo = new THREE.LatheGeometry(lathePoints, 24);
  bodyGeo.rotateX(Math.PI / 2);
  bodyGeo.scale(0.76, 1.05, 1.0);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f495c,
    roughness: 0.34,
    metalness: 0.15,
    clearcoat: 0.85,
    clearcoatRoughness: 0.2,
    iridescence: 0.7,
    iridescenceIOR: 1.38,
    emissive: new THREE.Color('#093a42'),
    emissiveIntensity: 0.38,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 2. Dorsal fin (extruded curved fin)
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(0, 0);
  dorsalShape.quadraticCurveTo(0.1, 0.58, -0.5, 0.44);
  dorsalShape.quadraticCurveTo(-0.78, 0.24, -0.82, 0);
  dorsalShape.closePath();

  const finGeo = new THREE.ExtrudeGeometry(dorsalShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
  finGeo.rotateY(Math.PI / 2);

  const finMat = new THREE.MeshPhysicalMaterial({
    color: 0x26e8d4,
    emissive: new THREE.Color('#19b8a8'),
    emissiveIntensity: 0.75,
    roughness: 0.45,
    metalness: 0.0,
    transparent: true,
    opacity: 0.82,
  });
  const dorsalFin = new THREE.Mesh(finGeo, finMat);
  dorsalFin.position.set(0.02, 0.4, 0.15);
  group.add(dorsalFin);

  // 3 & 4. Left & right pectoral fins
  const pecGeo = new THREE.ConeGeometry(0.2, 0.65, 10);
  pecGeo.scale(0.22, 1, 0.72);
  pecGeo.rotateZ(Math.PI / 2.2);

  const leftFin = new THREE.Mesh(pecGeo, finMat);
  leftFin.position.set(-0.36, -0.08, 0.32);
  leftFin.rotation.y = -0.4;
  group.add(leftFin);

  const rightFin = new THREE.Mesh(pecGeo, finMat);
  rightFin.position.set(0.36, -0.08, 0.32);
  rightFin.rotation.z = Math.PI;
  rightFin.rotation.y = 0.4;
  group.add(rightFin);

  // 5. Articulated Caudal Tail Fin
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0, -1.18);

  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.quadraticCurveTo(-0.32, 0.56, -0.86, 0.6);
  tailShape.quadraticCurveTo(-0.46, 0.08, -0.48, 0);
  tailShape.quadraticCurveTo(-0.46, -0.08, -0.86, -0.6);
  tailShape.quadraticCurveTo(-0.32, -0.56, 0, 0);

  const tailGeo = new THREE.ExtrudeGeometry(tailShape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  tailGeo.rotateY(Math.PI / 2);
  const tailMesh = new THREE.Mesh(tailGeo, finMat);
  tailMesh.position.x = 0.015;
  tailPivot.add(tailMesh);
  group.add(tailPivot);

  // 6. Bioluminescent Call Crest / Lure on forehead
  const lureMat = new THREE.MeshStandardMaterial({
    color: 0x99fff4,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 1.8,
    roughness: 0.2,
    metalness: 0.0,
  });
  const lureMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), lureMat);
  lureMesh.position.set(0, 0.32, 0.88);
  group.add(lureMesh);

  // 7. Expressive eyes
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x051017,
    roughness: 0.1,
    metalness: 0.2,
  });
  const irisMat = new THREE.MeshStandardMaterial({
    color: 0xd9fffa,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 0.55,
    roughness: 0.25,
  });
  const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const irisGeo = new THREE.SphereGeometry(0.1, 12, 12);

  [-1, 1].forEach((side) => {
    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.set(side * 0.26, 0.11, 0.84);
    group.add(iris);

    const pupil = new THREE.Mesh(eyeGeo, eyeMat);
    pupil.position.set(side * 0.3, 0.11, 0.88);
    group.add(pupil);
  });

  // Bioluminescent flashlight PointLight lighting up surrounding reef and seabed
  const pointLight = new THREE.PointLight('#26e8d4', 3.0, 20, 1.3);
  pointLight.position.set(0, 0.35, 1.05);
  group.add(pointLight);

  return {
    group,
    tailPivot,
    leftFin,
    rightFin,
    lureMesh,
    bodyMat,
    lureMat,
    pointLight,
  };
}

export function createEggMesh(lowQuality = false, extraPointLights = true): THREE.Group {
  const group = new THREE.Group();

  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xbafff7,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 2.8,
    roughness: 0.2,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.26, lowQuality ? 12 : 20, lowQuality ? 10 : 20), coreMat);
  core.scale.set(0.9, 1.18, 0.9);
  group.add(core);

  const shellMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0x73fff0,
        roughness: 0.18,
        metalness: 0.04,
        transparent: true,
        opacity: 0.5,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x73fff0,
        roughness: 0.1,
        metalness: 0.04,
        transparent: true,
        opacity: 0.5,
        clearcoat: 1.0,
        iridescence: 0.85,
        iridescenceIOR: 1.36,
      });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.42, lowQuality ? 14 : 24, lowQuality ? 12 : 24), shellMat);
  shell.scale.set(0.92, 1.18, 0.92);
  group.add(shell);

  // Orbiting organic bioluminescent motes replacing flat ring geometry
  const sporeMat = new THREE.MeshStandardMaterial({
    color: 0xbafff7,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 1.9,
    roughness: 0.2,
  });
  const sporeGeo = new THREE.SphereGeometry(0.055, 8, 8);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const mote = new THREE.Mesh(sporeGeo, sporeMat);
    mote.position.set(
      Math.cos(a) * 0.56,
      Math.sin(i * 1.3) * 0.14,
      Math.sin(a) * 0.56,
    );
    group.add(mote);
  }

  const light = new THREE.PointLight('#26e8d4', 1.8, 12, 1.5);
  light.visible = extraPointLights;
  light.userData.isSecondaryLight = true;
  group.add(light);

  return group;
}

export interface MildredRig {
  group: THREE.Group;
  bell: THREE.Mesh;
  tentacles: THREE.Mesh[];
}

/**
 * 8-part Grandma Jellyfish Mildred with translucent bell, glowing core, granny spectacles, and trailing tentacles.
 */
export function createMildredRig(
  isSoftwareGl = false,
  lowQuality = false,
  extraPointLights = true,
): MildredRig {
  const group = new THREE.Group();
  const skipTransmission = isSoftwareGl || lowQuality;

  const bellMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0x957ae8,
        emissive: new THREE.Color('#7f5de0'),
        emissiveIntensity: 0.48,
        roughness: 0.24,
        metalness: 0.0,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x957ae8,
        emissive: new THREE.Color('#7f5de0'),
        emissiveIntensity: 0.48,
        roughness: 0.14,
        metalness: 0.0,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
        transmission: skipTransmission ? 0 : 0.78,
        ior: 1.38,
        thickness: 1.4,
        side: THREE.DoubleSide,
      });

  // Soft Fresnel rim-only emissive glow so Mildred reads as soft gelatinous tissue
  bellMat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
      float rimFresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.5);
      totalEmissiveRadiance *= (0.18 + 0.95 * rimFresnel);`,
    );
  };
  bellMat.customProgramCacheKey = () =>
    `mildred-fresnel-bell-${isSoftwareGl ? 'sw' : 'hw'}`;

  const bellGeo = new THREE.SphereGeometry(
    1.25,
    24,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.58,
  );
  const bell = new THREE.Mesh(bellGeo, bellMat);
  group.add(bell);

  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xe6b8ff,
    emissive: new THREE.Color('#c76bff'),
    emissiveIntensity: 0.9,
    roughness: 0.35,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), coreMat);
  nucleus.position.y = 0.28;
  group.add(nucleus);

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd9a6ff,
    emissive: new THREE.Color('#cf75ff'),
    emissiveIntensity: 1.35,
    roughness: 0.3,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.06, 10, 28),
    rimMat,
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.22;
  group.add(rim);

  // Cute granny spectacles on the front of the bell
  const specMat = new THREE.MeshStandardMaterial({
    color: 0xd9b968,
    metalness: 0.8,
    roughness: 0.28,
  });
  [-0.3, 0.3].forEach((x) => {
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.03, 8, 18),
      specMat,
    );
    frame.position.set(x, 0.22, 1.15);
    group.add(frame);
  });

  // 5 waving translucent tentacles
  const tentacles: THREE.Mesh[] = [];
  const tentMat = new THREE.MeshStandardMaterial({
    color: 0x9b6be0,
    emissive: new THREE.Color('#7b3dc9'),
    emissiveIntensity: 0.55,
    roughness: 0.45,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.12, -0.7, 0.08),
      new THREE.Vector3(-0.1, -1.45, -0.06),
      new THREE.Vector3(0.08, -2.2, 0.05),
    ]);
    const tGeo = new THREE.TubeGeometry(curve, 14, 0.055, 6, false);
    const tMesh = new THREE.Mesh(tGeo, tentMat);
    tMesh.position.set(Math.cos(angle) * 0.55, -0.15, Math.sin(angle) * 0.55);
    group.add(tMesh);
    tentacles.push(tMesh);
  }

  const light = new THREE.PointLight('#a86eff', 1.1, 11, 1.5);
  light.position.y = 0.2;
  light.visible = extraPointLights;
  light.userData.isSecondaryLight = true;
  group.add(light);

  return { group, bell, tentacles };
}

export interface SquidRig {
  group: THREE.Group;
  siphonMat: THREE.MeshStandardMaterial;
  bodyMat: THREE.MeshPhysicalMaterial;
  tentacles: THREE.Group;
  warnLight: THREE.PointLight;
}

/**
 * 7-part Rocket Squid predator with torpedo mantle, stabilizers, bioluminescent telegraph bands, and tentacle cluster.
 */
export function createSquidRig(): SquidRig {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x6b2032,
    roughness: 0.32,
    metalness: 0.15,
    clearcoat: 0.75,
    emissive: new THREE.Color('#2b0912'),
    emissiveIntensity: 0.45,
  });

  // Torpedo mantle along +Z
  const mantlePoints: THREE.Vector2[] = [
    new THREE.Vector2(0.01, -1.55),
    new THREE.Vector2(0.44, -0.85),
    new THREE.Vector2(0.56, 0.0),
    new THREE.Vector2(0.42, 0.75),
    new THREE.Vector2(0.32, 1.05),
  ];
  const mantleGeo = new THREE.LatheGeometry(mantlePoints, 20);
  mantleGeo.rotateX(Math.PI / 2);
  const mantle = new THREE.Mesh(mantleGeo, bodyMat);
  mantle.castShadow = true;
  group.add(mantle);

  // Side arrow fins near tail (-Z)
  const finGeo = new THREE.ConeGeometry(0.45, 0.9, 4);
  finGeo.scale(1.2, 1, 0.12);
  finGeo.rotateX(Math.PI / 2);
  const fin = new THREE.Mesh(finGeo, bodyMat);
  fin.position.set(0, 0, -1.0);
  group.add(fin);

  // Glowing telegraph band + eyes
  const siphonMat = new THREE.MeshStandardMaterial({
    color: 0xff6f4a,
    emissive: new THREE.Color('#ff4824'),
    emissiveIntensity: 1.2,
    roughness: 0.25,
  });
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.075, 10, 22),
    siphonMat,
  );
  ring.position.set(0, 0, 0.35);
  group.add(ring);

  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 10),
      siphonMat,
    );
    eye.position.set(side * 0.34, 0.12, 0.85);
    group.add(eye);
  });

  // Tentacles forward (+Z)
  const tentacles = new THREE.Group();
  tentacles.position.set(0, 0, 1.0);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const tGeo = new THREE.ConeGeometry(0.075, 1.25, 6);
    tGeo.rotateX(Math.PI / 2);
    const tMesh = new THREE.Mesh(tGeo, bodyMat);
    tMesh.position.set(Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0.55);
    tentacles.add(tMesh);
  }
  group.add(tentacles);

  const warnLight = new THREE.PointLight('#ff5430', 1.4, 12, 1.5);
  warnLight.position.set(0, 0.2, 0.6);
  group.add(warnLight);

  return { group, siphonMat, bodyMat, tentacles, warnLight };
}

export function createShrimpFlockRig(): THREE.Group {
  const group = new THREE.Group();
  const shrimpMat = new THREE.MeshStandardMaterial({
    color: 0xff9d76,
    emissive: new THREE.Color('#ff5e3a'),
    emissiveIntensity: 0.85,
    roughness: 0.35,
  });

  for (let i = 0; i < 6; i++) {
    const shrimp = new THREE.Group();
    const angle = (i / 6) * Math.PI * 2;
    shrimp.position.set(
      Math.cos(angle) * 0.95,
      Math.sin(i * 1.7) * 0.35,
      Math.sin(angle) * 0.95,
    );
    shrimp.rotation.y = -angle;

    const seg1 = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, 0.24, 4, 8),
      shrimpMat,
    );
    seg1.rotation.x = Math.PI / 2;
    shrimp.add(seg1);

    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.18, 6),
      shrimpMat,
    );
    tail.rotation.x = -Math.PI / 2;
    tail.position.z = -0.22;
    shrimp.add(tail);

    group.add(shrimp);
  }

  return group;
}

export function createCoralShelterRig(
  coralTextures?: {
    map?: THREE.Texture;
    bumpMap?: THREE.Texture;
  },
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x2e1e30,
    map: coralTextures?.map ?? null,
    bumpMap: coralTextures?.bumpMap ?? null,
    bumpScale: 0.55,
    roughness: 0.86,
    metalness: 0.0,
    envMapIntensity: 0.08,
  });
  const branchMat = new THREE.MeshStandardMaterial({
    color: 0x572f42,
    map: coralTextures?.map ?? null,
    bumpMap: coralTextures?.bumpMap ?? null,
    bumpScale: 0.58,
    roughness: 0.85,
    metalness: 0.0,
    envMapIntensity: 0.08,
  });

  // Base mound seated flush on floor
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.8, 0.9, 14), baseMat);
  base.position.y = -0.8;
  group.add(base);

  // 7 curved staghorn shelter ribs forming a hollow protective sanctuary dome
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a) * 2.3, -0.5, Math.sin(a) * 2.3),
      new THREE.Vector3(Math.cos(a) * 2.5, 1.3, Math.sin(a) * 2.5),
      new THREE.Vector3(Math.cos(a) * 1.15, 2.7, Math.sin(a) * 1.15),
    ]);
    const rib = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 12, 0.24, 8, false),
      branchMat,
    );
    rib.castShadow = true;
    rib.receiveShadow = true;
    group.add(rib);
  }

  // Subtle interior refuge warmth (non-blooming)
  const safeGlow = new THREE.PointLight('#9e4e6e', 0.45, 7, 1.8);
  safeGlow.position.set(0, 0.6, 0);
  safeGlow.visible = extraPointLights;
  safeGlow.userData.isSecondaryLight = true;
  group.add(safeGlow);

  return group;
}

export function createPearlPickupRig(
  nacreTex?: SandTextures,
  lowQuality = false,
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const shellMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0x7a8a99,
        map: nacreTex?.map ?? null,
        normalMap: nacreTex?.normalMap ?? null,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.45,
        metalness: 0.14,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x7a8a99,
        map: nacreTex?.map ?? null,
        normalMap: nacreTex?.normalMap ?? null,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.42,
        metalness: 0.14,
        clearcoat: 0.45,
        clearcoatRoughness: 0.25,
        iridescence: 0.72,
        iridescenceIOR: 1.36,
      });
  const innerMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xcfe2eb,
        roughness: 0.3,
        metalness: 0.08,
        emissive: new THREE.Color('#274754'),
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xcfe2eb,
        roughness: 0.26,
        metalness: 0.08,
        clearcoat: 0.65,
        iridescence: 0.85,
        emissive: new THREE.Color('#274754'),
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide,
      });

  const lowerShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, lowQuality ? 12 : 18, lowQuality ? 8 : 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    shellMat,
  );
  lowerShell.scale.set(1.24, 0.52, 1.02);
  lowerShell.position.y = -0.24;
  lowerShell.castShadow = !lowQuality;
  lowerShell.receiveShadow = !lowQuality;
  group.add(lowerShell);

  const lowerLip = new THREE.Mesh(
    new THREE.TorusGeometry(0.66, 0.045, lowQuality ? 6 : 8, lowQuality ? 14 : 20),
    innerMat,
  );
  lowerLip.rotation.x = Math.PI / 2;
  lowerLip.scale.set(1.22, 1.0, 1.0);
  lowerLip.position.y = -0.23;
  group.add(lowerLip);

  const upperShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, lowQuality ? 12 : 18, lowQuality ? 8 : 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    shellMat,
  );
  upperShell.scale.set(1.24, 0.52, 1.02);
  upperShell.position.set(0, -0.18, -0.22);
  upperShell.rotation.x = -0.88;
  upperShell.castShadow = !lowQuality;
  group.add(upperShell);

  // Scalloped hinge pin at the back of the clam
  const hingeMat = new THREE.MeshStandardMaterial({
    color: 0x998055,
    roughness: 0.48,
    metalness: 0.65,
  });
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.42, 10), hingeMat);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, -0.22, -0.62);
  group.add(hinge);

  const pearlMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xfff8e7,
        emissive: new THREE.Color('#f7df9c'),
        emissiveIntensity: 1.38,
        roughness: 0.14,
        metalness: 0.08,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xfff8e7,
        emissive: new THREE.Color('#f7df9c'),
        emissiveIntensity: 1.38,
        roughness: 0.06,
        metalness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        iridescence: 1.0,
        iridescenceIOR: 1.42,
      });
  const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.32, lowQuality ? 14 : 22, lowQuality ? 12 : 22), pearlMat);
  pearl.position.y = 0.07;
  pearl.castShadow = !lowQuality;
  group.add(pearl);

  const pLight = new THREE.PointLight('#ffe8a6', 1.25, 8, 1.55);
  pLight.position.y = 0.38;
  pLight.visible = extraPointLights;
  pLight.userData.isSecondaryLight = true;
  group.add(pLight);

  return group;
}

/**
 * Translucent volumetric sunlight cones ("God Rays") filtering down from surface.
 */
export function createGodRayBeams(): THREE.Group {
  const group = new THREE.Group();

  const beamMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#6ee2ff') },
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vec3 viewDir = normalize(vViewPos);
        float fresnel = pow(abs(dot(vNormal, viewDir)), 1.75);
        float verticalFade = smoothstep(0.0, 0.32, vUv.y) * (1.0 - smoothstep(0.62, 1.0, vUv.y));
        float streaks = 0.68 + 0.32 * sin(uTime * 0.85 + vUv.x * 16.0) * cos(uTime * 0.48 + vUv.x * 9.0 + vUv.y * 2.5);
        float alpha = fresnel * verticalFade * streaks * 0.135 * uIntensity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const beamConfigs = [
    { x: -5.5, y: 8.5, z: -2, rTop: 1.4, rBot: 6.4, h: 27, rx: 0.15, rz: -0.11 },
    { x: 5.5, y: 9.2, z: -14, rTop: 1.9, rBot: 7.4, h: 29, rx: 0.12, rz: 0.09 },
    { x: -3.2, y: 8.2, z: -30, rTop: 1.7, rBot: 6.8, h: 27, rx: 0.11, rz: -0.13 },
    { x: 6.2, y: 8.8, z: -46, rTop: 1.8, rBot: 7.2, h: 28, rx: 0.14, rz: 0.08 },
    { x: -4.8, y: 7.6, z: -62, rTop: 2.0, rBot: 7.8, h: 28, rx: 0.13, rz: -0.09 },
    { x: 2.0, y: 7.2, z: -78, rTop: 2.3, rBot: 8.5, h: 29, rx: 0.15, rz: 0.05 },
  ];

  for (const cfg of beamConfigs) {
    const geo = new THREE.CylinderGeometry(cfg.rTop, cfg.rBot, cfg.h, 22, 1, true);
    const mesh = new THREE.Mesh(geo, beamMat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.rotation.set(cfg.rx, 0, cfg.rz);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    group.add(mesh);
  }
  group.userData.beamMaterial = beamMat;

  return group;
}

// --- Chapter 2: «Поющий кит» (Sunken Liner & Twilight Reef) 3D Rigs ---

export interface BorisRig {
  group: THREE.Group;
  tentacles: THREE.Mesh[];
  lanternLight: THREE.PointLight;
}

export function createBorisRig(lowQuality = false, extraPointLights = true): BorisRig {
  const group = new THREE.Group();

  const skinMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0x6b2f45,
        roughness: 0.48,
        metalness: 0.06,
        emissive: new THREE.Color('#210a15'),
        emissiveIntensity: 0.35,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x6b2f45,
        roughness: 0.42,
        metalness: 0.06,
        clearcoat: 0.6,
        emissive: new THREE.Color('#210a15'),
        emissiveIntensity: 0.35,
      });

  // Bulbous octopus head / mantle
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 16), skinMat);
  head.scale.set(0.92, 1.18, 0.95);
  head.position.y = 0.72;
  head.castShadow = !lowQuality;
  group.add(head);

  // Expressive eyes
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffe49e,
    emissive: new THREE.Color('#ffc44d'),
    emissiveIntensity: 0.7,
    roughness: 0.2,
  });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x091015, roughness: 0.1 });
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), eyeMat);
    eye.position.set(side * 0.42, 0.48, 0.75);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), pupilMat);
    pupil.position.set(side * 0.45, 0.48, 0.89);
    group.add(pupil);
  });

  // 8 curling tentacles
  const tentacles: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a) * 0.45, 0.05, Math.sin(a) * 0.45),
      new THREE.Vector3(Math.cos(a) * 1.15, -0.35, Math.sin(a) * 1.15),
      new THREE.Vector3(Math.cos(a + 0.35) * 1.65, -0.15, Math.sin(a + 0.35) * 1.65),
      new THREE.Vector3(Math.cos(a + 0.65) * 2.05, 0.25, Math.sin(a + 0.65) * 2.05),
    ]);
    const tMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.13, 7, false), skinMat);
    tMesh.castShadow = !lowQuality;
    group.add(tMesh);
    tentacles.push(tMesh);
  }

  const lanternLight = new THREE.PointLight('#ffbb66', 1.4, 10, 1.5);
  lanternLight.position.set(0, 0.7, 1.2);
  lanternLight.visible = extraPointLights;
  lanternLight.userData.isSecondaryLight = true;
  group.add(lanternLight);

  return { group, tentacles, lanternLight };
}

export interface PafnutiyRig {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  bodyMat: THREE.MeshStandardMaterial;
  warnLight: THREE.PointLight;
}

export function createPafnutiyRig(lowQuality = false, extraPointLights = true): PafnutiyRig {
  const group = new THREE.Group();
  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  const bodyMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xb8964f,
        roughness: 0.52,
        metalness: 0.05,
        emissive: new THREE.Color('#3b290c'),
        emissiveIntensity: 0.32,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xb8964f,
        roughness: 0.48,
        metalness: 0.05,
        clearcoat: 0.45,
        emissive: new THREE.Color('#3b290c'),
        emissiveIntensity: 0.32,
      });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 16), bodyMat);
  body.castShadow = !lowQuality;
  bodyGroup.add(body);

  // Cute dorsal & side spines radiating around pufferfish
  const spineMat = new THREE.MeshStandardMaterial({
    color: 0xe3cf9d,
    roughness: 0.55,
  });
  const spineGeo = new THREE.ConeGeometry(0.08, 0.34, 6);
  for (let i = 0; i < 18; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / 18);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    );
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.copy(dir).multiplyScalar(0.84);
    spine.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    bodyGroup.add(spine);
  }

  // Wide surprised eyes
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf7fbff, roughness: 0.2 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x091015, roughness: 0.1 });
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), whiteMat);
    eye.position.set(side * 0.36, 0.24, 0.72);
    bodyGroup.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), darkMat);
    pupil.position.set(side * 0.38, 0.24, 0.87);
    bodyGroup.add(pupil);
  });

  const warnLight = new THREE.PointLight('#ffd27a', 1.1, 9, 1.5);
  warnLight.position.set(0, 0.3, 0.9);
  warnLight.visible = extraPointLights;
  warnLight.userData.isSecondaryLight = true;
  group.add(warnLight);

  return { group, bodyGroup, bodyMat, warnLight };
}

export function createGlowingMugRig(lowQuality = false, extraPointLights = true): THREE.Group {
  const group = new THREE.Group();

  const brassMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xc2904a,
        roughness: 0.34,
        metalness: 0.74,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xc2904a,
        roughness: 0.28,
        metalness: 0.78,
        clearcoat: 0.28,
        clearcoatRoughness: 0.22,
      });
  const patinaBrassMat = new THREE.MeshStandardMaterial({
    color: 0x6c5938,
    roughness: 0.56,
    metalness: 0.52,
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.29, 0.64, 20), brassMat);
  body.castShadow = !lowQuality;
  group.add(body);

  // Flared base ring & lip rim for authentic heavy naval mug silhouette
  const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.35, 0.1, 20), patinaBrassMat);
  baseRing.position.y = -0.3;
  group.add(baseRing);

  const lipRim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.032, 10, 24), brassMat);
  lipRim.rotation.x = Math.PI / 2;
  lipRim.position.y = 0.31;
  group.add(lipRim);

  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.048, 10, 18, Math.PI),
    brassMat,
  );
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(0.33, 0, 0);
  group.add(handle);

  // Handle rivet brackets
  [-0.17, 0.17].forEach((hy) => {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.08), patinaBrassMat);
    bracket.position.set(0.33, hy, 0);
    group.add(bracket);
  });

  // Warm glowing lamp tea inside the mug
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xffe4a8,
    emissive: new THREE.Color('#ffb84d'),
    emissiveIntensity: 2.2,
    roughness: 0.18,
  });
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.28, 0.12, 20), glowMat);
  core.position.y = 0.28;
  group.add(core);

  const light = new THREE.PointLight('#ffbb55', 2.6, 12, 1.4);
  light.position.y = 0.5;
  light.visible = extraPointLights;
  light.userData.isSecondaryLight = true;
  group.add(light);

  return group;
}

export function createCargoCrateShelterRig(
  woodTex?: PBRSurfaceTextures,
  hullTex?: PBRSurfaceTextures,
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({
    color: woodTex ? 0xe0d2bf : 0x45382e,
    map: woodTex?.map ?? null,
    normalMap: woodTex?.normalMap ?? null,
    normalScale: new THREE.Vector2(0.95, 0.95),
    roughnessMap: woodTex?.roughnessMap ?? null,
    roughness: 0.85,
    metalness: 0.04,
    envMapIntensity: 0.28,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: hullTex ? 0xd4dfe6 : 0x3b4852,
    map: hullTex?.map ?? null,
    normalMap: hullTex?.normalMap ?? null,
    normalScale: new THREE.Vector2(0.9, 0.9),
    roughnessMap: hullTex?.roughnessMap ?? null,
    roughness: 0.64,
    metalness: 0.5,
    envMapIntensity: 0.42,
  });
  const lanternGlassMat = new THREE.MeshStandardMaterial({
    color: 0xffd796,
    emissive: new THREE.Color('#ffaa44'),
    emissiveIntensity: 1.55,
    roughness: 0.2,
  });

  // 4 corner steel posts with riveted base plates + wooden beams open for fish to swim inside
  const w = 4.6;
  const h = 3.4;
  const postGeo = new THREE.BoxGeometry(0.34, h, 0.34);
  const footGeo = new THREE.BoxGeometry(0.54, 0.16, 0.54);
  const beamGeo = new THREE.BoxGeometry(w, 0.3, 0.28);
  const sideBeamGeo = new THREE.BoxGeometry(0.28, 0.3, w);

  [
    [-w / 2, -w / 2],
    [w / 2, -w / 2],
    [-w / 2, w / 2],
    [w / 2, w / 2],
  ].forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeo, ironMat);
    post.position.set(px, 0.5, pz);
    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);

    const foot = new THREE.Mesh(footGeo, ironMat);
    foot.position.set(px, -h / 2 + 0.45, pz);
    group.add(foot);
  });

  [h / 2 + 0.5, -h / 2 + 0.5].forEach((py) => {
    [-w / 2, w / 2].forEach((offset) => {
      const b1 = new THREE.Mesh(beamGeo, woodMat);
      b1.position.set(0, py, offset);
      b1.castShadow = true;
      b1.receiveShadow = true;
      group.add(b1);
      const b2 = new THREE.Mesh(sideBeamGeo, woodMat);
      b2.position.set(offset, py, 0);
      b2.castShadow = true;
      b2.receiveShadow = true;
      group.add(b2);
    });
  });

  // Diagonal iron corner braces for industrial naval crate silhouette
  const braceGeo = new THREE.BoxGeometry(0.14, 1.35, 0.16);
  [-1, 1].forEach((sx) => {
    [-1, 1].forEach((sz) => {
      const brace = new THREE.Mesh(braceGeo, ironMat);
      brace.position.set(sx * (w / 2 - 0.38), h / 2 + 0.08, sz * (w / 2));
      brace.rotation.z = sx * 0.78;
      group.add(brace);
    });
  });

  // Top roof planks with slight organic weathering tilt
  for (let i = -2; i <= 2; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(w + 0.28, 0.15, 0.62), woodMat);
    plank.position.set(0, h / 2 + 0.66, i * 0.85);
    plank.rotation.y = (i % 2 === 0 ? 1 : -1) * 0.015;
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }

  // Hanging warm refuge lantern inside crate roof
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 6), ironMat);
  chain.position.set(0, h / 2 + 0.35, 0);
  group.add(chain);
  const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.28, 8), lanternGlassMat);
  lanternBody.position.set(0, h / 2 + 0.06, 0);
  group.add(lanternBody);

  const safeGlow = new THREE.PointLight('#e89e4e', 0.95, 9.5, 1.6);
  safeGlow.position.set(0, 1.2, 0);
  safeGlow.visible = extraPointLights;
  safeGlow.userData.isSecondaryLight = true;
  group.add(safeGlow);

  return group;
}

export interface PelicanGateRig {
  group: THREE.Group;
  doorLeft: THREE.Mesh;
  doorRight: THREE.Mesh;
  leverGroup: THREE.Group;
  leverMat: THREE.MeshStandardMaterial;
  leverLight: THREE.PointLight;
}

export function createPelicanGateRig(
  hullTex?: PBRSurfaceTextures,
  lowQuality = false,
  extraPointLights = true,
): PelicanGateRig {
  const group = new THREE.Group();

  const hullMat = new THREE.MeshStandardMaterial({
    color: hullTex ? 0xd0dce3 : 0x263540,
    map: hullTex?.map ?? null,
    normalMap: hullTex?.normalMap ?? null,
    normalScale: new THREE.Vector2(0.95, 0.95),
    roughnessMap: hullTex?.roughnessMap ?? null,
    roughness: 0.68,
    metalness: 0.46,
    envMapIntensity: lowQuality ? 0.0 : 0.38,
  });
  const doorMat = new THREE.MeshStandardMaterial({
    color: hullTex ? 0xe3edf2 : 0x3b4e5c,
    map: hullTex?.map ?? null,
    normalMap: hullTex?.normalMap ?? null,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughnessMap: hullTex?.roughnessMap ?? null,
    roughness: 0.58,
    metalness: 0.54,
    envMapIntensity: lowQuality ? 0.0 : 0.45,
  });
  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0x8f6b29,
    roughness: 0.72,
    metalness: 0.25,
  });
  const brassMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xc2934e,
        roughness: 0.36,
        metalness: 0.74,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xc2934e,
        roughness: 0.3,
        metalness: 0.78,
        clearcoat: 0.25,
      });

  // Flanking bulkhead walls leaving center cargo doorway open when doors slide apart
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(11, 14, 1.6), hullMat);
  leftWall.position.set(-10.5, 2, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(11, 14, 1.6), hullMat);
  rightWall.position.set(10.5, 2, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // Heavy riveted vertical frame jambs flanking the doorway
  [-5.15, 5.15].forEach((jx) => {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 11.2, 1.95), hullMat);
    jamb.position.set(jx, 0.6, 0);
    jamb.castShadow = true;
    group.add(jamb);
  });

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(11.6, 4.6, 1.85), hullMat);
  lintel.position.set(0, 7.2, 0);
  lintel.castShadow = true;
  group.add(lintel);

  // Overhead hydraulic rail & lock pistons on the lintel
  const railBeam = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.55, 2.2), hullMat);
  railBeam.position.set(0, 5.15, 0);
  group.add(railBeam);
  [-3.2, 3.2].forEach((px) => {
    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.6, 10), brassMat);
    piston.rotation.z = Math.PI / 2;
    piston.position.set(px, 5.55, 1.05);
    group.add(piston);
  });

  // Sliding Pelican beak doors with structural horizontal ribs & weathered hazard stripe
  const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(5.1, 9.5, 0.85), doorMat);
  doorLeft.position.set(-2.55, 0.2, 0);
  doorLeft.castShadow = true;
  doorLeft.receiveShadow = true;
  [-2.6, 0, 2.6].forEach((ry) => {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(4.85, 0.38, 1.04), hullMat);
    rib.position.y = ry;
    doorLeft.add(rib);
  });
  const stripeL = new THREE.Mesh(new THREE.BoxGeometry(4.95, 0.52, 0.92), hazardMat);
  stripeL.position.y = -1.3;
  doorLeft.add(stripeL);
  group.add(doorLeft);

  const doorRight = new THREE.Mesh(new THREE.BoxGeometry(5.1, 9.5, 0.85), doorMat);
  doorRight.position.set(2.55, 0.2, 0);
  doorRight.castShadow = true;
  doorRight.receiveShadow = true;
  [-2.6, 0, 2.6].forEach((ry) => {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(4.85, 0.38, 1.04), hullMat);
    rib.position.y = ry;
    doorRight.add(rib);
  });
  const stripeR = new THREE.Mesh(new THREE.BoxGeometry(4.95, 0.52, 0.92), hazardMat);
  stripeR.position.y = -1.3;
  doorRight.add(stripeR);
  group.add(doorRight);

  // Interactive glowing Pelican Hatch Wheel Pedestal ahead of gate
  const leverGroup = new THREE.Group();
  leverGroup.position.set(-3.2, -1.4, 2.5);
  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.2, 1.15), hullMat);
  basePlate.position.y = -0.5;
  leverGroup.add(basePlate);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 1.1, 14), hullMat);
  pedestal.castShadow = true;
  leverGroup.add(pedestal);

  const leverMat = new THREE.MeshStandardMaterial({
    color: 0x7df5ff,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 1.5,
    roughness: 0.24,
  });
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.085, 10, 22), leverMat);
  wheel.position.set(0, 0.78, 0.08);
  leverGroup.add(wheel);
  // 6 spokes on the hatch wheel
  for (let s = 0; s < 3; s++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.92, 6), brassMat);
    spoke.rotation.z = (s * Math.PI) / 3;
    spoke.position.set(0, 0.78, 0.08);
    leverGroup.add(spoke);
  }
  const centerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 12), brassMat);
  centerHub.rotation.x = Math.PI / 2;
  centerHub.position.set(0, 0.78, 0.08);
  leverGroup.add(centerHub);

  const leverLight = new THREE.PointLight('#26e8d4', 2.4, 12, 1.4);
  leverLight.position.set(0, 0.95, 0.45);
  leverLight.visible = extraPointLights;
  leverLight.userData.isSecondaryLight = true;
  leverGroup.add(leverLight);
  group.add(leverGroup);

  return { group, doorLeft, doorRight, leverGroup, leverMat, leverLight };
}

export function createSunkenLinerSet(
  hullTex?: PBRSurfaceTextures,
  woodTex?: PBRSurfaceTextures,
  lowQuality = false,
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const rustIronMat = new THREE.MeshStandardMaterial({
    color: hullTex ? 0xd2dde6 : 0x26343e,
    map: hullTex?.map ?? null,
    normalMap: hullTex?.normalMap ?? null,
    normalScale: new THREE.Vector2(1.05, 1.05),
    roughnessMap: hullTex?.roughnessMap ?? null,
    roughness: 0.74,
    metalness: 0.42,
    envMapIntensity: lowQuality ? 0.0 : 0.38,
  });
  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: hullTex ? 0xb8c6d1 : 0x1b2833,
    map: hullTex?.map ?? null,
    normalMap: hullTex?.normalMap ?? null,
    normalScale: new THREE.Vector2(0.95, 0.95),
    roughnessMap: hullTex?.roughnessMap ?? null,
    roughness: 0.7,
    metalness: 0.46,
    envMapIntensity: lowQuality ? 0.0 : 0.34,
  });
  const woodCounterMat = new THREE.MeshStandardMaterial({
    color: woodTex ? 0xe0d2bf : 0x45382e,
    map: woodTex?.map ?? null,
    normalMap: woodTex?.normalMap ?? null,
    normalScale: new THREE.Vector2(0.9, 0.9),
    roughnessMap: woodTex?.roughnessMap ?? null,
    roughness: 0.82,
    metalness: 0.04,
  });
  const brassFixtureMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xb88644,
        roughness: 0.38,
        metalness: 0.7,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xb88644,
        roughness: 0.34,
        metalness: 0.74,
        clearcoat: 0.2,
      });
  const portholeGlowMat = new THREE.MeshStandardMaterial({
    color: 0x8be2f2,
    emissive: new THREE.Color('#2c88a3'),
    emissiveIntensity: 0.9,
    roughness: 0.22,
  });

  // Arched sunken ship hull ribs with riveted flange collars framing the twilight trench
  const ribZs = [-8, -18, -28, -38, -50, -72];
  for (let i = 0; i < ribZs.length; i++) {
    const z = ribZs[i];
    const tilt = (i % 2 === 0 ? 1 : -1) * 0.09;
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14.5, -5.0, 0),
      new THREE.Vector3(-12.5, 4.5, 0),
      new THREE.Vector3(0, 10.2, 0),
      new THREE.Vector3(12.5, 4.2, 0),
      new THREE.Vector3(14.5, -5.2, 0),
    ]);
    const rib = new THREE.Mesh(
      new THREE.TubeGeometry(archCurve, 22, 0.44, 10, false),
      rustIronMat,
    );
    rib.position.set(0, -i * 0.45, z);
    rib.rotation.z = tilt;
    rib.castShadow = true;
    rib.receiveShadow = true;
    group.add(rib);

    // Structural flange gussets on each side of the rib
    [-12.4, 12.4].forEach((fx) => {
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.7, 0.55, 10), darkSteelMat);
      collar.position.set(fx, 1.8 - i * 0.45, z);
      group.add(collar);
    });
  }

  // Tilted starboard & port liner plates with recessed riveted porthole collars + glowing sea-glass
  const hullPlates = [
    { x: -13.2, y: 1.5, z: -20, ry: 0.16, rz: -0.18, len: 24 },
    { x: 13.4, y: 0.6, z: -38, ry: -0.14, rz: 0.16, len: 28 },
    { x: -13.0, y: -0.8, z: -52, ry: 0.12, rz: -0.14, len: 22 },
  ];
  for (const plate of hullPlates) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 8.5, plate.len),
      darkSteelMat,
    );
    panel.position.set(plate.x, plate.y, plate.z);
    panel.rotation.set(0, plate.ry, plate.rz);
    panel.receiveShadow = true;
    group.add(panel);

    // Horizontal deck stringer rail along the hull plate
    const stringer = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 0.45, plate.len),
      rustIronMat,
    );
    stringer.position.set(plate.x, plate.y - 2.3, plate.z);
    stringer.rotation.set(0, plate.ry, plate.rz);
    group.add(stringer);

    for (let k = -1; k <= 1; k++) {
      const pz = plate.z + k * 6.0;
      const py = plate.y + 0.8;
      const porthole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.68, 1.05, 18),
        portholeGlowMat,
      );
      porthole.rotation.z = Math.PI / 2;
      porthole.position.set(plate.x, py, pz);
      group.add(porthole);

      const collarRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.75, 0.13, 8, 20),
        brassFixtureMat,
      );
      collarRing.rotation.y = Math.PI / 2;
      collarRing.position.set(
        plate.x + (plate.x < 0 ? 0.52 : -0.52),
        py,
        pz,
      );
      group.add(collarRing);
    }
  }

  // Fallen rusted catwalk beam & mooring bollard with hanging anchor chain near z = -22
  const fallenBeam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 9.5), rustIronMat);
  fallenBeam.position.set(-8.8, -2.55, -22);
  fallenBeam.rotation.set(0.08, 0.35, -0.12);
  fallenBeam.receiveShadow = true;
  group.add(fallenBeam);

  const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.2, 12), darkSteelMat);
  bollard.position.set(9.2, -2.1, -24);
  group.add(bollard);
  for (let c = 0; c < 6; c++) {
    const link = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.045, 6, 12), rustIronMat);
    link.position.set(9.2 - c * 0.25, -1.6 - c * 0.18, -24 + c * 0.2);
    link.rotation.y = (c % 2) * (Math.PI / 2);
    group.add(link);
  }

  // Sunken galley counter + timber countertop + brass kettle & warm galley storytelling light near Boris's mug (x=7.2, z=-42)
  const galleyGroup = new THREE.Group();
  galleyGroup.position.set(7.4, -1.65, -42);
  galleyGroup.rotation.y = -0.22;

  const galleyBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.35, 4.6), rustIronMat);
  galleyBase.castShadow = true;
  galleyBase.receiveShadow = true;
  galleyGroup.add(galleyBase);

  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(3.48, 0.22, 4.88), woodCounterMat);
  counterTop.position.y = 0.76;
  counterTop.receiveShadow = true;
  galleyGroup.add(counterTop);

  // Brass tea kettle & copper galley pipes on the counter
  const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), brassFixtureMat);
  kettle.scale.set(1, 0.8, 1);
  kettle.position.set(-0.65, 1.15, 1.15);
  galleyGroup.add(kettle);

  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 2.4, 10), brassFixtureMat);
  pipe.position.set(1.25, 1.65, -1.6);
  galleyGroup.add(pipe);

  const galleyWarmLight = new THREE.PointLight('#ffaa4c', 3.2, 18, 1.4);
  galleyWarmLight.position.set(-0.3, 2.3, 0.2);
  galleyWarmLight.visible = extraPointLights;
  galleyWarmLight.userData.isSecondaryLight = true;
  galleyGroup.add(galleyWarmLight);

  group.add(galleyGroup);

  // Architectural corridor accent sconces illuminating the rusted ribs, anchor chain, and portholes
  const portWarmSconce = new THREE.PointLight('#e89e4e', 2.2, 18, 1.45);
  portWarmSconce.position.set(-9.6, 2.4, -18);
  portWarmSconce.visible = extraPointLights;
  portWarmSconce.userData.isSecondaryLight = true;
  group.add(portWarmSconce);

  const starboardCyanSconce = new THREE.PointLight('#47bdd9', 2.4, 20, 1.4);
  starboardCyanSconce.position.set(9.2, 2.0, -26);
  starboardCyanSconce.visible = extraPointLights;
  starboardCyanSconce.userData.isSecondaryLight = true;
  group.add(starboardCyanSconce);

  return group;
}

export function createWhaleSilhouetteRig(lowQuality = false): THREE.Group {
  const group = new THREE.Group();
  const whaleMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0x164660,
        emissive: new THREE.Color('#144a63'),
        emissiveIntensity: 0.42,
        roughness: 0.48,
        metalness: 0.06,
        transparent: true,
        opacity: 0.9,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x164660,
        emissive: new THREE.Color('#144a63'),
        emissiveIntensity: 0.42,
        roughness: 0.42,
        metalness: 0.06,
        clearcoat: 0.45,
        transparent: true,
        opacity: 0.9,
      });

  // Streamlined baleen whale torso sculpted via LatheGeometry along Z
  const whalePoints: THREE.Vector2[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 = nose (+Z), 1 = tail stock (-Z)
    const r = Math.sin(Math.pow(t, 0.62) * Math.PI) * (2.65 - 1.55 * t);
    const z = (0.48 - t) * 18.5;
    whalePoints.push(new THREE.Vector2(Math.max(0.05, r), z));
  }
  const bodyGeo = new THREE.LatheGeometry(whalePoints, 24);
  bodyGeo.rotateX(Math.PI / 2);
  bodyGeo.scale(0.95, 0.84, 1.0);
  const body = new THREE.Mesh(bodyGeo, whaleMat);
  group.add(body);

  // Dorsal ridge fin
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(0, 0);
  dorsalShape.quadraticCurveTo(-0.3, 1.4, -1.5, 1.1);
  dorsalShape.quadraticCurveTo(-2.0, 0.4, -2.3, 0);
  dorsalShape.closePath();
  const dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 2,
  });
  dorsalGeo.rotateY(Math.PI / 2);
  const dorsal = new THREE.Mesh(dorsalGeo, whaleMat);
  dorsal.position.set(0.09, 1.35, -3.2);
  group.add(dorsal);

  // Swept wing-like pectoral flippers
  const pecShape = new THREE.Shape();
  pecShape.moveTo(0, 0);
  pecShape.quadraticCurveTo(1.8, 0.45, 5.4, -1.6);
  pecShape.quadraticCurveTo(3.4, -2.15, 0.2, -1.4);
  pecShape.closePath();
  const pecGeo = new THREE.ExtrudeGeometry(pecShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  pecGeo.rotateX(Math.PI / 2);

  [-1, 1].forEach((side) => {
    const fin = new THREE.Mesh(pecGeo, whaleMat);
    fin.position.set(side * 1.7, -0.55, 2.5);
    if (side < 0) fin.scale.x = -1;
    fin.rotation.z = side * -0.18;
    group.add(fin);
  });

  // Crescent notched tail fluke
  const flukeShape = new THREE.Shape();
  flukeShape.moveTo(0, 0.6);
  flukeShape.quadraticCurveTo(2.4, 0.3, 3.6, -1.1);
  flukeShape.quadraticCurveTo(1.4, -0.6, 0, -0.2);
  flukeShape.quadraticCurveTo(-1.4, -0.6, -3.6, -1.1);
  flukeShape.quadraticCurveTo(-2.4, 0.3, 0, 0.6);
  const flukeGeo = new THREE.ExtrudeGeometry(flukeShape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  flukeGeo.rotateX(Math.PI / 2);
  const fluke = new THREE.Mesh(flukeGeo, whaleMat);
  fluke.position.set(0, 0.12, -9.2);
  group.add(fluke);

  // Subtle bioluminescent teal flank spots for atmospheric silhouette depth
  const bioMat = new THREE.MeshStandardMaterial({
    color: 0x4ce8dc,
    emissive: new THREE.Color('#24d4c8'),
    emissiveIntensity: 1.1,
    roughness: 0.3,
  });
  [-1, 1].forEach((side) => {
    const eyeGlow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), bioMat);
    eyeGlow.position.set(side * 1.42, 0.1, 5.4);
    group.add(eyeGlow);
  });

  return group;
}

// --- Chapter 3: «Мёртвый шёпот» (Kelp Forest & Hermit Crab Outpost) ---

export interface HermitCrabSquadRig {
  group: THREE.Group;
  claws: THREE.Mesh[];
  beaconLight: THREE.PointLight;
}

export function createHermitCrabSquadRig(extraPointLights = true): HermitCrabSquadRig {
  const group = new THREE.Group();
  const claws: THREE.Mesh[] = [];

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xd96b4e,
    roughness: 0.55,
    metalness: 0.08,
    emissive: new THREE.Color('#471910'),
    emissiveIntensity: 0.25,
  });
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf28c5c,
    roughness: 0.45,
    metalness: 0.05,
  });
  const helmetGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffb38a,
    emissive: new THREE.Color('#3de8c4'),
    emissiveIntensity: 0.55,
    roughness: 0.38,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x0b151a,
    emissive: new THREE.Color('#fff2a6'),
    emissiveIntensity: 0.45,
    roughness: 0.12,
  });

  // Mossy outpost cairn mound rooted firmly into the seabed beneath the hermit crab guards
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1a3b34,
    roughness: 0.9,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.35, 1.9, 9), baseMat);
  base.position.y = -1.2;
  group.add(base);

  const crabOffsets = [
    { x: 0, y: 0.0, z: 0.2, scale: 1.05, ry: 0.1 },
    { x: -0.95, y: -0.18, z: -0.35, scale: 0.78, ry: 0.45 },
    { x: 0.95, y: -0.15, z: -0.3, scale: 0.82, ry: -0.4 },
  ];

  for (const cfg of crabOffsets) {
    const crab = new THREE.Group();
    crab.position.set(cfg.x, cfg.y, cfg.z);
    crab.rotation.y = cfg.ry;
    crab.scale.setScalar(cfg.scale);

    // Spiraled coral shell helmet
    const shell = new THREE.Mesh(new THREE.ConeGeometry(0.54, 1.15, 10), shellMat);
    shell.rotation.x = -0.58;
    shell.position.set(0, 0.22, -0.22);
    crab.add(shell);

    const crest = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.1, 6, 12), helmetGlowMat);
    crest.rotation.x = Math.PI * 0.32;
    crest.position.set(0, 0.3, -0.02);
    crab.add(crest);

    // Crab thorax & eyes
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), bodyMat);
    head.position.set(0, 0.05, 0.28);
    crab.add(head);

    [-0.14, 0.14].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), eyeMat);
      eye.position.set(ex, 0.28, 0.48);
      crab.add(eye);
    });

    // Raised guard pincer claws
    [-1, 1].forEach((side) => {
      const claw = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), bodyMat);
      claw.scale.set(1.25, 0.78, 1.4);
      claw.position.set(side * 0.44, 0.1, 0.45);
      crab.add(claw);
      claws.push(claw);
    });

    group.add(crab);
  }

  const beaconLight = new THREE.PointLight('#3ae6c3', 1.9, 13, 1.5);
  beaconLight.position.set(0, 0.9, 0.4);
  beaconLight.visible = extraPointLights;
  beaconLight.userData.isSecondaryLight = true;
  group.add(beaconLight);

  return { group, claws, beaconLight };
}

export interface GlafiraTurtleRig {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  flippers: THREE.Mesh[];
}

export function createGlafiraTurtleRig(): GlafiraTurtleRig {
  const group = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const flippers: THREE.Mesh[] = [];

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x3b614b,
    roughness: 0.56,
    metalness: 0.06,
    emissive: new THREE.Color('#133329'),
    emissiveIntensity: 0.28,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x769469,
    roughness: 0.62,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x5c8062,
    roughness: 0.58,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x101820,
    emissive: new THREE.Color('#ffe094'),
    emissiveIntensity: 0.4,
    roughness: 0.15,
  });

  // Domed carapace
  const carapace = new THREE.Mesh(new THREE.SphereGeometry(1.15, 16, 12), shellMat);
  carapace.scale.set(0.95, 0.46, 1.28);
  carapace.castShadow = true;
  bodyGroup.add(carapace);

  // Scute border ring
  const scuteRim = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.13, 8, 20), rimMat);
  scuteRim.rotation.x = Math.PI / 2;
  scuteRim.scale.set(0.96, 1.25, 0.72);
  scuteRim.position.y = -0.08;
  bodyGroup.add(scuteRim);

  // Head & gentle eyes
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), skinMat);
  head.scale.set(0.9, 0.78, 1.25);
  head.position.set(0, 0.05, 1.48);
  bodyGroup.add(head);

  [-0.22, 0.22].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
    eye.position.set(ex, 0.16, 1.72);
    bodyGroup.add(eye);
  });

  // Swept swimming flippers
  const flipGeo = new THREE.BoxGeometry(1.25, 0.11, 0.45);
  [-1, 1].forEach((side) => {
    const front = new THREE.Mesh(flipGeo, skinMat);
    front.position.set(side * 1.15, -0.05, 0.55);
    front.rotation.y = side * -0.48;
    bodyGroup.add(front);
    flippers.push(front);

    const rear = new THREE.Mesh(flipGeo, skinMat);
    rear.scale.set(0.55, 0.9, 0.75);
    rear.position.set(side * 0.78, -0.1, -1.05);
    rear.rotation.y = side * -0.82;
    bodyGroup.add(rear);
    flippers.push(rear);
  });

  group.add(bodyGroup);
  return { group, bodyGroup, flippers };
}

export function createKelpShelterRig(): THREE.Group {
  const group = new THREE.Group();

  const rootMat = new THREE.MeshStandardMaterial({
    color: 0x1c4a3e,
    roughness: 0.78,
    metalness: 0.03,
    emissive: new THREE.Color('#0c2b24'),
    emissiveIntensity: 0.22,
  });
  const sporeMat = new THREE.MeshStandardMaterial({
    color: 0x7effdb,
    emissive: new THREE.Color('#2ce8b5'),
    emissiveIntensity: 1.5,
    roughness: 0.25,
  });

  // Ring of arching kelp-root ribs creating a hollow hideout canopy
  const ribCount = 6;
  for (let i = 0; i < ribCount; i++) {
    const ang = (i / ribCount) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(ang) * 2.3, -1.0, Math.sin(ang) * 2.3),
      new THREE.Vector3(Math.cos(ang) * 2.0, 0.85, Math.sin(ang) * 2.0),
      new THREE.Vector3(Math.cos(ang + 0.35) * 0.45, 2.15, Math.sin(ang + 0.35) * 0.45),
    ]);
    const rib = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.2, 7, false), rootMat);
    group.add(rib);

    // Glowing sanctuary spore bulb inside the arch
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), sporeMat);
    bulb.position.set(Math.cos(ang) * 1.45, 0.95, Math.sin(ang) * 1.45);
    group.add(bulb);
  }

  return group;
}

export interface KelpDebrisBarricadeRig {
  group: THREE.Group;
  doorLeft: THREE.Group;
  doorRight: THREE.Group;
  leverGroup: THREE.Group;
  leverMat: THREE.MeshStandardMaterial;
  leverLight: THREE.PointLight;
}

export function createKelpDebrisBarricadeRig(
  rustedTex: PBRSurfaceTextures,
  woodTex: PBRSurfaceTextures,
  extraPointLights = true,
): KelpDebrisBarricadeRig {
  const group = new THREE.Group();

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x3b4e54,
    map: rustedTex.map,
    normalMap: rustedTex.normalMap,
    roughnessMap: rustedTex.roughnessMap,
    roughness: 0.78,
    metalness: 0.45,
  });
  const timberMat = new THREE.MeshStandardMaterial({
    color: 0x4f4438,
    map: woodTex.map,
    normalMap: woodTex.normalMap,
    roughness: 0.86,
  });
  const kelpVineMat = new THREE.MeshStandardMaterial({
    color: 0x1d5e4c,
    roughness: 0.72,
    emissive: new THREE.Color('#0c3329'),
    emissiveIntensity: 0.25,
  });

  // Organic mossy canyon boulders flanking the rubble barricade (instead of flat boxy walls)
  const rockFlankMat = new THREE.MeshStandardMaterial({
    color: 0x1c3d36,
    roughness: 0.92,
    metalness: 0.04,
  });
  [-8.5, 8.5].forEach((px, idx) => {
    const lowerRock = new THREE.Mesh(new THREE.DodecahedronGeometry(4.6, 1), rockFlankMat);
    lowerRock.scale.set(1.35, 1.15, 0.72);
    lowerRock.position.set(px, -0.4, 0);
    lowerRock.rotation.set(0.2 * idx, 0.6 * idx, 0.15);
    lowerRock.receiveShadow = true;
    group.add(lowerRock);

    const upperRock = new THREE.Mesh(new THREE.DodecahedronGeometry(3.4, 1), rockFlankMat);
    upperRock.scale.set(1.25, 1.05, 0.68);
    upperRock.position.set(px + (idx === 0 ? -0.9 : 0.9), 4.0, -0.2);
    upperRock.rotation.set(-0.3, 0.4, -0.2);
    group.add(upperRock);
  });

  // Slanted rusted crane boom arm & glowing guide beacon overhead
  const craneBoom = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.55, 0.65), ironMat);
  craneBoom.position.set(1.2, 6.2, 0.1);
  craneBoom.rotation.z = 0.14;
  group.add(craneBoom);

  const counterweight = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 1.6, 8), ironMat);
  counterweight.position.set(-5.8, 5.1, 0.1);
  group.add(counterweight);

  const craneBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 10, 8),
    new THREE.MeshStandardMaterial({
      color: 0x7effdb,
      emissive: new THREE.Color('#30e8b8'),
      emissiveIntensity: 1.8,
      roughness: 0.25,
    }),
  );
  craneBeacon.position.set(0, 6.0, 0.45);
  group.add(craneBeacon);

  // Movable rubble & sunken crab-pot doors blocking the central gap
  const doorLeft = new THREE.Group();
  const doorRight = new THREE.Group();

  const buildDoorHalf = (target: THREE.Group, sign: number) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 8.2, 1.3), timberMat);
    frame.position.set(0, 1.5, 0);
    target.add(frame);

    for (let k = -1; k <= 1; k++) {
      const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(1.35, 0), ironMat);
      boulder.position.set(k * 1.15, -0.3 + Math.abs(k) * 1.35, sign * 0.25);
      boulder.rotation.set(k * 0.5, k * 0.8, 0.3);
      target.add(boulder);

      const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 6.2, 6), kelpVineMat);
      vine.position.set(k * 1.4, 1.4, 0.75);
      vine.rotation.z = k * 0.22;
      target.add(vine);
    }
  };

  buildDoorHalf(doorLeft, -1);
  buildDoorHalf(doorRight, 1);
  doorLeft.position.set(-2.55, 0, 0);
  doorRight.position.set(2.55, 0, 0);
  group.add(doorLeft, doorRight);

  // Interactive Crab Crane Winch Pedestal at front-right (z = +2.5 local -> world -59.5)
  const leverGroup = new THREE.Group();
  leverGroup.position.set(3.6, -1.6, 2.5);

  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, 1.5, 10), ironMat);
  stand.position.y = 0.75;
  leverGroup.add(stand);

  const leverMat = new THREE.MeshStandardMaterial({
    color: 0x3bf0c2,
    emissive: new THREE.Color('#28e8b6'),
    emissiveIntensity: 1.9,
    roughness: 0.24,
  });
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.11, 8, 18), leverMat);
  wheel.position.set(0, 1.72, 0.16);
  leverGroup.add(wheel);

  const leverLight = new THREE.PointLight('#2ee8b8', 2.6, 13, 1.4);
  leverLight.position.set(0, 1.85, 0.4);
  leverLight.visible = extraPointLights;
  leverLight.userData.isSecondaryLight = true;
  leverGroup.add(leverLight);

  group.add(leverGroup);

  return { group, doorLeft, doorRight, leverGroup, leverMat, leverLight };
}

/**
 * Organic Chapter 3 pickup: a coiled calcified Luminous Nautilus / Sea-Amber Conch Shell
 * cradling a bioluminescent sea-pearl and delicate sea-moss blades (zero geometric shards).
 */
export function createDebrisScrapRig(
  lowQuality = false,
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const shellMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xebd7b7,
        emissive: new THREE.Color('#2a4542'),
        emissiveIntensity: 0.25,
        roughness: 0.36,
        metalness: 0.04,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xebd7b7,
        emissive: new THREE.Color('#2a4542'),
        emissiveIntensity: 0.25,
        roughness: 0.28,
        metalness: 0.04,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
        iridescence: 0.72,
        iridescenceIOR: 1.38,
      });

  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xc27b53,
    roughness: 0.46,
    metalness: 0.02,
  });

  const pearlCoreMat = new THREE.MeshStandardMaterial({
    color: 0xb8fff3,
    emissive: new THREE.Color('#34ecd2'),
    emissiveIntensity: 1.75,
    roughness: 0.16,
  });

  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x226952,
    emissive: new THREE.Color('#0f382d'),
    emissiveIntensity: 0.25,
    roughness: 0.78,
  });

  // Helical nautilus whorl built from 8 tapered organic chambers
  const whorl = new THREE.Group();
  const chamberGeo = new THREE.SphereGeometry(0.24, lowQuality ? 10 : 14, lowQuality ? 8 : 12);
  const ridgeGeo = new THREE.SphereGeometry(0.25, lowQuality ? 8 : 12, lowQuality ? 6 : 10);

  const steps = 8;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const angle = t * Math.PI * 1.75 - 0.6;
    const radius = 0.06 + t * 0.34;
    const scale = 0.28 + t * 0.85;

    const chamber = new THREE.Mesh(chamberGeo, shellMat);
    chamber.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius + 0.06,
      0,
    );
    chamber.scale.set(scale * 0.92, scale * 1.08, scale * 0.78);
    chamber.rotation.z = angle + 0.35;
    whorl.add(chamber);

    if (i > 1) {
      const ridge = new THREE.Mesh(ridgeGeo, stripeMat);
      ridge.position.copy(chamber.position);
      ridge.scale.set(scale * 0.96, scale * 0.22, scale * 0.82);
      ridge.rotation.z = angle + 0.45;
      whorl.add(ridge);
    }
  }

  // Softly glowing bioluminescent sea-pearl & anemone tendrils nestled in the shell aperture
  const pearlCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, lowQuality ? 10 : 14, lowQuality ? 8 : 12),
    pearlCoreMat,
  );
  pearlCore.position.set(0.36, -0.08, 0.12);
  whorl.add(pearlCore);

  for (let p = 0; p < 5; p++) {
    const pa = (p / 5) * Math.PI * 2;
    const tendril = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.19, 6), pearlCoreMat);
    tendril.position.set(
      0.36 + Math.cos(pa) * 0.09,
      -0.08 + Math.sin(pa) * 0.09,
      0.2,
    );
    tendril.rotation.set(Math.PI / 2 + Math.sin(pa) * 0.35, 0, Math.cos(pa) * 0.35);
    whorl.add(tendril);
  }

  // Delicate sea-moss frond blades embracing the bottom of the shell
  [-1, 1].forEach((side) => {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.42, 6), mossMat);
    blade.position.set(side * 0.24, -0.34, -0.06);
    blade.rotation.z = side * -0.45;
    blade.rotation.x = 0.22;
    whorl.add(blade);
  });

  whorl.rotation.x = -0.22;
  whorl.rotation.y = 0.35;
  group.add(whorl);

  const glow = new THREE.PointLight('#3ae8d0', 1.15, 7.5, 1.5);
  glow.position.set(0.2, 0.12, 0.28);
  glow.visible = extraPointLights;
  glow.userData.isSecondaryLight = true;
  group.add(glow);

  return group;
}

export function createMantaFallbackRig(): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x163847,
    emissive: new THREE.Color('#185e68'),
    emissiveIntensity: 0.42,
    roughness: 0.45,
    metalness: 0.06,
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 10), bodyMat);
  body.scale.set(1.2, 0.28, 1.45);
  group.add(body);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.9);
  wingShape.quadraticCurveTo(2.4, 0.5, 4.2, -0.9);
  wingShape.quadraticCurveTo(1.8, -0.9, 0, -1.1);
  wingShape.quadraticCurveTo(-1.8, -0.9, -4.2, -0.9);
  wingShape.quadraticCurveTo(-2.4, 0.5, 0, 0.9);
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.12,
    bevelEnabled: false,
  });
  wingGeo.rotateX(Math.PI / 2);
  const wings = new THREE.Mesh(wingGeo, bodyMat);
  group.add(wings);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 3.0, 6), bodyMat);
  tail.rotation.x = -Math.PI / 2;
  tail.position.z = -2.2;
  group.add(tail);

  return group;
}

// --- Chapter 4: «Кладбище левиафанов» (Leviathan Graveyard, 280–480 m) ---

export function createLeviathanSkeletonSet(lowQuality = false): THREE.Group {
  const group = new THREE.Group();

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xb7c4be,
    roughness: 0.84,
    metalness: 0.04,
    emissive: new THREE.Color('#10282b'),
    emissiveIntensity: 0.22,
  });
  const agedBoneMat = new THREE.MeshStandardMaterial({
    color: 0x7b8d8a,
    roughness: 0.9,
    metalness: 0.03,
  });
  const veinMat = new THREE.MeshStandardMaterial({
    color: 0x4ae8d8,
    emissive: new THREE.Color('#1eb5a8'),
    emissiveIntensity: 0.72,
    roughness: 0.32,
  });

  // 4 colossal arched Leviathan whale ribcages framing the bone abyss
  const ribZs = [-12, -24, -38, -52];
  for (let i = 0; i < ribZs.length; i++) {
    const z = ribZs[i];
    const span = 12.8 - i * 0.45;
    const crestY = 9.4 - i * 0.35;
    const tilt = (i % 2 === 0 ? 1 : -1) * 0.08;

    [-1, 1].forEach((side) => {
      const ribCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * span, -4.6, 0),
        new THREE.Vector3(side * (span * 0.92), 2.8, 0.3 * side),
        new THREE.Vector3(side * (span * 0.42), crestY, -0.15),
        new THREE.Vector3(side * 0.12, crestY + 0.45, 0),
      ]);
      const rib = new THREE.Mesh(
        new THREE.TubeGeometry(ribCurve, lowQuality ? 10 : 16, 0.52, lowQuality ? 6 : 8, false),
        boneMat,
      );
      rib.position.set(0, -i * 0.3, z);
      rib.rotation.z = tilt;
      rib.castShadow = !lowQuality;
      rib.receiveShadow = !lowQuality;
      group.add(rib);

      // Calcified rib knuckle & barnacle cluster at seabed anchor
      const anchor = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.15, 0),
        agedBoneMat,
      );
      anchor.position.set(side * span, -3.6 - i * 0.25, z);
      anchor.scale.set(1.2, 0.85, 1.1);
      group.add(anchor);
    });

    // Overhead dorsal vertebra joint with neural spine locking the rib pair together
    const joint = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 1.55, 8), boneMat);
    joint.rotation.x = Math.PI / 2;
    joint.rotation.y = -tilt * 0.5;
    joint.position.set(0, crestY + 0.45 - i * 0.3, z);
    group.add(joint);

    const neuralSpine = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.85, 6), agedBoneMat);
    neuralSpine.position.set(0, crestY + 1.55 - i * 0.3, z - 0.15);
    neuralSpine.rotation.x = -0.25;
    neuralSpine.rotation.z = tilt;
    group.add(neuralSpine);
  }

  // Massive sunken Sperm Whale skull & upper/lower mandible resting on the left ridge near (-6.8, floor, -43)
  const skullGroup = new THREE.Group();
  skullGroup.position.set(-7.6, -2.5, -42.5);
  skullGroup.rotation.set(0.08, 0.45, -0.14);

  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(2.85, lowQuality ? 10 : 14, lowQuality ? 8 : 12),
    boneMat,
  );
  cranium.scale.set(1.05, 0.88, 1.55);
  skullGroup.add(cranium);

  // Tapered sperm whale rostrum & lower jawbone creating a cavernous cradle
  const rostrum = new THREE.Mesh(new THREE.ConeGeometry(1.65, 6.2, 8), boneMat);
  rostrum.rotation.x = Math.PI / 2;
  rostrum.scale.set(1.1, 1.0, 0.52);
  rostrum.position.set(0, 0.45, 3.6);
  skullGroup.add(rostrum);

  const jaw = new THREE.Mesh(new THREE.ConeGeometry(1.05, 5.4, 7), agedBoneMat);
  jaw.rotation.x = Math.PI / 2 + 0.24;
  jaw.scale.set(0.85, 1.0, 0.42);
  jaw.position.set(0, -0.75, 3.2);
  skullGroup.add(jaw);

  // Subtle glowing abyssal vein tracing along the cranium ridge
  const vein = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), veinMat);
  vein.position.set(0.9, 1.15, 0.8);
  skullGroup.add(vein);

  // Partially buried spinal column vertebrae trailing behind the skull
  for (let v = 0; v < 7; v++) {
    const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.82 - v * 0.05, 0.86 - v * 0.05, 0.92, 8), agedBoneMat);
    vert.rotation.x = Math.PI / 2 + 0.06;
    vert.position.set(-v * 0.55, -0.45 - v * 0.08, -3.4 - v * 1.55);
    vert.rotation.y = v * 0.1;
    skullGroup.add(vert);
  }

  group.add(skullGroup);
  return group;
}

export function createBoneShelterRig(
  lowQuality = false,
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xaab8b3,
    roughness: 0.85,
    metalness: 0.03,
  });
  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x1c4a46,
    roughness: 0.88,
  });
  const sporeMat = new THREE.MeshStandardMaterial({
    color: 0x7effeb,
    emissive: new THREE.Color('#28e6cf'),
    emissiveIntensity: 1.5,
    roughness: 0.25,
  });

  // Calcified vertebra base ring seated flush on the abyssal floor
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.75, 0.85, 10), mossMat);
  base.position.y = -0.78;
  group.add(base);

  // Hollow whale-vertebra sanctuary ribs curving into a bone canopy
  const ribCount = 6;
  for (let i = 0; i < ribCount; i++) {
    const a = (i / ribCount) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a) * 2.25, -0.55, Math.sin(a) * 2.25),
      new THREE.Vector3(Math.cos(a) * 2.38, 1.25, Math.sin(a) * 2.38),
      new THREE.Vector3(Math.cos(a) * 0.95, 2.55, Math.sin(a) * 0.95),
    ]);
    const boneArch = new THREE.Mesh(
      new THREE.TubeGeometry(curve, lowQuality ? 8 : 11, 0.28, 7, false),
      boneMat,
    );
    boneArch.castShadow = !lowQuality;
    boneArch.receiveShadow = !lowQuality;
    group.add(boneArch);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), sporeMat);
    bulb.position.set(Math.cos(a) * 1.4, 1.35, Math.sin(a) * 1.4);
    group.add(bulb);
  }

  const safeGlow = new THREE.PointLight('#2ee6d0', 0.85, 8.5, 1.6);
  safeGlow.position.set(0, 0.8, 0);
  safeGlow.visible = extraPointLights;
  safeGlow.userData.isSecondaryLight = true;
  group.add(safeGlow);

  return group;
}

export interface CriticCrabsRig {
  group: THREE.Group;
  claws: THREE.Mesh[];
  beaconLight: THREE.PointLight;
}

export function createCriticCrabsRig(extraPointLights = true): CriticCrabsRig {
  const group = new THREE.Group();
  const claws: THREE.Mesh[] = [];

  const perchMat = new THREE.MeshStandardMaterial({
    color: 0x9aa8a4,
    roughness: 0.86,
  });
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x576780,
    roughness: 0.48,
    metalness: 0.16,
    emissive: new THREE.Color('#132236'),
    emissiveIntensity: 0.25,
  });
  const crabMat = new THREE.MeshStandardMaterial({
    color: 0xd97352,
    roughness: 0.46,
    metalness: 0.06,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe8c468,
    roughness: 0.26,
    metalness: 0.82,
    emissive: new THREE.Color('#664810'),
    emissiveIntensity: 0.35,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x0b151a,
    emissive: new THREE.Color('#a6fff4'),
    emissiveIntensity: 0.6,
    roughness: 0.12,
  });

  // Fossilized whale vertebra lectern platform
  const lectern = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.25, 1.9, 10), perchMat);
  lectern.position.y = -1.2;
  group.add(lectern);

  const pairConfigs = [
    { x: -0.58, y: 0.05, z: 0.12, scale: 1.02, ry: 0.28 },
    { x: 0.65, y: -0.08, z: -0.05, scale: 0.94, ry: -0.32 },
  ];

  for (let idx = 0; idx < pairConfigs.length; idx++) {
    const cfg = pairConfigs[idx];
    const crab = new THREE.Group();
    crab.position.set(cfg.x, cfg.y, cfg.z);
    crab.rotation.y = cfg.ry;
    crab.scale.setScalar(cfg.scale);

    // Ornate calcified conch cap
    const shell = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.02, 10), shellMat);
    shell.rotation.x = -0.52;
    shell.position.set(0, 0.22, -0.2);
    crab.add(shell);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), crabMat);
    head.position.set(0, 0.05, 0.26);
    crab.add(head);

    [-0.14, 0.14].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), eyeMat);
      eye.position.set(ex, 0.26, 0.48);
      crab.add(eye);
    });

    // Brass monocle on left Critic Crab & brass notepad/spyglass on right
    if (idx === 0) {
      const monocle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.024, 6, 14), brassMat);
      monocle.position.set(0.14, 0.26, 0.55);
      crab.add(monocle);
    } else {
      const spyglass = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.42, 8), brassMat);
      spyglass.rotation.x = Math.PI / 2.2;
      spyglass.position.set(-0.24, 0.18, 0.56);
      crab.add(spyglass);
    }

    [-1, 1].forEach((side) => {
      const claw = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), crabMat);
      claw.scale.set(1.22, 0.78, 1.42);
      claw.position.set(side * 0.44, 0.12, 0.45);
      crab.add(claw);
      claws.push(claw);
    });

    group.add(crab);
  }

  const beaconLight = new THREE.PointLight('#45f0df', 2.1, 14, 1.45);
  beaconLight.position.set(0, 0.95, 0.5);
  beaconLight.visible = extraPointLights;
  beaconLight.userData.isSecondaryLight = true;
  group.add(beaconLight);

  return { group, claws, beaconLight };
}

export function createWhaleContainerRig(
  lowQuality = false,
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const cradleBoneMat = new THREE.MeshStandardMaterial({
    color: 0xb6c4bd,
    roughness: 0.76,
    metalness: 0.05,
  });
  const glassMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0x8efcf0,
        emissive: new THREE.Color('#28d8c8'),
        emissiveIntensity: 0.55,
        roughness: 0.2,
        transparent: true,
        opacity: 0.62,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x9efcf2,
        emissive: new THREE.Color('#28d8c8'),
        emissiveIntensity: 0.42,
        roughness: 0.12,
        metalness: 0.04,
        clearcoat: 0.9,
        iridescence: 0.75,
        transparent: true,
        opacity: 0.68,
      });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xd8fffb,
    emissive: new THREE.Color('#3cf5e2'),
    emissiveIntensity: 2.2,
    roughness: 0.18,
  });

  // Sculpted organic bone-and-brass resonance capsule
  const vial = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.56, 6, 12), glassMat);
  group.add(vial);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), coreMat);
  core.scale.set(0.95, 1.35, 0.95);
  group.add(core);

  // Ribbed bone cradle ribs hugging the bio-quartz resonance capsule
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.85, 7), cradleBoneMat);
    rib.position.set(Math.cos(a) * 0.34, 0, Math.sin(a) * 0.34);
    rib.rotation.z = Math.cos(a) * 0.16;
    rib.rotation.x = Math.sin(a) * -0.16;
    group.add(rib);
  }

  const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.16, 12), cradleBoneMat);
  capTop.position.y = 0.46;
  group.add(capTop);

  const capBot = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.16, 12), cradleBoneMat);
  capBot.position.y = -0.46;
  group.add(capBot);

  const light = new THREE.PointLight('#45f5e6', 2.4, 14, 1.4);
  light.position.set(0, 0.3, 0.2);
  light.visible = extraPointLights;
  light.userData.isSecondaryLight = true;
  group.add(light);

  return group;
}

export interface CharybdisGateRig {
  group: THREE.Group;
  doorLeft: THREE.Group;
  doorRight: THREE.Group;
  leverGroup: THREE.Group;
  leverMat: THREE.MeshStandardMaterial;
  leverLight: THREE.PointLight;
}

export function createCharybdisGateRig(
  rustedTex: PBRSurfaceTextures,
  woodTex: PBRSurfaceTextures,
  extraPointLights = true,
): CharybdisGateRig {
  const group = new THREE.Group();

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x32424b,
    map: rustedTex.map,
    normalMap: rustedTex.normalMap,
    roughnessMap: rustedTex.roughnessMap,
    roughness: 0.78,
    metalness: 0.48,
  });
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0x9aa8a3,
    roughness: 0.84,
    metalness: 0.04,
  });
  const timberMat = new THREE.MeshStandardMaterial({
    color: 0x453d34,
    map: woodTex.map,
    normalMap: woodTex.normalMap,
    roughness: 0.86,
  });

  // Twin flanking whalebone & basalt canyon buttresses
  [-8.6, 8.6].forEach((px, idx) => {
    const pillar = new THREE.Mesh(new THREE.DodecahedronGeometry(4.7, 1), ironMat);
    pillar.scale.set(1.3, 1.25, 0.75);
    pillar.position.set(px, -0.2, 0);
    pillar.rotation.set(0.18 * idx, 0.55 * idx, 0.1);
    group.add(pillar);

    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.9, 7.6, 8), boneMat);
    tusk.position.set(px + (idx === 0 ? 1.8 : -1.8), 3.6, 0.25);
    tusk.rotation.z = idx === 0 ? -0.45 : 0.45;
    group.add(tusk);
  });

  // Overhead Charybdis Crane beam & glowing hydrothermal guide lantern
  const beam = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.65, 0.85), ironMat);
  beam.position.set(0, 6.4, 0.1);
  beam.rotation.z = -0.08;
  group.add(beam);

  const lantern = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 10, 8),
    new THREE.MeshStandardMaterial({
      color: 0x9efff5,
      emissive: new THREE.Color('#2ef0dc'),
      emissiveIntensity: 1.9,
      roughness: 0.22,
    }),
  );
  lantern.position.set(0, 6.1, 0.55);
  group.add(lantern);

  // Heavy bone-and-iron sluice doors blocking z = -62
  const doorLeft = new THREE.Group();
  const doorRight = new THREE.Group();

  const buildGateHalf = (target: THREE.Group, sign: number) => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(5.2, 8.4, 1.2), timberMat);
    slab.position.set(0, 1.6, 0);
    target.add(slab);

    for (let k = -1; k <= 1; k++) {
      const whaleRibBar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 7.6, 7), boneMat);
      whaleRibBar.position.set(k * 1.45, 1.6, sign * 0.55);
      whaleRibBar.rotation.z = k * 0.14;
      target.add(whaleRibBar);
    }
  };

  buildGateHalf(doorLeft, -1);
  buildGateHalf(doorRight, 1);
  doorLeft.position.set(-2.55, 0, 0);
  doorRight.position.set(2.55, 0, 0);
  group.add(doorLeft, doorRight);

  // Interactive Charybdis Crane Lever Pedestal at front-right (4.2, floor, -59.2 -> local +2.8)
  const leverGroup = new THREE.Group();
  leverGroup.position.set(4.2, -1.6, 2.8);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, 1.5, 10), ironMat);
  pedestal.position.y = 0.75;
  leverGroup.add(pedestal);

  const leverMat = new THREE.MeshStandardMaterial({
    color: 0x62fff0,
    emissive: new THREE.Color('#2ef0dc'),
    emissiveIntensity: 1.9,
    roughness: 0.22,
  });
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.11, 8, 18), leverMat);
  wheel.position.set(0, 1.72, 0.16);
  leverGroup.add(wheel);

  const leverLight = new THREE.PointLight('#2ef0dc', 2.6, 13, 1.4);
  leverLight.position.set(0, 1.85, 0.42);
  leverLight.visible = extraPointLights;
  leverLight.userData.isSecondaryLight = true;
  leverGroup.add(leverLight);

  group.add(leverGroup);

  return { group, doorLeft, doorRight, leverGroup, leverMat, leverLight };
}
