'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useAccentColor } from '@/lib/AccentColorContext';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { hexToRgb } from '@/lib/colorUtils';
import { features } from '@/data';
import styles from './InteractiveBackground.module.css';

/**
 * WebGL plus-grid hero background.
 *
 * One fullscreen canvas runs a procedural fragment shader that draws the grid
 * and applies cursor-driven displacement. No DOM mask layer, no per-cell JS
 * state — engine-uniform paint cost across Chrome/Firefox/Safari.
 *
 * Cursor displacement is a function of the current (eased) mouse position
 * gated by a JS-side velocity factor: the warp ramps up while the cursor
 * moves and decays once it goes idle, reproducing the "cursor must move to
 * push signs" feel of the prior spring-physics implementation.
 *
 * Falls back to a CSS-masked static grid when WebGL is unavailable,
 * `prefers-reduced-motion` is set, or the device is coarse-pointer /
 * small-screen.
 */

const cfg = features.interactiveBackground;
const BASE_GRID_SPACING = cfg.grid.spacing;
const PLUS_SIZE = cfg.grid.plusSignSize;
const STROKE_WIDTH = cfg.grid.strokeWidth;
const MOUSE_RADIUS = cfg.physics.mouseRadius;
// Visual calibration vs V2's steady-state displacement at the cursor center.
// Tune this knob first if the warp feels too strong / too weak.
const PUSH_STRENGTH = 32;
const STATIC_OPACITY = 0.22;
const HOVER_OPACITY_BOOST = 0.4;
// Higher = snappier follow; lower = more lag. V2 friction = 0.9 → comparable feel ≈ 0.12.
const MOUSE_EASE = 0.12;
// Velocity gate: while the cursor moves, push ramps to 1; once it sits still
// longer than IDLE_TIMEOUT_MS, push decays toward 0 each frame. This emulates
// V2's behaviour where displacement is velocity-driven — signs only get pushed
// while the cursor is moving — without per-cell state. Half-life at 60fps:
// log(0.5) / log(0.85) ≈ 4.3 frames ≈ 72ms.
const MOVE_DECAY = 0.85;
const IDLE_TIMEOUT_MS = 150;
const DPR_CAP_DESKTOP = 2;
const DPR_CAP_MOBILE = 1.5;
const MOBILE_BREAKPOINT = 768;
const FAR = -100000;
// Off-screen sentinel test, derived from FAR so retuning FAR can't silently
// break the `< OFFSCREEN` comparisons. FAR/2 is still far more negative than
// any real on-screen coordinate.
const OFFSCREEN = FAR / 2;

const computeGridSpacing = (vw: number) =>
  Math.max(BASE_GRID_SPACING, Math.min(40, Math.round(vw / 96)));

const VERT_SRC = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG_SRC = `precision highp float;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uMouse;
uniform float uSpacing;
uniform float uPlusSize;
uniform float uStrokeWidth;
uniform float uMouseRadius;
uniform float uPushStrength;
uniform vec3 uAccent;
uniform float uStaticOpacity;
uniform float uHoverBoost;

float plusMask(vec2 local, float hp, float hs) {
  float h = step(abs(local.x), hs) * step(abs(local.y), hp);
  float v = step(abs(local.y), hs) * step(abs(local.x), hp);
  return max(h, v);
}

void main() {
  // gl_FragCoord is physical pixels, bottom-left origin. Convert to CSS px,
  // top-left origin to match the mouse coordinate space.
  vec2 p = gl_FragCoord.xy / uDpr;
  p.y = (uResolution.y / uDpr) - p.y;

  float hp = uPlusSize * 0.5;
  float hs = uStrokeWidth * 0.5;
  float mouseDist = length(p - uMouse);
  float searchR = uMouseRadius + uPushStrength;

  vec2 cellId = floor(p / uSpacing);
  float alpha = 0.0;

  if (mouseDist > searchR) {
    // Far from the cursor: single at-origin plus from the current cell.
    vec2 center = (cellId + 0.5) * uSpacing;
    alpha = plusMask(p - center, hp, hs) * uStaticOpacity;
  } else {
    // Inside the warp halo: a sign from a neighbor cell may have been pushed
    // into this fragment. Test a 5x5 neighborhood.
    for (int dy = -2; dy <= 2; dy++) {
      for (int dx = -2; dx <= 2; dx++) {
        vec2 cid = cellId + vec2(float(dx), float(dy));
        vec2 orig = (cid + 0.5) * uSpacing;
        vec2 toCell = orig - uMouse;
        float d = length(toCell);
        vec2 displaced = orig;
        if (d < uMouseRadius && d > 0.0001) {
          float strength = (uMouseRadius - d) / uMouseRadius;
          displaced += (toCell / d) * strength * uPushStrength;
        }
        float m = plusMask(p - displaced, hp, hs);
        if (m > 0.0) {
          float dmouse = length(displaced - uMouse);
          float boost = max(0.0, 1.0 - dmouse / uMouseRadius) * uHoverBoost;
          alpha = max(alpha, uStaticOpacity + boost);
        }
      }
    }
  }

  gl_FragColor = vec4(uAccent, alpha);
}`;

type Mode = 'gl' | 'fallback';

const detectInitialMode = (): Mode => {
  if (typeof window === 'undefined') return 'fallback';
  if (window.matchMedia('(pointer: coarse)').matches) return 'fallback';
  if (window.innerWidth < MOBILE_BREAKPOINT) return 'fallback';
  return 'gl';
};

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getUniformLocation) { // keeping context
  }
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[InteractiveBackground] shader compile:', gl.getShaderInfoLog(sh));
    }
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function InteractiveBackground() {
  return null;
}
