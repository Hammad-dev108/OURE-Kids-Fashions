import * as THREE from 'three';
import type { GarmentModelType, GarmentPalette } from '../types/store';

export interface ProceduralTextureSet {
  knitBump: THREE.CanvasTexture;
  knitRoughness: THREE.CanvasTexture;
  linenBump: THREE.CanvasTexture;
  velvetBump: THREE.CanvasTexture;
  embroideryColor: THREE.CanvasTexture;
  embroideryBump: THREE.CanvasTexture;
  laceColor: THREE.CanvasTexture;
  laceAlpha: THREE.CanvasTexture;
  woodColor: THREE.CanvasTexture;
  woodBump: THREE.CanvasTexture;
  marbleColor: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
}

function configureTexture(
  canvas: HTMLCanvasElement,
  isColor: boolean,
  repeatX: number,
  repeatY: number,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = Math.min(maxAnisotropy || 4, 8);
  tex.needsUpdate = true;
  return tex;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. High-resolution Cotton Knit V-stitch Bump & Roughness (256x256, linear)
  const knitBumpCanvas = document.createElement('canvas');
  knitBumpCanvas.width = 256;
  knitBumpCanvas.height = 256;
  const kb = knitBumpCanvas.getContext('2d');

  const knitRoughCanvas = document.createElement('canvas');
  knitRoughCanvas.width = 256;
  knitRoughCanvas.height = 256;
  const kr = knitRoughCanvas.getContext('2d');

  if (kb && kr) {
    kb.fillStyle = '#787878';
    kb.fillRect(0, 0, 256, 256);
    kr.fillStyle = '#d4d4d4';
    kr.fillRect(0, 0, 256, 256);

    const colW = 16;
    const rowH = 12;
    for (let y = 0; y < 256; y += rowH) {
      for (let x = 0; x < 256; x += colW) {
        // Left & right interlocking V-knit loops
        kb.strokeStyle = '#bcbcbc';
        kb.lineWidth = 2.4;
        kb.lineCap = 'round';
        kb.beginPath();
        kb.moveTo(x + 2, y + 2);
        kb.lineTo(x + colW * 0.45, y + rowH - 2);
        kb.moveTo(x + colW - 2, y + 2);
        kb.lineTo(x + colW * 0.55, y + rowH - 2);
        kb.stroke();

        // Recessed channel between wales
        kb.strokeStyle = '#484848';
        kb.lineWidth = 1.4;
        kb.beginPath();
        kb.moveTo(x, y);
        kb.lineTo(x, y + rowH);
        kb.stroke();

        // Subtle quilted diamond stitch highlight every 4x4 grid
        if ((x / colW + y / rowH) % 4 === 0) {
          kr.fillStyle = '#efefef';
          kr.fillRect(x + 3, y + 3, colW - 6, rowH - 6);
        }
      }
    }
  }
  const knitBump = configureTexture(knitBumpCanvas, false, 6, 6, maxAnisotropy);
  const knitRoughness = configureTexture(knitRoughCanvas, false, 6, 6, maxAnisotropy);

  // 2. Fine Linen / Muslin Slub Weave (256x256, linear)
  const linenCanvas = document.createElement('canvas');
  linenCanvas.width = 256;
  linenCanvas.height = 256;
  const lc = linenCanvas.getContext('2d');
  if (lc) {
    lc.fillStyle = '#808080';
    lc.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 4) {
      const shade = 112 + Math.round(Math.sin(y * 0.7) * 18);
      lc.fillStyle = `rgb(${shade},${shade},${shade})`;
      lc.fillRect(0, y, 256, 2);
    }
    for (let x = 0; x < 256; x += 4) {
      const alpha = x % 12 === 0 ? 0.24 : 0.12;
      lc.fillStyle = x % 8 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      lc.fillRect(x, 0, 2, 256);
    }
    // Organic linen slub threads
    lc.strokeStyle = 'rgba(220,220,220,0.22)';
    lc.lineWidth = 1.2;
    for (let i = 0; i < 42; i++) {
      const sx = (i * 53) % 240;
      const sy = (i * 37) % 252;
      lc.beginPath();
      lc.moveTo(sx, sy);
      lc.lineTo(sx + 18 + (i % 14), sy);
      lc.stroke();
    }
  }
  const linenBump = configureTexture(linenCanvas, false, 7, 7, maxAnisotropy);

  // 3. Micro-pile Velvet Nap Texture (256x256, linear)
  const velvetCanvas = document.createElement('canvas');
  velvetCanvas.width = 256;
  velvetCanvas.height = 256;
  const vc = velvetCanvas.getContext('2d');
  if (vc) {
    vc.fillStyle = '#7e7e7e';
    vc.fillRect(0, 0, 256, 256);
    // Deterministic fine plush nap directional strokes
    for (let i = 0; i < 3600; i++) {
      const x = (i * 73) % 256;
      const y = (i * 139 + Math.floor(i / 20) * 7) % 256;
      const tone = 96 + ((i * 29) % 68);
      vc.fillStyle = `rgb(${tone},${tone},${tone})`;
      vc.fillRect(x, y, 1.5, 3);
    }
  }
  const velvetBump = configureTexture(velvetCanvas, false, 5, 5, maxAnisotropy);

  // 4. Gold Zardozi Paisley & Floral Embroidery (256x256 Color + Bump)
  const embColorCanvas = document.createElement('canvas');
  embColorCanvas.width = 256;
  embColorCanvas.height = 256;
  const ec = embColorCanvas.getContext('2d');

  const embBumpCanvas = document.createElement('canvas');
  embBumpCanvas.width = 256;
  embBumpCanvas.height = 256;
  const eb = embBumpCanvas.getContext('2d');

  if (ec && eb) {
    ec.fillStyle = '#A87418';
    ec.fillRect(0, 0, 256, 256);
    eb.fillStyle = '#505050';
    eb.fillRect(0, 0, 256, 256);

    // Repeating zardozi floral medallions & vine border
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cx = col * 64 + 32;
        const cy = row * 64 + 32;

        // Outer scalloped gold thread ring
        ec.strokeStyle = '#FBC030';
        ec.lineWidth = 2.6;
        ec.beginPath();
        ec.arc(cx, cy, 20, 0, Math.PI * 2);
        ec.stroke();

        eb.strokeStyle = '#dcdcdc';
        eb.lineWidth = 3.2;
        eb.beginPath();
        eb.arc(cx, cy, 20, 0, Math.PI * 2);
        eb.stroke();

        // 8 floral petals
        for (let p = 0; p < 8; p++) {
          const ang = (p * Math.PI) / 4;
          const px = cx + Math.cos(ang) * 11;
          const py = cy + Math.sin(ang) * 11;

          ec.fillStyle = '#FDE382';
          ec.beginPath();
          ec.ellipse(px, py, 5.5, 3.2, ang, 0, Math.PI * 2);
          ec.fill();

          eb.fillStyle = '#f2f2f2';
          eb.beginPath();
          eb.ellipse(px, py, 5.5, 3.2, ang, 0, Math.PI * 2);
          eb.fill();
        }

        // Center zari bead
        ec.fillStyle = '#FFF8DC';
        ec.beginPath();
        ec.arc(cx, cy, 4, 0, Math.PI * 2);
        ec.fill();

        eb.fillStyle = '#ffffff';
        eb.beginPath();
        eb.arc(cx, cy, 4.5, 0, Math.PI * 2);
        eb.fill();
      }
    }

    // Twin metallic zari edge borders
    ec.fillStyle = '#FBC030';
    ec.fillRect(4, 0, 6, 256);
    ec.fillRect(246, 0, 6, 256);
    eb.fillStyle = '#f0f0f0';
    eb.fillRect(4, 0, 6, 256);
    eb.fillRect(246, 0, 6, 256);
  }
  const embroideryColor = configureTexture(embColorCanvas, true, 1, 3, maxAnisotropy);
  const embroideryBump = configureTexture(embBumpCanvas, false, 1, 3, maxAnisotropy);

  // 5. Delicate Scalloped Eyelet Lace Trim (256x128 Color + Alpha)
  const laceColorCanvas = document.createElement('canvas');
  laceColorCanvas.width = 256;
  laceColorCanvas.height = 128;
  const lcc = laceColorCanvas.getContext('2d');

  const laceAlphaCanvas = document.createElement('canvas');
  laceAlphaCanvas.width = 256;
  laceAlphaCanvas.height = 128;
  const lac = laceAlphaCanvas.getContext('2d');

  if (lcc && lac) {
    lcc.fillStyle = '#FFF8DC';
    lcc.fillRect(0, 0, 256, 128);
    lac.fillStyle = '#000000';
    lac.fillRect(0, 0, 256, 128);

    // Top woven band
    lac.fillStyle = '#e0e0e0';
    lac.fillRect(0, 0, 256, 44);

    // Scalloped lace arcs along lower edge
    for (let x = 16; x < 256; x += 32) {
      lac.fillStyle = '#ffffff';
      lac.beginPath();
      lac.arc(x, 62, 16, 0, Math.PI * 2);
      lac.fill();

      // Eyelet cutout hole
      lac.fillStyle = '#252525';
      lac.beginPath();
      lac.arc(x, 64, 5.5, 0, Math.PI * 2);
      lac.fill();

      // Gold thread rim on scallop
      lcc.strokeStyle = '#FBC030';
      lcc.lineWidth = 2.5;
      lcc.beginPath();
      lcc.arc(x, 62, 14, 0, Math.PI);
      lcc.stroke();
    }
  }
  const laceColor = configureTexture(laceColorCanvas, true, 10, 1, maxAnisotropy);
  const laceAlpha = configureTexture(laceAlphaCanvas, false, 10, 1, maxAnisotropy);

  // 6. Luxury Walnut Wood Grain (256x256 Color + Bump)
  const woodColorCanvas = document.createElement('canvas');
  woodColorCanvas.width = 256;
  woodColorCanvas.height = 256;
  const wc = woodColorCanvas.getContext('2d');

  const woodBumpCanvas = document.createElement('canvas');
  woodBumpCanvas.width = 256;
  woodBumpCanvas.height = 256;
  const wb = woodBumpCanvas.getContext('2d');

  if (wc && wb) {
    wc.fillStyle = '#4E2D18';
    wc.fillRect(0, 0, 256, 256);
    wb.fillStyle = '#808080';
    wb.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 3) {
      const wave = Math.sin(y * 0.14) * 14;
      wc.strokeStyle = y % 9 === 0 ? '#31190B' : '#6A3F23';
      wc.lineWidth = y % 6 === 0 ? 2 : 1;
      wc.beginPath();
      wc.moveTo(0, y);
      for (let x = 0; x <= 256; x += 16) {
        wc.lineTo(x, y + Math.sin(x * 0.04 + y * 0.08) * 3.5 + wave * 0.12);
      }
      wc.stroke();

      wb.strokeStyle = y % 9 === 0 ? '#5c5c5c' : '#969696';
      wb.lineWidth = 1.4;
      wb.beginPath();
      wb.moveTo(0, y);
      for (let x = 0; x <= 256; x += 16) {
        wb.lineTo(x, y + Math.sin(x * 0.04 + y * 0.08) * 3.5);
      }
      wb.stroke();
    }
  }
  const woodColor = configureTexture(woodColorCanvas, true, 2, 1, maxAnisotropy);
  const woodBump = configureTexture(woodBumpCanvas, false, 2, 1, maxAnisotropy);

  // 7. Sunlit Warm Cream Travertine Marble surface texture (256x256, SRGBColorSpace)
  const marbleCanvas = document.createElement('canvas');
  marbleCanvas.width = 256;
  marbleCanvas.height = 256;
  const mCtx = marbleCanvas.getContext('2d');
  if (mCtx) {
    mCtx.fillStyle = '#EFE7DA';
    mCtx.fillRect(0, 0, 256, 256);
    mCtx.strokeStyle = 'rgba(200, 150, 62, 0.34)';
    mCtx.lineWidth = 1.6;
    for (let i = 0; i < 14; i++) {
      mCtx.beginPath();
      let y = (i / 14) * 256;
      mCtx.moveTo(0, y);
      for (let x = 0; x <= 256; x += 16) {
        y += Math.sin(x * 0.04 + i * 1.7) * 6;
        mCtx.lineTo(x, y);
      }
      mCtx.stroke();
    }
    mCtx.strokeStyle = 'rgba(110, 93, 84, 0.16)';
    mCtx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      mCtx.beginPath();
      let y = (i / 8) * 256 + 10;
      mCtx.moveTo(0, y);
      for (let x = 0; x <= 256; x += 16) {
        y += Math.cos(x * 0.05 + i) * 5;
        mCtx.lineTo(x, y);
      }
      mCtx.stroke();
    }
  }
  const marbleColor = configureTexture(marbleCanvas, true, 1, 1, maxAnisotropy);

  // 8. Soft warm-cocoa radial contact shadow map fading cleanly to #F5EFE6 (128x128)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const grad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, 'rgba(64, 48, 38, 0.42)');
    grad.addColorStop(0.55, 'rgba(110, 93, 84, 0.18)');
    grad.addColorStop(1, 'rgba(245, 239, 230, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
  }
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);

  return {
    knitBump,
    knitRoughness,
    linenBump,
    velvetBump,
    embroideryColor,
    embroideryBump,
    laceColor,
    laceAlpha,
    woodColor,
    woodBump,
    marbleColor,
    contactShadow,
  };
}

