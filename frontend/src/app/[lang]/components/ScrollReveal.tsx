"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  /**
   * Animation type
   * @default "fade-up"
   */
  animation?:
    | "fade-up"
    | "fade-down"
    | "fade-left"
    | "fade-right"
    | "fade"
    | "zoom-in"
    | "zoom-out";
  /**
   * Animation duration in milliseconds
   * @default 600
   */
  duration?: number;
  /**
   * Delay before animation starts in milliseconds
   * @default 0
   */
  delay?: number;
  /**
   * Threshold for intersection observer (0-1)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Root margin for intersection observer
   * @default "0px 0px -50px 0px"
   */
  rootMargin?: string;
  /**
   * Whether to animate only once
   * @default true
   */
  once?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Reveals its children with animation when scrolling into view.
 * Uses the Intersection Observer API so it doesn't run on the main thread scroll handler.
 */
export default function ScrollReveal({
  children,
  animation = "fade-up",
  duration = 600,
  delay = 0,
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
  once = true,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add("scroll-reveal-visible");

            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            element.classList.remove("scroll-reveal-visible");
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, once]);

  const animationStyles = {
    "--scroll-reveal-duration": `${duration}ms`,
    "--scroll-reveal-delay": `${delay}ms`,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-reveal-${animation} ${className}`}
      style={animationStyles}
    >
      {children}
    </div>
  );
}
