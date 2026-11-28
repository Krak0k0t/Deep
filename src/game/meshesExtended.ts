import * as THREE from 'three';
import { PBRSurfaceTextures } from './textures';

/**
 * Soft seabed contact shadow disc placed under Mama Fish for stronger spatial grounding.
 */
export function createContactShadowDisc(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(2, 12, 18, 0.56)');
    grad.addColorStop(0.55, 'rgba(3, 18, 28, 0.24)');
    grad.addColorStop(1, 'rgba(3, 18, 28, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const geo = new THREE.CircleGeometry(1.15, 16);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    opacity: 0.75,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  return mesh;
}

export interface BlackSmokerVentRig {
  group: THREE.Group;
  rimMat: THREE.MeshStandardMaterial;
  plumeRings: THREE.Mesh[];
  glowLight: THREE.PointLight;
}

/**
 * Chapter 5: Black Smoker hydrothermal chimney with warning/eruption magma rim and rising plume rings.
 */
export function createBlackSmokerVentRig(
  lowQuality = false,
  extraPointLights = true,
): BlackSmokerVentRig {
  const group = new THREE.Group();

  const basaltMat = new THREE.MeshStandardMaterial({
    color: 0x261f24,
    roughness: 0.92,
    metalness: 0.14,
  });
  const stack = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 2.2, 4.6, lowQuality ? 7 : 11, 2),
    basaltMat,
  );
  stack.position.y = 2.0;
  group.add(stack);

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xff7b3b,
    emissive: new THREE.Color('#ff541f'),
    emissiveIntensity: 0.8,
    roughness: 0.35,
  });
  const craterRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.22, lowQuality ? 6 : 8, lowQuality ? 10 : 16),
    rimMat,
  );
  craterRim.rotation.x = Math.PI / 2;
  craterRim.position.y = 4.25;
  group.add(craterRim);

  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0xff8e47,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const plumeRings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.7 + i * 0.25, 0.08, 6, 12),
      plumeMat,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 4.8 + i * 1.4;
    group.add(ring);
    plumeRings.push(ring);
  }

  const glowLight = new THREE.PointLight('#ff6a2e', 1.9, 15, 1.45);
  glowLight.position.y = 4.6;
  glowLight.visible = extraPointLights;
  glowLight.userData.isSecondaryLight = true;
  group.add(glowLight);

  return { group, rimMat, plumeRings, glowLight };
}

export interface QueenAnglerRig {
  group: THREE.Group;
  tailPivot: THREE.Group;
  escaMat: THREE.MeshStandardMaterial;
  escaLight: THREE.PointLight;
}

/**
 * Chapter 5 & 6: Queen Anglerfish with royal luminescent crown, jaw fangs, and escort esca bulb.
 */
