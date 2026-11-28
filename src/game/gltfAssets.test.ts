import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  enableShadowsRecursive,
  extractInstancedMeshParts,
  normalizeGitHubRawBase,
  prepareNormalizedModel,
  resolveAssetUrls,
  stripGiantBackdropMeshes,
  tuneFireflySquidMaterial,
  tuneFishMaterial,
  tuneGlassOctopusMaterial,
  tuneJellyfishMaterial,
  tunePufferfishMaterial,
  tuneSquidPredatorMaterial,
} from './gltfAssets';

test('enableShadowsRecursive enables castShadow and receiveShadow on all nested meshes', () => {
  const root = new THREE.Group();
  const childGroup = new THREE.Group();
  const meshA = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial(),
  );
  const meshB = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshStandardMaterial(),
  );
  meshA.castShadow = false;
  meshA.receiveShadow = false;
  meshB.castShadow = false;
  meshB.receiveShadow = false;

  childGroup.add(meshB);
  root.add(meshA, childGroup);

  enableShadowsRecursive(root);
  assert.equal(meshA.castShadow, true);
  assert.equal(meshA.receiveShadow, true);
  assert.equal(meshB.castShadow, true);
  assert.equal(meshB.receiveShadow, true);
});

test('prepareNormalizedModel centers and scales oversized offset Sketchfab models', () => {
  const rawModel = new THREE.Group();
  const giantMesh = new THREE.Mesh(
    new THREE.BoxGeometry(100, 50, 200),
    new THREE.MeshStandardMaterial(),
  );
  giantMesh.position.set(300, 150, -400);
  rawModel.add(giantMesh);

  const normalized = prepareNormalizedModel(rawModel, {
    targetSize: 2.5,
    alignBottomToZero: false,
  });

  const box = new THREE.Box3().setFromObject(normalized);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  assert.ok(Math.abs(size.z - 2.5) < 0.01);
  assert.ok(Math.abs(center.x) < 0.01);
  assert.ok(Math.abs(center.y) < 0.01);
  assert.ok(Math.abs(center.z) < 0.01);
});

test('prepareNormalizedModel alignBottomToZero seats prop flush on Y=0 and extracts instanced parts', () => {
  const coral = new THREE.Group();
  const stalk = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 2, 10),
    new THREE.MeshStandardMaterial(),
  );
  stalk.position.set(12, 25, -8);
  coral.add(stalk);

  const normalized = prepareNormalizedModel(coral, {
    targetSize: 3.0,
    alignBottomToZero: true,
  });

  const box = new THREE.Box3().setFromObject(normalized);
  assert.ok(Math.abs(box.min.y) < 0.01);

  const parts = extractInstancedMeshParts(normalized);
  assert.equal(parts.length, 1);
  parts[0].geometry.computeBoundingBox();
  assert.ok(Math.abs(parts[0].geometry.boundingBox!.min.y) < 0.01);
});

test('normalizeGitHubRawBase and resolveAssetUrls map TropicalFish pack and crystal jellyfish cleanly', () => {
  assert.equal(
    normalizeGitHubRawBase('https://github.com/demo/ocean-assets'),
    'https://raw.githubusercontent.com/demo/ocean-assets/main/',
  );
  assert.equal(
    normalizeGitHubRawBase('https://github.com/demo/ocean-assets/tree/dev/models'),
    'https://raw.githubusercontent.com/demo/ocean-assets/dev/models/',
  );

  const defaults = resolveAssetUrls('');
  assert.equal(
    defaults.tropicalFishPack,
    'https://raw.githubusercontent.com/Krak0k0t/Deep/main/TropicalFish_FBX.zip',
  );
  assert.equal(
    defaults.jellyfish,
    'https://raw.githubusercontent.com/Krak0k0t/Deep/main/crystal_jellyfish_leptomedusae.glb',
  );
  assert.equal(
    defaults.octopus,
    'https://raw.githubusercontent.com/Krak0k0t/Deep/main/glass_octopus.glb',
  );
  assert.equal(
    defaults.pufferfish,
    'https://raw.githubusercontent.com/Krak0k0t/Deep/main/diodon_holocanthus_pufferfish.glb',
  );
  assert.equal(
    defaults.squidPredator,
    'https://raw.githubusercontent.com/Krak0k0t/Deep/main/lurker_-_rigged_and_animated.glb',
  );
  assert.equal(
    defaults.fireflySquid,
    'https://raw.githubusercontent.com/Krak0k0t/Deep/main/firefly-squid-glowing.glb',
  );
  assert.equal(
    defaults.coral,
    'https://raw.githubusercontent.com/Krak0k0t/Deep/main/coral_piece.glb',
  );
  assert.deepEqual(defaults.corals, [
    'https://raw.githubusercontent.com/Krak0k0t/Deep/main/coral_piece.glb',
  ]);
  assert.equal(defaults.rocks.length, 2);

  const withRepo = resolveAssetUrls('?githubBase=https://github.com/demo/ocean-assets');
  assert.equal(
    withRepo.tropicalFishPack,
    'https://raw.githubusercontent.com/demo/ocean-assets/main/TropicalFish_FBX.zip',
  );
  assert.equal(
    withRepo.jellyfish,
    'https://raw.githubusercontent.com/demo/ocean-assets/main/crystal_jellyfish_leptomedusae.glb',
  );
  assert.equal(
    withRepo.octopus,
    'https://raw.githubusercontent.com/demo/ocean-assets/main/glass_octopus.glb',
  );
  assert.equal(
    withRepo.pufferfish,
    'https://raw.githubusercontent.com/demo/ocean-assets/main/diodon_holocanthus_pufferfish.glb',
  );
  assert.equal(
    withRepo.squidPredator,
    'https://raw.githubusercontent.com/demo/ocean-assets/main/lurker_-_rigged_and_animated.glb',
  );
  assert.equal(
    withRepo.fireflySquid,
    'https://raw.githubusercontent.com/demo/ocean-assets/main/firefly-squid-glowing.glb',
  );
  assert.equal(
    withRepo.coral,
    'https://raw.githubusercontent.com/demo/ocean-assets/main/coral_piece.glb',
  );
  assert.deepEqual(withRepo.corals, [
    'https://raw.githubusercontent.com/demo/ocean-assets/main/coral_piece.glb',
  ]);
  assert.equal(
    withRepo.stoneEntrance,
    'https://raw.githubusercontent.com/demo/ocean-assets/main/stone_entrance.glb',
  );
  assert.deepEqual(withRepo.rocks, [
    'https://raw.githubusercontent.com/demo/ocean-assets/main/low_poly_rock.glb',
    'https://raw.githubusercontent.com/demo/ocean-assets/main/low_poly_rock_1.glb',
  ]);
});

