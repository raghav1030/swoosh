"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface WindIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface WindIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  animateOnRender?: boolean; // New flag added here
}

const PATH_VARIANTS: Variants = {
  normal: (custom: number) => ({
    pathLength: 1,
    opacity: 1,
    pathOffset: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      delay: custom,
    },
  }),
  animate: (custom: number) => ({
    pathLength: [0, 1],
    opacity: [0, 1],
    pathOffset: [1, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      delay: custom,
    },
  }),
};

const WindIcon = forwardRef<WindIconHandle, WindIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, animateOnRender = false, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    // Trigger animation on mount if flag is true
    useEffect(() => {
      if (animateOnRender) {
        controls.start("animate");
      }
    }, [animateOnRender, controls]);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={controls}
            custom={0.2}
            d="M12.8 19.6A2 2 0 1 0 14 16H2"
            // If animateOnRender is true, start hidden so we don't flash the full icon before animating
            initial={animateOnRender ? { opacity: 0, pathLength: 0, pathOffset: 1 } : "normal"}
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={0}
            d="M17.5 8a2.5 2.5 0 1 1 2 4H2"
            initial={animateOnRender ? { opacity: 0, pathLength: 0, pathOffset: 1 } : "normal"}
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={0.4}
            d="M9.8 4.4A2 2 0 1 1 11 8H2"
            initial={animateOnRender ? { opacity: 0, pathLength: 0, pathOffset: 1 } : "normal"}
            variants={PATH_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

WindIcon.displayName = "WindIcon";

export { WindIcon };