export function createQueenAnglerRig(
  lowQuality = false,
  extraPointLights = true,
): QueenAnglerRig {
  const group = new THREE.Group();

  const bodyMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0x4b2959,
        roughness: 0.42,
        metalness: 0.14,
        emissive: new THREE.Color('#341945'),
        emissiveIntensity: 0.85,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x4b2959,
        roughness: 0.35,
        metalness: 0.14,
        clearcoat: 0.78,
        iridescence: 0.65,
        emissive: new THREE.Color('#341945'),
        emissiveIntensity: 0.85,
      });

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, lowQuality ? 12 : 18, lowQuality ? 10 : 14),
    bodyMat,
  );
  body.scale.set(0.86, 0.96, 1.32);
  group.add(body);

  // Translucent dorsal & pectoral fins
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x6ef7eb,
    emissive: new THREE.Color('#2ce0cf'),
    emissiveIntensity: 1.05,
    transparent: true,
    opacity: 0.86,
    side: THREE.DoubleSide,
  });
  [-1, 1].forEach((side) => {
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.95, 7), finMat);
    fin.position.set(side * 0.88, -0.1, 0.1);
    fin.rotation.z = side * -1.1;
    group.add(fin);
  });

  const tailPivot = new THREE.Group();
  tailPivot.position.z = -1.45;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.05, 6), finMat);
  tail.rotation.x = Math.PI / 2;
  tail.scale.set(0.24, 1, 1);
  tail.position.z = -0.35;
  tailPivot.add(tail);
  group.add(tailPivot);

  // Royal eyes & translucent pearlescent fangs
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xbafff8,
    emissive: new THREE.Color('#47fff0'),
    emissiveIntensity: 1.1,
  });
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), eyeMat);
    eye.position.set(side * 0.52, 0.28, 0.96);
    group.add(eye);
  });

  const fangMat = new THREE.MeshStandardMaterial({
    color: 0xe6faf8,
    emissive: new THREE.Color('#388c86'),
    emissiveIntensity: 0.4,
    roughness: 0.25,
  });
  for (let i = -2; i <= 2; i++) {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 5), fangMat);
    fang.position.set(i * 0.16, -0.25, 1.32 - Math.abs(i) * 0.08);
    fang.rotation.x = -0.35;
    group.add(fang);
  }

  // Curved illicium lure stalk & glowing crown esca bulb
  const stalkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.72, 0.45),
    new THREE.Vector3(0, 1.55, 1.15),
    new THREE.Vector3(0, 1.18, 1.92),
  ]);
  const stalk = new THREE.Mesh(new THREE.TubeGeometry(stalkCurve, 10, 0.055, 6, false), bodyMat);
  group.add(stalk);

  const escaMat = new THREE.MeshStandardMaterial({
    color: 0xd9fffb,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 2.2,
    roughness: 0.15,
  });
  const escaBulb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), escaMat);
  escaBulb.position.set(0, 1.12, 1.94);
  group.add(escaBulb);

  const escaLight = new THREE.PointLight('#38f5e4', 2.4, 15, 1.4);
  escaLight.position.set(0, 1.12, 2.05);
  escaLight.visible = extraPointLights;
  escaLight.userData.isSecondaryLight = true;
  group.add(escaLight);

  return { group, tailPivot, escaMat, escaLight };
}

/**
 * Chapter 5: Deep Luminary Pearl pickup inside a volcanic obsidian calyx.
 */
export function createLurePearlPickupRig(
  lowQuality = false,
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x22202c,
    roughness: 0.4,
    metalness: 0.35,
  });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.95, 6), obsidianMat);
    petal.position.set(Math.cos(a) * 0.42, 0.15, Math.sin(a) * 0.42);
    petal.rotation.z = -Math.cos(a) * 0.55;
    petal.rotation.x = Math.sin(a) * 0.55;
    group.add(petal);
  }

  const pearlMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xfff0d4,
        emissive: new THREE.Color('#ffb74d'),
        emissiveIntensity: 1.9,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xfff4dc,
        emissive: new THREE.Color('#ffb74d'),
        emissiveIntensity: 1.8,
        clearcoat: 1.0,
        iridescence: 1.0,
        roughness: 0.08,
      });
  const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), pearlMat);
  pearl.position.y = 0.38;
  group.add(pearl);

  const light = new THREE.PointLight('#ffbe5c', 2.2, 13, 1.45);
  light.position.y = 0.65;
  light.visible = extraPointLights;
  light.userData.isSecondaryLight = true;
  group.add(light);

  return group;
}

export interface AbyssalHeartAltarRig {
  group: THREE.Group;
  ringMesh: THREE.Mesh;
  beaconLight: THREE.PointLight;
}

/**
 * Chapter 6: Abyssal Heart Altar cradling Mama Fish's Egg at the deepest point of the trench.
 */