// ============================================================================
// Parametric Sculpted Cloth Geometry Builders
// ============================================================================

interface SculptedTorsoOptions {
  shoulderHalfW: number;
  waistHalfW: number;
  hemHalfW: number;
  waistV?: number;
  height: number;
  topDepth: number;
  chestDepth: number;
  hemDepth: number;
  shoulderDrop?: number;
  neckRadius?: number;
  neckFrontDrop?: number;
  hemCurve?: number;
  pleatFreq?: number;
  pleatAmp?: number;
  sideSlitStartV?: number; // e.g., 0.72 for kurta side slits
  frontVNeckDepth?: number; // opens V-neck on front (for blazer)
  uSegs?: number;
  vSegs?: number;
}

/**
 * Generates a closed-perimeter, smoothly curved 3D sculpted cloth garment shell
 * with shoulder slopes, chest fullness, pinched waistline, vertical drape pleats,
 * curved hems, and optional side slits or V-neck cutaway.
 */
function createSculptedClothTorso(opts: SculptedTorsoOptions): THREE.BufferGeometry {
  const uSegs = opts.uSegs ?? 48;
  const vSegs = opts.vSegs ?? 24;
  const waistV = opts.waistV ?? 0.45;
  const shoulderDrop = opts.shoulderDrop ?? 0.085;
  const neckRadius = opts.neckRadius ?? 0.078;
  const neckFrontDrop = opts.neckFrontDrop ?? 0.032;
  const hemCurve = opts.hemCurve ?? 0.024;
  const pleatFreq = opts.pleatFreq ?? 10;
  const pleatAmp = opts.pleatAmp ?? 0.016;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const rows = vSegs + 1;
  const cols = uSegs + 1;

  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs; // 0 = shoulder top, 1 = bottom hem

    // Smooth silhouette width across shoulder -> waist -> hem
    let halfW: number;
    if (v <= waistV) {
      const t = v / waistV;
      const smooth = t * t * (3 - 2 * t);
      halfW = THREE.MathUtils.lerp(opts.shoulderHalfW, opts.waistHalfW, smooth);
    } else {
      const t = (v - waistV) / (1 - waistV);
      const smooth = t * t * (3 - 2 * t);
      halfW = THREE.MathUtils.lerp(opts.waistHalfW, opts.hemHalfW, smooth);
    }

    // Anatomical front-to-back fullness (thin over hanger at v=0, fuller over chest, flowing to hem)
    const chestBell = Math.sin(Math.min(v * 2.1, Math.PI));
    const halfD =
      THREE.MathUtils.lerp(opts.topDepth, opts.hemDepth, v) +
      opts.chestDepth * chestBell;

    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs;
      // theta = 0 is right side, PI/2 is front (+Z), PI is left side, 3PI/2 is back (-Z)
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Subtle vertical cloth drape pleats growing toward waist/hem
      const pleatWeight = Math.pow(v, 0.85);
      const pleat =
        pleatAmp *
        pleatWeight *
        (Math.sin(pleatFreq * theta) * 0.72 +
          Math.sin(pleatFreq * 2 * theta + 0.8) * 0.28);

      // Optional side slit flare near bottom edge (for Kurta)
      let slitOffsetZ = 0;
      if (opts.sideSlitStartV !== undefined && v > opts.sideSlitStartV) {
        const slitProgress = (v - opts.sideSlitStartV) / (1 - opts.sideSlitStartV);
        const sideProximity = Math.pow(Math.abs(cosT), 4);
        slitOffsetZ =
          Math.sign(sinT || 1) * 0.018 * slitProgress * sideProximity;
      }

      const rX = halfW + pleat * Math.abs(cosT) * 0.55;
      const rZ = halfD + pleat * (0.65 + 0.35 * Math.abs(sinT));

      const x = cosT * rX;
      let z = sinT * rZ + slitOffsetZ;

      // Top y follows curved wooden hanger shoulder slope + carved neckline scoop
      const xAbs = Math.abs(x);
      const shoulderY =
        -shoulderDrop * Math.pow(Math.min(xAbs / opts.shoulderHalfW, 1.15), 1.75);

      let neckDip = 0;
      if (xAbs < neckRadius) {
        const nx = 1 - (xAbs / neckRadius) * (xAbs / neckRadius);
        const frontFactor = sinT > 0 ? 1.0 : 0.3;
        neckDip = neckFrontDrop * nx * frontFactor;
      }

      // Optional open V-neck dip on front chest (for structured Blazer)
      if (
        opts.frontVNeckDepth &&
        sinT > 0.15 &&
        xAbs < neckRadius * 1.15 &&
        v < 0.42
      ) {
        const vOpen =
          (1 - xAbs / (neckRadius * 1.15)) * Math.max(0, (sinT - 0.15) / 0.85);
        neckDip += opts.frontVNeckDepth * vOpen;
      }

      // Gently arched hem at bottom (higher at sides, curved front/back)
      const topY = shoulderY - neckDip * (1 - Math.min(v * 2.2, 1));
      const bottomY =
        -opts.height + hemCurve * Math.pow(Math.abs(cosT), 2) - pleat * 0.22;

      const y = THREE.MathUtils.lerp(topY, bottomY, v);

      // Keep top shoulder seam gently pinched along hanger yoke
      if (v < 0.06 && xAbs > neckRadius * 0.9) {
        z *= 0.88 + 0.12 * (v / 0.06);
      }

      positions.push(x, y, z);
      uvs.push(u * 2, v);
    }
  }

  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeTangents();
  return geo;
}

