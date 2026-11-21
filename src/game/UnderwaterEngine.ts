import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';

import {
  advanceToRoom,
  buildBalanceTelemetry,
  CampaignState,
  CHAPTERS,
  collectPearl,
  createCampaignState,
  emitCall,
  getCallCooldownSec,
  getPlayerSpeedMultiplier,
  getPredatorSpeedMultiplier,
  recordRoomDeath,
  registerStyleDodge,
} from './campaign';
import {
  createChapter1NPCs,
  distanceSq3,
  NPCData,
  triggerShrimpPanic,
  updateNPCProximity,
} from './npc';
import {
  CHAPTER_1_NET_WINDOWS,
  CHAPTER_1_NET_Z,
  CHAPTER_1_PEARLS,
  CHAPTER_1_SHELTERS,
  clampPlayerPosition,
  createInitialSquid,
  getReefFloorHeight,
  getRoomIdForZChapter1,
  isInsideCoralShelter,
  resolveTrawlerNetCollision,
  SquidEntity,
  stepSquidAI,
} from './physics';
import {
  createCoralTextures,
  createParticleGlowTexture,
  createSandTextures,
  createTrawlerNetTexture,
} from './textures';
import {
  createCoralShelterRig,
  createEggMesh,
  createGodRayBeams,
  createMildredRig,
  createPearlPickupRig,
  createPlayerFishRig,
  createShrimpFlockRig,
  createSquidRig,
  MildredRig,
  PlayerFishRig,
  SquidRig,
} from './meshes';
import {
  clearSaveData,
  createCampaignFromSave,
  loadSaveData,
  saveCampaignProgress,
} from './save';
import { CHAPTER_TRANSITIONS, isInsideTransitionTrigger } from './transition';
import { UnderwaterAudio } from './audio';

export type GameScreenState = 'title' | 'playing' | 'paused' | 'gameover';

export interface FloatingBubble {
  id: string;
  speaker: string;
  line1: string;
  line2: string;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export interface HUDSnapshot {
  screenState: GameScreenState;
  chapter: number;
  chapterTitle: string;
  phase: 'DESCENT' | 'ASCENT';
  health: number;
  maxHealth: number;
  pearls: number;
  depthMeters: number;
  isHidden: boolean;
  callCooldownRemaining: number;
  callCooldownTotal: number;
  objectiveText: string;
  toastText: string | null;
  eggEchoText: string | null;
  outcome: 'victory' | 'defeat' | null;
  elapsedSec: number;
  totalDeaths: number;
  npcsMetCount: number;
  styleDodges: number;
  muted: boolean;
  bubbles: FloatingBubble[];
  squidAlert: 'calm' | 'telegraph' | 'dash';
  savedHighestChapter: number;
  savedPearls: number;
  completionLabel: string | null;
}

const _vec3 = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export class UnderwaterEngine {
  private container: HTMLElement;
  private onHUDUpdate: (snapshot: HUDSnapshot) => void;
  private audio = new UnderwaterAudio();

  private isSoftwareGl = false;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private godRays!: THREE.Group;

  private playerRig!: PlayerFishRig;
  private eggMesh!: THREE.Group;
  private mildredRig!: MildredRig;
  private shrimpRig!: THREE.Group;
  private squidRig!: SquidRig;
  private pearlMeshes = new Map<string, THREE.Group>();
  private callWaveRing!: THREE.Mesh;
  private callWaveMat!: THREE.MeshBasicMaterial;
  private callWaveActive = 0;

  private planktonPoints!: THREE.Points;
  private planktonPositions!: Float32Array;
  private planktonCount = 460;

  private disposables: Array<{ dispose: () => void }> = [];
  private frameId = 0;
  private disposed = false;
  private lastTimeMs = performance.now();

  // Simulation state
  private screenState: GameScreenState = 'title';
  private outcome: 'victory' | 'defeat' | null = null;
  private campaign: CampaignState = createCampaignState(1);
  private npcs: NPCData[] = createChapter1NPCs();
  private squid: SquidEntity = createInitialSquid();

  private playerPos = new THREE.Vector3(0, 3.0, 4);
  private playerVel = new THREE.Vector3(0, 0, 0);
  private playerYaw = Math.PI; // Facing -Z (down the reef canyon)
  private playerPitch = -0.06;
  private targetYaw = Math.PI;
  private targetPitch = -0.06;
  private swimDistance = 0;

  private health = 100;
  private maxHealth = 100;
  private hurtInvulnTimer = 0;
  private mildredBumpCooldown = 0;
  private shrimpPanicCooldown = 0;
  private trauma = 0;
  private hitstopTimer = 0;

  private simTimeSec = 0;
  private playElapsedSec = 0;
  private introBeatTimer = 0;
  private eggEchoTimer = 0;
  private eggEchoText: string | null = null;
  private toastTimer = 0;
  private toastText: string | null = null;
  private lastHudEmitMs = 0;
  private savedHighestChapter = 1;
  private savedPearls = 0;
  private completionLabel: string | null = null;

  // Input state
  private keys = new Set<string>();
  private pointerOffsetX = 0;
  private pointerOffsetY = 0;
  private pointerActive = false;
  private viewportWidth = 1280;
  private viewportHeight = 720;

  constructor(
    container: HTMLElement,
    onHUDUpdate: (snapshot: HUDSnapshot) => void,
    autostart = false,
  ) {
    this.container = container;
    this.onHUDUpdate = onHUDUpdate;

    this.initThree();
    this.buildChapter1Scene();
    this.bindEvents();
    this.syncSavedSummary();

    if (autostart) {
      this.startGame(false);
    } else {
      this.syncBodyState('title');
      this.emitHUD(true);
    }

    this.lastTimeMs = performance.now();
    this.tick();
  }

  private detectSoftwareGl(): boolean {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  }

  private initThree(): void {
    this.isSoftwareGl = this.detectSoftwareGl();
    const rect = this.container.getBoundingClientRect();
    this.viewportWidth = Math.max(320, rect.width || window.innerWidth);
    this.viewportHeight = Math.max(240, rect.height || window.innerHeight);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.setSize(this.viewportWidth, this.viewportHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    const ch1 = CHAPTERS[1];
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(ch1.fogColor);
    // Methodology requirement: <fogExp2 attach="fog" args={['#052236', 0.015]} />
    this.scene.fog = new THREE.FogExp2(ch1.fogColor, ch1.fogDensity);

    // Mandatory studio/environment map on every device so PBR materials gleam properly
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = envRT.texture;
    this.disposables.push(envRT);
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(
      58,
      this.viewportWidth / this.viewportHeight,
      0.2,
      140,
    );
    this.camera.position.set(0, 5.2, 11.5);

    // Post-processing: EffectComposer + Bloom + Vignette + ACES_FILMIC OutputPass
    // Skipped on Software WebGL to prevent SwiftShader stalls while keeping identical lighting
    if (!this.isSoftwareGl) {
      const composer = new EffectComposer(this.renderer);
      composer.addPass(new RenderPass(this.scene, this.camera));

      const bloom = new UnrealBloomPass(
        new THREE.Vector2(this.viewportWidth, this.viewportHeight),
        0.55,
        0.5,
        0.72,
      );
      composer.addPass(bloom);
      this.bloomPass = bloom;

      const vignette = new ShaderPass(VignetteShader);
      vignette.uniforms['offset'].value = 0.98;
      vignette.uniforms['darkness'].value = 1.15;
      composer.addPass(vignette);

      composer.addPass(new OutputPass());
      this.composer = composer;
    }
  }

  private buildChapter1Scene(): void {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const ch1 = CHAPTERS[1];

    // 1. Lighting: Hemisphere + overhead soft blue SpotLight + subtle sun key light
    const hemi = new THREE.HemisphereLight('#5cc4eb', '#061c2c', 0.72);
    this.scene.add(hemi);

    const spot = new THREE.SpotLight(ch1.spotColor, 140, 95, Math.PI / 3.4, 0.75, 1.3);
    spot.position.set(0, 32, -16);
    spot.target.position.set(0, -2, -26);
    this.scene.add(spot);
    this.scene.add(spot.target);

    const sunDir = new THREE.DirectionalLight('#7ee0ff', 1.35);
    sunDir.position.set(12, 28, 10);
    if (!this.isSoftwareGl) {
      sunDir.castShadow = true;
      sunDir.shadow.mapSize.set(1024, 1024);
      sunDir.shadow.camera.left = -28;
      sunDir.shadow.camera.right = 28;
      sunDir.shadow.camera.top = 28;
      sunDir.shadow.camera.bottom = -28;
      sunDir.shadow.camera.near = 2;
      sunDir.shadow.camera.far = 70;
      sunDir.shadow.bias = -0.0005;
      sunDir.shadow.normalBias = 0.02;
    }
    this.scene.add(sunDir);

    // Volumetric God Rays
    this.godRays = createGodRayBeams();
    this.scene.add(this.godRays);

    // 2. Sandy Seabed with Perlin/FBM displacement
    const sandTex = createSandTextures(maxAniso);
    this.disposables.push(sandTex.map, sandTex.bumpMap);

    const floorGeo = new THREE.PlaneGeometry(76, 145, 76, 110);
    floorGeo.rotateX(-Math.PI / 2);
    const posAttr = floorGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i) - 38;
      posAttr.setZ(i, z);
      posAttr.setY(i, getReefFloorHeight(x, z));
    }
    floorGeo.computeVertexNormals();

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: sandTex.map,
      bumpMap: sandTex.bumpMap,
      bumpScale: 0.35,
      roughness: 0.88,
      metalness: 0.02,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);
    this.disposables.push(floorGeo, floorMat);