export function createAbyssalHeartAltarRig(
  lowQuality = false,
  extraPointLights = true,
): AbyssalHeartAltarRig {
  const group = new THREE.Group();

  const basaltMat = new THREE.MeshStandardMaterial({
    color: 0x162638,
    roughness: 0.82,
    metalness: 0.18,
  });
  const dais = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 3.6, 1.35, lowQuality ? 10 : 16),
    basaltMat,
  );
  dais.position.y = 0.5;
  group.add(dais);

  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x8efffa,
    emissive: new THREE.Color('#2ef5df'),
    emissiveIntensity: 2.25,
    roughness: 0.15,
    transparent: true,
    opacity: 0.92,
    fog: false,
  });

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.75, 5), crystalMat);
    shard.position.set(Math.cos(a) * 2.55, 1.65, Math.sin(a) * 2.55);
    shard.rotation.z = Math.cos(a) * 0.28;
    shard.rotation.x = -Math.sin(a) * 0.28;
    group.add(shard);
  }

  const ringMesh = new THREE.Mesh(
    new THREE.TorusGeometry(1.7, 0.12, 8, lowQuality ? 18 : 28),
    crystalMat,
  );
  ringMesh.position.y = 2.6;
  group.add(ringMesh);

  const beaconLight = new THREE.PointLight('#2ef5df', 3.2, 22, 1.35);
  beaconLight.position.y = 3.1;
  beaconLight.visible = extraPointLights;
  beaconLight.userData.isSecondaryLight = true;
  group.add(beaconLight);

  return { group, ringMesh, beaconLight };
}

export interface UpdraftCurrentRig {
  group: THREE.Group;
  rings: THREE.Mesh[];
}

/**
 * Chapters 7 & 10: Rising thermal / sunlit updraft vortex rings propelling the Ascent swim.
 */
export function createUpdraftCurrentRig(
  radius: number,
  height: number,
  colorHex: string,
  lowQuality = false,
): UpdraftCurrentRig {
  const group = new THREE.Group();

  const colMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colorHex),
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.95, height, lowQuality ? 10 : 16, 1, true),
    colMat,
  );
  tube.position.y = height * 0.45;
  group.add(tube);

  const ringMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colorHex),
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.78, 0.08, 6, lowQuality ? 12 : 20),
      ringMat,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = (i / 3) * height;
    group.add(ring);
    rings.push(ring);
  }

  return { group, rings };
}

export interface YoungWhaleRescueRig {
  group: THREE.Group;
  whaleGroup: THREE.Group;
  cableGroup: THREE.Group;
  valveGroup: THREE.Group;
  valveMat: THREE.MeshStandardMaterial;
  light: THREE.PointLight;
}

/**
 * Chapter 7: Juvenile singing whale calf tethered beside a pressure release valve.
 */
export function createYoungWhaleRescueRig(
  lowQuality = false,
  extraPointLights = true,
): YoungWhaleRescueRig {
  const group = new THREE.Group();
  const whaleGroup = new THREE.Group();

  const skinMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0x264f73,
        roughness: 0.48,
        emissive: new THREE.Color('#0f273d'),
        emissiveIntensity: 0.35,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x264f73,
        roughness: 0.38,
        clearcoat: 0.65,
        emissive: new THREE.Color('#0f273d'),
        emissiveIntensity: 0.35,
      });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0x99e0ff,
    emissive: new THREE.Color('#2a80b8'),
    emissiveIntensity: 0.55,
    roughness: 0.4,
  });

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, lowQuality ? 12 : 18, lowQuality ? 10 : 14),
    skinMat,
  );
  body.scale.set(0.95, 0.85, 2.15);
  whaleGroup.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(1.18, 12, 10), bellyMat);
  belly.scale.set(0.85, 0.55, 1.85);
  belly.position.y = -0.38;
  whaleGroup.add(belly);

  // Side flippers & tail fluke
  [-1, 1].forEach((side) => {
    const flipper = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.45, 7), skinMat);
    flipper.position.set(side * 1.32, -0.25, 0.35);
    flipper.rotation.z = side * -1.25;
    flipper.rotation.y = side * 0.25;
    whaleGroup.add(flipper);
  });

  const fluke = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 0.85), skinMat);
  fluke.position.set(0, 0, -3.1);
  whaleGroup.add(fluke);

  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xd9f7ff,
    emissive: new THREE.Color('#5ef7e6'),
    emissiveIntensity: 0.85,
  });
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), eyeMat);
    eye.position.set(side * 0.98, 0.15, 1.65);
    whaleGroup.add(eye);
  });

  group.add(whaleGroup);

  // Tether cable
  const cableGroup = new THREE.Group();
  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x705842,
    emissive: new THREE.Color('#ff8844'),
    emissiveIntensity: 0.45,
    roughness: 0.72,
  });
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.6, 8), cableMat);
  cable.position.set(0, -1.6, 0.4);
  cable.rotation.z = 0.22;
  cableGroup.add(cable);
  group.add(cableGroup);

  // Release Valve Pedestal
  const valveGroup = new THREE.Group();
  valveGroup.position.set(2.4, -1.6, 1.2);
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 1.45, 8),
    new THREE.MeshStandardMaterial({ color: 0x394b59, roughness: 0.65, metalness: 0.45 }),
  );
  stand.position.y = 0.72;
  valveGroup.add(stand);

  const valveMat = new THREE.MeshStandardMaterial({
    color: 0x62fff0,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 1.9,
  });
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.1, 8, 16), valveMat);
  wheel.position.set(0, 1.65, 0.1);
  valveGroup.add(wheel);
  group.add(valveGroup);

  const light = new THREE.PointLight('#6ec9ff', 2.2, 16, 1.4);
  light.position.set(0, 1.5, 1.2);
  light.visible = extraPointLights;
  light.userData.isSecondaryLight = true;
  group.add(light);

  return { group, whaleGroup, cableGroup, valveGroup, valveMat, light };
}

