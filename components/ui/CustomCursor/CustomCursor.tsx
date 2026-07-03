'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { cursorBus } from '@/lib/cursorBus';
import styles from './CustomCursor.module.css';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Store mouse position
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const hasMovedMouse = useRef(false);

  const isSpotlightActive = useRef(false);

  // PERF: Track ticker state to avoid unnecessary 60fps updates
  const tickerActiveRef = useRef(false);
  const animateFnRef = useRef<(() => void) | null>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth lerp factor for main cursor
  const lerpFactor = 0.15;

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) return;

    // Skip cursor entirely on touch devices — CSS hides it, but JS would still
    // mount listeners and run the ticker otherwise.
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorBus.x = e.clientX;
      cursorBus.y = e.clientY;

      // Show cursor on first mouse move
      if (!hasMovedMouse.current) {
        hasMovedMouse.current = true;
        cursorPos.current = { x: e.clientX, y: e.clientY };
        setIsVisible(true);
      }

      // PERF: Ensure ticker is running when mouse moves
      startTicker();
    };

    // PERF: xPercent/yPercent never change at runtime — set once so the
    // per-frame animate() only updates x/y via quickSetter. quickSetter is
    // GSAP's optimized hot-path writer (~3–5× faster than gsap.set on warm
    // cache) while preserving the _gsap matrix tracking that hover-
    // scale and spotlight tweens rely on.
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    type QuickSetter = (value: number) => void;
    const setCursorX = gsap.quickSetter(cursor, 'x', 'px') as QuickSetter;
    const setCursorY = gsap.quickSetter(cursor, 'y', 'px') as QuickSetter;

    // Track mouse movement
    window.addEventListener('mousemove', handleMouseMove);

    // PERF: Start ticker only when needed
    const startTicker = () => {
      if (!tickerActiveRef.current && animateFnRef.current) {
        gsap.ticker.add(animateFnRef.current);
        tickerActiveRef.current = true;
      }
    };

    // PERF: Stop ticker when cursor is idle
    const stopTicker = () => {
      if (tickerActiveRef.current && animateFnRef.current) {
        gsap.ticker.remove(animateFnRef.current);
        tickerActiveRef.current = false;
      }
    };

    // PERF: Schedule idle check - stop ticker after 150ms of no movement
    const scheduleIdleCheck = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {
        // Check if cursor has settled (lerp nearly complete).
        // 1px threshold avoids ticker restarts on sub-pixel jitter.
        const dx = Math.abs(mousePos.current.x - cursorPos.current.x);
        const dy = Math.abs(mousePos.current.y - cursorPos.current.y);
        if (dx < 1 && dy < 1) {
          stopTicker();
        }
      }, 150);
    };

    // Animate with GSAP ticker for smooth 60fps updates.
    // PERF: hot path — uses quickSetter (Track A), gates DOM writes on a
    // 0.1px sub-pixel threshold (Track C).
    const SUBPIXEL = 0.1;
    const animate = () => {
      if (!hasMovedMouse.current) return;

      // Lerp main cursor
      const newCx = cursorPos.current.x + (mousePos.current.x - cursorPos.current.x) * lerpFactor;
      const newCy = cursorPos.current.y + (mousePos.current.y - cursorPos.current.y) * lerpFactor;
      if (Math.abs(newCx - cursorPos.current.x) > SUBPIXEL || Math.abs(newCy - cursorPos.current.y) > SUBPIXEL) {
        cursorPos.current.x = newCx;
        cursorPos.current.y = newCy;
        setCursorX(newCx);
        setCursorY(newCy);

        // --cursor-x / --cursor-y are only consumed by the spotlight reveal mask.
        // Skip the per-frame style recalculation when spotlight is inactive.
        if (isSpotlightActive.current) {
          document.documentElement.style.setProperty('--cursor-x', `${newCx}px`);
          document.documentElement.style.setProperty('--cursor-y', `${newCy}px`);
        }
      }

      // Idle-timer gate stays at 1px (coarser than the sub-pixel write skip)
      // so the ticker stops once the head converges.
      const dx = Math.abs(mousePos.current.x - cursorPos.current.x);
      const dy = Math.abs(mousePos.current.y - cursorPos.current.y);
      if (dx < 1 && dy < 1) {
        scheduleIdleCheck();
      }
    };

    // Store reference for cleanup and control
    animateFnRef.current = animate;

    // Handle cursor visibility when leaving/entering window
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorPos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Handle hover states on interactive elements
    const handleLinkHover = () => {
      gsap.to(cursor, {
        scale: 2,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleLinkLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    // Handle tagline spotlight - cursor becomes the spotlight
    const handleSpotlightEnter = (e: Event) => {
      const customEvent = e as CustomEvent<{ size: number }>;
      const spotlightSize = customEvent.detail?.size || 100;

      isSpotlightActive.current = true;

      // Set CSS variable for spotlight state
      document.documentElement.style.setProperty('--spotlight-active', '1');
      document.documentElement.style.setProperty('--spotlight-size', `${spotlightSize / 2}px`);
      // Seed cursor position vars so the spotlight is correctly placed on the
      // first paint. Use mousePos (most recent raw input) rather than
      // cursorPos (last *settled* eased position) — when the ticker is idle
      // because the cursor sat still, cursorPos is the previous hover origin
      // and the spotlight pops in at the wrong place until the next mousemove.
      cursorPos.current.x = mousePos.current.x;
      cursorPos.current.y = mousePos.current.y;
      document.documentElement.style.setProperty('--cursor-x', `${mousePos.current.x}px`);
      document.documentElement.style.setProperty('--cursor-y', `${mousePos.current.y}px`);
      // Resume the ticker so per-frame writes start immediately.
      startTicker();

      // Hide the main cursor so the spotlight (reveal mask) takes over completely
      // This prevents color clashing (difference mode vs purple background)
      gsap.to(cursor, {
        scale: 1.5, // Slight scale up before disappearing for effect
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out',
      });
    };

    const handleSpotlightLeave = () => {
      isSpotlightActive.current = false;

      // Reset CSS variables for spotlight state. Clear --spotlight-size too:
      // the tagline reveal layers read `var(--spotlight-size, 0px)` and inherit
      // this <html> value whenever their own container hasn't set one yet (e.g.
      // a freshly remounted Hero after a back-navigation). Leaving it non-zero
      // here strands the hidden tagline visible until the next hover writes 0px
      // onto the container.
      document.documentElement.style.setProperty('--spotlight-active', '0');
      document.documentElement.style.setProperty('--spotlight-size', '0px');

      // Bring back the main cursor
      gsap.to(cursor, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    // Listen for spotlight events
    window.addEventListener('tagline-spotlight-enter', handleSpotlightEnter);
    window.addEventListener('tagline-spotlight-leave', handleSpotlightLeave);

    // Event delegation via bubbling pointerover / pointerout instead of
    // capture-phase mouseenter / mouseleave. The capture-phase pair fires for
    // every node entry/leave across the entire document tree on every cursor
    // movement; pointerover/out bubble, so a single handler at the document
    // root fires once per actual element crossing.
    const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select';

    const handleInteractiveEnter = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const entered = target.closest(INTERACTIVE_SELECTOR);
      if (!entered) return;
      // Suppress when moving within the same interactive element.
      const related = e.relatedTarget;
      if (related instanceof Element && related.closest(INTERACTIVE_SELECTOR) === entered) return;
      handleLinkHover();
    };

    const handleInteractiveLeave = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const left = target.closest(INTERACTIVE_SELECTOR);
      if (!left) return;
      // Suppress when moving to a child of the same interactive element, or
      // sliding onto another interactive element (handleLinkHover will fire
      // for the new one via pointerover and overwrite the scale tween).
      const related = e.relatedTarget;
      if (related instanceof Element) {
        const relatedInteractive = related.closest(INTERACTIVE_SELECTOR);
        if (relatedInteractive === left) return;
        if (relatedInteractive) return;
      }
      handleLinkLeave();
    };

    document.addEventListener('pointerover', handleInteractiveEnter);
    document.addEventListener('pointerout', handleInteractiveLeave);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('tagline-spotlight-enter', handleSpotlightEnter);
      window.removeEventListener('tagline-spotlight-leave', handleSpotlightLeave);

      // PERF: Clean up ticker properly
      if (animateFnRef.current) {
        gsap.ticker.remove(animateFnRef.current);
      }
      tickerActiveRef.current = false;

      // PERF: Clean up idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      // PERF: Remove delegated event listeners
      document.removeEventListener('pointerover', handleInteractiveEnter);
      document.removeEventListener('pointerout', handleInteractiveLeave);
    };
  }, []);

  return (
    <div
      className={styles.cursorWrapper}
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
      aria-hidden="true"
    >
      <div ref={cursorRef} className={styles.cursor} />
    </div>
  );
}
