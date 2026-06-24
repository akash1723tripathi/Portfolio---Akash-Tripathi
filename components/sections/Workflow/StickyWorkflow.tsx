'use client';

/* ============================================================
   WORKFLOW · STICKY STACKING CARDS renderer
   A dark panel with rounded-top corners slides over the previous
   section (overlap reveal). Inside, accordion-style cards stack
   via position:sticky with progressive top offsets — each new
   card slides up over the previous one as the user scrolls.
   GSAP ScrollTrigger drives the initial per-element reveals.
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { content } from '@/data';
import type { WorkflowStop } from '@/data';
import { renderCopy } from './renderCopy';
import styles from './StickyWorkflow.module.css';

/* ============================================================
   PORTAL ANIMATION UTILITIES — matching Archive section
   ============================================================ */
type Direction = 'up' | 'down' | 'left' | 'right';
const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];
const PORTAL_DISTANCE = 110;

const getRandomDirection = (): Direction =>
  DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

const getDirectionTransform = (direction: Direction, distance: number = PORTAL_DISTANCE) => {
  switch (direction) {
    case 'up':    return { x: 0, y: -distance };
    case 'down':  return { x: 0, y: distance };
    case 'left':  return { x: -distance, y: 0 };
    case 'right': return { x: distance, y: 0 };
    default:      return { x: 0, y: 0 };
  }
};

const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case 'up':    return 'down';
    case 'down':  return 'up';
    case 'left':  return 'right';
    case 'right': return 'left';
    default:      return 'up';
  }
};

const triggerPortalLoop = (letterElement: HTMLElement) => {
  if (gsap.isTweening(letterElement)) return;
  const direction = getRandomDirection();
  const exitTransform = getDirectionTransform(direction);
  const entryTransform = getDirectionTransform(getOppositeDirection(direction));

  gsap.timeline()
    .to(letterElement, {
      x: exitTransform.x + '%',
      y: exitTransform.y + '%',
      duration: 0.25,
      ease: 'power2.in',
    })
    .set(letterElement, {
      x: entryTransform.x + '%',
      y: entryTransform.y + '%',
    })
    .to(letterElement, {
      x: '0%',
      y: '0%',
      duration: 0.35,
      ease: 'power2.out',
    });
};

/* ── Portal animated word ── */
function PortalWord({ word, triggerReveal }: { word: string; triggerReveal: boolean }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion || !triggerReveal || !containerRef.current) return;
    const letters = containerRef.current.querySelectorAll<HTMLElement>(`.${styles.portalLetter}`);

    // Set initial random exit state
    letters.forEach((letter) => {
      const dir = getRandomDirection();
      const start = getDirectionTransform(dir);
      gsap.set(letter, { x: start.x + '%', y: start.y + '%' });
    });

    // Stagger reveal them back to center
    letters.forEach((letter) => {
      const delay = Math.random() * 0.25;
      gsap.to(letter, {
        x: '0%',
        y: '0%',
        duration: 0.4,
        delay,
        ease: 'power2.out',
      });
    });
  }, [triggerReveal, reducedMotion]);

  const handleLetterHover = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (reducedMotion) return;
    const letter = e.currentTarget.querySelector(`.${styles.portalLetter}`) as HTMLElement | null;
    if (letter) triggerPortalLoop(letter);
  };

  return (
    <span ref={containerRef} className={styles.portalWord} aria-label={word}>
      {word.split('').map((char, i) => (
        <span
          key={i}
          className={styles.portalMask}
          onMouseEnter={handleLetterHover}
          aria-hidden="true"
        >
          <span className={styles.portalLetter}>{char}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * Resolve a step's accent to a CSS color. Every step uses its fixed brand
 * palette colour (`--wf-<accent>`) EXCEPT the final step, which always tracks
 * the live site accent (`--color-accent-purple`) so the workflow lands on
 * whatever colour the page is currently cycling.
 */
function workflowAccent(accent: string, index: number, count: number): string {
  return index === count - 1 ? 'var(--color-accent-purple)' : `var(--wf-${accent})`;
}

export function StickyWorkflow() {
  const { label, stops } = content.workflow;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  /* ---- panel reveal slide-up / expansion ---- */
  useGSAP(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;

    gsap.fromTo(
      inner,
      {
        '--reveal-progress': 0,
      },
      {
        '--reveal-progress': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom', // when top of Workflow section enters bottom of viewport
          end: 'top top', // when top of Workflow section reaches top of viewport
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  }, [reducedMotion]);

  /* ---- heading scroll reveal ---- */
  useGSAP(() => {
    if (!headingRef.current) return;

    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  return (
    <div
      ref={wrapperRef}
      id="workflow-wrapper"
      className={styles.wrapper}
      data-overlap={!reducedMotion ? 'true' : undefined}
    >
      <section id="workflow" ref={sectionRef} className={styles.section}>
        <div ref={innerRef} className={styles.inner}>
          <div className={styles.content}>
            {/* Section Heading */}
            <h2 ref={headingRef} className={styles.heading}>
              {label} /
            </h2>

            {/* Subtitle Row */}
            <div className={styles.subtitleRow}>
              <span className={styles.subtitleLabel}>(Process)</span>
              <p className={styles.subtitleText}>
                A clear, repeatable process that keeps projects moving and
                stakeholders aligned — from first conversation to final polish.
              </p>
            </div>

            {/* Sticky Stacking Cards */}
            <div className={styles.cardsWrap}>
              <div className={styles.cardsStack}>
                {stops.map((stop, index) => (
                  <WorkflowCard
                     key={stop.name}
                     stop={stop}
                     index={index}
                     total={stops.length}
                     accent={workflowAccent(stop.accent, index, stops.length)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Individual sticky card ── */
function WorkflowCard({
  stop,
  index,
  total,
  accent,
}: {
  stop: WorkflowStop;
  index: number;
  total: number;
  accent: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  /* ---- card scroll reveal ---- */
  useGSAP(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'transform',
        onStart: () => setRevealed(true),
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  const padNum = String(index + 1).padStart(2, '0');

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        '--card-index': index,
        '--card-total': total,
        '--card-accent': accent,
        opacity: 0,
      } as React.CSSProperties}
    >
      {/* Header row: number + step name */}
      <div className={styles.cardHeader}>
        <span className={styles.cardNum}>({padNum})</span>
        <h3 className={styles.cardTitle}>
          <PortalWord word={stop.name.toUpperCase()} triggerReveal={revealed} />
        </h3>
      </div>

      {/* Expanded content */}
      <div className={styles.cardBody}>
        <div className={styles.cardContent}>
          <h4 className={styles.cardSubHeading}>{stop.title}</h4>
          <p className={styles.cardCopy}>
            {renderCopy(stop, styles.em)}
          </p>
        </div>
      </div>
    </div>
  );
}