interface DrapedSleeveOptions {
  side: -1 | 1;
  shoulderPos: THREE.Vector3;
  length: number;
  hangAngle: number; // angle from vertical in XY
  forwardBend?: number;
  radiusTop: number;
  radiusEnd: number;
  creaseAmp?: number;
  flaredCuff?: boolean;
}

/**
 * Generates a curved hanging sleeve along a natural gravity-draped CatmullRom path
 * with longitudinal fabric folds and shoulder/cuff shaping.
 */
function createDrapedSleeve(opts: DrapedSleeveOptions): THREE.BufferGeometry {
  const s = opts.side;
  const dirX = s * Math.sin(opts.hangAngle);
  const dirY = -Math.cos(opts.hangAngle);
  const fwd = opts.forwardBend ?? 0.04;

  const p0 = opts.shoulderPos.clone();
  const p1 = p0
    .clone()
    .add(new THREE.Vector3(dirX * opts.length * 0.35, dirY * opts.length * 0.32, fwd * 0.35));
  const p2 = p0
    .clone()
    .add(new THREE.Vector3(dirX * opts.length * 0.68, dirY * opts.length * 0.66, fwd * 0.85));
  const p3 = p0
    .clone()
    .add(new THREE.Vector3(dirX * opts.length * 0.96, dirY * opts.length, fwd));

  const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
  const radialSegs = 20;
  const tubularSegs = 18;

  const frames = curve.computeFrenetFrames(tubularSegs, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubularSegs; i++) {
    const t = i / tubularSegs;
    const center = curve.getPointAt(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    // Slight flare at sleeve opening if requested, otherwise gentle taper
    let rad = THREE.MathUtils.lerp(opts.radiusTop, opts.radiusEnd, Math.pow(t, 0.85));
    if (opts.flaredCuff && t > 0.85) {
      rad += ((t - 0.85) / 0.15) * 0.008;
    }

    for (let j = 0; j <= radialSegs; j++) {
      const u = j / radialSegs;
      const theta = u * Math.PI * 2;
      const crease =
        (opts.creaseAmp ?? 0.004) *
        Math.sin(theta * 5 + t * 2.5) *
        Math.sin(t * Math.PI);
      const r = rad + crease;

      // Slightly oval armhole cross-section at shoulder
      const rx = r * (1 + (1 - t) * 0.14);
      const rz = r * (0.86 + t * 0.12);

      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      const vx = center.x + (N.x * cos * rx + B.x * sin * rz);
      const vy = center.y + (N.y * cos * rx + B.y * sin * rz);
      const vz = center.z + (N.z * cos * rx + B.z * sin * rz);

      positions.push(vx, vy, vz);
      uvs.push(u, t);
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < tubularSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = (i + 1) * stride + j;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeTangents();
  return geo;
}

interface PleatedSkirtOptions {
  waistRx: number;
  waistRz: number;
  hemRx: number;
  hemRz: number;
  height: number;
  pleatCount: number;
  pleatDepth: number;
  ruffleWave?: number;
  radialSegs?: number;
  heightSegs?: number;
}

/**
 * Generates a lush, multi-pleated ruffled skirt shell with gathered waist and flared organic hem.
 */
function createPleatedSkirtGeometry(opts: PleatedSkirtOptions): THREE.BufferGeometry {
  const radialSegs = opts.radialSegs ?? 72;
  const heightSegs = opts.heightSegs ?? 16;
  const ruffleWave = opts.ruffleWave ?? 0.014;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const cols = radialSegs + 1;

  for (let iv = 0; iv <= heightSegs; iv++) {
    const v = iv / heightSegs; // 0 = gathered waist, 1 = flared hem
    const bell = Math.pow(v, 0.78);
    const rxBase = THREE.MathUtils.lerp(opts.waistRx, opts.hemRx, bell);
    const rzBase = THREE.MathUtils.lerp(opts.waistRz, opts.hemRz, bell);

    for (let iu = 0; iu <= radialSegs; iu++) {
      const u = iu / radialSegs;
      const theta = u * Math.PI * 2;

      // Crisp pleated folds radiating outward from gathered waist
      const pleatStrength = 0.25 + 0.75 * v;
      const primaryPleat = Math.sin(theta * opts.pleatCount);
      const secondaryPleat = Math.sin(theta * opts.pleatCount * 2 + 0.7) * 0.3;
      const fold = opts.pleatDepth * pleatStrength * (primaryPleat + secondaryPleat);

      const rx = rxBase + fold;
      const rz = rzBase + fold * 0.85;

      const x = Math.cos(theta) * rx;
      const z = Math.sin(theta) * rz;
      const y =
        -v * opts.height +
        ruffleWave * Math.pow(v, 1.3) * Math.sin(theta * (opts.pleatCount * 0.5) + 0.5);

      positions.push(x, y, z);
      uvs.push(u * 2, v);
    }
  }

  for (let iv = 0; iv < heightSegs; iv++) {
    for (let iu = 0; iu < radialSegs; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeTangents();
  return geo;
}

/**
 * Generates neatly draped & folded trousers hanging over a walnut hanger trouser bar.
 */
function createFoldedTrousersGroup(
  mat: THREE.Material,
  hipHalfW: number,
  dropLength: number,
  legRadiusTop: number,
  legRadiusBottom: number,
  withCenterCrease = true
): THREE.Group {
  const trousers = new THREE.Group();

  // Folded over the bar at local y = 0
  const foldLoop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, hipHalfW * 1.9, 14),
    mat
  );
  foldLoop.rotation.z = Math.PI / 2;
  foldLoop.scale.set(1, 1, 1.35);
  foldLoop.castShadow = true;
  trousers.add(foldLoop);

  for (const side of [-1, 1]) {
    // Front & back hanging folds of each trouser leg
    const legGeo = createSculptedClothTorso({
      shoulderHalfW: legRadiusTop,
      waistHalfW: THREE.MathUtils.lerp(legRadiusTop, legRadiusBottom, 0.55),
      hemHalfW: legRadiusBottom,
      height: dropLength,
      topDepth: 0.028,
      chestDepth: 0.012,
      hemDepth: 0.036,
      shoulderDrop: 0.004,
      neckRadius: 0.001,
      neckFrontDrop: 0,
      hemCurve: 0.003,
      pleatFreq: withCenterCrease ? 4 : 6,
      pleatAmp: withCenterCrease ? 0.007 : 0.005,
      uSegs: 20,
      vSegs: 12,
    });
    const legMesh = new THREE.Mesh(legGeo, mat);
    legMesh.position.set(side * (hipHalfW * 0.5), 0, 0);
    legMesh.castShadow = true;
    trousers.add(legMesh);
  }

  return trousers;
}

// ============================================================================
// Luxury Walnut Wood & Brushed Brass Hanger
// ============================================================================

/**
 * Builds a luxury curved walnut wood hanger with integrated trouser bar and
 * brushed brass hook centered at (0, 0, 0) to hook cleanly onto the carousel ring.
 */
function buildLuxuryHanger(
  textures: ProceduralTextureSet,
  goldColor: string
): THREE.Group {
  const hanger = new THREE.Group();

  const walnutMat = new THREE.MeshStandardMaterial({
    map: textures.woodColor,
    bumpMap: textures.woodBump,
    bumpScale: 0.005,
    roughness: 0.36,
    metalness: 0.08,
  });

  const brassMat = new THREE.MeshPhysicalMaterial({
    color: goldColor,
    roughness: 0.18,
    metalness: 0.94,
    anisotropy: 0.8,
  });

  // 1. Sculpted ergonomic curved walnut shoulder yoke (placed at y = -0.17 below ring hook)
  const yokeY = -0.175;
  const barCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.33, yokeY - 0.095, 0),
    new THREE.Vector3(-0.18, yokeY - 0.025, 0.012),
    new THREE.Vector3(0, yokeY + 0.012, 0.005),
    new THREE.Vector3(0.18, yokeY - 0.025, 0.012),
    new THREE.Vector3(0.33, yokeY - 0.095, 0),
  ]);
  const barGeo = new THREE.TubeGeometry(barCurve, 24, 0.018, 10, false);
  barGeo.scale(1, 0.85, 1.35);
  const barMesh = new THREE.Mesh(barGeo, walnutMat);
  barMesh.castShadow = true;
  hanger.add(barMesh);

  // Brass shoulder end caps
  for (const side of [-1, 1]) {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.021, 12, 12),
      brassMat
    );
    cap.position.set(side * 0.33, yokeY - 0.095, 0);
    cap.scale.set(0.9, 0.85, 1.2);
    hanger.add(cap);
  }

  // 2. Integrated walnut trouser bar + brass side drop-pins
  const trouserBarY = yokeY - 0.145;
  const trouserBar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, 0.48, 14),
    walnutMat
  );
  trouserBar.rotation.z = Math.PI / 2;
  trouserBar.position.set(0, trouserBarY, -0.015);
  trouserBar.castShadow = true;
  hanger.add(trouserBar);

  for (const side of [-1, 1]) {
    const dropStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0055, 0.0055, 0.105, 8),
      brassMat
    );
    dropStrut.position.set(side * 0.235, (yokeY - 0.045 + trouserBarY) * 0.5, -0.008);
    dropStrut.rotation.z = side * 0.08;
    hanger.add(dropStrut);
  }

  // 3. Brushed brass neck collar ferrule
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.024, 0.042, 14),
    brassMat
  );
  collar.position.set(0, yokeY + 0.032, 0.005);
  hanger.add(collar);

  // 4. Curved brass hook whose top apex wraps directly around y = 0 (carousel brass ring)
  const hookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, yokeY + 0.05, 0.005),
    new THREE.Vector3(0, -0.035, 0.004),
    new THREE.Vector3(0, 0.026, 0.028),
    new THREE.Vector3(0, 0.034, 0.0),
    new THREE.Vector3(0, 0.014, -0.032),
    new THREE.Vector3(0, -0.018, -0.024),
  ]);
  const hookGeo = new THREE.TubeGeometry(hookCurve, 20, 0.0085, 8, false);
  const hookMesh = new THREE.Mesh(hookGeo, brassMat);
  hookMesh.castShadow = true;
  hanger.add(hookMesh);

  return hanger;
}