export interface KelpSporeLanternRig {
  group: THREE.Group;
  bulbMat: THREE.MeshStandardMaterial;
  light: THREE.PointLight;
}

/**
 * Chapter 8: Bioluminescent Kelp Spore Lantern that flares up when Mama Fish emits Call.
 */
export function createKelpSporeLanternRig(extraPointLights = true): KelpSporeLanternRig {
  const group = new THREE.Group();

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x165242,
    roughness: 0.65,
  });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 2.8, 7), stemMat);
  stem.position.y = 1.4;
  group.add(stem);

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0x99ffe0,
    emissive: new THREE.Color('#38f2b8'),
    emissiveIntensity: 1.1,
    roughness: 0.25,
  });
  const mainBulb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), bulbMat);
  mainBulb.position.y = 2.95;
  group.add(mainBulb);

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const bud = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), bulbMat);
    bud.position.set(Math.cos(a) * 0.55, 2.45 + i * 0.12, Math.sin(a) * 0.55);
    group.add(bud);
  }

  const light = new THREE.PointLight('#3cf2b8', 1.5, 13, 1.5);
  light.position.y = 3.0;
  light.visible = extraPointLights;
  light.userData.isSecondaryLight = true;
  group.add(light);

  return { group, bulbMat, light };
}

export interface LinerSearchlightRig {
  group: THREE.Group;
  beamMesh: THREE.Mesh;
  beamMat: THREE.MeshBasicMaterial;
}

/**
 * Chapter 9: Sweeping emergency searchlight beacon inside the sunken liner hold.
 */
export function createLinerSearchlightRig(lowQuality = false): LinerSearchlightRig {
  const group = new THREE.Group();

  const housing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.48, 0.65, 10),
    new THREE.MeshStandardMaterial({ color: 0x3b4852, roughness: 0.45, metalness: 0.6 }),
  );
  housing.rotation.x = Math.PI / 2;
  group.add(housing);

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffaa44,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const beamMesh = new THREE.Mesh(
    new THREE.ConeGeometry(3.4, 12.5, lowQuality ? 10 : 18, 1, true),
    beamMat,
  );
  beamMesh.rotation.x = -Math.PI / 2;
  beamMesh.position.z = 6.25;
  group.add(beamMesh);

  return { group, beamMesh, beamMat };
}

export interface KeshaParrotfishRig {
  group: THREE.Group;
  tailPivot: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  crestMat: THREE.MeshStandardMaterial;
}

/**
 * Chapter 9: Vibrant Parrotfish Kesha with colorful plumage fins and loud Call amplification.
 */
