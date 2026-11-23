import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ChevronDown, ChevronUp, Eye, RotateCcw, Sliders } from 'lucide-react';

export type MaterialFinish = 'rose-gold' | 'pearl-quartz' | 'obsidian-champagne';
export type SceneFocusTarget = 'auto' | 'lotus' | 'flacon' | 'matrix';

interface Scene3DProps {
  scrollProgressRef: MutableRefObject<number>;
  activeAccentHex: string;
  laserScanColor: string;
  laserScanSpeed: number;
  serviceFocus: 'lotus' | 'flacon' | 'matrix';
  studioMode: boolean;
  onToggleStudioMode: (next: boolean) => void;
}

// Pre-allocated math helpers at module scope (Zero GC inside render loop)
const _camTargetPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _currentLook = new THREE.Vector3(0, 0, 0);
const _dummy = new THREE.Object3D();
const _colorA = new THREE.Color();
const _colorB = new THREE.Color();
const _tempColor = new THREE.Color();

interface PetalHandle {
  pivot: THREE.Group;
  ringIndex: number;
  baseTilt: number;
  maxTilt: number;
  phase: number;
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createHaloDialTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2d1423';
    ctx.fillRect(0, 0, size, 64);

    // Subtle brushed grain
    for (let y = 0; y < 64; y += 2) {
      ctx.fillStyle = y % 4 === 0 ? 'rgba(229,193,133,0.12)' : 'rgba(244,165,192,0.06)';
      ctx.fillRect(0, y, size, 1);
    }

    // Precision architectural ticks
    const tickCount = 128;
    for (let i = 0; i < tickCount; i++) {
      const x = (i / tickCount) * size;
      const major = i % 8 === 0;
      ctx.fillStyle = major ? 'rgba(229, 193, 133, 0.85)' : 'rgba(244, 165, 192, 0.35)';
      ctx.fillRect(x, major ? 12 : 22, major ? 2.5 : 1.2, major ? 40 : 20);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(3, 1);
  return tex;
}

function createPetalGeometry(length: number, width: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.52, length * 0.18, width * 0.62, length * 0.68, 0, length);
  shape.bezierCurveTo(-width * 0.62, length * 0.68, -width * 0.52, length * 0.18, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.65,
    bevelSize: width * 0.06,
    bevelSegments: 3,
    curveSegments: 18,
  });

  // Gentle sculptural cup curvature along petal length and width
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = Math.max(0, Math.min(1, y / length));
    const cup = (x * x) / (width * width + 0.001) * 0.24;
    const arch = Math.sin(t * Math.PI) * 0.22 - t * t * 0.16;
    pos.setZ(i, z + cup + arch);
  }
  geo.computeVertexNormals();
  return geo;
}