test('tuneFishMaterial, tuneCoralMaterial, and tuneJellyfishMaterial enforce organic PBR properties', () => {
  const fishMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.5, 1.2),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  const fishGroup = new THREE.Group();
  fishGroup.add(fishMesh);
  const handle = tuneFishMaterial(fishGroup, 'z');
  assert.ok(fishMesh.material instanceof THREE.MeshPhysicalMaterial);
  assert.equal(fishMesh.material.roughness, 0.2);
  assert.equal(fishMesh.material.metalness, 0.1);
  handle.updateSwim(1.2, 0.8);
  handle.updateCallGlow(1.0);
  assert.ok(fishMesh.material.emissiveIntensity > 1.0);

  const jellyMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshBasicMaterial({ name: 'Crystal-jelly_bell1' }),
  );
  const jellyGroup = new THREE.Group();
  jellyGroup.add(jellyMesh);
  tuneJellyfishMaterial(jellyGroup, true);
  assert.ok(jellyMesh.material instanceof THREE.MeshPhysicalMaterial);
  assert.equal(jellyMesh.material.transparent, true);
  assert.equal(jellyMesh.material.depthWrite, false);
  assert.equal(jellyMesh.material.map, null);
  assert.equal(jellyMesh.material.opacity, 0.4);
});

test('tuneGlassOctopusMaterial, tuneSquidPredatorMaterial, and tuneFireflySquidMaterial configure translucent, predator, and glowing materials', () => {
  const glassMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.25 }),
  );
  const eyePupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.2),
    new THREE.MeshStandardMaterial({ transparent: false, opacity: 1 }),
  );
  const octoGroup = new THREE.Group();
  const backdropSphere = new THREE.Mesh(
    new THREE.SphereGeometry(20000),
    new THREE.MeshStandardMaterial({ name: 'material_4', color: 0x000000 }),
  );
  octoGroup.add(glassMesh, eyePupil, backdropSphere);
  stripGiantBackdropMeshes(octoGroup);
  assert.equal(octoGroup.children.length, 2);
  tuneGlassOctopusMaterial(octoGroup, true);
  assert.ok(glassMesh.material instanceof THREE.MeshPhysicalMaterial);
  assert.equal(glassMesh.material.transparent, true);
  assert.equal(glassMesh.material.depthWrite, false);
  assert.equal(glassMesh.castShadow, false);
  assert.equal(eyePupil.castShadow, true);

  const lurkerBody = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 2),
    new THREE.MeshStandardMaterial({ name: 'Body' }),
  );
  lurkerBody.name = 'Body_Retopo';
  const lurkerEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshStandardMaterial({ name: 'Eyes' }),
  );
  lurkerEye.name = 'Eyes';
  const lurkerGroup = new THREE.Group();
  lurkerGroup.add(lurkerBody, lurkerEye);
  const lurkerMats = tuneSquidPredatorMaterial(lurkerGroup);
  assert.equal(lurkerMats.eyeMaterials.length, 1);
  assert.equal(lurkerMats.bodyMaterials.length, 1);
  assert.ok(lurkerMats.eyeMaterials[0].emissiveIntensity >= 1.25);

  const fireflyMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 1),
    new THREE.MeshStandardMaterial({ name: 'lambert2', color: 0x000000 }),
  );
  const fireflyGroup = new THREE.Group();
  fireflyGroup.add(fireflyMesh);
  tuneFireflySquidMaterial(fireflyGroup);
  assert.equal(fireflyMesh.castShadow, false);
  assert.ok((fireflyMesh.material as THREE.MeshStandardMaterial).emissiveIntensity >= 1.35);

  const pufferBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.8),
    new THREE.MeshStandardMaterial({ roughness: 0.94, metalness: 0.02 }),
  );
  pufferBody.name = 'PufferBody';
  const pufferEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.15),
    new THREE.MeshStandardMaterial({ roughness: 0.05 }),
  );
  pufferEye.name = 'PufferEyeLeft';
  const pufferGroup = new THREE.Group();
  pufferGroup.add(pufferBody, pufferEye);
  tunePufferfishMaterial(pufferGroup);
  assert.ok(pufferBody.material instanceof THREE.MeshPhysicalMaterial);
  assert.ok(pufferEye.material instanceof THREE.MeshPhysicalMaterial);
  assert.ok(pufferBody.material.clearcoat > 0.3);
  assert.equal(pufferEye.material.clearcoat, 1.0);
});