export function createKeshaParrotfishRig(
  lowQuality = false,
  extraPointLights = true,
): KeshaParrotfishRig {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x16b8a8,
    emissive: new THREE.Color('#0c5c58'),
    emissiveIntensity: 0.4,
    roughness: 0.35,
  });
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, lowQuality ? 10 : 16, lowQuality ? 8 : 12),
    bodyMat,
  );
  body.scale.set(0.75, 0.92, 1.35);
  group.add(body);

  const crestMat = new THREE.MeshStandardMaterial({
    color: 0xff6b7d,
    emissive: new THREE.Color('#ff4564'),
    emissiveIntensity: 0.85,
    roughness: 0.3,
  });
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.82, 6), crestMat);
  crest.position.set(0, 0.68, 0.12);
  crest.rotation.x = -0.35;
  group.add(crest);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.42, 6),
    new THREE.MeshStandardMaterial({ color: 0xffd15c, roughness: 0.25 }),
  );
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, -0.05, 0.98);
  group.add(beak);

  const wingGeo = new THREE.ConeGeometry(0.22, 0.72, 6);
  wingGeo.scale(0.22, 1, 0.7);
  const leftWing = new THREE.Mesh(wingGeo, crestMat);
  leftWing.position.set(-0.55, 0, 0.15);
  leftWing.rotation.z = 1.25;
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, crestMat);
  rightWing.position.set(0.55, 0, 0.15);
  rightWing.rotation.z = -1.25;
  group.add(rightWing);

  const tailPivot = new THREE.Group();
  tailPivot.position.z = -0.9;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.75, 5), crestMat);
  tail.rotation.x = Math.PI / 2;
  tail.scale.set(0.22, 1, 1);
  tail.position.z = -0.25;
  tailPivot.add(tail);
  group.add(tailPivot);

  const light = new THREE.PointLight('#ff8296', 1.6, 11, 1.5);
  light.position.set(0, 0.6, 0.8);
  light.visible = extraPointLights;
  light.userData.isSecondaryLight = true;
  group.add(light);

  return { group, tailPivot, leftWing, rightWing, crestMat };
}

/**
 * Chapter 10: Sunlit Hatchling Coral Sanctuary Cradle.
 */
export function createHatchlingCoralSanctuaryRig(
  lowQuality = false,
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const coralMat = new THREE.MeshStandardMaterial({
    color: 0xff8ea6,
    emissive: new THREE.Color('#7a2240'),
    emissiveIntensity: 0.42,
    roughness: 0.45,
  });
  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.42, lowQuality ? 7 : 10, lowQuality ? 16 : 24),
    coralMat,
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.28;
  group.add(baseRing);

  const petalMat = new THREE.MeshStandardMaterial({
    color: 0x99fff4,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 1.15,
    roughness: 0.25,
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.6, 6), petalMat);
    petal.position.set(Math.cos(a) * 2.5, 1.0, Math.sin(a) * 2.5);
    petal.rotation.z = -Math.cos(a) * 0.35;
    petal.rotation.x = Math.sin(a) * 0.35;
    group.add(petal);
  }

  const sunLight = new THREE.PointLight('#8efcf0', 3.0, 22, 1.35);
  sunLight.position.y = 2.6;
  sunLight.visible = extraPointLights;
  sunLight.userData.isSecondaryLight = true;
  group.add(sunLight);

  return group;
}

export interface BabyHatchlingRig {
  group: THREE.Group;
  tailPivot: THREE.Group;
}

/**
 * Chapter 10 Finale: Tiny glowing Baby Hatchling swimming beside Mama Fish!
 */
export function createBabyHatchlingRig(): BabyHatchlingRig {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8efcf0,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), mat);
  body.scale.set(0.75, 0.9, 1.35);
  group.add(body);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x051017 });
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 6, 6), eyeMat);
    eye.position.set(side * 0.14, 0.06, 0.22);
    group.add(eye);
  });

  const tailPivot = new THREE.Group();
  tailPivot.position.z = -0.28;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 5), mat);
  tail.rotation.x = Math.PI / 2;
  tail.scale.set(0.2, 1, 1);
  tail.position.z = -0.14;
  tailPivot.add(tail);
  group.add(tailPivot);

  return { group, tailPivot };
}

export interface AbyssalGateRig {
  group: THREE.Group;
  doorLeft: THREE.Group;
  doorRight: THREE.Group;
  leverGroup: THREE.Group;
  leverMat: THREE.MeshStandardMaterial;
  leverLight: THREE.PointLight;
}

