import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface Scene3DProps {
  scrollProgressRef: MutableRefObject<number>;
  activeAccentHex: string;
}

// Pre-allocated math helpers at module scope (Zero GC in render loop)
const _camTargetPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _currentLook = new THREE.Vector3(0, 0, 0);
const _dummy = new THREE.Object3D();
const _colorA = new THREE.Color();
const _tempColor = new THREE.Color();

interface PetalHandle {
  pivot: THREE.Group;
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

function createPetalGeometry(length: number, width: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.52, length * 0.18, width * 0.62, length * 0.68, 0, length);
  shape.bezierCurveTo(-width * 0.62, length * 0.68, -width * 0.52, length * 0.18, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.6,
    bevelSize: width * 0.055,
    bevelSegments: 2,
    curveSegments: 14,
  });

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = Math.max(0, Math.min(1, y / length));
    const cup = ((x * x) / (width * width + 0.001)) * 0.22;
    const arch = Math.sin(t * Math.PI) * 0.2 - t * t * 0.14;
    pos.setZ(i, z + cup + arch);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Pure ambient full-viewport scroll-choreographed 3D background.
 * Continuously animates with scroll depth & subtle pointer parallax (no corner toggle UI).
 */
export function Scene3D({ scrollProgressRef, activeAccentHex }: Scene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const accentRef = useRef(activeAccentHex);
  accentRef.current = activeAccentHex;

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
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight,
    );
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d060b);
    scene.fog = new THREE.FogExp2(0x0d060b, 0.05);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      44,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      80,
    );
    camera.position.set(1.4, 1.2, 8.6);

    // Warm/cool studio ambient rig
    const hemiLight = new THREE.HemisphereLight(0xf6cde0, 0x1c0816, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe6d4, 1.9);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xe86b94, 15, 22, 1.8);
    rimLight.position.set(-4.5, 2.2, -3.2);
    scene.add(rimLight);

    const champagneFill = new THREE.PointLight(0xe5c185, 9, 18, 1.8);
    champagneFill.position.set(4.0, -2.0, 3.5);
    scene.add(champagneFill);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };

    const outerPetalMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xc96289,
        metalness: 0.25,
        roughness: 0.36,
        clearcoat: 0.5,
      }),
    );
    const midPetalMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe5b899,
        metalness: 0.88,
        roughness: 0.18,
        clearcoat: 0.75,
      }),
    );
    const innerPetalMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xfbe5ef,
        metalness: 0.14,
        roughness: 0.16,
        clearcoat: 0.9,
      }),
    );
    const brushedGoldMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe5c185,
        metalness: 0.94,
        roughness: 0.2,
        anisotropy: 0.75,
      }),
    );

    // 1. Ambient Blooming Botanical Lotus Sculpture
    const lotusGroup = new THREE.Group();
    lotusGroup.position.set(2.1, -0.1, -0.8);
    scene.add(lotusGroup);

    const calyxProfile = [
      new THREE.Vector2(0.0, -0.45),
      new THREE.Vector2(0.32, -0.35),
      new THREE.Vector2(0.55, -0.05),
      new THREE.Vector2(0.45, 0.04),
      new THREE.Vector2(0.0, 0.0),
    ];
    const calyxMesh = new THREE.Mesh(
      trackGeo(new THREE.LatheGeometry(calyxProfile, 28)),
      brushedGoldMat,
    );
    lotusGroup.add(calyxMesh);

    const outerPetalGeo = trackGeo(createPetalGeometry(1.48, 0.7, 0.042));
    const midPetalGeo = trackGeo(createPetalGeometry(1.18, 0.54, 0.038));
    const innerPetalGeo = trackGeo(createPetalGeometry(0.86, 0.4, 0.032));

    const petals: PetalHandle[] = [];
    const rings = [
      { count: 8, radius: 0.4, geo: outerPetalGeo, mat: outerPetalMat, baseTilt: 0.52, maxTilt: 1.25, y: 0, offset: 0 },
      { count: 8, radius: 0.28, geo: midPetalGeo, mat: midPetalMat, baseTilt: 0.34, maxTilt: 0.92, y: 0.05, offset: Math.PI / 8 },
      { count: 6, radius: 0.18, geo: innerPetalGeo, mat: innerPetalMat, baseTilt: 0.16, maxTilt: 0.56, y: 0.1, offset: Math.PI / 6 },
    ];

    rings.forEach((spec, rIdx) => {
      for (let i = 0; i < spec.count; i++) {
        const holder = new THREE.Group();
        holder.rotation.y = (i / spec.count) * Math.PI * 2 + spec.offset;
        holder.position.y = spec.y;

        const pivot = new THREE.Group();
        pivot.position.set(0, 0, spec.radius);
        pivot.rotation.x = spec.baseTilt;

        const mesh = new THREE.Mesh(spec.geo, spec.mat);
        pivot.add(mesh);
        holder.add(pivot);
        lotusGroup.add(holder);

        petals.push({
          pivot,
          baseTilt: spec.baseTilt,
          maxTilt: spec.maxTilt,
          phase: i * 0.55 + rIdx * 1.1,
        });
      }
    });

    const coreMesh = new THREE.Mesh(
      trackGeo(new THREE.OctahedronGeometry(0.28, 1)),
      trackMat(
        new THREE.MeshPhysicalMaterial({
          color: 0xffd0e3,
          emissive: 0xe86b94,
          emissiveIntensity: 0.42,
          metalness: 0.08,
          roughness: 0.1,
          clearcoat: 1.0,
        }),
      ),
    );
    coreMesh.position.y = 0.44;
    coreMesh.scale.set(0.9, 1.3, 0.9);
    lotusGroup.add(coreMesh);

    // Orbital Architectural Halo Rings
    const haloOuter = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(2.25, 0.018, 14, 84)),
      brushedGoldMat,
    );
    haloOuter.rotation.set(Math.PI * 0.4, 0.25, 0);
    lotusGroup.add(haloOuter);

    const haloInner = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(1.78, 0.012, 12, 72)),
      outerPetalMat,
    );
    haloInner.rotation.set(Math.PI * 0.58, 0, -0.32);
    lotusGroup.add(haloInner);

    // 2. Floating Glass Serum Silhouette on Opposite Flank
    const flaconGroup = new THREE.Group();
    flaconGroup.position.set(-2.6, -0.3, -2.0);
    flaconGroup.rotation.z = -0.16;
    scene.add(flaconGroup);

    const bottleProfile = [
      new THREE.Vector2(0.0, -0.82),
      new THREE.Vector2(0.42, -0.82),
      new THREE.Vector2(0.48, -0.74),
      new THREE.Vector2(0.5, 0.12),
      new THREE.Vector2(0.45, 0.32),
      new THREE.Vector2(0.24, 0.48),
      new THREE.Vector2(0.22, 0.64),
    ];
    const flaconBody = new THREE.Mesh(
      trackGeo(new THREE.LatheGeometry(bottleProfile, 32)),
      trackMat(
        new THREE.MeshPhysicalMaterial({
          color: 0xffcce0,
          metalness: 0.05,
          roughness: 0.08,
          transparent: true,
          opacity: 0.38,
          clearcoat: 1.0,
          depthWrite: false,
        }),
      ),
    );
    flaconBody.renderOrder = 2;
    flaconGroup.add(flaconBody);

    const elixirProfile = [
      new THREE.Vector2(0.0, -0.7),
      new THREE.Vector2(0.39, -0.7),
      new THREE.Vector2(0.42, 0.08),
      new THREE.Vector2(0.0, 0.08),
    ];
    const elixirMesh = new THREE.Mesh(
      trackGeo(new THREE.LatheGeometry(elixirProfile, 28)),
      trackMat(
        new THREE.MeshPhysicalMaterial({
          color: 0xe86b94,
          emissive: 0x701637,
          emissiveIntensity: 0.35,
          roughness: 0.15,
          transparent: true,
          opacity: 0.82,
        }),
      ),
    );
    elixirMesh.renderOrder = 1;
    flaconGroup.add(elixirMesh);

    const capCollar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.26, 0.265, 0.3, 30)),
      brushedGoldMat,
    );
    capCollar.position.y = 0.66;
    flaconGroup.add(capCollar);

    const capBulb = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.13, 0.28, 8, 16)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x3b172c,
          roughness: 0.68,
          metalness: 0.08,
        }),
      ),
    );
    capBulb.position.y = 0.96;
    flaconGroup.add(capBulb);

    // 3. Rising Luminous Pearl-Gold Essence Particles (InstancedMesh)
    const particleCount = 96;
    const particlesMesh = new THREE.InstancedMesh(
      trackGeo(new THREE.OctahedronGeometry(0.032, 0)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xffd9e8,
          emissive: 0xe5c185,
          emissiveIntensity: 0.4,
          metalness: 0.6,
          roughness: 0.24,
        }),
      ),
      particleCount,
    );
    particlesMesh.frustumCulled = false;

    const seeds = Array.from({ length: particleCount }, (_, i) => ({
      angle: (i / particleCount) * Math.PI * 2 * 3.5,
      radius: 2.2 + ((i * 71) % 100) * 0.055,
      y: (((i * 29) % 100) / 100 - 0.5) * 7.6,
      speed: 0.14 + ((i * 19) % 100) * 0.0024,
      scale: 0.55 + ((i * 41) % 100) * 0.01,
    }));

    for (let i = 0; i < particleCount; i++) {
      const p = seeds[i];
      _dummy.position.set(Math.cos(p.angle) * p.radius, p.y, Math.sin(p.angle) * p.radius - 1.0);
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

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

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
    let smoothedScroll = scrollProgressRef.current;
    let smoothedBloom = 0.25;

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
      const motionScale = prefersReducedMotion ? 0.15 : 1.0;

      smoothedScroll = THREE.MathUtils.damp(smoothedScroll, scrollProgressRef.current, 5.2, delta);
      pointer.x = THREE.MathUtils.damp(pointer.x, pointer.targetX, 4.0, delta);
      pointer.y = THREE.MathUtils.damp(pointer.y, pointer.targetY, 4.0, delta);

      _colorA.set(accentRef.current || '#E86B94');
      rimLight.color.lerp(_colorA, 1 - Math.exp(-3.5 * delta));

      const targetBloom = THREE.MathUtils.clamp(
        0.16 + Math.sin(smoothedScroll * Math.PI * 1.15) * 0.72 + smoothedScroll * 0.2,
        0.15,
        0.98,
      );
      smoothedBloom = THREE.MathUtils.damp(smoothedBloom, targetBloom, 4.0, delta);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        const breath = Math.sin(elapsed * 1.1 * motionScale + p.phase) * 0.032;
        p.pivot.rotation.x = THREE.MathUtils.lerp(p.baseTilt, p.maxTilt, smoothedBloom) + breath;
      }

      lotusGroup.rotation.y = elapsed * 0.16 * motionScale + smoothedScroll * Math.PI * 1.8;
      lotusGroup.position.y = -0.15 + Math.sin(elapsed * 0.85 * motionScale) * 0.14;
      coreMesh.rotation.y = -elapsed * 0.6 * motionScale;
      haloOuter.rotation.z = elapsed * 0.2 * motionScale;
      haloInner.rotation.y = -elapsed * 0.28 * motionScale;

      flaconGroup.position.y = -0.25 + Math.sin(elapsed * 0.95 * motionScale + 1.5) * 0.18;
      flaconGroup.rotation.y = elapsed * 0.25 * motionScale + smoothedScroll * 2.4;

      for (let i = 0; i < particleCount; i++) {
        const p = seeds[i];
        const yWrapped =
          ((((p.y + elapsed * p.speed * motionScale + smoothedScroll * 2.2 + 3.8) % 7.6) + 7.6) %
            7.6) -
          3.8;
        const ang = p.angle + elapsed * 0.06 * motionScale;
        _dummy.position.set(
          Math.cos(ang) * p.radius,
          yWrapped,
          Math.sin(ang) * p.radius - 1.0,
        );
        _dummy.rotation.set(elapsed * 0.45 + i, elapsed * 0.35, 0);
        _dummy.scale.setScalar(p.scale * (0.8 + 0.22 * Math.sin(elapsed * 1.6 + i)));
        _dummy.updateMatrix();
        particlesMesh.setMatrixAt(i, _dummy.matrix);
      }
      particlesMesh.instanceMatrix.needsUpdate = true;

      // Smooth scroll-driven camera orbit
      const s = smoothedScroll;
      const cx = Math.sin(s * Math.PI * 1.35) * 2.4 + 0.65;
      const cy = 1.25 - Math.sin(s * Math.PI) * 0.85;
      const cz = 8.4 - Math.sin(s * Math.PI) * 1.35;

      _camTargetPos.set(
        cx + pointer.x * 0.36 * motionScale,
        cy + pointer.y * 0.24 * motionScale,
        cz,
      );
      _lookTarget.set(Math.cos(s * Math.PI) * 0.45, -0.1, -0.7);

      camera.position.lerp(_camTargetPos, 1 - Math.exp(-3.6 * delta));
      _currentLook.lerp(_lookTarget, 1 - Math.exp(-4.0 * delta));
      camera.lookAt(_currentLook);

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
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgressRef]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {webglFailed ? (
        <div className="w-full h-full bg-gradient-to-br from-[#190914] via-[#0D060B] to-[#260E1F]" />
      ) : (
        <div ref={mountRef} className="w-full h-full" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 75% 32%, rgba(232,107,148,0.06) 0%, rgba(13,6,11,0.54) 55%, rgba(13,6,11,0.86) 100%)',
        }}
      />
    </div>
  );
}