// ============================================================================
// Detailed Tailored Garment Builders (4 Signature Outfits)
// ============================================================================

export function buildProceduralGarment(
  type: GarmentModelType,
  palette: GarmentPalette,
  textures: ProceduralTextureSet,
  withHanger = true
): THREE.Group {
  const group = new THREE.Group();
  const garmentBody = new THREE.Group();
  // Position garment shoulder top snug right over the walnut hanger yoke (y = -0.165)
  garmentBody.position.set(0, -0.165, 0.005);

  const brassHardware = new THREE.MeshPhysicalMaterial({
    color: palette.hardware,
    roughness: 0.18,
    metalness: 0.94,
    anisotropy: 0.8,
  });

  const satinAccent = new THREE.MeshPhysicalMaterial({
    color: palette.accent,
    roughness: 0.28,
    metalness: 0.16,
    clearcoat: 0.35,
    clearcoatRoughness: 0.32,
    sheen: 0.75,
    sheenColor: new THREE.Color('#FFF8DC'),
    side: THREE.DoubleSide,
  });

  if (type === 'kurta') {
    // --- OUTFIT 1: Festive Kurta & Trouser Set ---
    const silkLinenMat = new THREE.MeshPhysicalMaterial({
      color: palette.primary,
      roughness: 0.72,
      metalness: 0.04,
      sheen: 0.68,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color('#FFF8DC'),
      bumpMap: textures.linenBump,
      bumpScale: 0.006,
      side: THREE.DoubleSide,
    });

    const trouserMat = new THREE.MeshPhysicalMaterial({
      color: palette.secondary,
      roughness: 0.78,
      metalness: 0.02,
      sheen: 0.45,
      sheenRoughness: 0.55,
      bumpMap: textures.linenBump,
      bumpScale: 0.005,
      side: THREE.DoubleSide,
    });

    const embroideryMat = new THREE.MeshPhysicalMaterial({
      map: textures.embroideryColor,
      bumpMap: textures.embroideryBump,
      bumpScale: 0.012,
      roughness: 0.32,
      metalness: 0.72,
      sheen: 0.5,
      sheenColor: new THREE.Color('#FBC030'),
    });

    // 1. Draped pleated kurta tunic with side slits and curved hem
    const tunicGeo = createSculptedClothTorso({
      shoulderHalfW: 0.255,
      waistHalfW: 0.235,
      hemHalfW: 0.275,
      waistV: 0.42,
      height: 0.64,
      topDepth: 0.032,
      chestDepth: 0.062,
      hemDepth: 0.068,
      shoulderDrop: 0.075,
      neckRadius: 0.08,
      neckFrontDrop: 0.028,
      hemCurve: 0.028,
      pleatFreq: 10,
      pleatAmp: 0.014,
      sideSlitStartV: 0.7,
      uSegs: 48,
      vSegs: 24,
    });
    const tunic = new THREE.Mesh(tunicGeo, silkLinenMat);
    tunic.castShadow = true;
    tunic.receiveShadow = true;
    garmentBody.add(tunic);

    // 2. Tailored Mandarin Stand Collar with gold piping
    const collarCurve = new THREE.TorusGeometry(0.08, 0.016, 12, 28, Math.PI * 1.78);
    const collar = new THREE.Mesh(collarCurve, silkLinenMat);
    collar.rotation.x = Math.PI / 2;
    collar.rotation.z = Math.PI * 0.61;
    collar.position.set(0, -0.004, 0.002);
    garmentBody.add(collar);

    const collarBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.082, 0.088, 0.048, 28, 1, true, 0.35, Math.PI * 1.78),
      silkLinenMat
    );
    collarBand.position.set(0, 0.016, 0.002);
    garmentBody.add(collarBand);

    const collarPiping = new THREE.Mesh(
      new THREE.TorusGeometry(0.082, 0.005, 8, 28, Math.PI * 1.78),
      brassHardware
    );
    collarPiping.rotation.x = Math.PI / 2;
    collarPiping.rotation.z = Math.PI * 0.61;
    collarPiping.position.set(0, 0.04, 0.002);
    garmentBody.add(collarPiping);

    // 3. Curved Gold Embroidered Zardozi Chest Placket
    const placketCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.02, 0.056),
      new THREE.Vector3(0, -0.12, 0.086),
      new THREE.Vector3(0, -0.22, 0.086),
      new THREE.Vector3(0, -0.32, 0.072),
    ]);
    const placketGeo = new THREE.TubeGeometry(placketCurve, 12, 0.036, 8, false);
    placketGeo.scale(1.1, 1, 0.22);
    const placket = new THREE.Mesh(placketGeo, embroideryMat);
    placket.castShadow = true;
    garmentBody.add(placket);

    // 4. Tiny metallic kurta buttons + thread loop accents
    for (let i = 0; i < 4; i++) {
      const btnY = -0.065 - i * 0.064;
      const btnZ = i === 0 ? 0.081 : i === 3 ? 0.082 : 0.095;
      const btn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.014, 0.012, 14),
        brassHardware
      );
      btn.rotation.x = Math.PI / 2;
      btn.position.set(0, btnY, btnZ);
      garmentBody.add(btn);

      const loop = new THREE.Mesh(
        new THREE.TorusGeometry(0.014, 0.003, 6, 12),
        satinAccent
      );
      loop.position.set(-0.008, btnY, btnZ - 0.002);
      garmentBody.add(loop);
    }

    // 5. Soft draped sleeves with gold embroidered cuffs
    for (const side of [-1, 1] as const) {
      const sleeveGeo = createDrapedSleeve({
        side,
        shoulderPos: new THREE.Vector3(side * 0.24, -0.082, 0.004),
        length: 0.36,
        hangAngle: 0.44,
        forwardBend: 0.045,
        radiusTop: 0.066,
        radiusEnd: 0.048,
        creaseAmp: 0.0055,
      });
      const sleeve = new THREE.Mesh(sleeveGeo, silkLinenMat);
      sleeve.castShadow = true;
      garmentBody.add(sleeve);

      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.052, 0.046, 18),
        embroideryMat
      );
      const endX = side * (0.24 + Math.sin(0.44) * 0.36 * 0.96);
      const endY = -0.082 - Math.cos(0.44) * 0.36;
      cuff.position.set(endX, endY + 0.016, 0.048);
      cuff.rotation.z = side * 0.44;
      cuff.rotation.x = 0.1;
      garmentBody.add(cuff);
    }

    // 6. Neatly folded matching pajama trousers hanging from hanger trouser bar behind kurta
    const trousers = createFoldedTrousersGroup(
      trouserMat,
      0.16,
      0.56,
      0.082,
      0.058,
      false
    );
    trousers.position.set(0, -0.155, -0.022);
    garmentBody.add(trousers);
  } else if (type === 'frock') {
    // --- OUTFIT 2: Tulle & Satin Party Frock ---
    const satinBodiceMat = new THREE.MeshPhysicalMaterial({
      color: palette.secondary,
      roughness: 0.32,
      metalness: 0.08,
      clearcoat: 0.25,
      clearcoatRoughness: 0.4,
      sheen: 0.85,
      sheenRoughness: 0.35,
      sheenColor: new THREE.Color('#FFF8DC'),
      bumpMap: textures.linenBump,
      bumpScale: 0.003,
      side: THREE.DoubleSide,
    });

    const innerSkirtMat = new THREE.MeshPhysicalMaterial({
      color: palette.primary,
      roughness: 0.45,
      metalness: 0.06,
      sheen: 0.9,
      sheenRoughness: 0.35,
      sheenColor: new THREE.Color('#FFFFFF'),
      side: THREE.DoubleSide,
    });

    const sheerTulleMat = new THREE.MeshPhysicalMaterial({
      color: palette.secondary,
      roughness: 0.48,
      metalness: 0.02,
      sheen: 0.95,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color('#FFF8DC'),
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const laceTrimMat = new THREE.MeshStandardMaterial({
      map: textures.laceColor,
      alphaMap: textures.laceAlpha,
      transparent: true,
      alphaTest: 0.25,
      roughness: 0.6,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });

    // 1. Fitted satin-cotton bodice ending at natural cinched waist
    const bodiceGeo = createSculptedClothTorso({
      shoulderHalfW: 0.215,
      waistHalfW: 0.155,
      hemHalfW: 0.155,
      waistV: 0.95,
      height: 0.28,
      topDepth: 0.028,
      chestDepth: 0.056,
      hemDepth: 0.052,
      shoulderDrop: 0.068,
      neckRadius: 0.082,
      neckFrontDrop: 0.042,
      hemCurve: 0.005,
      pleatFreq: 8,
      pleatAmp: 0.004,
      uSegs: 42,
      vSegs: 14,
    });
    const bodice = new THREE.Mesh(bodiceGeo, satinBodiceMat);
    bodice.castShadow = true;
    garmentBody.add(bodice);

    // Neckline delicate gold piping
    const neckPiping = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.006, 8, 28, Math.PI * 1.65),
      brassHardware
    );
    neckPiping.rotation.x = Math.PI / 2 + 0.18;
    neckPiping.rotation.z = Math.PI * 0.68;
    neckPiping.position.set(0, -0.026, 0.022);
    garmentBody.add(neckPiping);

    // 2. Puffed cap sleeves with gathered elastic trim
    for (const side of [-1, 1] as const) {
      const puffGeo = new THREE.SphereGeometry(0.086, 20, 16);
      const posAttr = puffGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const px = posAttr.getX(i);
        const py = posAttr.getY(i);
        const pz = posAttr.getZ(i);
        const angle = Math.atan2(pz, px);
        const gather = 1 + 0.08 * Math.sin(angle * 7);
        posAttr.setXYZ(i, px * gather, py * 0.85, pz * gather * 0.9);
      }
      puffGeo.computeVertexNormals();
      const puff = new THREE.Mesh(puffGeo, satinBodiceMat);
      puff.position.set(side * 0.235, -0.085, 0.004);
      puff.rotation.z = side * -0.35;
      puff.castShadow = true;
      garmentBody.add(puff);

      const capBand = new THREE.Mesh(
        new THREE.TorusGeometry(0.062, 0.008, 8, 18),
        satinAccent
      );
      capBand.position.set(side * 0.27, -0.135, 0.004);
      capBand.rotation.x = Math.PI / 2;
      capBand.rotation.y = side * -0.45;
      garmentBody.add(capBand);
    }

    // 3. Multi-layered ruffled/pleated flared skirt
    const waistY = -0.27;
    // Layer A: Inner satin underskirt
    const innerSkirtGeo = createPleatedSkirtGeometry({
      waistRx: 0.155,
      waistRz: 0.075,
      hemRx: 0.42,
      hemRz: 0.3,
      height: 0.43,
      pleatCount: 12,
      pleatDepth: 0.018,
      ruffleWave: 0.01,
      radialSegs: 64,
      heightSegs: 14,
    });
    const innerSkirt = new THREE.Mesh(innerSkirtGeo, innerSkirtMat);
    innerSkirt.position.y = waistY;
    innerSkirt.castShadow = true;
    innerSkirt.receiveShadow = true;
    garmentBody.add(innerSkirt);

    // Layer B: Middle dense pleated tulle tier
    const midSkirtGeo = createPleatedSkirtGeometry({
      waistRx: 0.162,
      waistRz: 0.08,
      hemRx: 0.46,
      hemRz: 0.34,
      height: 0.39,
      pleatCount: 18,
      pleatDepth: 0.022,
      ruffleWave: 0.016,
      radialSegs: 72,
      heightSegs: 14,
    });
    const midSkirt = new THREE.Mesh(midSkirtGeo, sheerTulleMat);
    midSkirt.position.y = waistY;
    midSkirt.renderOrder = 1;
    garmentBody.add(midSkirt);

    // Layer C: Outer sheer ruffled overlay + scalloped lace trim at bottom hem
    const outerSkirtGeo = createPleatedSkirtGeometry({
      waistRx: 0.168,
      waistRz: 0.085,
      hemRx: 0.49,
      hemRz: 0.365,
      height: 0.35,
      pleatCount: 14,
      pleatDepth: 0.024,
      ruffleWave: 0.02,
      radialSegs: 72,
      heightSegs: 12,
    });
    const outerSkirt = new THREE.Mesh(outerSkirtGeo, sheerTulleMat);
    outerSkirt.position.y = waistY;
    outerSkirt.renderOrder = 2;
    garmentBody.add(outerSkirt);

    // Scalloped lace edge band along the inner skirt hem
    const laceBandGeo = createPleatedSkirtGeometry({
      waistRx: 0.395,
      waistRz: 0.282,
      hemRx: 0.435,
      hemRz: 0.312,
      height: 0.065,
      pleatCount: 12,
      pleatDepth: 0.016,
      ruffleWave: 0.008,
      radialSegs: 64,
      heightSegs: 4,
    });
    const laceHem = new THREE.Mesh(laceBandGeo, laceTrimMat);
    laceHem.position.y = waistY - 0.385;
    laceHem.renderOrder = 3;
    garmentBody.add(laceHem);

    // 4. Satin waist sash & volumetric 3D bow with cascading tails
    const sash = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.022, 12, 32),
      satinAccent
    );
    sash.rotation.x = Math.PI / 2;
    sash.scale.set(1.02, 0.52, 1.25);
    sash.position.set(0, waistY + 0.005, 0);
    garmentBody.add(sash);

    const bowGroup = new THREE.Group();
    bowGroup.position.set(0, waistY + 0.005, 0.088);

    const bowKnot = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 14, 14),
      satinAccent
    );
    bowKnot.scale.set(1.15, 0.95, 0.8);
    bowGroup.add(bowKnot);

    for (const side of [-1, 1] as const) {
      const loopCurve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(side * 0.072, 0.032, 0.02),
          new THREE.Vector3(side * 0.088, -0.005, 0.012),
          new THREE.Vector3(side * 0.068, -0.034, 0.005),
          new THREE.Vector3(0, 0, 0),
        ],
        true
      );
      const loopMesh = new THREE.Mesh(
        new THREE.TubeGeometry(loopCurve, 20, 0.014, 8, true),
        satinAccent
      );
      loopMesh.scale.set(1, 1.15, 0.65);
      bowGroup.add(loopMesh);

      // Flowing bow ribbon tail draping over skirt pleats
      const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.012, -0.01, 0),
        new THREE.Vector3(side * 0.042, -0.085, 0.042),
        new THREE.Vector3(side * 0.065, -0.17, 0.095),
      ]);
      const tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.013, 6, false);
      tailGeo.scale(1.3, 1, 0.25);
      const tailMesh = new THREE.Mesh(tailGeo, satinAccent);
      bowGroup.add(tailMesh);
    }
    garmentBody.add(bowGroup);
  } else if (type === 'party-suit') {
    // --- OUTFIT 3: Velvet Baby Blazer & Pant Set ---
    const velvetMat = new THREE.MeshPhysicalMaterial({
      color: palette.primary,
      roughness: 0.66,
      metalness: 0.06,
      sheen: 1.0,
      sheenRoughness: 0.28,
      sheenColor: new THREE.Color('#FDE382'),
      bumpMap: textures.velvetBump,
      bumpScale: 0.007,
      side: THREE.DoubleSide,
    });

    const shirtMat = new THREE.MeshPhysicalMaterial({
      color: palette.secondary,
      roughness: 0.72,
      metalness: 0.02,
      sheen: 0.4,
      sheenColor: new THREE.Color('#FFFFFF'),
      bumpMap: textures.linenBump,
      bumpScale: 0.004,
      side: THREE.DoubleSide,
    });

    // 1. Crisp Ivory Collared Dress Shirt underneath blazer
    const shirtGeo = createSculptedClothTorso({
      shoulderHalfW: 0.21,
      waistHalfW: 0.195,
      hemHalfW: 0.205,
      height: 0.39,
      topDepth: 0.026,
      chestDepth: 0.052,
      hemDepth: 0.045,
      shoulderDrop: 0.062,
      neckRadius: 0.07,
      neckFrontDrop: 0.018,
      hemCurve: 0.01,
      pleatFreq: 6,
      pleatAmp: 0.003,
      uSegs: 36,
      vSegs: 16,
    });
    const shirt = new THREE.Mesh(shirtGeo, shirtMat);
    garmentBody.add(shirt);

    // Shirt collar points
    for (const side of [-1, 1] as const) {
      const collarShape = new THREE.Shape();
      collarShape.moveTo(0, 0);
      collarShape.lineTo(side * 0.068, 0.015);
      collarShape.lineTo(side * 0.045, -0.042);
      collarShape.lineTo(side * 0.006, -0.026);
      collarShape.closePath();
      const cGeo = new THREE.ExtrudeGeometry(collarShape, {
        depth: 0.008,
        bevelEnabled: true,
        bevelSize: 0.003,
        bevelThickness: 0.003,
        bevelSegments: 2,
      });
      const cMesh = new THREE.Mesh(cGeo, shirtMat);
      cMesh.position.set(side * 0.006, -0.012, 0.052);
      cMesh.rotation.x = 0.28;
      cMesh.rotation.y = side * -0.18;
      garmentBody.add(cMesh);
    }

    // 2. Pleated Gold Satin Bow Tie
    const bowTie = new THREE.Group();
    bowTie.position.set(0, -0.046, 0.072);
    const knot = new THREE.Mesh(
      new THREE.BoxGeometry(0.022, 0.024, 0.018),
      satinAccent
    );
    bowTie.add(knot);
    for (const side of [-1, 1] as const) {
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0.008);
      wingShape.lineTo(side * 0.048, 0.026);
      wingShape.lineTo(side * 0.048, -0.026);
      wingShape.lineTo(0, -0.008);
      wingShape.closePath();
      const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
        depth: 0.01,
        bevelEnabled: true,
        bevelSize: 0.003,
        bevelThickness: 0.003,
        bevelSegments: 2,
      });
      const wing = new THREE.Mesh(wingGeo, satinAccent);
      wing.position.set(0, 0, -0.004);
      wing.rotation.y = side * -0.15;
      bowTie.add(wing);
    }
    garmentBody.add(bowTie);

    // 3. Structured Velvet Blazer Shell with V-neck front opening
    const blazerGeo = createSculptedClothTorso({
      shoulderHalfW: 0.255,
      waistHalfW: 0.225,
      hemHalfW: 0.245,
      waistV: 0.56,
      height: 0.44,
      topDepth: 0.035,
      chestDepth: 0.068,
      hemDepth: 0.06,
      shoulderDrop: 0.072,
      neckRadius: 0.088,
      neckFrontDrop: 0.028,
      frontVNeckDepth: 0.145,
      hemCurve: 0.022,
      pleatFreq: 8,
      pleatAmp: 0.006,
      uSegs: 48,
      vSegs: 20,
    });
    const blazer = new THREE.Mesh(blazerGeo, velvetMat);
    blazer.castShadow = true;
    blazer.receiveShadow = true;
    garmentBody.add(blazer);

    // 4. Structured Notched Lapels (left & right sculpted lapels with authentic notch)
    for (const side of [-1, 1] as const) {
      const lapelShape = new THREE.Shape();
      lapelShape.moveTo(side * 0.068, 0.0);
      lapelShape.lineTo(side * 0.11, -0.045);
      lapelShape.lineTo(side * 0.088, -0.056); // notch cut-in
      lapelShape.lineTo(side * 0.118, -0.076); // lower peak
      lapelShape.lineTo(side * 0.048, -0.22);
      lapelShape.lineTo(side * 0.022, -0.22);
      lapelShape.lineTo(side * 0.052, -0.02);
      lapelShape.closePath();

      const lapelGeo = new THREE.ExtrudeGeometry(lapelShape, {
        depth: 0.012,
        bevelEnabled: true,
        bevelSize: 0.004,
        bevelThickness: 0.004,
        bevelSegments: 2,
      });
      const lapel = new THREE.Mesh(lapelGeo, velvetMat);
      lapel.position.set(0, -0.025, 0.075);
      lapel.rotation.x = 0.12;
      lapel.rotation.y = side * 0.22;
      lapel.castShadow = true;
      garmentBody.add(lapel);
    }

    // 5. Chest Welt Pocket & Folded Silk Pocket Square
    const pocketWelt = new THREE.Mesh(
      new THREE.BoxGeometry(0.068, 0.014, 0.012),
      velvetMat
    );
    pocketWelt.position.set(0.115, -0.155, 0.084);
    pocketWelt.rotation.z = 0.06;
    pocketWelt.rotation.y = 0.3;
    garmentBody.add(pocketWelt);

    for (let p = 0; p < 2; p++) {
      const sqPeak = new THREE.Mesh(
        new THREE.ConeGeometry(0.018, 0.042, 4),
        satinAccent
      );
      sqPeak.position.set(0.108 + p * 0.018, -0.132, 0.084);
      sqPeak.rotation.z = -0.15 + p * 0.35;
      sqPeak.scale.set(1, 1, 0.3);
      garmentBody.add(sqPeak);
    }

    // 6. Double-Breasted Brushed Gold Buttons (2x3 tailored layout)
    for (let row = 0; row < 3; row++) {
      for (const side of [-1, 1] as const) {
        const btn = new THREE.Mesh(
          new THREE.CylinderGeometry(0.014, 0.015, 0.01, 16),
          brassHardware
        );
        btn.rotation.x = Math.PI / 2;
        btn.position.set(side * 0.046, -0.21 - row * 0.068, 0.092 - row * 0.006);
        btn.rotation.z = side * -0.1;
        garmentBody.add(btn);
      }
    }

    // 7. Draped Velvet Sleeves with Mini Gold Cuff Buttons
    for (const side of [-1, 1] as const) {
      const sleeveGeo = createDrapedSleeve({
        side,
        shoulderPos: new THREE.Vector3(side * 0.24, -0.078, 0.004),
        length: 0.35,
        hangAngle: 0.42,
        forwardBend: 0.042,
        radiusTop: 0.065,
        radiusEnd: 0.048,
        creaseAmp: 0.004,
      });
      const sleeve = new THREE.Mesh(sleeveGeo, velvetMat);
      sleeve.castShadow = true;
      garmentBody.add(sleeve);

      const cuffBtn = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 10, 10),
        brassHardware
      );
      const endX = side * (0.24 + Math.sin(0.42) * 0.35 * 0.94);
      const endY = -0.078 - Math.cos(0.42) * 0.35;
      cuffBtn.position.set(endX, endY + 0.032, 0.078);
      garmentBody.add(cuffBtn);
    }

    // 8. Tailored Creased Velvet Trousers hanging on walnut trouser bar below blazer
    const trousers = createFoldedTrousersGroup(
      velvetMat,
      0.155,
      0.57,
      0.082,
      0.056,
      true
    );
    trousers.position.set(0, -0.155, -0.018);
    garmentBody.add(trousers);
  } else {
    // --- OUTFIT 4: Organic Cotton Newborn Romper ---
    const knitPrimaryMat = new THREE.MeshPhysicalMaterial({
      color: palette.primary,
      roughness: 0.86,
      metalness: 0.01,
      sheen: 0.5,
      sheenRoughness: 0.72,
      sheenColor: new THREE.Color('#FFF8DC'),
      bumpMap: textures.knitBump,
      bumpScale: 0.012,
      roughnessMap: textures.knitRoughness,
      side: THREE.DoubleSide,
    });

    const ribbedTrimMat = new THREE.MeshPhysicalMaterial({
      color: palette.secondary,
      roughness: 0.82,
      metalness: 0.02,
      sheen: 0.45,
      sheenRoughness: 0.65,
      bumpMap: textures.knitBump,
      bumpScale: 0.015,
      side: THREE.DoubleSide,
    });

    // 1. Soft quilted/knit romper upper body (chest to hip gusset)
    const romperBodyGeo = createSculptedClothTorso({
      shoulderHalfW: 0.225,
      waistHalfW: 0.215,
      hemHalfW: 0.238,
      waistV: 0.45,
      height: 0.44,
      topDepth: 0.03,
      chestDepth: 0.062,
      hemDepth: 0.064,
      shoulderDrop: 0.072,
      neckRadius: 0.075,
      neckFrontDrop: 0.036,
      hemCurve: 0.018,
      pleatFreq: 8,
      pleatAmp: 0.008,
      uSegs: 44,
      vSegs: 18,
    });
    const romperBody = new THREE.Mesh(romperBodyGeo, knitPrimaryMat);
    romperBody.castShadow = true;
    romperBody.receiveShadow = true;
    garmentBody.add(romperBody);

    // 2. Sculpted baby trouser legs with ribbed knit ankle cuffs
    for (const side of [-1, 1] as const) {
      const legGeo = createDrapedSleeve({
        side,
        shoulderPos: new THREE.Vector3(side * 0.118, -0.39, 0.002),
        length: 0.26,
        hangAngle: 0.1,
        forwardBend: 0.012,
        radiusTop: 0.088,
        radiusEnd: 0.062,
        creaseAmp: 0.005,
      });
      const leg = new THREE.Mesh(legGeo, knitPrimaryMat);
      leg.castShadow = true;
      garmentBody.add(leg);

      // Ribbed ankle cuff
      const endX = side * (0.118 + Math.sin(0.1) * 0.26);
      const endY = -0.39 - Math.cos(0.1) * 0.26;
      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.063, 0.056, 0.044, 18),
        ribbedTrimMat
      );
      cuff.position.set(endX, endY, 0.014);
      cuff.rotation.z = side * 0.1;
      garmentBody.add(cuff);
    }

    // 3. Soft Rounded Peter Pan Collar (dual curved collar petals)
    for (const side of [-1, 1] as const) {
      const petalShape = new THREE.Shape();
      petalShape.moveTo(side * 0.008, 0);
      petalShape.quadraticCurveTo(side * 0.08, 0.015, side * 0.115, -0.025);
      petalShape.quadraticCurveTo(side * 0.105, -0.072, side * 0.042, -0.068);
      petalShape.quadraticCurveTo(side * 0.012, -0.058, side * 0.008, -0.022);
      petalShape.closePath();

      const petalGeo = new THREE.ExtrudeGeometry(petalShape, {
        depth: 0.009,
        bevelEnabled: true,
        bevelSize: 0.004,
        bevelThickness: 0.004,
        bevelSegments: 2,
      });
      const petal = new THREE.Mesh(petalGeo, ribbedTrimMat);
      petal.position.set(0, -0.02, 0.06);
      petal.rotation.x = 0.42;
      petal.rotation.y = side * 0.24;
      petal.castShadow = true;
      garmentBody.add(petal);
    }

    // 4. Center Front Knit Button Placket + 5 Olivewood/Brass Buttons
    const placketCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.055, 0.074),
      new THREE.Vector3(0, -0.18, 0.094),
      new THREE.Vector3(0, -0.32, 0.088),
      new THREE.Vector3(0, -0.41, 0.07),
    ]);
    const placketGeo = new THREE.TubeGeometry(placketCurve, 14, 0.024, 8, false);
    placketGeo.scale(1.15, 1, 0.22);
    const placket = new THREE.Mesh(placketGeo, ribbedTrimMat);
    garmentBody.add(placket);

    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const pt = placketCurve.getPointAt(0.08 + t * 0.84);
      const btn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.01, 14),
        brassHardware
      );
      btn.rotation.x = Math.PI / 2;
      btn.position.set(0, pt.y, pt.z + 0.006);
      garmentBody.add(btn);
    }

    // 5. Draped raglan knit sleeves with ribbed wrist cuffs
    for (const side of [-1, 1] as const) {
      const sleeveGeo = createDrapedSleeve({
        side,
        shoulderPos: new THREE.Vector3(side * 0.215, -0.078, 0.004),
        length: 0.31,
        hangAngle: 0.48,
        forwardBend: 0.036,
        radiusTop: 0.062,
        radiusEnd: 0.045,
        creaseAmp: 0.0045,
      });
      const sleeve = new THREE.Mesh(sleeveGeo, knitPrimaryMat);
      sleeve.castShadow = true;
      garmentBody.add(sleeve);

      const endX = side * (0.215 + Math.sin(0.48) * 0.31 * 0.96);
      const endY = -0.078 - Math.cos(0.48) * 0.31;
      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.047, 0.042, 0.04, 16),
        ribbedTrimMat
      );
      cuff.position.set(endX, endY, 0.038);
      cuff.rotation.z = side * 0.48;
      garmentBody.add(cuff);
    }
  }

  group.add(garmentBody);

  if (withHanger) {
    const hanger = buildLuxuryHanger(textures, palette.hardware);
    group.add(hanger);
  }

  return group;
}

