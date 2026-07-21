"use client";

import { useId } from "react";
import Particles, {
  ParticlesProvider,
  useParticlesProvider,
} from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

interface SparklesProps {
  className?: string;
  size?: number;
  minSize?: number | null;
  density?: number;
  speed?: number;
  minSpeed?: number | null;
  opacity?: number;
  opacitySpeed?: number;
  minOpacity?: number | null;
  color?: string;
  background?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>;
}

async function particlesInit(engine: Engine) {
  await loadSlim(engine);
}

/** Inner component — must be rendered inside <ParticlesProvider> */
function SparklesInner({
  className,
  size = 1,
  minSize = null,
  density = 800,
  speed = 1,
  minSpeed = null,
  opacity = 1,
  opacitySpeed = 3,
  minOpacity = null,
  color = "#FFFFFF",
  background = "transparent",
  options = {},
}: SparklesProps) {
  const { loaded } = useParticlesProvider();
  const id = useId();

  const defaultOptions = {
    background: { color: { value: background } },
    fullScreen: { enable: false, zIndex: 1 },
    fpsLimit: 120,
    particles: {
      color: { value: color },
      move: {
        enable: true,
        direction: "none" as const,
        speed: { min: minSpeed ?? speed / 10, max: speed },
        straight: false,
      },
      number: { value: density },
      opacity: {
        value: { min: minOpacity ?? opacity / 10, max: opacity },
        animation: { enable: true, sync: false, speed: opacitySpeed },
      },
      size: {
        value: { min: minSize ?? size / 2.5, max: size },
      },
    },
    detectRetina: true,
  };

  if (!loaded) return null;

  return (
    <Particles
      id={id}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={{ ...defaultOptions, ...options } as any}
      className={className}
    />
  );
}

/** Public export — wraps itself in the required ParticlesProvider */
export function Sparkles(props: SparklesProps) {
  return (
    <ParticlesProvider init={particlesInit}>
      <SparklesInner {...props} />
    </ParticlesProvider>
  );
}
