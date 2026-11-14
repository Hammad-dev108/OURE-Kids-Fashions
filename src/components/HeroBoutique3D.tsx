import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw, Sun } from 'lucide-react';
import {
  buildBoutiqueCarousel,
  createProceduralTextures,
} from '../three/proceduralGarments';
import {
  afterDraw,
  applyStudioEnvironment,
  createBoutiqueRenderer,
  detectSoftwareWebGL,
  disposeObject3D,
} from '../three/webglUtils';

interface HeroBoutique3DProps {
  onSelectShowcase?: () => void;
}

const DEFAULT_CAM_POS = new THREE.Vector3(0, 1.55, 4.15);
const DEFAULT_TARGET = new THREE.Vector3(0, 1.08, 0);

// Pre-allocated scratch math helpers (zero per-frame GC)
const _targetCam = new THREE.Vector3();
const _warmColor = new THREE.Color('#FFFBF2');
const _pastelColor = new THREE.Color('#F4E4D8');
const _warmRim = new THREE.Color('#E0AF50');
const _pastelRim = new THREE.Color('#C8963E');

export function HeroBoutique3D({ onSelectShowcase }: HeroBoutique3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [autoSpin, setAutoSpin] = useState(true);
  const [mood, setMood] = useState<'gold' | 'pastel'>('gold');
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const autoSpinRef = useRef(autoSpin);
  const moodRef = useRef(mood);
  const resetRequestedRef = useRef(false);
  const pointerOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      autoSpinRef.current = false;
      setAutoSpin(false);
    }

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = createBoutiqueRenderer(isSoftwareGl);
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F5EFE6');
    scene.fog = new THREE.FogExp2('#F5EFE6', 0.055);

    const envTexture = applyStudioEnvironment(renderer, scene);

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 40);
    camera.position.copy(DEFAULT_CAM_POS);

    renderer.setSize(width, height, false);

    // Three-point warm sunlit golden studio lighting rig
    const hemiLight = new THREE.HemisphereLight('#FFFDF8', '#D8C7B2', 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFFBF2', 2.25);
    keyLight.position.set(3.2, 4.6, 3.6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -2.6;
    keyLight.shadow.camera.right = 2.6;
    keyLight.shadow.camera.top = 2.8;
    keyLight.shadow.camera.bottom = -2.0;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#E0AF50', 1.8);
    rimLight.position.set(-3.4, 2.8, -3.2);
    scene.add(rimLight);

    const warmFill = new THREE.PointLight('#C8963E', 1.25, 9, 1.5);
    warmFill.position.set(-2.2, 1.55, 2.5);
    scene.add(warmFill);

    const frontSheenLight = new THREE.PointLight('#FFFDF8', 1.0, 8, 1.6);
    frontSheenLight.position.set(1.8, 1.45, 2.8);
    scene.add(frontSheenLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextures(maxAniso);
    const carouselRig = buildBoutiqueCarousel(textures);
    scene.add(carouselRig.root);

    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(DEFAULT_TARGET);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 6.2;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.maxPolarAngle = Math.PI * 0.54;
    controls.update();

    let userInteracting = false;
    const handleControlStart = () => {
      userInteracting = true;
      resetRequestedRef.current = false;
    };
    const handleControlEnd = () => {
      userInteracting = false;
    };
    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('end', handleControlEnd);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointerOffsetRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointerOffsetRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
    };
    const handlePointerLeave = () => {
      pointerOffsetRef.current.x = 0;
      pointerOffsetRef.current.y = 0;
    };
    canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerleave', handlePointerLeave);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.floor(entry.contentRect.width), 200);
      const h = Math.max(Math.floor(entry.contentRect.height), 200);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    resizeObserver.observe(container);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let disposed = false;
    let frameId = 0;
    let timerId = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    let parallaxX = 0;
    let parallaxY = 0;
    let prevAzimuth = controls.getAzimuthalAngle();
    let prevSpinnerYaw = carouselRig.carouselSpinner.rotation.y;

    // Pre-allocated pendulum spring state per garment (zero GC in loop)
    const swayZ = new Float32Array(carouselRig.garmentHolders.length);
    const velZ = new Float32Array(carouselRig.garmentHolders.length);
    const swayX = new Float32Array(carouselRig.garmentHolders.length);
    const velX = new Float32Array(carouselRig.garmentHolders.length);

    const tick = () => {
      if (disposed) return;

      const now = performance.now();
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.05);
      lastTime = now;
      elapsed += dt;

      // Smooth carousel rotation & subtle floating motion
      if (autoSpinRef.current && !userInteracting) {
        carouselRig.carouselSpinner.rotation.y += dt * 0.28;
      }

      // Compute angular velocity from carousel spin + user drag orbit
      const curAzimuth = controls.getAzimuthalAngle();
      let dAzimuth = curAzimuth - prevAzimuth;
      if (dAzimuth > Math.PI) dAzimuth -= Math.PI * 2;
      if (dAzimuth < -Math.PI) dAzimuth += Math.PI * 2;
      prevAzimuth = curAzimuth;

      const curSpinnerYaw = carouselRig.carouselSpinner.rotation.y;
      const dSpinner = curSpinnerYaw - prevSpinnerYaw;
      prevSpinnerYaw = curSpinnerYaw;

      const angularImpulse = THREE.MathUtils.clamp((dSpinner - dAzimuth * 0.7) / dt, -4.5, 4.5);

      // Damped second-order pendulum sway per suspended garment
      const stiffness = 18.0;
      const damping = 3.2;
      for (let i = 0; i < carouselRig.garmentHolders.length; i++) {
        const holder = carouselRig.garmentHolders[i];
        const phase = i * 1.55;
        const breezeZ = Math.sin(elapsed * 1.45 + phase) * 0.022;
        const breezeX = Math.cos(elapsed * 1.15 + phase * 0.8) * 0.016;

        // Tangential lag (local Z axis swing) & gentle centrifugal outward flare (local X)
        const targetZ = THREE.MathUtils.clamp(
          -angularImpulse * 0.042 + breezeZ,
          -0.16,
          0.16
        );
        const targetX = THREE.MathUtils.clamp(
          -Math.abs(angularImpulse) * 0.022 + breezeX,
          -0.12,
          0.12
        );

        const accZ = (targetZ - swayZ[i]) * stiffness - velZ[i] * damping;
        velZ[i] += accZ * dt;
        swayZ[i] += velZ[i] * dt;

        const accX = (targetX - swayX[i]) * stiffness - velX[i] * damping;
        velX[i] += accX * dt;
        swayX[i] += velX[i] * dt;

        holder.rotation.z = swayZ[i];
        holder.rotation.x = swayX[i];
      }

      // Undulating satin ribbons
      for (let i = 0; i < carouselRig.ribbons.length; i++) {
        const ribbon = carouselRig.ribbons[i];
        ribbon.rotation.y = elapsed * (0.14 + i * 0.05);
        ribbon.position.y = Math.sin(elapsed * 1.1 + i * 2.0) * 0.05;
      }

      // Pointer hover parallax tilt on root assembly
      parallaxX = THREE.MathUtils.damp(
        parallaxX,
        pointerOffsetRef.current.x * 0.14,
        4.5,
        dt
      );
      parallaxY = THREE.MathUtils.damp(
        parallaxY,
        pointerOffsetRef.current.y * 0.06,
        4.5,
        dt
      );
      carouselRig.root.rotation.y = parallaxX;
      carouselRig.root.rotation.x = parallaxY;

      // Lighting mood damping
      const isGold = moodRef.current === 'gold';
      keyLight.color.lerp(isGold ? _warmColor : _pastelColor, 1 - Math.exp(-5 * dt));
      rimLight.color.lerp(isGold ? _warmRim : _pastelRim, 1 - Math.exp(-5 * dt));

      // Smooth camera reset when requested
      if (resetRequestedRef.current) {
        _targetCam.copy(DEFAULT_CAM_POS);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCam.x, 6, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCam.y, 6, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCam.z, 6, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, DEFAULT_TARGET.x, 6, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, DEFAULT_TARGET.y, 6, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, DEFAULT_TARGET.z, 6, dt);
        if (camera.position.distanceTo(_targetCam) < 0.02) {
          camera.position.copy(_targetCam);
          controls.target.copy(DEFAULT_TARGET);
          resetRequestedRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(renderer, tick, (id) => {
          timerId = id;
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(renderer, tick, (id) => {
        timerId = id;
      });
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('end', handleControlEnd);
      controls.dispose();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      disposeObject3D(scene);
      textures.knitBump.dispose();
      textures.knitRoughness.dispose();
      textures.linenBump.dispose();
      textures.velvetBump.dispose();
      textures.embroideryColor.dispose();
      textures.embroideryBump.dispose();
      textures.laceColor.dispose();
      textures.laceAlpha.dispose();
      textures.woodColor.dispose();
      textures.woodBump.dispose();
      textures.marbleColor.dispose();
      textures.contactShadow.dispose();
      envTexture.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  const handleReset = () => {
    resetRequestedRef.current = true;
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#E8DFD1] bg-[#F5EFE6]">
      {/* Dedicated WebGL mount container */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D OURA Boutique Carousel"
      />

      {/* Fallback when WebGL context is lost */}
      {contextLost && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FFFFFF] p-6 text-center">
          <p className="font-display text-2xl text-[#2C221E]">
            OURA Atelier Carousel
          </p>
          <p className="mt-2 max-w-xs text-sm text-[#6E5D54]">
            3D display paused while graphics memory resets.
          </p>
          {onSelectShowcase && (
            <button
              type="button"
              onClick={onSelectShowcase}
              className="mt-4 rounded-lg bg-[#C8963E] px-4 py-2 text-xs font-semibold text-[#2C221E] hover:bg-[#E0AF50]"
            >
              Browse Collection
            </button>
          )}
        </div>
      )}

      {/* Subtle top-left interaction hint (solid/rgba surface, no backdrop-blur over WebGL) */}
      <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-md border border-[#E8DFD1] bg-[#FFFFFF]/92 px-3 py-1.5 text-xs font-medium text-[#6E5D54]">
        Drag to rotate · Hover for depth
      </div>

      {/* Collapsible compact bottom control dock */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
        <button
          type="button"
          onClick={() => setControlsCollapsed((prev) => !prev)}
          className="mb-1.5 flex items-center gap-1.5 rounded-md border border-[#E8DFD1] bg-[#FFFFFF]/94 px-3 py-1 text-[11px] font-medium text-[#6E5D54] transition-colors hover:text-[#2C221E]"
        >
          {controlsCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              <span>Show 3D Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!controlsCollapsed && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-[#E8DFD1] bg-[#FFFFFF]/96 px-3 py-2 shadow-lg">
            <button
              type="button"
              onClick={() => setAutoSpin((prev) => !prev)}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#2C221E] transition-colors hover:bg-[#F4E4D8]"
            >
              {autoSpin ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-[#C8963E]" />
                  <span>Pause Spin</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-[#C8963E]" />
                  <span>Auto Spin</span>
                </>
              )}
            </button>

            <span className="h-4 w-px bg-[#E8DFD1]" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setMood((m) => (m === 'gold' ? 'pastel' : 'gold'))}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#2C221E] transition-colors hover:bg-[#F4E4D8]"
            >
              <Sun className="h-3.5 w-3.5 text-[#C8963E]" />
              <span>{mood === 'gold' ? 'Sunlit Gold' : 'Blush Warmth'}</span>
            </button>

            <span className="h-4 w-px bg-[#E8DFD1]" aria-hidden="true" />

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6E5D54] transition-colors hover:bg-[#F4E4D8] hover:text-[#2C221E]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