// ============================================================================
// Hero 3D Boutique Carousel Assembly
// ============================================================================

export interface HeroCarouselRig {
  root: THREE.Group;
  carouselSpinner: THREE.Group;
  garmentHolders: THREE.Group[];
  ribbons: THREE.Mesh[];
}

export function buildBoutiqueCarousel(textures: ProceduralTextureSet): HeroCarouselRig {
  const root = new THREE.Group();

  // 1. Contact shadow plane directly at y = 0.004
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 4.4),
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      opacity: 0.74,
      depthWrite: false,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.004;
  root.add(shadowPlane);

  // 2. Stepped dark travertine pedestal base (bottom flush at y = 0)
  const marbleMat = new THREE.MeshStandardMaterial({
    map: textures.marbleColor,
    roughness: 0.36,
    metalness: 0.14,
  });
  const brassMat = new THREE.MeshPhysicalMaterial({
    color: '#C8963E',
    roughness: 0.18,
    metalness: 0.92,
    anisotropy: 0.8,
  });

  const basePlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.18, 1.28, 0.14, 32),
    marbleMat
  );
  basePlinth.position.y = 0.07;
  basePlinth.receiveShadow = true;
  root.add(basePlinth);

  const brassBaseRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.02, 10, 48),
    brassMat
  );
  brassBaseRing.rotation.x = Math.PI / 2;
  brassBaseRing.position.y = 0.14;
  root.add(brassBaseRing);

  // 3. Central fluted boutique column
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.085, 2.12, 16),
    brassMat
  );
  column.position.y = 1.2;
  column.castShadow = true;
  root.add(column);

  // Crown finial
  const finial = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.11, 0.04),
        new THREE.Vector2(0.06, 0.11),
        new THREE.Vector2(0.08, 0.18),
        new THREE.Vector2(0, 0.28),
      ],
      20
    ),
    brassMat
  );
  finial.position.y = 2.26;
  root.add(finial);

  // 4. Spinning circular boutique rack at y = 1.96
  const carouselSpinner = new THREE.Group();
  carouselSpinner.position.y = 1.96;
  root.add(carouselSpinner);

  const rackRadius = 0.98;
  const rackRing = new THREE.Mesh(
    new THREE.TorusGeometry(rackRadius, 0.022, 10, 48),
    brassMat
  );
  rackRing.rotation.x = Math.PI / 2;
  carouselSpinner.add(rackRing);

  // 4 radial brass spokes + decorative ring finials
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, rackRadius, 10),
      brassMat
    );
    spoke.rotation.z = Math.PI / 2;
    spoke.rotation.y = angle;
    spoke.position.set(
      Math.cos(angle) * (rackRadius / 2),
      0,
      -Math.sin(angle) * (rackRadius / 2)
    );
    carouselSpinner.add(spoke);
  }

  // 4 Signature Luxury Outfits hanging around the carousel ring (contrasting cleanly against #F5EFE6)
  const showcaseOutfits: Array<{ type: GarmentModelType; palette: GarmentPalette }> = [
    {
      type: 'frock', // Outfit 2: Blush Peach & Champagne Tulle Party Frock
      palette: {
        primary: '#E8BCAE',
        secondary: '#FFFBF5',
        accent: '#C8963E',
        hardware: '#C8963E',
      },
    },
    {
      type: 'romper', // Outfit 4: Organic Oat & Honey-Knit Newborn Romper
      palette: {
        primary: '#DFD2C0',
        secondary: '#C9AE8B',
        accent: '#C8963E',
        hardware: '#B48231',
      },
    },
    {
      type: 'kurta', // Outfit 1: Festive Sand-Silk Kurta & Trouser Set
      palette: {
        primary: '#D7BA92',
        secondary: '#F5EFE6',
        accent: '#C8963E',
        hardware: '#C8963E',
      },
    },
    {
      type: 'party-suit', // Outfit 3: Deep Espresso-Cocoa Velvet Blazer & Pant Set
      palette: {
        primary: '#4A3127',
        secondary: '#FFFFFF',
        accent: '#E0AF50',
        hardware: '#C8963E',
      },
    },
  ];

  const garmentHolders: THREE.Group[] = [];
  showcaseOutfits.forEach((item, idx) => {
    const angle = (idx * Math.PI) / 2;
    const holder = new THREE.Group();
    // Pivot point sits directly on the brass ring (y = 0 in carouselSpinner space)
    holder.position.set(Math.cos(angle) * rackRadius, 0, Math.sin(angle) * rackRadius);
    holder.rotation.y = -angle + Math.PI / 2;

    // Inner swing pivot allows natural pendulum sway while keeping brass hook locked on ring
    const garment = buildProceduralGarment(item.type, item.palette, textures, true);
    garment.scale.setScalar(0.92);
    holder.add(garment);

    carouselSpinner.add(holder);
    garmentHolders.push(holder);
  });

  // 5. Floating satin fabric ribbons orbiting the boutique carousel
  const ribbonSpecs = [
    { color: '#C8963E', radius: 1.5, yOffset: 0.72, phase: 0 },
    { color: '#E0AF50', radius: 1.64, yOffset: 1.25, phase: 2.1 },
    { color: '#DFBEB0', radius: 1.4, yOffset: 1.64, phase: 4.2 },
  ];

  const ribbons: THREE.Mesh[] = ribbonSpecs.map((spec) => {
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= 14; s++) {
      const t = (s / 14) * Math.PI * 1.35 + spec.phase;
      pts.push(
        new THREE.Vector3(
          Math.cos(t) * spec.radius,
          spec.yOffset + Math.sin(t * 2) * 0.16,
          Math.sin(t) * spec.radius
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.022, 8, false);
    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: spec.color,
      roughness: 0.3,
      metalness: spec.color === '#C8963E' ? 0.45 : 0.12,
      sheen: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const ribbonMesh = new THREE.Mesh(tubeGeo, ribbonMat);
    ribbonMesh.scale.set(1, 0.35, 1);
    root.add(ribbonMesh);
    return ribbonMesh;
  });

  return { root, carouselSpinner, garmentHolders, ribbons };
}