    // 3. Instanced Corals & Reef Formations (two distinct organic shapes clustered along reef flanks)
    const coralTex = createCoralTextures(maxAniso);
    this.disposables.push(coralTex.map, coralTex.bumpMap);

    const coralMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: coralTex.map,
      bumpMap: coralTex.bumpMap,
      bumpScale: 0.25,
      roughness: 0.78,
      metalness: 0.04,
    });

    // Variety A: Tapered organic sea-fan / tube coral pillars
    const coralCount = 170;
    const stalkGeo = new THREE.CylinderGeometry(0.14, 0.36, 2.3, 10, 1);
    stalkGeo.translate(0, 1.0, 0);
    const coralInst = new THREE.InstancedMesh(stalkGeo, coralMat, coralCount);
    coralInst.castShadow = !this.isSoftwareGl;
    coralInst.receiveShadow = true;

    const coralPalette = [
      '#c96b7c',
      '#cc8b5c',
      '#289e92',
      '#7a64b0',
      '#4a7a96',
      '#a8587e',
    ];

    for (let i = 0; i < coralCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const laneRand = ((i * 37.7) % 100) / 100;
      // Keep center lane and camera-left title foreground open
      let x = side * (7.2 + laneRand * 15.5);
      const z = 12 - ((i * 23.1) % 102);
      if (z > -2 && x < 2) {
        x = 7.5 + laneRand * 10;
      }
      const y = getReefFloorHeight(x, z) - 0.25;

      _dummy.position.set(x, y, z);
      _dummy.rotation.set(
        (((i * 13) % 10) - 5) * 0.06,
        ((i * 47) % 360) * (Math.PI / 180),
        (((i * 19) % 10) - 5) * 0.06,
      );
      const s = 0.7 + (((i * 29) % 100) / 100) * 1.05;
      _dummy.scale.set(s, s * (0.75 + ((i * 7) % 5) * 0.22), s);
      _dummy.updateMatrix();
      coralInst.setMatrixAt(i, _dummy.matrix);

      _color.set(coralPalette[i % coralPalette.length]);
      coralInst.setColorAt(i, _color);
    }
    coralInst.instanceMatrix.needsUpdate = true;
    if (coralInst.instanceColor) coralInst.instanceColor.needsUpdate = true;
    coralInst.computeBoundingSphere();
    this.scene.add(coralInst);

    // Variety B: Eroded reef boulders / brain-coral domes
    const rockCount = 95;
    const rockGeo = new THREE.DodecahedronGeometry(1.15, 1);
    const rockInst = new THREE.InstancedMesh(rockGeo, coralMat, rockCount);
    rockInst.castShadow = !this.isSoftwareGl;
    rockInst.receiveShadow = true;

    const rockPalette = ['#31586b', '#3f687a', '#4f6d78', '#2a4a5e', '#596b75'];
    for (let i = 0; i < rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const laneRand = ((i * 53.3) % 100) / 100;
      let x = side * (6.0 + laneRand * 17.0);
      const z = 12 - ((i * 31.7) % 104);
      if (z > -3 && x < 2.5) x = 6.5 + laneRand * 11;
      const y = getReefFloorHeight(x, z) - 0.35;

      _dummy.position.set(x, y, z);
      _dummy.rotation.set(
        ((i * 17) % 30) * 0.1,
        ((i * 41) % 30) * 0.1,
        0,
      );
      const sx = 0.85 + (((i * 19) % 100) / 100) * 1.1;
      const sy = 0.55 + (((i * 23) % 100) / 100) * 0.65;
      _dummy.scale.set(sx, sy, sx * 0.9);
      _dummy.updateMatrix();
      rockInst.setMatrixAt(i, _dummy.matrix);

      _color.set(rockPalette[i % rockPalette.length]);
      rockInst.setColorAt(i, _color);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    if (rockInst.instanceColor) rockInst.instanceColor.needsUpdate = true;
    rockInst.computeBoundingSphere();
    this.scene.add(rockInst);

    this.disposables.push(stalkGeo, rockGeo, coralMat);

    // 4. Coral Shelters (Stealth refuges)
    for (const shelter of CHAPTER_1_SHELTERS) {
      const rig = createCoralShelterRig();
      const floorY = getReefFloorHeight(shelter.x, shelter.z);
      rig.position.set(shelter.x, floorY + 0.5, shelter.z);
      this.scene.add(rig);
    }

    // 5. Collectible Pearls
    for (const p of CHAPTER_1_PEARLS) {
      const rig = createPearlPickupRig();
      const floorY = getReefFloorHeight(p.x, p.z);
      rig.position.set(p.x, Math.max(p.y, floorY + 0.65), p.z);
      this.scene.add(rig);
      this.pearlMeshes.set(p.id, rig);
    }

    // 6. Trawler Net Barricade with 3 Open Fly-Through Windows
    this.buildTrawlerNetBarricade(maxAniso);

    // 7. Abyssal Crevice Beacon (End of Chapter 1)
    const beaconGeo = new THREE.RingGeometry(1.4, 2.2, 32);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: '#26e8d4',
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const creviceBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    creviceBeacon.position.set(0, -1.8, -86);
    this.scene.add(creviceBeacon);
    this.disposables.push(beaconGeo, beaconMat);

    const creviceLight = new THREE.PointLight('#26e8d4', 3.5, 22, 1.3);
    creviceLight.position.set(0, -1.2, -88);
    this.scene.add(creviceLight);

    // 8. Plankton Particles (Points)
    const pTex = createParticleGlowTexture();
    this.disposables.push(pTex);
    this.planktonPositions = new Float32Array(this.planktonCount * 3);
    for (let i = 0; i < this.planktonCount; i++) {
      this.planktonPositions[i * 3] = (Math.random() - 0.5) * 38;
      this.planktonPositions[i * 3 + 1] = -3 + Math.random() * 14;
      this.planktonPositions[i * 3 + 2] = 16 - Math.random() * 110;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(this.planktonPositions, 3),
    );
    const pMat = new THREE.PointsMaterial({
      color: 0x99f6ff,
      map: pTex,
      size: 0.24,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.planktonPoints = new THREE.Points(pGeo, pMat);
    this.scene.add(this.planktonPoints);
    this.disposables.push(pGeo, pMat);

    // 9. Actors: PlayerFish, Egg, Mildred, Shrimps, Rocket Squid
    this.playerRig = createPlayerFishRig();
    this.playerRig.group.position.copy(this.playerPos);
    this.scene.add(this.playerRig.group);

    this.eggMesh = createEggMesh();
    this.eggMesh.position.set(1.2, 3.2, 2.2);
    this.scene.add(this.eggMesh);

    this.mildredRig = createMildredRig();
    const mildredData = this.npcs[0];
    this.mildredRig.group.position.set(
      mildredData.position.x,
      mildredData.position.y,
      mildredData.position.z,
    );
    this.scene.add(this.mildredRig.group);

    this.shrimpRig = createShrimpFlockRig();
    const shrimpData = this.npcs[1];
    this.shrimpRig.position.set(
      shrimpData.position.x,
      shrimpData.position.y,
      shrimpData.position.z,
    );
    this.scene.add(this.shrimpRig);

    this.squidRig = createSquidRig();
    this.squidRig.group.position.set(
      this.squid.position.x,
      this.squid.position.y,
      this.squid.position.z,
    );
    this.scene.add(this.squidRig.group);

    // Expanding Call Sonar Wave Ring (thin delicate bioluminescent pulse)
    const waveGeo = new THREE.RingGeometry(0.92, 1.0, 56);
    this.callWaveMat = new THREE.MeshBasicMaterial({
      color: '#5ef7e6',
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.callWaveRing = new THREE.Mesh(waveGeo, this.callWaveMat);
    this.scene.add(this.callWaveRing);
    this.disposables.push(waveGeo, this.callWaveMat);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  private buildTrawlerNetBarricade(maxAniso: number): void {
    const netTex = createTrawlerNetTexture(maxAniso);
    this.disposables.push(netTex);

    const netMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: netTex,
      transparent: true,
      alphaTest: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });
    this.disposables.push(netMat);

    // Build modular net wall panels leaving 3 distinct rectangular fly-through windows
    const minX = -17;
    const maxX = 17;
    const minY = -3.5;
    const maxY = 11.5;

    const addPanel = (x1: number, x2: number, y1: number, y2: number, zOffset = 0) => {
      const w = x2 - x1;
      const h = y2 - y1;
      if (w <= 0.1 || h <= 0.1) return;
      const geo = new THREE.PlaneGeometry(w, h);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, uv.getX(i) * (w / 4.5), uv.getY(i) * (h / 4.5));
      }
      const mesh = new THREE.Mesh(geo, netMat);
      mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, CHAPTER_1_NET_Z + zOffset);
      this.scene.add(mesh);
      this.disposables.push(geo);
    };

    const sortedWins = [...CHAPTER_1_NET_WINDOWS].sort((a, b) => a.x - b.x);
    let cursorX = minX;

    for (const win of sortedWins) {
      const wx1 = win.x - win.halfWidth;
      const wx2 = win.x + win.halfWidth;
      const wy1 = win.y - win.halfHeight;
      const wy2 = win.y + win.halfHeight;

      // Full vertical column before window
      addPanel(cursorX, wx1, minY, maxY);
      // Top & bottom panels framing the window
      addPanel(wx1, wx2, wy2, maxY);
      addPanel(wx1, wx2, minY, wy1);

      // Visual wooden/rope frame accent around each fly-through window so player reads all 3 openings
      const frameMat = new THREE.MeshStandardMaterial({
        color: '#26e8d4',
        emissive: new THREE.Color('#138a80'),
        emissiveIntensity: 0.7,
        roughness: 0.5,
      });
      const frameGeo = new THREE.EdgesGeometry(
        new THREE.BoxGeometry(win.halfWidth * 2, win.halfHeight * 2, 0.25),
      );
      const frameLines = new THREE.LineSegments(frameGeo, frameMat);
      frameLines.position.set(win.x, win.y, CHAPTER_1_NET_Z);
      this.scene.add(frameLines);
      this.disposables.push(frameGeo, frameMat);

      cursorX = wx2;
    }
    // Rightmost column
    addPanel(cursorX, maxX, minY, maxY);

    // Second slightly angled overlapping net layer high up for depth
    addPanel(-16, 16, 6.2, 12.0, 1.3);
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('resize', this.handleResize);
    this.container.addEventListener('pointermove', this.handlePointerMove);
    this.container.addEventListener('pointerleave', this.handlePointerLeave);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    this.audio.unlock();
    if (this.screenState === 'title') {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.startGame();
      }
      return;
    }

    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (this.screenState === 'playing') {
        e.preventDefault();
        this.pauseGame();
        return;
      } else if (this.screenState === 'paused') {
        e.preventDefault();
        this.resumeGame();
        return;
      }
    }

    if (e.code === 'KeyM') {
      this.toggleMute();
      return;
    }

    if (this.screenState !== 'playing') return;

    if (e.code === 'KeyR') {
      this.restartChapter();
      return;
    }

    if (e.code === 'KeyE' && !e.repeat) {
      this.triggerCall();
      return;
    }

    this.keys.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  private handleBlur = (): void => {
    this.keys.clear();
    this.pointerActive = false;
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.keys.clear();
      this.pointerActive = false;
    }
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (this.screenState !== 'playing') return;
    const rect = this.container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    this.pointerOffsetX = THREE.MathUtils.clamp(nx, -1, 1);
    this.pointerOffsetY = THREE.MathUtils.clamp(ny, -1, 1);
    this.pointerActive = true;
  };

  private handlePointerLeave = (): void => {
    this.pointerActive = false;
  };

  private handleResize = (): void => {
    const rect = this.container.getBoundingClientRect();
    this.viewportWidth = Math.max(320, rect.width || window.innerWidth);
    this.viewportHeight = Math.max(240, rect.height || window.innerHeight);
    this.camera.aspect = this.viewportWidth / this.viewportHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewportWidth, this.viewportHeight);
    if (this.composer) {
      this.composer.setSize(this.viewportWidth, this.viewportHeight);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(this.viewportWidth, this.viewportHeight);
    }
  };

  private syncBodyState(state: GameScreenState): void {
    this.screenState = state;
    document.body.dataset.state = state;
  }

  private syncSavedSummary(): void {
    const saved = loadSaveData();
    this.savedHighestChapter = saved?.highestChapter ?? 1;
    this.savedPearls = saved?.pearls ?? 0;
  }

  public startGame(fromUserGesture = true): void {
    if (fromUserGesture) {
      this.audio.unlock();
    }
    const saved = loadSaveData();
    this.resetChapterState(false, saved ? createCampaignFromSave(saved, 1) : undefined);
    this.introBeatTimer = 2.4;
    this.showToast('Сеть траулера! Икринку уносит в расщелину — жми E (Зов)');
    this.syncBodyState('playing');
    if (fromUserGesture) {
      this.audio.setPaused(false);
    }
    this.emitHUD(true);
  }

  public startNewGame(): void {
    this.audio.unlock();
    clearSaveData();
    this.savedHighestChapter = 1;
    this.savedPearls = 0;
    this.resetChapterState(false);
    this.introBeatTimer = 2.4;
    this.showToast('Сеть траулера! Икринку уносит в расщелину — жми E (Зов)');
    this.syncBodyState('playing');
    this.audio.setPaused(false);
    this.emitHUD(true);
  }

  public restartChapter(): void {
    this.audio.unlock();
    this.resetChapterState(true);
    this.introBeatTimer = 1.6;
    this.syncBodyState('playing');
    this.audio.setPaused(false);
    this.emitHUD(true);
  }

  public respawnAtCheckpoint(): void {
    const room = this.campaign.checkpointRoomId;
    if (room === 'ch1_trawler_net') {
      this.playerPos.set(0, 2.2, -55);
    } else if (room === 'ch1_squid_patrol') {
      this.playerPos.set(0, 2.6, -28);
    } else {
      this.playerPos.set(0, 3.0, 4);
    }
    this.playerVel.set(0, 0, 0);
    this.playerYaw = Math.PI;
    this.targetYaw = Math.PI;
    this.playerPitch = -0.06;
    this.targetPitch = -0.06;
    this.health = this.maxHealth;
    this.hurtInvulnTimer = 1.5;
    this.squid = createInitialSquid();
    this.outcome = null;
    this.syncBodyState('playing');
    this.audio.setPaused(false);
    this.showToast('Возврат ко входу в зону · Жемчуг сохранён');
    this.emitHUD(true);
  }

  private resetChapterState(
    keepPearls: boolean,
    restoredCampaign?: CampaignState,
  ): void {
    if (restoredCampaign) {
      this.campaign = restoredCampaign;
    } else {
      const prevPearls = keepPearls ? this.campaign.pearls : 0;
      const prevIds = keepPearls ? [...this.campaign.collectedPearlIds] : [];
      this.campaign = createCampaignState(1);
      this.campaign.pearls = prevPearls;
      this.campaign.collectedPearlIds = prevIds;
    }

    this.npcs = createChapter1NPCs();
    this.squid = createInitialSquid();
    this.completionLabel = null;

    this.playerPos.set(0, 3.0, 4);
    this.playerVel.set(0, 0, 0);
    this.playerYaw = Math.PI;
    this.targetYaw = Math.PI;
    this.playerPitch = -0.06;
    this.targetPitch = -0.06;
    this.health = this.maxHealth;
    this.hurtInvulnTimer = 0;
    this.playElapsedSec = 0;
    this.outcome = null;
    this.eggEchoText = null;
    this.eggEchoTimer = 0;
    this.keys.clear();

    for (const p of CHAPTER_1_PEARLS) {
      const m = this.pearlMeshes.get(p.id);
      if (m) m.visible = !this.campaign.collectedPearlIds.includes(p.id);
    }
  }

  public pauseGame(): void {
    if (this.screenState !== 'playing') return;
    this.keys.clear();
    this.syncBodyState('paused');
    this.audio.setPaused(true);
    this.emitHUD(true);
  }

  public resumeGame(): void {
    if (this.screenState !== 'paused') return;
    this.syncBodyState('playing');
    this.audio.setPaused(false);
    this.emitHUD(true);
  }

  public returnToTitle(): void {
    this.resetChapterState(false);
    this.syncBodyState('title');
    this.audio.setPaused(true);
    this.emitHUD(true);
  }

  public toggleMute(): void {
    this.audio.unlock();
    this.audio.setMuted(!this.audio.isMuted());
    this.emitHUD(true);
  }

  public triggerCall(): void {
    if (this.screenState !== 'playing') return;
    this.audio.unlock();
    const res = emitCall(this.campaign, this.simTimeSec);
    if (!res.fired) return;
    this.campaign = res.state;
    this.audio.playCallPing(this.campaign.phase);
    this.callWaveActive = 1.0;
    this.callWaveRing.position.copy(this.playerPos);
    this.callWaveRing.scale.setScalar(0.6);

    // Directional hint toward the lost egg in DESCENT
    const eggTargetZ = -88;
    const dist = Math.max(0, Math.round(this.playerPos.z - eggTargetZ));
    this.eggEchoText =
      dist > 25
        ? `Эхо Зова в глубине (~${dist} м вперёд)`
        : 'Икринка совсем рядом за расщелиной!';
    this.eggEchoTimer = 3.2;

    if (res.stunDurationSec > 0) {
      this.squid.stunTimer = res.stunDurationSec;
    }
    this.emitHUD(true);
  }

  private showToast(msg: string): void {
    this.toastText = msg;
    this.toastTimer = 4.0;
  }

  private tick = (): void => {
    if (this.disposed) return;

    const nowMs = performance.now();
    const rawDt = (nowMs - this.lastTimeMs) / 1000;
    this.lastTimeMs = nowMs;
    const totalDt = Math.min(Math.max(rawDt, 0.001), 0.12);

    // Sub-step simulation at <= 0.04s increments so physics never tunnels and keeps full speed on SwiftShader
    let remaining = totalDt;
    while (remaining > 0.0001) {
      const stepDt = Math.min(remaining, 0.04);
      remaining -= stepDt;
      this.simTimeSec += stepDt;

      if (this.screenState === 'title') {
        this.updateTitleStage(stepDt);
      } else if (this.screenState === 'playing') {
        this.updatePlaying(stepDt);
      }
      this.updateAmbientVisuals(stepDt);
    }

    if (this.composer && !this.isSoftwareGl) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    if (nowMs - this.lastHudEmitMs > 100) {
      this.emitHUD(false);
    }

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (gl && typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    } else {
      this.frameId = window.setTimeout(cb, 80);
    }
  }

  private updateTitleStage(dt: number): void {
    // Serene underwater dance between Mama Fish and her turquoise Egg
    const t = this.simTimeSec;
    this.playerPos.set(Math.sin(t * 0.5) * 0.6, 3.0 + Math.sin(t * 1.1) * 0.3, 4.0);
    this.playerRig.group.position.copy(this.playerPos);
    this.playerRig.group.rotation.set(0.05 * Math.sin(t), Math.PI * 0.88 + Math.sin(t * 0.4) * 0.25, 0);
    this.playerRig.tailPivot.rotation.y = Math.sin(t * 5.2) * 0.35;

    // Egg bobbing in front of Mama Fish, pulsing in sync
    this.eggMesh.position.set(
      this.playerPos.x + 1.5,
      this.playerPos.y + 0.3 + Math.cos(t * 1.4) * 0.25,
      this.playerPos.z - 2.1,
    );
    const pulse = 1.6 + Math.sin(t * 3.0) * 0.5;
    this.playerRig.pointLight.intensity = pulse + 0.6;

    // Gentle orbital camera showcase leaving clean negative space on the left for title lockup
    const camX = Math.sin(t * 0.16) * 2.8 - 1.6;
    const camY = 4.5 + Math.sin(t * 0.25) * 0.4;
    const camZ = 10.8 + Math.cos(t * 0.14) * 1.1;
    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0.5, 2.8, -4);
  }

  private updatePlaying(dt: number): void {
    this.playElapsedSec += dt;
    this.hurtInvulnTimer = Math.max(0, this.hurtInvulnTimer - dt);
    this.mildredBumpCooldown = Math.max(0, this.mildredBumpCooldown - dt);
    this.shrimpPanicCooldown = Math.max(0, this.shrimpPanicCooldown - dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.8);

    if (this.toastTimer > 0) {
      this.toastTimer = Math.max(0, this.toastTimer - dt);
      if (this.toastTimer === 0) this.toastText = null;
    }
    if (this.eggEchoTimer > 0) {
      this.eggEchoTimer = Math.max(0, this.eggEchoTimer - dt);
      if (this.eggEchoTimer === 0) this.eggEchoText = null;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - dt);
      this.updateCameraRig(dt);
      return;
    }

    // Opening story choreography: egg swept down into the crevice
    if (this.introBeatTimer > 0) {
      this.introBeatTimer = Math.max(0, this.introBeatTimer - dt);
      const p = 1 - this.introBeatTimer / 2.4;
      this.eggMesh.position.set(
        Math.sin(p * 8) * 1.5,
        THREE.MathUtils.lerp(3.2, -1.6, p),
        THREE.MathUtils.lerp(2.0, -88.0, Math.pow(p, 1.35)),
      );
    } else {
      this.eggMesh.position.set(
        Math.sin(this.simTimeSec * 1.5) * 0.4,
        -1.6 + Math.sin(this.simTimeSec * 2.2) * 0.25,
        -88,
      );
    }

    // 1. Steering & Water Inertia Movement (WASD + Arrows + Mouse)
    if (this.pointerActive) {
      const steerRate = 1.65;
      if (Math.abs(this.pointerOffsetX) > 0.14) {
        this.targetYaw -= this.pointerOffsetX * steerRate * dt;
      }
      this.targetPitch = THREE.MathUtils.clamp(-this.pointerOffsetY * 0.55, -0.55, 0.55);
    }

    // Keyboard turn assist with Q/E or left/right
    const forwardInput =
      (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) -
      (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    const strafeInput =
      (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) -
      (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
    const vertInput =
      (this.keys.has('Space') ? 1 : 0) -
      (this.keys.has('KeyC') || this.keys.has('ShiftLeft') || this.keys.has('ControlLeft') ? 1 : 0);

    this.playerYaw = THREE.MathUtils.damp(this.playerYaw, this.targetYaw, 6.5, dt);
    this.playerPitch = THREE.MathUtils.damp(this.playerPitch, this.targetPitch, 6.5, dt);

    const speedMult = getPlayerSpeedMultiplier(this.campaign);
    const swimAccel = 26 * speedMult;

    // Forward vector along playerYaw & playerPitch
    const sinY = Math.sin(this.playerYaw);
    const cosY = Math.cos(this.playerYaw);
    const cosP = Math.cos(this.playerPitch);
    const sinP = Math.sin(this.playerPitch);

    const fwdX = sinY * cosP;
    const fwdY = sinP;
    const fwdZ = cosY * cosP;

    // Right vector perpendicular on XZ
    const rightX = -cosY;
    const rightZ = sinY;

    const ax = (fwdX * forwardInput + rightX * strafeInput) * swimAccel;
    const ay = (fwdY * forwardInput + vertInput * 0.85) * swimAccel;
    const az = (fwdZ * forwardInput + rightZ * strafeInput) * swimAccel;

    this.playerVel.x += ax * dt;
    this.playerVel.y += ay * dt;
    this.playerVel.z += az * dt;

    // Water viscous drag
    const drag = Math.exp(-3.1 * dt);
    this.playerVel.multiplyScalar(drag);

    // Clamp max swim speed
    const maxSpeed = 10.5 * speedMult;
    if (this.playerVel.lengthSq() > maxSpeed * maxSpeed) {
      this.playerVel.setLength(maxSpeed);
    }

    const prevPos = { x: this.playerPos.x, y: this.playerPos.y, z: this.playerPos.z };
    const candidate = {
      x: prevPos.x + this.playerVel.x * dt,
      y: prevPos.y + this.playerVel.y * dt,
      z: prevPos.z + this.playerVel.z * dt,
    };

    const netRes = resolveTrawlerNetCollision(prevPos, candidate);
    if (netRes.hitNet) {
      this.playerVel.z = Math.max(0, this.playerVel.z * -0.35);
      this.showToast('Сеть траулера! Проплывай сквозь одно из 3 светлых окон');
    }

    const clamped = clampPlayerPosition(netRes.position);
    this.playerPos.set(clamped.x, clamped.y, clamped.z);

    // Track room checkpoint transitions
    const roomId = getRoomIdForZChapter1(this.playerPos.z);
    if (roomId !== this.campaign.currentRoomId) {
      this.campaign = advanceToRoom(this.campaign, roomId);
    }

    // Update PlayerFishRig visuals + Coral Shelter stealth
    const isHidden = isInsideCoralShelter(this.playerPos);
    const speedMag = this.playerVel.length();
    this.swimDistance += speedMag * dt;

    this.playerRig.group.position.copy(this.playerPos);
    this.playerRig.group.rotation.y = this.playerYaw;
    this.playerRig.group.rotation.x = -this.playerPitch;
    this.playerRig.group.rotation.z = -strafeInput * 0.18;

    const tailFreq = 3.2 + speedMag * 1.15;
    this.playerRig.tailPivot.rotation.y = Math.sin(this.simTimeSec * tailFreq) * 0.42;
    this.playerRig.leftFin.rotation.z = Math.sin(this.simTimeSec * 4.0) * 0.16;
    this.playerRig.rightFin.rotation.z = Math.PI - Math.sin(this.simTimeSec * 4.0) * 0.16;

    // Dim glow inside coral shelters
    const targetLightIntensity = isHidden ? 0.65 : 2.4;
    this.playerRig.pointLight.intensity = THREE.MathUtils.damp(
      this.playerRig.pointLight.intensity,
      targetLightIntensity,
      8,
      dt,
    );
    this.playerRig.lureMat.emissiveIntensity = isHidden ? 0.6 : 2.2;

    // 2. NPCs (Mildred + Panic Shrimps)
    this.updateNPCs(dt, isHidden);

    // 3. Collectible Pearls
    for (const p of CHAPTER_1_PEARLS) {
      if (this.campaign.collectedPearlIds.includes(p.id)) continue;
      const mesh = this.pearlMeshes.get(p.id);
      if (!mesh) continue;
      mesh.rotation.y += dt * 1.1;
      if (distanceSq3(this.playerPos, mesh.position) < 4.5) {
        this.campaign = collectPearl(this.campaign, p.id);
        mesh.visible = false;
        this.audio.playPearlPickup();
        const saved = saveCampaignProgress(
          this.campaign,
          this.savedHighestChapter as 1,
        );
        this.savedHighestChapter = saved.highestChapter;
        this.savedPearls = saved.pearls;
        this.showToast(`Найдена жемчужина! Всего: ${this.campaign.pearls}`);
      }
    }

    // 4. Rocket Squid AI & Heartbeat Proximity Audio
    const predatorSpeedMult = getPredatorSpeedMultiplier(this.campaign);
    const squidStep = stepSquidAI(
      this.squid,
      this.playerPos,
      isHidden,
      predatorSpeedMult,
      dt,
      this.simTimeSec,
    );
    this.squid = squidStep.squid;

    if (squidStep.telegraphStarted) {
      this.audio.playSquidTelegraph();
    }
    if (squidStep.dodgedDash) {
      const styleRes = registerStyleDodge(this.campaign);
      this.campaign = styleRes.state;
      if (styleRes.awardedPearl) {
        this.audio.playPearlPickup();
        this.showToast('Красивый уворот ×3! Крабы оценили: +1 жемчужина');
      }
    }
    if (squidStep.hitPlayer && this.hurtInvulnTimer <= 0) {
      this.handlePlayerHurt();
    }

    // Update Squid 3D Rig
    this.squidRig.group.position.set(
      this.squid.position.x,
      this.squid.position.y,
      this.squid.position.z,
    );
    this.squidRig.group.rotation.y = this.squid.headingYaw;
    const isTelegraph = this.squid.state === 'telegraph';
    const isDash = this.squid.state === 'dash';
    this.squidRig.siphonMat.emissiveIntensity = isTelegraph ? 3.5 : isDash ? 2.6 : 0.9;
    this.squidRig.warnLight.intensity = isTelegraph ? 3.8 : isDash ? 2.8 : 1.0;
    this.squidRig.tentacles.rotation.z += dt * (isDash ? 8 : 2);

    const distToSquid = Math.sqrt(distanceSq3(this.playerPos, this.squid.position));
    const proximity01 = Math.max(0, Math.min(1, 1 - (distToSquid - 3) / 18));
    if (!isHidden && proximity01 > 0.15) {
      this.audio.maybePlayHeartbeat(proximity01);
    }

    // Update audio depth hum
    const depth = Math.round(12 + Math.max(0, 4 - this.playerPos.z) * 0.55);
    this.audio.updateDepthAmbience(depth);

    // 5. Check Chapter 1 Transition Trigger (abyssal crevice beyond trawler net)
    const ch1Trigger = CHAPTER_TRANSITIONS[1];
    if (ch1Trigger && isInsideTransitionTrigger(this.playerPos, ch1Trigger)) {
      this.completeChapter1(ch1Trigger.completionLabel);
      return;
    }

    this.updateCameraRig(dt);
  }

  private updateNPCs(dt: number, playerHidden: boolean): void {
    const t = this.simTimeSec;

    // Mildred gentle patrol + bump check
    const m = this.npcs[0];
    m.position.x = m.anchorPosition.x + Math.sin(t * 0.45) * 1.8;
    m.position.y = m.anchorPosition.y + Math.sin(t * 0.9) * 0.55;
    this.mildredRig.group.position.set(m.position.x, m.position.y, m.position.z);
    this.mildredRig.bell.scale.set(
      1 + Math.sin(t * 2.1) * 0.08,
      1 - Math.sin(t * 2.1) * 0.08,
      1 + Math.sin(t * 2.1) * 0.08,
    );
    this.mildredRig.tentacles.forEach((ten, idx) => {
      ten.rotation.z = Math.sin(t * 2.0 + idx) * 0.14;
    });

    if (
      this.mildredBumpCooldown <= 0 &&
      distanceSq3(this.playerPos, m.position) < 4.4
    ) {
      this.mildredBumpCooldown = 2.0;
      // Soft comic bounce back
      _vec3.set(
        this.playerPos.x - m.position.x,
        this.playerPos.y - m.position.y,
        this.playerPos.z - m.position.z,
      ).normalize();
      this.playerVel.addScaledVector(_vec3, 7.5);
      this.audio.playMildredBump();
    }

    // Shrimps flock + panic trigger
    const s = this.npcs[1];
    const hidden = t < s.hiddenUntilSec;
    this.shrimpRig.visible = !hidden;
    if (!hidden) {
      s.position.x = s.anchorPosition.x + Math.cos(t * 1.4) * 1.4;
      s.position.y = s.anchorPosition.y + Math.sin(t * 2.0) * 0.35;
      s.position.z = s.anchorPosition.z + Math.sin(t * 1.2) * 1.4;
      this.shrimpRig.position.set(s.position.x, s.position.y, s.position.z);
      this.shrimpRig.rotation.y = t * 1.3;

      const distSq = distanceSq3(this.playerPos, s.position);
      if (
        this.shrimpPanicCooldown <= 0 &&
        distSq < 28 &&
        !playerHidden &&
        this.playerVel.length() > 3.2
      ) {
        this.shrimpPanicCooldown = 4.5;
        const panicRes = triggerShrimpPanic(s, t);
        this.npcs[1] = panicRes.npc;
        if (panicRes.distractedPredator) {
          this.squid.distractedUntil = t + 4.5;
          this.squid.distractTarget = { ...CHAPTER_1_SHELTERS[0] };
        }
      }
    }

    // Proximity bubble reveals for all NPCs
    for (let i = 0; i < this.npcs.length; i++) {
      const res = updateNPCProximity(this.npcs[i], this.playerPos, dt, t);
      this.npcs[i] = res.npc;
      if (res.justMet && !this.campaign.npcsMet.includes(res.npc.id)) {
        this.campaign.npcsMet.push(res.npc.id);
      }
    }
  }

  private handlePlayerHurt(): void {
    this.health = Math.max(0, this.health - 34);
    this.hurtInvulnTimer = 1.6;
    this.hitstopTimer = 0.055;
    this.trauma = 0.85;
    this.audio.playHurt();

    if (this.health <= 0) {
      this.campaign = recordRoomDeath(this.campaign);
      this.outcome = 'defeat';
      this.syncBodyState('gameover');
      this.audio.setPaused(true);
      this.emitHUD(true);
    } else {
      this.showToast('Осторожнее! Прячься в розовых кораллах');
    }
  }

  private completeChapter1(completionLabel: string): void {
    this.outcome = 'victory';
    this.completionLabel = completionLabel;
    this.eggEchoText = '«...мама?..»';
    this.audio.playLullabyMotif();

    const saved = saveCampaignProgress(this.campaign, 2);
    this.savedHighestChapter = saved.highestChapter;
    this.savedPearls = saved.pearls;

    const telemetry = buildBalanceTelemetry(this.campaign, this.playElapsedSec);
    console.log('[Глубоководная рыбка] Статистика баланса (Глава 1):', telemetry);

    this.syncBodyState('gameover');
    this.audio.setPaused(true);
    this.emitHUD(true);
  }

  private updateCameraRig(dt: number): void {
    // Follow camera smoothly behind Mama Fish with subtle trauma shake
    const sinY = Math.sin(this.playerYaw);
    const cosY = Math.cos(this.playerYaw);

    _camDesired.set(
      this.playerPos.x - sinY * 8.2,
      this.playerPos.y + 2.5 - this.playerPitch * 3.0,
      this.playerPos.z - cosY * 8.2,
    );
    const floorAtCam = getReefFloorHeight(_camDesired.x, _camDesired.z);
    _camDesired.y = Math.max(floorAtCam + 1.1, _camDesired.y);

    const dampFactor = 1 - Math.exp(-5.8 * dt);
    this.camera.position.lerp(_camDesired, dampFactor);

    if (this.trauma > 0.01) {
      const shake = this.trauma * this.trauma * 0.45;
      this.camera.position.x += (Math.random() - 0.5) * shake;
      this.camera.position.y += (Math.random() - 0.5) * shake;
    }

    _camTarget.set(
      this.playerPos.x + sinY * 4.5,
      this.playerPos.y + 0.4 + this.playerPitch * 2.5,
      this.playerPos.z + cosY * 4.5,
    );
    this.camera.lookAt(_camTarget);
  }

  private updateAmbientVisuals(dt: number): void {
    const t = this.simTimeSec;

    // Animate God Rays shader time
    this.godRays.children.forEach((child) => {
      const mat = (child as THREE.Mesh).material as THREE.ShaderMaterial;
      if (mat.uniforms?.uTime) mat.uniforms.uTime.value = t;
    });

    // Expanding Call sonar wave
    if (this.callWaveActive > 0) {
      this.callWaveActive = Math.max(0, this.callWaveActive - dt * 0.85);
      const scale = 1.1 + (1 - this.callWaveActive) * 14;
      this.callWaveRing.scale.setScalar(scale);
      this.callWaveMat.opacity = this.callWaveActive * 0.36;
      this.callWaveRing.lookAt(this.camera.position);
    } else {
      this.callWaveMat.opacity = 0;
    }

    // Gentle drift of plankton particles
    for (let i = 0; i < this.planktonCount; i++) {
      let y = this.planktonPositions[i * 3 + 1];
      y += dt * (0.14 + (i % 5) * 0.03);
      if (y > 11) y = -3;
      this.planktonPositions[i * 3 + 1] = y;
      this.planktonPositions[i * 3] += Math.sin(t * 0.6 + i) * 0.004;
    }
    this.planktonPoints.geometry.attributes.position.needsUpdate = true;
  }

  private projectWorldToScreen(pos: { x: number; y: number; z: number }): {
    x: number;
    y: number;
    visible: boolean;
  } {
    _vec3B.set(pos.x, pos.y + 2.0, pos.z);
    _vec3B.project(this.camera);
    const visible = _vec3B.z >= -1 && _vec3B.z <= 1;
    return {
      x: (_vec3B.x * 0.5 + 0.5) * this.viewportWidth,
      y: (-_vec3B.y * 0.5 + 0.5) * this.viewportHeight,
      visible,
    };
  }

  private emitHUD(force: boolean): void {
    const now = performance.now();
    if (!force && now - this.lastHudEmitMs < 95) return;
    this.lastHudEmitMs = now;

    const ch1 = CHAPTERS[1];
    const callTotal = getCallCooldownSec(this.campaign.phase);
    const callElapsed = this.simTimeSec - this.campaign.lastCallTimeSec;
    const callRemaining = Math.max(0, callTotal - callElapsed);

    let objectiveText = 'Плыви вглубь рифа и жми E (Зов), чтобы чуять икринку';
    if (this.playerPos.z < -26 && this.playerPos.z > -56) {
      objectiveText = 'Проскочи мимо кальмара-ракеты (прячься в розовых кораллах)';
    } else if (this.playerPos.z <= -56 && this.playerPos.z > -66) {
      objectiveText = 'Пролети через одно из 3 окон в сети траулера';
    } else if (this.playerPos.z <= -66) {
      objectiveText = 'Спускайся к бирюзовой расщелине внизу';
    }

    const bubbles: FloatingBubble[] = this.npcs
      .filter((npc) => npc.revealed && npc.talkTimer > 0)
      .map((npc) => {
        const proj = this.projectWorldToScreen(npc.position);
        return {
          id: npc.id,
          speaker: npc.name,
          line1: npc.activeText[0],
          line2: npc.activeText[1],
          screenX: Math.max(150, Math.min(this.viewportWidth - 150, proj.x)),
          screenY: Math.max(90, Math.min(this.viewportHeight - 130, proj.y)),
          visible: proj.visible,
        };
      });

    const totalDeaths = Object.values(this.campaign.deathsByRoom).reduce(
      (a, b) => a + b,
      0,
    );

    const squidAlert: 'calm' | 'telegraph' | 'dash' =
      this.squid.state === 'telegraph'
        ? 'telegraph'
        : this.squid.state === 'dash'
          ? 'dash'
          : 'calm';

    this.onHUDUpdate({
      screenState: this.screenState,
      chapter: 1,
      chapterTitle: ch1.title,
      phase: this.campaign.phase,
      health: Math.round(this.health),
      maxHealth: this.maxHealth,
      pearls: this.campaign.pearls,
      depthMeters: Math.round(12 + Math.max(0, 4 - this.playerPos.z) * 0.55),
      isHidden: isInsideCoralShelter(this.playerPos),
      callCooldownRemaining: Math.round(callRemaining * 10) / 10,
      callCooldownTotal: callTotal,
      objectiveText,
      toastText: this.toastText,
      eggEchoText: this.eggEchoText,
      outcome: this.outcome,
      elapsedSec: Math.round(this.playElapsedSec),
      totalDeaths,
      npcsMetCount: this.campaign.npcsMet.length,
      styleDodges: this.campaign.totalStyleDodges,
      muted: this.audio.isMuted(),
      bubbles,
      squidAlert,
      savedHighestChapter: this.savedHighestChapter,
      savedPearls: this.savedPearls,
      completionLabel: this.completionLabel,
    });
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('resize', this.handleResize);
    this.container.removeEventListener('pointermove', this.handlePointerMove);
    this.container.removeEventListener('pointerleave', this.handlePointerLeave);

    this.audio.dispose();
    this.composer?.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