/**
 * Reusable heavy sluice / hatch barrier + glowing interactive lever wheel for Chapters 5, 7, 8, 9.
 */
export function createAbyssalGateRig(
  frameColorHex: number,
  glowHex: string,
  rustedTex: PBRSurfaceTextures,
  leverOffset: THREE.Vector3,
  extraPointLights = true,
): AbyssalGateRig {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: frameColorHex,
    map: rustedTex.map,
    normalMap: rustedTex.normalMap,
    roughness: 0.76,
    metalness: 0.42,
  });

  [-8.4, 8.4].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(5.6, 9.6, 2.2), frameMat);
    pillar.position.set(px, 1.2, 0);
    group.add(pillar);
  });

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(17.5, 1.4, 2.2), frameMat);
  lintel.position.set(0, 6.2, 0);
  group.add(lintel);

  const doorLeft = new THREE.Group();
  const doorRight = new THREE.Group();
  const doorMat = new THREE.MeshStandardMaterial({
    color: frameColorHex,
    map: rustedTex.map,
    roughness: 0.68,
    metalness: 0.52,
  });
  const stripMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(glowHex),
    emissive: new THREE.Color(glowHex),
    emissiveIntensity: 1.25,
  });

  const buildDoor = (target: THREE.Group) => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(5.3, 8.2, 0.9), doorMat);
    slab.position.set(0, 1.4, 0);
    target.add(slab);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.22, 1.05), stripMat);
    stripe.position.set(0, 2.0, 0);
    target.add(stripe);
  };

  buildDoor(doorLeft);
  buildDoor(doorRight);
  doorLeft.position.set(-2.65, 0, 0);
  doorRight.position.set(2.65, 0, 0);
  group.add(doorLeft, doorRight);

  const leverGroup = new THREE.Group();
  leverGroup.position.copy(leverOffset);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.58, 1.45, 10), frameMat);
  pedestal.position.y = 0.72;
  leverGroup.add(pedestal);

  const leverMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(glowHex),
    emissive: new THREE.Color(glowHex),
    emissiveIntensity: 1.9,
    roughness: 0.2,
  });
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.11, 8, 16), leverMat);
  wheel.position.set(0, 1.72, 0.16);
  leverGroup.add(wheel);

  const leverLight = new THREE.PointLight(glowHex, 2.5, 14, 1.4);
  leverLight.position.set(0, 1.85, 0.35);
  leverLight.visible = extraPointLights;
  leverLight.userData.isSecondaryLight = true;
  leverGroup.add(leverLight);

  group.add(leverGroup);

  return { group, doorLeft, doorRight, leverGroup, leverMat, leverLight };
}

/**
 * Collectible Abyssal Chronicle Lore Relic: golden-nacreous nautilus/crystal spiral inside a softly orbiting ring.
 */
export function createLoreRelicRig(
  tintHex = '#ffd67a',
  lowQuality = false,
  extraPointLights = true,
): THREE.Group {
  const group = new THREE.Group();

  const coreMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xffe5a3,
        emissive: new THREE.Color(tintHex),
        emissiveIntensity: 0.72,
        roughness: 0.25,
        metalness: 0.35,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xfff0c2,
        emissive: new THREE.Color(tintHex),
        emissiveIntensity: 0.68,
        roughness: 0.14,
        metalness: 0.28,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        iridescence: 0.92,
      });

  const haloMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(tintHex),
    emissive: new THREE.Color(tintHex),
    emissiveIntensity: 1.25,
    roughness: 0.22,
    metalness: 0.45,
  });

  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.42, lowQuality ? 0 : 1),
    coreMat,
  );
  crystal.scale.set(0.86, 1.32, 0.86);
  group.add(crystal);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.055, 6, lowQuality ? 16 : 26),
    haloMat,
  );
  ring.rotation.x = Math.PI * 0.38;
  group.add(ring);

  const pLight = new THREE.PointLight(tintHex, 1.45, 9, 1.45);
  pLight.position.y = 0.25;
  pLight.visible = extraPointLights;
  pLight.userData.isSecondaryLight = true;
  group.add(pLight);

  group.userData.relicHalo = ring;
  group.userData.relicCrystal = crystal;

  return group;
}

