import * as THREE from 'three';

export interface BioluminescentPortalRig {
  group: THREE.Group;
  dewOrb: THREE.Mesh;
  coreOrb: THREE.Mesh;
  sporeCaps: THREE.Mesh[];
  auraLight: THREE.PointLight;
  update: (timeSec: number, dt: number, isHovered: boolean) => void;
  dispose: () => void;
}

/**
 * Organic underwater micro-world sanctuary portal:
 * A mossy stone plinth cradling a refractive bioluminescent dew/air-pearl sphere
 * encircled by glowing deep-sea mushroom spores — zero flat sci-fi rings.
 */
export function createBioluminescentSanctuaryPortalRig(options?: {
  primaryColor?: string;
  sporeAccentColor?: string;
  scale?: number;
  isSoftwareGl?: boolean;
  lowQuality?: boolean;
  allowTransmission?: boolean;
  extraPointLights?: boolean;
}): BioluminescentPortalRig {
  const primaryHex = options?.primaryColor ?? '#26e8d4';
  const sporeHex = options?.sporeAccentColor ?? '#7efce8';
  const scale = options?.scale ?? 1.0;
  const isSoftwareGl = options?.isSoftwareGl ?? false;
  const lowQuality = options?.lowQuality ?? false;
  const allowTransmission = (options?.allowTransmission ?? !isSoftwareGl) && !isSoftwareGl && !lowQuality;
  const extraPointLights = options?.extraPointLights ?? !isSoftwareGl;

  const group = new THREE.Group();
  group.scale.setScalar(scale);

  const disposables: Array<{ dispose: () => void }> = [];

  // 1. Sculpted mossy stone sanctuary plinth
  const rockGeo = new THREE.CylinderGeometry(1.75, 2.35, 0.72, lowQuality ? 10 : 14, 2);
  const pos = rockGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const angle = Math.atan2(vz, vx);
    const n = 1 + Math.sin(angle * 5) * 0.08 + Math.cos(angle * 3 + vy * 2) * 0.06;
    pos.setXYZ(i, vx * n, vy + (vy > 0 ? Math.sin(angle * 4) * 0.05 : 0), vz * n);
  }
  rockGeo.computeVertexNormals();

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x1d3b45,
    roughness: 0.88,
    metalness: 0.05,
    envMapIntensity: lowQuality ? 0.0 : 0.22,
  });
  const plinth = new THREE.Mesh(rockGeo, rockMat);
  plinth.position.y = -0.92;
  plinth.castShadow = !isSoftwareGl && !lowQuality;
  plinth.receiveShadow = !lowQuality;
  group.add(plinth);
  disposables.push(rockGeo, rockMat);

  // Soft mossy cushion around plinth rim
  const mossGeo = new THREE.TorusGeometry(1.55, 0.26, lowQuality ? 6 : 8, lowQuality ? 14 : 22);
  mossGeo.rotateX(Math.PI / 2);
  const mossMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0x1d544c,
        roughness: 0.9,
        metalness: 0.0,
        envMapIntensity: 0.0,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x1d544c,
        roughness: 0.9,
        metalness: 0.0,
        sheen: 0.55,
        sheenColor: new THREE.Color('#4eb89d'),
        envMapIntensity: 0.16,
      });
  const mossRing = new THREE.Mesh(mossGeo, mossMat);
  mossRing.position.y = -0.58;
  group.add(mossRing);
  disposables.push(mossGeo, mossMat);

  // 2. Central luminous spore heart inside the refractive dew drop
  const coreGeo = new THREE.OctahedronGeometry(0.42, lowQuality ? 1 : 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xd8fff9,
    emissive: new THREE.Color(primaryHex),
    emissiveIntensity: 2.1,
    roughness: 0.18,
    metalness: 0.05,
  });
  const coreOrb = new THREE.Mesh(coreGeo, coreMat);
  coreOrb.position.y = 0.62;
  group.add(coreOrb);
  disposables.push(coreGeo, coreMat);

  // 3. Giant refractive water-dew / air-pearl sphere
  const dewGeo = new THREE.SphereGeometry(1.02, lowQuality ? 16 : 28, lowQuality ? 12 : 24);
  const dewMat = lowQuality
    ? new THREE.MeshStandardMaterial({
        color: 0xbefcf4,
        emissive: new THREE.Color(primaryHex),
        emissiveIntensity: 0.34,
        roughness: 0.14,
        metalness: 0.02,
        transparent: true,
        opacity: 0.44,
        depthWrite: false,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xbefcf4,
        emissive: new THREE.Color(primaryHex),
        emissiveIntensity: 0.24,
        roughness: 0.07,
        metalness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        iridescence: 0.85,
        iridescenceIOR: 1.38,
        transparent: true,
        opacity: allowTransmission ? 0.72 : 0.42,
        transmission: allowTransmission ? 0.8 : 0,
        ior: 1.36,
        thickness: 1.6,
        depthWrite: false,
      });
  const dewOrb = new THREE.Mesh(dewGeo, dewMat);
  dewOrb.scale.set(1.0, 1.12, 1.0);
  dewOrb.position.y = 0.62;
  group.add(dewOrb);
  disposables.push(dewGeo, dewMat);

  // 4. Cluster of sculpted bioluminescent deep-sea mushrooms / spore caps around the dew drop
  const capPoints: THREE.Vector2[] = [
    new THREE.Vector2(0.001, 0.22),
    new THREE.Vector2(0.14, 0.19),
    new THREE.Vector2(0.24, 0.09),
    new THREE.Vector2(0.26, 0.0),
    new THREE.Vector2(0.06, 0.01),
  ];
  const capGeo = new THREE.LatheGeometry(capPoints, lowQuality ? 10 : 14);
  const stemGeo = new THREE.CylinderGeometry(0.035, 0.055, 0.52, lowQuality ? 6 : 8);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x62a8a1,
    emissive: new THREE.Color('#195954'),
    emissiveIntensity: 0.45,
    roughness: 0.55,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: sporeHex,
    emissive: new THREE.Color(primaryHex),
    emissiveIntensity: 1.25,
    roughness: 0.28,
    transparent: true,
    opacity: 0.9,
  });
  disposables.push(capGeo, stemGeo, stemMat, capMat);

  const sporeCaps: THREE.Mesh[] = [];
  const sporeCount = lowQuality ? 8 : 12;
  for (let i = 0; i < sporeCount; i++) {
    const angle = (i / sporeCount) * Math.PI * 2;
    const rad = 1.25 + (i % 3) * 0.24;
    const hScale = 0.72 + ((i * 7) % 5) * 0.16;

    const mushroom = new THREE.Group();
    mushroom.position.set(
      Math.cos(angle) * rad,
      -0.62,
      Math.sin(angle) * rad,
    );
    mushroom.rotation.set(
      Math.sin(angle) * -0.18,
      -angle,
      Math.cos(angle) * 0.18,
    );
    mushroom.scale.setScalar(hScale);

    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.24;
    mushroom.add(stem);

    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.46;
    mushroom.add(cap);
    sporeCaps.push(cap);

    group.add(mushroom);
  }

  // 5. Bioluminescent sanctuary light
  const auraLight = new THREE.PointLight(primaryHex, 3.2, 22, 1.35);
  auraLight.position.set(0, 0.9, 0.4);
  auraLight.visible = extraPointLights;
  auraLight.userData.isSecondaryLight = true;
  group.add(auraLight);

  let hoverBlend = 0;

  return {
    group,
    dewOrb,
    coreOrb,
    sporeCaps,
    auraLight,
    update: (timeSec: number, dt: number, isHovered: boolean) => {
      hoverBlend = THREE.MathUtils.damp(hoverBlend, isHovered ? 1 : 0, 8, dt);

      const bob = Math.sin(timeSec * 1.8) * 0.12;
      const lift = hoverBlend * 0.28;
      dewOrb.position.y = 0.62 + bob + lift;
      coreOrb.position.y = 0.62 + bob + lift;
      coreOrb.rotation.y = timeSec * (0.9 + hoverBlend * 1.6);
      coreOrb.rotation.z = Math.sin(timeSec * 0.7) * 0.2;

      const scalePulse = 1 + Math.sin(timeSec * 2.4) * 0.03 + hoverBlend * 0.12;
      dewOrb.scale.set(scalePulse, scalePulse * 1.12, scalePulse);

      coreMat.emissiveIntensity = 2.0 + Math.sin(timeSec * 3.1) * 0.35 + hoverBlend * 1.4;
      capMat.emissiveIntensity = 1.15 + Math.sin(timeSec * 2.5) * 0.25 + hoverBlend * 1.1;
      auraLight.intensity = 3.0 + Math.sin(timeSec * 2.4) * 0.4 + hoverBlend * 2.2;
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
