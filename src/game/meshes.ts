import * as THREE from 'three';

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

  // Internal turquoise Зов PointLight placed slightly ahead so her rear silhouette stays readable
  const pointLight = new THREE.PointLight('#26e8d4', 2.2, 16, 1.4);
  pointLight.position.set(0, 0.25, 1.15);
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

export function createEggMesh(): THREE.Group {
  const group = new THREE.Group();

  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xbafff7,
    emissive: new THREE.Color('#26e8d4'),
    emissiveIntensity: 2.8,
    roughness: 0.2,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), coreMat);
  core.scale.set(0.9, 1.18, 0.9);
  group.add(core);

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x73fff0,
    roughness: 0.12,
    metalness: 0.05,
    transparent: true,
    opacity: 0.45,
    clearcoat: 1.0,
  });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), shellMat);
  shell.scale.set(0.92, 1.18, 0.92);
  group.add(shell);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x26e8d4,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.64, 32), ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const light = new THREE.PointLight('#26e8d4', 1.8, 12, 1.5);
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
export function createMildredRig(): MildredRig {
  const group = new THREE.Group();

  const bellMat = new THREE.MeshPhysicalMaterial({
    color: 0xc299ff,
    emissive: new THREE.Color('#5a2d9c'),
    emissiveIntensity: 0.65,
    roughness: 0.2,
    metalness: 0.05,
    transparent: true,
    opacity: 0.72,
    clearcoat: 0.9,
    side: THREE.DoubleSide,
  });

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
    color: 0xffd2f5,
    emissive: new THREE.Color('#e37dff'),
    emissiveIntensity: 1.4,
    roughness: 0.35,
  });
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), coreMat);
  nucleus.position.y = 0.28;
  group.add(nucleus);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.09, 10, 28),
    coreMat,
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.22;
  group.add(rim);

  // Cute granny spectacles on the front of the bell
  const specMat = new THREE.MeshStandardMaterial({
    color: 0xf4d27a,
    metalness: 0.85,
    roughness: 0.25,
  });
  [-0.3, 0.3].forEach((x) => {
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.03, 8, 18),
      specMat,
    );
    frame.position.set(x, 0.22, 1.15);
    group.add(frame);
  });

  // 5 waving tentacles
  const tentacles: THREE.Mesh[] = [];
  const tentMat = new THREE.MeshStandardMaterial({
    color: 0xb084f5,
    emissive: new THREE.Color('#6633aa'),
    emissiveIntensity: 0.75,
    roughness: 0.5,
    transparent: true,
    opacity: 0.82,
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.12, -0.7, 0.08),
      new THREE.Vector3(-0.1, -1.45, -0.06),
      new THREE.Vector3(0.08, -2.2, 0.05),
    ]);
    const tGeo = new THREE.TubeGeometry(curve, 14, 0.06, 6, false);
    const tMesh = new THREE.Mesh(tGeo, tentMat);
    tMesh.position.set(Math.cos(angle) * 0.55, -0.15, Math.sin(angle) * 0.55);
    group.add(tMesh);
    tentacles.push(tMesh);
  }

  const light = new THREE.PointLight('#c688ff', 1.4, 11, 1.5);
  light.position.y = 0.2;
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

export function createCoralShelterRig(): THREE.Group {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x3b2a4a,
    roughness: 0.85,
    metalness: 0.05,
  });
  const branchMat = new THREE.MeshStandardMaterial({
    color: 0xe86f8b,
    emissive: new THREE.Color('#8f2447'),
    emissiveIntensity: 0.55,
    roughness: 0.5,
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
    group.add(rib);
  }

  // Soft interior refuge glow
  const safeGlow = new THREE.PointLight('#ff9ebb', 1.4, 8, 1.6);
  safeGlow.position.set(0, 0.6, 0);
  group.add(safeGlow);

  return group;
}

export function createPearlPickupRig(): THREE.Group {
  const group = new THREE.Group();

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x5c6978,
    roughness: 0.72,
    metalness: 0.1,
  });
  const lowerShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 14, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    shellMat,
  );
  lowerShell.scale.set(1.2, 0.55, 1.0);
  lowerShell.position.y = -0.25;
  group.add(lowerShell);

  const upperShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
    shellMat,
  );
  upperShell.scale.set(1.2, 0.55, 1.0);
  upperShell.position.set(0, -0.2, -0.2);
  upperShell.rotation.x = -0.85;
  group.add(upperShell);

  const pearlMat = new THREE.MeshPhysicalMaterial({
    color: 0xfff8e7,
    emissive: new THREE.Color('#f7df9c'),
    emissiveIntensity: 1.4,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
    iridescence: 1.0,
  });
  const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 18), pearlMat);
  pearl.position.y = 0.06;
  group.add(pearl);

  const pLight = new THREE.PointLight('#ffe8a6', 1.1, 7, 1.6);
  pLight.position.y = 0.35;
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
      uColor: { value: new THREE.Color('#6cdbff') },
      uTime: { value: 0 },
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
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vec3 viewDir = normalize(vViewPos);
        float fresnel = pow(abs(dot(vNormal, viewDir)), 1.6);
        float verticalFade = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.65, 1.0, vUv.y));
        float shimmer = 0.78 + 0.22 * sin(uTime * 0.9 + vUv.x * 12.0);
        float alpha = fresnel * verticalFade * shimmer * 0.14;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const beamConfigs = [
    { x: -4, y: 8, z: -2, rTop: 1.5, rBot: 6.5, h: 26, rx: 0.14, rz: -0.1 },
    { x: 5, y: 9, z: -18, rTop: 2.0, rBot: 7.5, h: 28, rx: 0.12, rz: 0.08 },
    { x: -3, y: 8, z: -38, rTop: 1.8, rBot: 7.0, h: 26, rx: 0.1, rz: -0.12 },
    { x: 2, y: 7, z: -60, rTop: 2.2, rBot: 8.2, h: 28, rx: 0.15, rz: 0.05 },
  ];

  for (const cfg of beamConfigs) {
    const geo = new THREE.CylinderGeometry(cfg.rTop, cfg.rBot, cfg.h, 20, 1, true);
    const mesh = new THREE.Mesh(geo, beamMat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.rotation.set(cfg.rx, 0, cfg.rz);
    group.add(mesh);
  }

  return group;
}
