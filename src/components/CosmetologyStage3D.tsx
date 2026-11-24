import { Layers, Move3d } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { APPARATUS_PROCEDURES, type ApparatusItem } from '../data/clinicData';

interface CosmetologyStage3DProps {
  activeApparatusId: string;
  onSelectApparatus: (id: string) => void;
  onOpenBooking: (serviceId?: string) => void;
}

const _dummy = new THREE.Object3D();
const _targetColor = new THREE.Color();

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

function createRoundedSlabShape(width: number, depth: number, radius: number): THREE.Shape {
  const s = new THREE.Shape();
  const hw = width / 2;
  const hd = depth / 2;
  s.moveTo(-hw + radius, -hd);
  s.lineTo(hw - radius, -hd);
  s.quadraticCurveTo(hw, -hd, hw, -hd + radius);
  s.lineTo(hw, hd - radius);
  s.quadraticCurveTo(hw, hd, hw - radius, hd);
  s.lineTo(-hw + radius, hd);
  s.quadraticCurveTo(-hw, hd, -hw, hd - radius);
  s.lineTo(-hw, -hd + radius);
  s.quadraticCurveTo(-hw, -hd, -hw + radius, -hd);
  return s;
}

function createBaseGridTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1b0c17';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(229, 193, 133, 0.22)';
    ctx.lineWidth = 1.5;
    const step = 32;
    for (let i = 0; i <= size; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    // Precision dermal calibration rings
    ctx.strokeStyle = 'rgba(244, 165, 192, 0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.18, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Dedicated, generous-dimension interactive 3D Cosmetology Block inside the page.
 * Showcases a 3-layer anatomical dermal cross-section (Epidermis, Collagen Helix Matrix,
 * Hyaluronic Hydration Spheres & Base) with a live rose-gold aesthetic laser/RF/serum handpiece.
 */
export function CosmetologyStage3D({
  activeApparatusId,
  onSelectApparatus,
  onOpenBooking,
}: CosmetologyStage3DProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [exploded, setExploded] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const activeItem: ApparatusItem =
    APPARATUS_PROCEDURES.find((p) => p.id === activeApparatusId) || APPARATUS_PROCEDURES[0];

  const liveStateRef = useRef({
    modeId: activeItem.id,
    scanColor: activeItem.scanColor,
    scanSpeed: activeItem.scanSpeed,
    exploded,
  });
  liveStateRef.current = {
    modeId: activeItem.id,
    scanColor: activeItem.scanColor,
    scanSpeed: activeItem.scanSpeed,
    exploded,
  };

  useEffect(() => {
    const container = canvasMountRef.current;
    const stageEl = stageRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: true,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x130811);
    scene.fog = new THREE.FogExp2(0x130811, 0.045);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);

    const updateCameraFraming = () => {
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 480;
      const aspect = w / h;
      camera.aspect = aspect;
      // Adaptive framing so model NEVER feels cramped on narrow portrait mobile or wide desktop
      camera.fov = aspect < 0.95 ? 46 : 36;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    updateCameraFraming();
    camera.position.set(4.4, 3.25, 5.4);

    // Interactive 360° orbit without hijacking page vertical scroll
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minPolarAngle = Math.PI * 0.16;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 0.45, 0);
    controls.update();

    // Three-point warm/cool studio rig + RectAreaLight softboxes (GPU)
    const hemi = new THREE.HemisphereLight(0xfbe2ee, 0x240b1b, 0.95);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffeadb, 2.3);
    keyLight.position.set(5, 8, 5.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -4.5;
      keyLight.shadow.camera.right = 4.5;
      keyLight.shadow.camera.top = 4.5;
      keyLight.shadow.camera.bottom = -4.5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const treatmentPointLight = new THREE.PointLight(0xe86b94, 14, 12, 1.8);
    treatmentPointLight.position.set(0, 1.8, 0);
    scene.add(treatmentPointLight);

    const rimLight = new THREE.DirectionalLight(0xe5c185, 1.15);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xffdce9, 3.5, 4.8, 2.2);
      softbox.position.set(0, 4.8, 1.8);
      softbox.lookAt(0, 0.4, 0);
      scene.add(softbox);
    }

    // Track disposable resources
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

    const gridTex = createBaseGridTexture();
    gridTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(gridTex);

    // =========================================================================
    // COMPOSITE 3D COSMETOLOGY SKIN MODEL + HANDPIECE ASSEMBLY
    // =========================================================================
    const rootAssembly = new THREE.Group();
    scene.add(rootAssembly);

    // Ground contact shadow plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 18, 128, 128, 124);
      grad.addColorStop(0, 'rgba(6, 2, 5, 0.65)');
      grad.addColorStop(1, 'rgba(6, 2, 5, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const contactTex = new THREE.CanvasTexture(shadowCanvas);
    textures.push(contactTex);
    const contactPlane = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(6.8, 5.2)),
      trackMat(
        new THREE.MeshBasicMaterial({
          map: contactTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.7,
        }),
      ),
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = -0.78;
    rootAssembly.add(contactPlane);

    // Shared calibrated PBR materials (roughness delta >= 0.25 across adjacent parts)
    const brushedGoldMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe5c185,
        metalness: 0.94,
        roughness: 0.18,
        anisotropy: 0.8,
        clearcoat: 0.45,
      }),
    );

    const velvetBaseMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x26101f,
        metalness: 0.12,
        roughness: 0.72,
      }),
    );

    const calibrationTopMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: gridTex,
        roughness: 0.52,
        metalness: 0.18,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );

    // -------------------------------------------------------------------------
    // LAYER 1: SUBCUTANEOUS ARCHITECTURAL BASE TRAY
    // -------------------------------------------------------------------------
    const baseLayer = new THREE.Group();
    rootAssembly.add(baseLayer);

    const slabShape = createRoundedSlabShape(4.0, 2.8, 0.36);
    const baseGeo = trackGeo(
      new THREE.ExtrudeGeometry(slabShape, {
        depth: 0.28,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3,
      }),
    );
    baseGeo.rotateX(Math.PI / 2);
    const baseMesh = new THREE.Mesh(baseGeo, velvetBaseMat);
    baseMesh.position.y = -0.36;
    baseMesh.receiveShadow = !isSoftwareGl;
    baseMesh.castShadow = !isSoftwareGl;
    baseLayer.add(baseMesh);

    // Precision grid top plate (offset +0.02 above base to prevent Z-fighting)
    const gridPlate = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(3.62, 2.42)),
      calibrationTopMat,
    );
    gridPlate.rotation.x = -Math.PI / 2;
    gridPlate.position.y = -0.3;
    baseLayer.add(gridPlate);

    // Brushed champagne-gold perimeter trim
    const trimShape = createRoundedSlabShape(4.14, 2.94, 0.4);
    const trimHole = createRoundedSlabShape(3.96, 2.76, 0.34);
    trimShape.holes.push(trimHole);
    const trimGeo = trackGeo(
      new THREE.ExtrudeGeometry(trimShape, {
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
      }),
    );
    trimGeo.rotateX(Math.PI / 2);
    const trimMesh = new THREE.Mesh(trimGeo, brushedGoldMat);
    trimMesh.position.y = -0.33;
    baseLayer.add(trimMesh);

    // -------------------------------------------------------------------------
    // LAYER 2: DERMIS COLLAGEN HELIX FIBERS & HYALURONIC HYDRATION SPHERES
    // -------------------------------------------------------------------------
    const dermisLayer = new THREE.Group();
    dermisLayer.position.y = 0.08;
    rootAssembly.add(dermisLayer);

    // 5 Sculpted Helical Champagne-Gold Collagen Strands (TubeGeometry)
    const collagenMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe8b98a,
        emissive: 0x5c2038,
        emissiveIntensity: 0.25,
        metalness: 0.85,
        roughness: 0.22,
        clearcoat: 0.6,
      }),
    );

    const collagenStrands: THREE.Mesh[] = [];
    for (let row = 0; row < 5; row++) {
      const zOff = (row - 2) * 0.48;
      const pts: THREE.Vector3[] = [];
      const steps = 44;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = (t - 0.5) * 3.55;
        const phase = t * Math.PI * 6 + row * 1.1;
        const y = Math.sin(phase) * 0.12;
        const z = zOff + Math.cos(phase) * 0.09;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = trackGeo(new THREE.TubeGeometry(curve, 64, 0.036, 10, false));
      const strand = new THREE.Mesh(tubeGeo, collagenMat);
      strand.castShadow = !isSoftwareGl;
      dermisLayer.add(strand);
      collagenStrands.push(strand);
    }

    // 64 Instanced Luminous Hyaluronic Hydration Spheres
    const sphereCount = 64;
    const hydroMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffd9ea,
        emissive: 0xe86b94,
        emissiveIntensity: 0.35,
        metalness: 0.12,
        roughness: 0.1,
        clearcoat: 1.0,
        iridescence: 0.75,
      }),
    );
    const hydroMesh = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.085, 16, 16)),
      hydroMat,
      sphereCount,
    );
    hydroMesh.frustumCulled = false;

    const hydroSeeds = Array.from({ length: sphereCount }, (_, i) => {
      const col = i % 8;
      const row = Math.floor(i / 8);
      return {
        x: ((col / 7) - 0.5) * 3.35,
        z: ((row / 7) - 0.5) * 2.15,
        baseY: (((i * 23) % 10) / 10 - 0.5) * 0.24,
        scale: 0.75 + ((i * 31) % 100) * 0.0045,
        phase: i * 0.52,
      };
    });
    for (let i = 0; i < sphereCount; i++) {
      const s = hydroSeeds[i];
      _dummy.position.set(s.x, s.baseY, s.z);
      _dummy.scale.setScalar(s.scale);
      _dummy.updateMatrix();
      hydroMesh.setMatrixAt(i, _dummy.matrix);
    }
    hydroMesh.instanceMatrix.needsUpdate = true;
    hydroMesh.computeBoundingSphere();
    dermisLayer.add(hydroMesh);

    // -------------------------------------------------------------------------
    // LAYER 3: TRANSLUCENT OPALESCENT EPIDERMIS SURFACE + LASER GRID
    // -------------------------------------------------------------------------
    const epidermisLayer = new THREE.Group();
    epidermisLayer.position.y = 0.62;
    rootAssembly.add(epidermisLayer);

    const epiPlaneGeo = trackGeo(new THREE.PlaneGeometry(3.85, 2.65, 32, 22));
    epiPlaneGeo.rotateX(-Math.PI / 2);
    const epiBasePos = new Float32Array(epiPlaneGeo.attributes.position.array);

    const epiSurfaceMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xf7cddc,
        metalness: 0.04,
        roughness: 0.22,
        transmission: isSoftwareGl ? 0 : 0.48,
        transparent: true,
        opacity: isSoftwareGl ? 0.52 : 0.84,
        ior: 1.42,
        thickness: 0.45,
        clearcoat: 0.9,
        sheen: 0.7,
        sheenColor: new THREE.Color(0xfff0f6),
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    const epiMesh = new THREE.Mesh(epiPlaneGeo, epiSurfaceMat);
    epiMesh.renderOrder = 2;
    epidermisLayer.add(epiMesh);

    const epiGridMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xe86b94,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      }),
    );
    const epiGridMesh = new THREE.Mesh(epiPlaneGeo, epiGridMat);
    epiGridMesh.position.y = 0.015;
    epiGridMesh.renderOrder = 3;
    epidermisLayer.add(epiGridMesh);

    // -------------------------------------------------------------------------
    // COMPOSITE 3D AESTHETIC COSMETOLOGY HANDPIECE (6-Part Sculpted Wand)
    // -------------------------------------------------------------------------
    const handpieceGroup = new THREE.Group();
    handpieceGroup.position.set(0, 1.65, 0);
    handpieceGroup.rotation.z = -0.22;
    rootAssembly.add(handpieceGroup);

    const pearlBodyMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xfbf3f7,
        metalness: 0.08,
        roughness: 0.16,
        clearcoat: 1.0,
      }),
    );

    const wandProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.14, 0.02),
      new THREE.Vector2(0.22, 0.25),
      new THREE.Vector2(0.25, 0.78),
      new THREE.Vector2(0.21, 1.38),
      new THREE.Vector2(0.14, 1.68),
      new THREE.Vector2(0.0, 1.72),
    ];
    const wandBody = new THREE.Mesh(
      trackGeo(new THREE.LatheGeometry(wandProfile, 32)),
      pearlBodyMat,
    );
    wandBody.castShadow = !isSoftwareGl;
    handpieceGroup.add(wandBody);

    // Brushed champagne accent collar & status ring
    const wandCollar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.235, 0.19, 0.24, 32)),
      brushedGoldMat,
    );
    wandCollar.position.y = 0.24;
    handpieceGroup.add(wandCollar);

    const wandRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.245, 0.022, 14, 36)),
      brushedGoldMat,
    );
    wandRing.rotation.x = Math.PI / 2;
    wandRing.position.y = 0.92;
    handpieceGroup.add(wandRing);

    // Optical Sapphire Emitter Lens
    const emitterMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffd4e5,
        emissive: 0xe86b94,
        emissiveIntensity: 1.35,
        roughness: 0.1,
        metalness: 0.2,
      }),
    );
    const emitterTip = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.13, 0.095, 0.12, 24)),
      emitterMat,
    );
    emitterTip.position.y = -0.04;
    handpieceGroup.add(emitterTip);

    // Volumetric Laser / RF / Phototherapy Light Cone
    const beamMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xe86b94,
        transparent: true,
        opacity: 0.26,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    const beamCone = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.58, 1.15, 28, 1, true)),
      beamMat,
    );
    beamCone.position.y = -0.62;
    beamCone.renderOrder = 4;
    handpieceGroup.add(beamCone);

    // Luminous Surface Treatment Ring on Epidermis
    const impactRingMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffd7e8,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    const impactRing = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(0.28, 0.42, 36)),
      impactRingMat,
    );
    impactRing.rotation.x = -Math.PI / 2;
    impactRing.position.y = 0.06;
    impactRing.renderOrder = 5;
    epidermisLayer.add(impactRing);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ResizeObserver for crisp responsive sizing on mobile & desktop
    const resizeObserver = new ResizeObserver(() => {
      updateCameraFraming();
    });
    resizeObserver.observe(container);

    // Pause rendering when block is scrolled completely off-screen
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: '140px' },
    );
    if (stageEl) intersectionObserver.observe(stageEl);

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

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    let explodeFactor = 0;

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
            frameId = window.setTimeout(cb, 85);
          }
        };
        frameId = window.setTimeout(poll, 6);
      } else {
        frameId = window.setTimeout(cb, 95);
      }
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      if (isVisible && !contextLost) {
        const st = liveStateRef.current;
        const motionScale = prefersReducedMotion ? 0.15 : 1.0;

        // Smoothly damp exploded layers separation
        explodeFactor = THREE.MathUtils.damp(explodeFactor, st.exploded ? 1 : 0, 5.2, delta);
        baseLayer.position.y = -explodeFactor * 0.42;
        dermisLayer.position.y = 0.08 + explodeFactor * 0.14;
        epidermisLayer.position.y = 0.62 + explodeFactor * 0.72;

        // Smoothly transition active mode colors
        _targetColor.set(st.scanColor);
        treatmentPointLight.color.lerp(_targetColor, 1 - Math.exp(-5 * delta));
        emitterMat.emissive.lerp(_targetColor, 1 - Math.exp(-5 * delta));
        beamMat.color.lerp(_targetColor, 1 - Math.exp(-5 * delta));
        epiGridMat.color.lerp(_targetColor, 1 - Math.exp(-5 * delta));
        hydroMat.emissive.lerp(_targetColor, 1 - Math.exp(-5 * delta));

        // Handpiece figure-8 treatment glide over the skin slab
        const t = elapsed * st.scanSpeed * motionScale;
        const scanX = Math.sin(t * 0.9) * 1.25;
        const scanZ = Math.sin(t * 1.8) * 0.62;
        handpieceGroup.position.x = scanX;
        handpieceGroup.position.z = scanZ;
        handpieceGroup.position.y = 1.62 + explodeFactor * 0.72 + Math.sin(t * 2.1) * 0.05;
        handpieceGroup.rotation.z = -0.18 - scanX * 0.06;
        handpieceGroup.rotation.x = scanZ * 0.08;

        treatmentPointLight.position.set(scanX, 1.35 + explodeFactor * 0.6, scanZ);

        // Mode-specific beam geometry & pulse
        const pulse = 0.88 + Math.sin(elapsed * 4.2 * motionScale) * 0.14;
        if (st.modeId === 'phototherapy') {
          beamCone.scale.set(1.45, 1.0, 1.45);
          beamMat.opacity = 0.24 * pulse;
        } else if (st.modeId === 'rf-lifting') {
          beamCone.scale.set(1.1, 1.05, 1.1);
          beamMat.opacity = 0.3 * pulse;
        } else {
          beamCone.scale.set(0.85, 1.0, 0.85);
          beamMat.opacity = 0.28 * pulse;
        }

        impactRing.position.set(scanX, 0.06, scanZ);
        impactRing.scale.setScalar(0.85 + Math.sin(elapsed * 4.5 * motionScale) * 0.22);

        // Real-time Epidermis smoothing & rejuvenation wave beneath handpiece
        const posAttr = epiPlaneGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < posAttr.count; i++) {
          const bx = epiBasePos[i * 3];
          const bz = epiBasePos[i * 3 + 2];
          const dx = bx - scanX;
          const dz = bz - scanZ;
          const distSq = dx * dx + dz * dz;
          const smoothZone = Math.exp(-distSq * 1.45);

          const microRipple =
            (Math.sin(bx * 2.2 + elapsed * 1.1 * motionScale) * 0.045 +
              Math.cos(bz * 2.5 - elapsed * 0.9 * motionScale) * 0.035) *
            (1 - smoothZone * 0.75);
          const liftBump =
            st.modeId === 'rf-lifting'
              ? smoothZone * 0.11
              : st.modeId === 'ultrasound'
                ? smoothZone * 0.08
                : smoothZone * 0.055;
          posAttr.setY(i, microRipple + liftBump);
        }
        posAttr.needsUpdate = true;

        // Animate collagen strands subtle lifting bounce
        for (let r = 0; r < collagenStrands.length; r++) {
          collagenStrands[r].position.y =
            Math.sin(elapsed * 1.5 * motionScale + r * 0.8) * 0.025 +
            (st.modeId === 'rf-lifting' ? 0.05 : 0);
        }

        // Animate hyaluronic hydration spheres swelling when energized
        const isHydro = st.modeId === 'ultrasound';
        for (let i = 0; i < sphereCount; i++) {
          const s = hydroSeeds[i];
          const dx = s.x - scanX;
          const dz = s.z - scanZ;
          const boost = Math.exp(-(dx * dx + dz * dz) * 1.2);
          const yBob =
            s.baseY + Math.sin(elapsed * 1.7 * motionScale + s.phase) * 0.04 + boost * 0.09;
          const radScale = s.scale * (1 + boost * (isHydro ? 0.58 : 0.34));
          _dummy.position.set(s.x, yBob, s.z);
          _dummy.scale.setScalar(radScale);
          _dummy.updateMatrix();
          hydroMesh.setMatrixAt(i, _dummy.matrix);
        }
        hydroMesh.instanceMatrix.needsUpdate = true;

        // Slow majestic stage rotation when idle
        rootAssembly.rotation.y = Math.sin(elapsed * 0.22 * motionScale) * 0.16;

        controls.update();
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
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
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
  }, []);

  return (
    <div
      ref={stageRef}
      className="w-full bg-[#130811]/94 border border-[#F4A5C0]/20 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Generous, Uncramped 3D Viewport on BOTH Mobile & Desktop */}
      <div className="relative w-full h-[430px] sm:h-[520px] lg:h-[600px] bg-[#130811]">
        {webglFailed ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#230E1D] to-[#11060E] p-8 text-center">
            <p className="text-[15px] text-[#D7C2CC]">
              3D interaktiv teri qatlamlari modeli · {activeItem.title}
            </p>
          </div>
        ) : (
          <div
            ref={canvasMountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
            aria-label="3D kosmetologiya teri qatlamlari va apparat ta’siri modeli"
          />
        )}

        {/* Minimal Top-Left Unboxed Spec Overlay (zero viewport occlusion) */}
        <div className="pointer-events-none absolute top-5 left-5 sm:top-7 sm:left-7 right-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[12px] font-mono-num text-[#E5C185]">
              <span>{activeItem.wavelength}</span>
              <span aria-hidden="true">·</span>
              <span>{activeItem.depth}</span>
            </div>
            <h3 className="font-display text-[26px] sm:text-[32px] font-semibold text-[#F9EEF3] leading-none">
              {activeItem.title}
            </h3>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-[#B89EA9] bg-[#0D060B]/80 border border-[#F4A5C0]/15 px-3 py-1.5 rounded-md">
            <Move3d className="w-3.5 h-3.5 text-[#E5C185]" />
            <span>360° aylantiring</span>
          </div>
        </div>

        {/* Minimal Mobile Hint + Exploded Layers Toggle in Bottom Corners */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-7 sm:right-7 flex items-end justify-between gap-3 pointer-events-none">
          <p className="text-[13px] sm:text-[14px] text-[#E4D1DA] max-w-[38ch] bg-[#0D060B]/84 px-3.5 py-2 rounded-lg border border-[#F4A5C0]/14">
            {activeItem.effect}
          </p>

          <button
            type="button"
            onClick={() => setExploded((prev) => !prev)}
            className={`pointer-events-auto inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-[12.5px] font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              exploded
                ? 'bg-[#E5C185] text-[#14070F] border-[#E5C185] font-semibold'
                : 'bg-[#0D060B]/88 text-[#F9EEF3] border-[#F4A5C0]/24 hover:border-[#E86B94]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{exploded ? 'Yig‘ish' : 'Qatlamlar'}</span>
          </button>
        </div>
      </div>

      {/* Crisp Touch-First Control Bar Underneath the 3D Stage */}
      <div className="p-4 sm:p-5 bg-[#190B15] border-t border-[#F4A5C0]/14 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
          {APPARATUS_PROCEDURES.map((proc) => {
            const isActive = proc.id === activeItem.id;
            return (
              <button
                key={proc.id}
                type="button"
                onClick={() => onSelectApparatus(proc.id)}
                className={`min-h-[44px] px-3.5 py-2.5 text-[13px] font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#E86B94] text-[#14070F] border-[#E86B94] font-semibold'
                    : 'bg-[#12070F] text-[#D7C2CC] border-[#F4A5C0]/15 hover:border-[#F4A5C0]/40 hover:text-[#F9EEF3]'
                }`}
              >
                {proc.shortLabel}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onOpenBooking(activeItem.id)}
          className="min-h-[44px] px-5 py-2.5 text-[13px] font-semibold text-[#F9EEF3] bg-[#261221] hover:bg-[#31172A] border border-[#E5C185]/35 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Ushbu muolajaga yozilish →
        </button>
      </div>
    </div>
  );
}