export function Scene3D({
  scrollProgressRef,
  activeAccentHex,
  laserScanColor,
  laserScanSpeed,
  serviceFocus,
  studioMode,
  onToggleStudioMode,
}: Scene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [finish, setFinish] = useState<MaterialFinish>('rose-gold');
  const [manualBloom, setManualBloom] = useState(0.58);
  const [focusTarget, setFocusTarget] = useState<SceneFocusTarget>('auto');

  // Mutable refs for live parameter updates without rebuilding WebGL context
  const livePropsRef = useRef({
    activeAccentHex,
    laserScanColor,
    laserScanSpeed,
    serviceFocus,
    studioMode,
    finish,
    manualBloom,
    focusTarget,
  });
  livePropsRef.current = {
    activeAccentHex,
    laserScanColor,
    laserScanSpeed,
    serviceFocus,
    studioMode,
    finish,
    manualBloom,
    focusTarget,
  };

  const resetCameraRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!livePropsRef.current.studioMode) return;
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        onToggleStudioMode(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onToggleStudioMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d060b);
    scene.fog = new THREE.FogExp2(0x0d060b, 0.045);

    // Studio Environment Map (RoomEnvironment PMREM) on all devices
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      42,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      90,
    );
    camera.position.set(1.8, 1.35, 8.2);

    // OrbitControls (only active when studioMode === true)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.2;
    controls.maxDistance = 14.5;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.target.set(0.3, 0.1, 0);

    // Three-point warm/cool studio lighting rig + RectAreaLight softboxes (GPU)
    const hemiLight = new THREE.HemisphereLight(0xf6cde0, 0x1e0918, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe6d4, 2.2);
    keyLight.position.set(5.5, 7.5, 6.0);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 26;
      keyLight.shadow.camera.left = -6;
      keyLight.shadow.camera.right = 6;
      keyLight.shadow.camera.top = 6;
      keyLight.shadow.camera.bottom = -6;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xe86b94, 16, 22, 1.8);
    rimLight.position.set(-4.5, 2.4, -3.5);
    scene.add(rimLight);

    const champagneFill = new THREE.PointLight(0xe5c185, 10, 18, 1.8);
    champagneFill.position.set(4.2, -1.8, 3.8);
    scene.add(champagneFill);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const topSoftbox = new THREE.RectAreaLight(0xffdce9, 3.6, 5.5, 2.2);
      topSoftbox.position.set(0, 5.4, 2.2);
      topSoftbox.lookAt(0, 0, 0);
      scene.add(topSoftbox);

      const sideSoftbox = new THREE.RectAreaLight(0xf2d1a0, 2.2, 2.5, 4.8);
      sideSoftbox.position.set(5.6, 1.2, 1.5);
      sideSoftbox.lookAt(0, 0, 0);
      scene.add(sideSoftbox);
    }

    // Disposable tracking lists
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };

    const haloTex = createHaloDialTexture();
    haloTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(haloTex);

    // =========================================================================
    // SHARED PBR MATERIALS (dynamically tintable via finish selector)
    // =========================================================================
    const outerPetalMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xd97398,
        metalness: 0.22,
        roughness: 0.34,
        clearcoat: 0.55,
        clearcoatRoughness: 0.22,
        sheen: 0.6,
        sheenColor: new THREE.Color(0xffd7e6),
      }),
    );

    const midPetalMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe6b99c,
        metalness: 0.88,
        roughness: 0.17,
        clearcoat: 0.8,
        anisotropy: 0.65,
      }),
    );

    const innerPetalMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xfbe5ef,
        metalness: 0.12,
        roughness: 0.14,
        clearcoat: 1.0,
        iridescence: 0.72,
        iridescenceIOR: 1.35,
      }),
    );

    const brushedGoldMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe5c185,
        metalness: 0.94,
        roughness: 0.18,
        anisotropy: 0.8,
        clearcoat: 0.4,
      }),
    );

    const matteVelvetMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x3b172c,
        metalness: 0.08,
        roughness: 0.68,
      }),
    );

    const crystalCoreMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffd0e3,
        emissive: 0xe86b94,
        emissiveIntensity: 0.45,
        metalness: 0.05,
        roughness: 0.08,
        transmission: isSoftwareGl ? 0 : 0.78,
        transparent: true,
        opacity: isSoftwareGl ? 0.65 : 1,
        ior: 1.72,
        thickness: 1.4,
        clearcoat: 1.0,
      }),
    );

    // =========================================================================
    // 1. COMPOSITE 3D BOTANICAL LOTUS SCULPTURE (26+ Parts)
    // =========================================================================
    const lotusGroup = new THREE.Group();
    lotusGroup.position.set(1.65, -0.25, 0);
    scene.add(lotusGroup);

    // Calyx pedestal (LatheGeometry)
    const calyxPoints = [
      new THREE.Vector2(0.0, -0.52),
      new THREE.Vector2(0.28, -0.48),
      new THREE.Vector2(0.42, -0.32),
      new THREE.Vector2(0.58, -0.14),
      new THREE.Vector2(0.68, 0.02),
      new THREE.Vector2(0.52, 0.06),
      new THREE.Vector2(0.0, 0.0),
    ];
    const calyxGeo = trackGeo(new THREE.LatheGeometry(calyxPoints, 36));
    const calyxMesh = new THREE.Mesh(calyxGeo, brushedGoldMat);
    calyxMesh.castShadow = !isSoftwareGl;
    calyxMesh.receiveShadow = !isSoftwareGl;
    lotusGroup.add(calyxMesh);

    // Grounded under-pedestal trim ring
    const baseTrimGeo = trackGeo(new THREE.TorusGeometry(0.48, 0.035, 16, 48));
    const baseTrim = new THREE.Mesh(baseTrimGeo, matteVelvetMat);
    baseTrim.rotation.x = Math.PI / 2;
    baseTrim.position.y = -0.22;
    lotusGroup.add(baseTrim);

    // Sculpted Petal Rings
    const outerPetalGeo = trackGeo(createPetalGeometry(1.52, 0.72, 0.045));
    const midPetalGeo = trackGeo(createPetalGeometry(1.24, 0.56, 0.04));
    const innerPetalGeo = trackGeo(createPetalGeometry(0.92, 0.42, 0.035));

    const petals: PetalHandle[] = [];

    const ringSpecs = [
      { count: 8, radius: 0.42, geo: outerPetalGeo, mat: outerPetalMat, baseTilt: 0.56, maxTilt: 1.24, y: -0.02, offset: 0 },
      { count: 8, radius: 0.31, geo: midPetalGeo, mat: midPetalMat, baseTilt: 0.36, maxTilt: 0.92, y: 0.04, offset: Math.PI / 8 },
      { count: 6, radius: 0.19, geo: innerPetalGeo, mat: innerPetalMat, baseTilt: 0.18, maxTilt: 0.56, y: 0.09, offset: Math.PI / 6 },
    ];

    ringSpecs.forEach((spec, ringIndex) => {
      for (let i = 0; i < spec.count; i++) {
        const angle = (i / spec.count) * Math.PI * 2 + spec.offset;
        const holder = new THREE.Group();
        holder.rotation.y = angle;
        holder.position.y = spec.y;

        const pivot = new THREE.Group();
        pivot.position.set(0, 0, spec.radius);
        pivot.rotation.x = spec.baseTilt;

        const mesh = new THREE.Mesh(spec.geo, spec.mat);
        mesh.castShadow = !isSoftwareGl;
        mesh.receiveShadow = !isSoftwareGl;
        pivot.add(mesh);

        holder.add(pivot);
        lotusGroup.add(holder);

        petals.push({
          pivot,
          ringIndex,
          baseTilt: spec.baseTilt,
          maxTilt: spec.maxTilt,
          phase: i * 0.55 + ringIndex * 1.1,
        });
      }
    });

    // Central Hyaluronic Faceted Crystal Heart
    const crystalCoreGeo = trackGeo(new THREE.OctahedronGeometry(0.32, 1));
    const crystalCore = new THREE.Mesh(crystalCoreGeo, crystalCoreMat);
    crystalCore.position.y = 0.46;
    crystalCore.scale.set(0.9, 1.32, 0.9);
    lotusGroup.add(crystalCore);

    // Stamen crown ring around crystal
    const stamenCrown = new THREE.Group();
    stamenCrown.position.y = 0.25;
    const stamenStemGeo = trackGeo(new THREE.CylinderGeometry(0.012, 0.016, 0.34, 8));
    const stamenTipGeo = trackGeo(new THREE.SphereGeometry(0.036, 12, 12));
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const stem = new THREE.Mesh(stamenStemGeo, brushedGoldMat);
      stem.position.set(Math.cos(a) * 0.24, 0.15, Math.sin(a) * 0.24);
      stem.rotation.z = -Math.cos(a) * 0.24;
      stem.rotation.x = Math.sin(a) * 0.24;
      stamenCrown.add(stem);

      const tip = new THREE.Mesh(stamenTipGeo, innerPetalMat);
      tip.position.set(Math.cos(a) * 0.29, 0.31, Math.sin(a) * 0.29);
      stamenCrown.add(tip);
    }
    lotusGroup.add(stamenCrown);

    // Architectural Halo Rings around Lotus
    const haloRingMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: haloTex,
        color: 0xf4c8d8,
        metalness: 0.85,
        roughness: 0.24,
      }),
    );
    const haloRingOuterGeo = trackGeo(new THREE.TorusGeometry(2.18, 0.024, 16, 96));
    const haloRingOuter = new THREE.Mesh(haloRingOuterGeo, haloRingMat);
    haloRingOuter.rotation.x = Math.PI * 0.38;
    haloRingOuter.rotation.y = 0.24;
    lotusGroup.add(haloRingOuter);

    const haloRingInnerGeo = trackGeo(new THREE.TorusGeometry(1.82, 0.014, 14, 84));
    const haloRingInner = new THREE.Mesh(haloRingInnerGeo, brushedGoldMat);
    haloRingInner.rotation.x = Math.PI * 0.56;
    haloRingInner.rotation.z = -0.35;
    lotusGroup.add(haloRingInner);

    // =========================================================================
    // 2. COMPOSITE LUXURY CLINICAL SERUM FLACON (8-Part Lathe & Glass Assembly)
    // =========================================================================
    const flaconGroup = new THREE.Group();
    flaconGroup.position.set(-2.35, -0.35, -1.65);
    flaconGroup.rotation.z = -0.14;
    scene.add(flaconGroup);

    const flaconGlassMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffd2e2,
        metalness: 0.0,
        roughness: 0.06,
        transmission: isSoftwareGl ? 0 : 0.88,
        transparent: true,
        opacity: isSoftwareGl ? 0.34 : 1.0,
        ior: 1.52,
        thickness: 0.85,
        attenuationColor: new THREE.Color(0xe86b94),
        attenuationDistance: 1.8,
        clearcoat: 1.0,
        depthWrite: false,
      }),
    );

    const serumLiquidMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe86b94,
        emissive: 0x7a1c3f,
        emissiveIntensity: 0.38,
        metalness: 0.05,
        roughness: 0.14,
        clearcoat: 0.8,
        transparent: true,
        opacity: 0.88,
      }),
    );

    // Outer sculpted glass flacon silhouette
    const bottleProfile = [
      new THREE.Vector2(0.0, -0.92),
      new THREE.Vector2(0.46, -0.92),
      new THREE.Vector2(0.54, -0.84),
      new THREE.Vector2(0.56, 0.14),
      new THREE.Vector2(0.52, 0.34),
      new THREE.Vector2(0.28, 0.52),
      new THREE.Vector2(0.25, 0.72),
      new THREE.Vector2(0.22, 0.72),
    ];
    const bottleGeo = trackGeo(new THREE.LatheGeometry(bottleProfile, 40));
    const bottleMesh = new THREE.Mesh(bottleGeo, flaconGlassMat);
    bottleMesh.renderOrder = 2;
    flaconGroup.add(bottleMesh);

    // Inner serum elixir liquid
    const liquidProfile = [
      new THREE.Vector2(0.0, -0.78),
      new THREE.Vector2(0.44, -0.78),
      new THREE.Vector2(0.47, 0.06),
      new THREE.Vector2(0.44, 0.12),
      new THREE.Vector2(0.0, 0.12),
    ];
    const liquidGeo = trackGeo(new THREE.LatheGeometry(liquidProfile, 32));
    const liquidMesh = new THREE.Mesh(liquidGeo, serumLiquidMat);
    liquidMesh.renderOrder = 1;
    flaconGroup.add(liquidMesh);

    // Brushed champagne-gold collar
    const collarGeo = trackGeo(new THREE.CylinderGeometry(0.29, 0.295, 0.34, 36));
    const collarMesh = new THREE.Mesh(collarGeo, brushedGoldMat);
    collarMesh.position.y = 0.74;
    collarMesh.castShadow = !isSoftwareGl;
    flaconGroup.add(collarMesh);

    // Collar stepped bevel ring
    const collarRingGeo = trackGeo(new THREE.TorusGeometry(0.295, 0.025, 14, 40));
    const collarRing = new THREE.Mesh(collarRingGeo, brushedGoldMat);
    collarRing.rotation.x = Math.PI / 2;
    collarRing.position.y = 0.57;
    flaconGroup.add(collarRing);

    // Matte velvet dropper bulb
    const bulbProfile = [
      new THREE.Vector2(0.0, 1.38),
      new THREE.Vector2(0.11, 1.35),
      new THREE.Vector2(0.16, 1.2),
      new THREE.Vector2(0.15, 0.91),
      new THREE.Vector2(0.19, 0.91),
    ];
    const bulbGeo = trackGeo(new THREE.LatheGeometry(bulbProfile, 28));
    const bulbMesh = new THREE.Mesh(bulbGeo, matteVelvetMat);
    flaconGroup.add(bulbMesh);

    // Internal glass pipette stem
    const pipetteGeo = trackGeo(new THREE.CylinderGeometry(0.042, 0.026, 1.12, 16));
    const pipetteMesh = new THREE.Mesh(pipetteGeo, innerPetalMat);
    pipetteMesh.position.y = -0.08;
    pipetteMesh.renderOrder = 1;
    flaconGroup.add(pipetteMesh);

    // Poised glowing serum droplet at pipette tip
    const dropGeo = trackGeo(new THREE.SphereGeometry(0.075, 16, 16));
    const dropMesh = new THREE.Mesh(dropGeo, crystalCoreMat);
    dropMesh.scale.set(0.85, 1.25, 0.85);
    dropMesh.position.y = -0.66;
    dropMesh.renderOrder = 1;
    flaconGroup.add(dropMesh);

    // =========================================================================
    // 3. 3D DERMAL COLLAGEN & LASER-SCAN MATRIX (Inspired by Facial Grid)
    // =========================================================================
    const matrixGroup = new THREE.Group();
    matrixGroup.position.set(0.45, -1.55, -2.5);
    matrixGroup.rotation.x = -0.45;
    matrixGroup.rotation.y = -0.22;
    scene.add(matrixGroup);

    const gridCols = 22;
    const gridRows = 14;
    const dermalPlaneGeo = trackGeo(new THREE.PlaneGeometry(5.2, 3.1, gridCols, gridRows));
    const dermalBasePositions = new Float32Array(dermalPlaneGeo.attributes.position.array);

    const dermalWireMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xe86b94,
        wireframe: true,
        transparent: true,
        opacity: 0.34,
      }),
    );
    const dermalMesh = new THREE.Mesh(dermalPlaneGeo, dermalWireMat);
    matrixGroup.add(dermalMesh);

    // Glowing Laser Scan Bar sweeping across dermal matrix
    const scanBarGeo = trackGeo(new THREE.BoxGeometry(0.055, 3.25, 0.08));
    const scanBarMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffd4e5,
        transparent: true,
        opacity: 0.88,
      }),
    );
    const scanBar = new THREE.Mesh(scanBarGeo, scanBarMat);
    matrixGroup.add(scanBar);

    const scanHaloGeo = trackGeo(new THREE.PlaneGeometry(0.68, 3.25));
    const scanHaloMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xe86b94,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    const scanHalo = new THREE.Mesh(scanHaloGeo, scanHaloMat);
    scanHalo.position.z = 0.02;
    scanBar.add(scanHalo);

    // Instanced Collagen Micro-Nodes on the dermal lattice
    const nodeCount = 96;
    const nodeGeo = trackGeo(new THREE.SphereGeometry(0.032, 10, 10));
    const nodeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf9dbe7,
        emissive: 0xe86b94,
        emissiveIntensity: 0.5,
        metalness: 0.4,
        roughness: 0.2,
      }),
    );
    const collagenNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    collagenNodes.frustumCulled = false;
    const nodeCoords: { x: number; y: number; phase: number; scale: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const col = i % 12;
      const row = Math.floor(i / 12);
      const x = ((col / 11) - 0.5) * 4.8;
      const y = ((row / 7) - 0.5) * 2.8;
      const scale = 0.78 + ((i * 37) % 100) / 250;
      nodeCoords.push({ x, y, phase: i * 0.4, scale });
      _dummy.position.set(x, y, 0);
      _dummy.scale.setScalar(scale);
      _dummy.updateMatrix();
      collagenNodes.setMatrixAt(i, _dummy.matrix);
    }
    collagenNodes.instanceMatrix.needsUpdate = true;
    collagenNodes.computeBoundingSphere();
    matrixGroup.add(collagenNodes);

    // =========================================================================
    // 4. RISING LUMINOUS ESSENCE PARTICLES (InstancedMesh)
    // =========================================================================
    const particleCount = 110;
    const particleGeo = trackGeo(new THREE.OctahedronGeometry(0.034, 0));
    const particleMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffd7e6,
        emissive: 0xe5c185,
        emissiveIntensity: 0.45,
        metalness: 0.65,
        roughness: 0.22,
      }),
    );
    const particlesMesh = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    particlesMesh.frustumCulled = false;

    const particleSeeds = Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2 * 3.7;
      const radius = 2.0 + ((i * 73) % 100) * 0.055;
      const y = (((i * 29) % 100) / 100 - 0.5) * 7.2;
      const speed = 0.14 + ((i * 19) % 100) * 0.0028;
      const scale = 0.55 + ((i * 41) % 100) * 0.011;
      return { angle, radius, y, speed, scale };
    });

    for (let i = 0; i < particleCount; i++) {
      const p = particleSeeds[i];
      _dummy.position.set(Math.cos(p.angle) * p.radius, p.y, Math.sin(p.angle) * p.radius - 0.8);
      _dummy.scale.setScalar(p.scale);
      _dummy.updateMatrix();
      particlesMesh.setMatrixAt(i, _dummy.matrix);
      _tempColor.setHex(i % 3 === 0 ? 0xe5c185 : i % 2 === 0 ? 0xf4a5c0 : 0xffffff);
      particlesMesh.setColorAt(i, _tempColor);
    }
    particlesMesh.instanceMatrix.needsUpdate = true;
    if (particlesMesh.instanceColor) particlesMesh.instanceColor.needsUpdate = true;
    particlesMesh.computeBoundingSphere();
    scene.add(particlesMesh);

    // Pre-compile shaders on GPU devices
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer Parallax Tracking
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Context Loss Handling
    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    resetCameraRef.current = () => {
      camera.position.set(0.4, 1.4, 7.6);
      controls.target.set(0.15, 0.0, -0.4);
      controls.update();
    };

    // Material finish palettes
    const finishPalettes: Record<
      MaterialFinish,
      { outer: number; mid: number; inner: number; gold: number; rim: number }
    > = {
      'rose-gold': { outer: 0xd97398, mid: 0xe6b99c, inner: 0xfbe5ef, gold: 0xe5c185, rim: 0xe86b94 },
      'pearl-quartz': { outer: 0xf0d6e4, mid: 0xfaf2f6, inner: 0xffffff, gold: 0xdfd3c3, rim: 0xf4a5c0 },
      'obsidian-champagne': { outer: 0x3b182c, mid: 0xe5c185, inner: 0xf5d6a7, gold: 0xf0c987, rim: 0xe5c185 },
    };

    // Animation Loop (paced with afterDraw fenceSync on software WebGL)
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    let smoothedScroll = scrollProgressRef.current;
    let smoothedBloom = 0.25;
    let userOrbiting = false;

    const onControlStart = () => {
      userOrbiting = true;
    };
    const onControlEnd = () => {
      userOrbiting = false;
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('end', onControlEnd);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 6);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 6);
      } else {
        frameId = window.setTimeout(cb, 90);
      }
    }

    function tick() {
      if (disposed) return;

      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();
      const props = livePropsRef.current;
      const motionScale = prefersReducedMotion ? 0.15 : 1.0;

      // Smoothly damp scroll & pointer
      smoothedScroll = THREE.MathUtils.damp(smoothedScroll, scrollProgressRef.current, 5.5, delta);
      pointer.x = THREE.MathUtils.damp(pointer.x, pointer.targetX, 4.5, delta);
      pointer.y = THREE.MathUtils.damp(pointer.y, pointer.targetY, 4.5, delta);

      // Smooth material finish transitions
      const pal = finishPalettes[props.finish];
      _colorA.setHex(pal.outer);
      outerPetalMat.color.lerp(_colorA, 1 - Math.exp(-5 * delta));
      _colorA.setHex(pal.mid);
      midPetalMat.color.lerp(_colorA, 1 - Math.exp(-5 * delta));
      _colorA.setHex(pal.inner);
      innerPetalMat.color.lerp(_colorA, 1 - Math.exp(-5 * delta));
      _colorA.setHex(pal.gold);
      brushedGoldMat.color.lerp(_colorA, 1 - Math.exp(-5 * delta));

      // Blend rim light toward active service accent
      _colorA.set(props.activeAccentHex || '#E86B94');
      _colorB.setHex(pal.rim);
      _colorA.lerp(_colorB, 0.35);
      rimLight.color.lerp(_colorA, 1 - Math.exp(-4 * delta));

      // Update laser scan color
      _colorA.set(props.laserScanColor || '#E86B94');
      dermalWireMat.color.lerp(_colorA, 1 - Math.exp(-5 * delta));
      scanHaloMat.color.lerp(_colorA, 1 - Math.exp(-5 * delta));
      nodeMat.emissive.lerp(_colorA, 1 - Math.exp(-5 * delta));

      // 1. Scroll-choreographed Bloom & Lotus Kinetics
      const targetBloom = props.studioMode
        ? props.manualBloom
        : THREE.MathUtils.clamp(0.18 + Math.sin(smoothedScroll * Math.PI * 1.15) * 0.72 + smoothedScroll * 0.18, 0.15, 0.98);
      smoothedBloom = THREE.MathUtils.damp(smoothedBloom, targetBloom, 4.2, delta);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        const breath = Math.sin(elapsed * 1.15 * motionScale + p.phase) * 0.035;
        p.pivot.rotation.x = THREE.MathUtils.lerp(p.baseTilt, p.maxTilt, smoothedBloom) + breath;
      }

      lotusGroup.rotation.y = elapsed * 0.18 * motionScale + smoothedScroll * Math.PI * 1.65;
      lotusGroup.position.y = -0.22 + Math.sin(elapsed * 0.9 * motionScale) * 0.12;
      crystalCore.rotation.y = -elapsed * 0.65 * motionScale;
      crystalCore.position.y = 0.46 + Math.sin(elapsed * 1.6 * motionScale) * 0.05;
      haloRingOuter.rotation.z = elapsed * 0.22 * motionScale;
      haloRingInner.rotation.y = -elapsed * 0.32 * motionScale;

      // 2. Serum Flacon Float & Gentle Tilt
      flaconGroup.position.y = -0.28 + Math.sin(elapsed * 1.05 * motionScale + 1.4) * 0.16;
      flaconGroup.rotation.y = elapsed * 0.28 * motionScale + smoothedScroll * 2.2;
      dropMesh.position.y = -0.66 - Math.abs(Math.sin(elapsed * 1.4 * motionScale)) * 0.06;

      // 3. Dermal Collagen Matrix Wave & Laser Scan Sweep
      const scanPos = Math.sin(elapsed * props.laserScanSpeed * motionScale) * 2.35;
      scanBar.position.x = scanPos;

      const posAttr = dermalPlaneGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        const bx = dermalBasePositions[i * 3];
        const by = dermalBasePositions[i * 3 + 1];
        const distToScan = Math.abs(bx - scanPos);
        const tighten = Math.exp(-distToScan * distToScan * 1.6);
        // Smooth organic wave that tightens as the laser beam passes
        const wave =
          (Math.sin(bx * 1.25 + elapsed * 1.2 * motionScale) * 0.16 +
            Math.cos(by * 1.65 - elapsed * 0.95 * motionScale) * 0.12) *
            (1 - tighten * 0.55) +
          tighten * 0.18;
        const arch = -0.055 * (bx * bx + by * by);
        posAttr.setZ(i, wave + arch);
      }
      posAttr.needsUpdate = true;

      for (let i = 0; i < nodeCount; i++) {
        const nc = nodeCoords[i];
        const dist = Math.abs(nc.x - scanPos);
        const boost = Math.exp(-dist * dist * 1.9);
        const z =
          (Math.sin(nc.x * 1.25 + elapsed * 1.2 * motionScale) * 0.16 +
            Math.cos(nc.y * 1.65 - elapsed * 0.95 * motionScale) * 0.12) *
            (1 - boost * 0.55) +
          boost * 0.2 -
          0.055 * (nc.x * nc.x + nc.y * nc.y);
        _dummy.position.set(nc.x, nc.y, z + 0.03);
        _dummy.scale.setScalar(nc.scale * (1 + boost * 0.65));
        _dummy.updateMatrix();
        collagenNodes.setMatrixAt(i, _dummy.matrix);
      }
      collagenNodes.instanceMatrix.needsUpdate = true;

      // 4. Rising Essence Particles
      for (let i = 0; i < particleCount; i++) {
        const p = particleSeeds[i];
        const yWrapped = ((((p.y + elapsed * p.speed * motionScale + 3.6) % 7.2) + 7.2) % 7.2) - 3.6;
        const ang = p.angle + elapsed * 0.07 * motionScale;
        _dummy.position.set(
          Math.cos(ang) * p.radius,
          yWrapped,
          Math.sin(ang) * p.radius - 0.8,
        );
        _dummy.rotation.set(elapsed * 0.5 + i, elapsed * 0.4, 0);
        _dummy.scale.setScalar(p.scale * (0.8 + 0.25 * Math.sin(elapsed * 1.8 + i)));
        _dummy.updateMatrix();
        particlesMesh.setMatrixAt(i, _dummy.matrix);
      }
      particlesMesh.instanceMatrix.needsUpdate = true;

      // 5. Camera Choreography: Scroll Narrative vs Interactive Studio Mode
      controls.enabled = props.studioMode;

      if (props.studioMode) {
        if (!userOrbiting && props.focusTarget !== 'auto') {
          if (props.focusTarget === 'lotus') {
            _lookTarget.set(1.65, 0.1, 0);
          } else if (props.focusTarget === 'flacon') {
            _lookTarget.set(-2.35, 0.05, -1.65);
          } else if (props.focusTarget === 'matrix') {
            _lookTarget.set(0.45, -1.4, -2.5);
          }
          controls.target.lerp(_lookTarget, 1 - Math.exp(-4.5 * delta));
        }
        controls.update();
      } else {
        // 5-Chapter Cinematic Scroll Camera Path
        const s = smoothedScroll;
        let cx = 1.1;
        let cy = 1.25;
        let cz = 7.9;
        let lx = 0.6;
        let ly = -0.1;
        let lz = -0.2;

        if (s < 0.25) {
          // Chapter 1: Hero — Framing Lotus & Serum Flacon in balanced asymmetry
          const t = s / 0.25;
          cx = THREE.MathUtils.lerp(0.85, 2.35, t);
          cy = THREE.MathUtils.lerp(1.25, 1.55, t);
          cz = THREE.MathUtils.lerp(7.9, 6.7, t);
          lx = THREE.MathUtils.lerp(0.45, 1.15, t);
          ly = THREE.MathUtils.lerp(-0.1, 0.05, t);
          lz = THREE.MathUtils.lerp(-0.2, -0.35, t);
        } else if (s < 0.52) {
          // Chapter 2: Services — Orbiting Blooming Lotus & shifting subtly by selected service
          const t = (s - 0.25) / 0.27;
          const focusShift = props.serviceFocus === 'flacon' ? -1.1 : props.serviceFocus === 'matrix' ? 0.3 : 0.7;
          cx = THREE.MathUtils.lerp(2.35, -1.6 + focusShift * 0.4, t);
          cy = THREE.MathUtils.lerp(1.55, 0.95, t);
          cz = THREE.MathUtils.lerp(6.7, 6.2, t);
          lx = THREE.MathUtils.lerp(1.15, -0.45 + focusShift * 0.35, t);
          ly = THREE.MathUtils.lerp(0.05, -0.15, t);
          lz = THREE.MathUtils.lerp(-0.35, -0.95, t);
        } else if (s < 0.75) {
          // Chapter 3: Doctor Intro & Apparatus Laser — Gliding toward Dermal Collagen Matrix
          const t = (s - 0.52) / 0.23;
          cx = THREE.MathUtils.lerp(-1.6, 0.95, t);
          cy = THREE.MathUtils.lerp(0.95, -0.15, t);
          cz = THREE.MathUtils.lerp(6.2, 4.35, t);
          lx = THREE.MathUtils.lerp(-0.45, 0.42, t);
          ly = THREE.MathUtils.lerp(-0.15, -1.25, t);
          lz = THREE.MathUtils.lerp(-0.95, -2.35, t);
        } else {
          // Chapter 4 & 5: Results & Clinic Finale — Wide Golden Symmetry
          const t = (s - 0.75) / 0.25;
          cx = THREE.MathUtils.lerp(0.95, -0.35, t);
          cy = THREE.MathUtils.lerp(-0.15, 1.45, t);
          cz = THREE.MathUtils.lerp(4.35, 8.6, t);
          lx = THREE.MathUtils.lerp(0.42, 0.15, t);
          ly = THREE.MathUtils.lerp(-1.25, -0.2, t);
          lz = THREE.MathUtils.lerp(-2.35, -0.85, t);
        }

        // Subtle pointer parallax
        _camTargetPos.set(cx + pointer.x * 0.42 * motionScale, cy + pointer.y * 0.28 * motionScale, cz);
        _lookTarget.set(lx, ly, lz);

        camera.position.lerp(_camTargetPos, 1 - Math.exp(-3.8 * delta));
        _currentLook.lerp(_lookTarget, 1 - Math.exp(-4.2 * delta));
        camera.lookAt(_currentLook);
        controls.target.copy(_currentLook);
      }

      if (!contextLost) {
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('end', onControlEnd);
      controls.dispose();

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgressRef]);

  return (
    <>
      {/* Dedicated Isolated WebGL Container (zero sibling DOM clutter inside ref) */}
      <div
        className={`fixed inset-0 z-0 transition-opacity duration-500 ${
          studioMode ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'
        }`}
        aria-hidden={!studioMode}
      >
        {webglFailed ? (
          <div className="w-full h-full bg-gradient-to-br from-[#190914] via-[#0D060B] to-[#260E1F]" />
        ) : (
          <div ref={mountRef} className="w-full h-full" />
        )}
        {/* Atmospheric legibility vignette when browsing content */}
        {!studioMode && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 72% 38%, rgba(232,107,148,0.06) 0%, rgba(13,6,11,0.52) 56%, rgba(13,6,11,0.84) 100%)',
            }}
          />
        )}
      </div>

      {/* Interactive 3D Studio Mode Toggle (discreet bottom-right button when scrolling) */}
      {!studioMode && !webglFailed && (
        <button
          type="button"
          onClick={() => onToggleStudioMode(true)}
          className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#F9EEF3] bg-[#1C0C17]/95 border border-[#F4A5C0]/25 hover:border-[#E86B94]/70 hover:bg-[#271120] rounded-md shadow-lg transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86B94]"
          title="3D sahnani 360° aylantirib ko‘rish"
        >
          <Eye className="w-4 h-4 text-[#E5C185]" />
          <span>3D sahna</span>
        </button>
      )}

      {/* Unified Collapsible Bottom Control Dock (only visible in 3D Studio Inspector Mode) */}
      {studioMode && (
        <>
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#170A13]/95 border border-[#F4A5C0]/25 rounded-md flex items-center gap-4 text-[13px] text-[#F9EEF3] shadow-xl">
            <span className="font-medium whitespace-nowrap">
              3D Studiya · Sichqoncha bilan aylantiring va yaqinlashtiring
            </span>
            <button
              type="button"
              onClick={() => onToggleStudioMode(false)}
              className="px-3 py-1 text-[12px] font-semibold bg-[#E86B94] text-[#14070F] hover:bg-[#F182A7] rounded transition-colors whitespace-nowrap cursor-pointer"
            >
              Saytga qaytish
            </button>
          </div>

          <div
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[min(900px,94vw)] transition-transform duration-300"
            style={{ transform: `translate(-50%, ${dockCollapsed ? 'calc(100% - 34px)' : '0%'})` }}
          >
            <div className="flex justify-center mb-1.5">
              <button
                type="button"
                onClick={() => setDockCollapsed((c) => !c)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[12px] font-medium text-[#F9EEF3] bg-[#190B15]/95 border border-[#F4A5C0]/25 rounded-md hover:border-[#E86B94]/60 transition-colors cursor-pointer"
              >
                {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{dockCollapsed ? 'Boshqaruvni ochish (H)' : 'Boshqaruvni yashirish (H)'}</span>
              </button>
            </div>

            <div className="bg-[#160A12]/96 border border-[#F4A5C0]/22 rounded-lg p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              {/* Bloom Slider */}
              <div className="flex items-center gap-3 min-w-[180px] flex-1">
                <Sliders className="w-4 h-4 text-[#E5C185] shrink-0" />
                <label htmlFor="lotus-bloom-slider" className="text-[12px] text-[#B89EA9] whitespace-nowrap">
                  Lotus ochilishi
                </label>
                <input
                  id="lotus-bloom-slider"
                  type="range"
                  min={0.15}
                  max={1}
                  step={0.01}
                  value={manualBloom}
                  onChange={(e) => setManualBloom(parseFloat(e.target.value))}
                  className="w-full accent-[#E86B94] cursor-pointer"
                />
              </div>

              {/* Material Finish Swatches */}
              <div className="flex items-center gap-1.5 bg-[#0D060B] p-1 rounded-md border border-[#F4A5C0]/15">
                {(
                  [
                    { id: 'rose-gold', label: 'Atirgul oltin' },
                    { id: 'pearl-quartz', label: 'Marvarid' },
                    { id: 'obsidian-champagne', label: 'Shampan' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFinish(item.id)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                      finish === item.id
                        ? 'bg-[#E86B94] text-[#14070F]'
                        : 'text-[#B89EA9] hover:text-[#F9EEF3]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Focus Object Presets */}
              <div className="flex items-center gap-1.5 bg-[#0D060B] p-1 rounded-md border border-[#F4A5C0]/15">
                {(
                  [
                    { id: 'lotus', label: 'Lotus' },
                    { id: 'flacon', label: 'Zardob' },
                    { id: 'matrix', label: 'Lazer to‘r' },
                  ] as const
                ).map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setFocusTarget(target.id)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                      focusTarget === target.id
                        ? 'bg-[#2A1424] text-[#F9EEF3] border border-[#E5C185]/40'
                        : 'text-[#B89EA9] hover:text-[#F9EEF3]'
                    }`}
                  >
                    {target.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setFocusTarget('auto');
                  resetCameraRef.current?.();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#F9EEF3] border border-[#F4A5C0]/20 hover:border-[#E86B94]/60 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tiklash</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
