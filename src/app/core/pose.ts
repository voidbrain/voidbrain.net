// Poses of the self-model, one per state (docs/DESIGN.md, "The idea"). Plain numbers, so the three.js
// component only applies them and a spec can check the transitions.
import type { StateId } from './states';

export interface Pose {
  /** Head rotation in radians: pitch (down is positive), yaw (left/right), roll (tilt). */
  readonly pitch: number;
  readonly yaw: number;
  readonly roll: number;
  /** Prop visibility, 0 (hidden) to 1 (shown). */
  readonly glasses: number;
  readonly goggles: number;
  readonly mask: number;
  readonly eyes: number;
  /** How much the head follows the pointer, 0 to 1. */
  readonly follow: number;
}

export const POSES: Record<StateId, Pose> = {
  work: { pitch: 0.22, yaw: -0.25, roll: 0, glasses: 1, goggles: 0, mask: 0, eyes: 1, follow: 0.6 },
  play: { pitch: -0.12, yaw: 0.2, roll: 0.05, glasses: 0, goggles: 1, mask: 0, eyes: 0, follow: 1 },
  sleep: { pitch: 0.12, yaw: 0.1, roll: 0.38, glasses: 0, goggles: 0, mask: 1, eyes: 0, follow: 0 },
};

const KEYS = ['pitch', 'yaw', 'roll', 'glasses', 'goggles', 'mask', 'eyes', 'follow'] as const;

/** Moves `from` towards `to` by `amount` (0 keeps `from`, 1 reaches `to`). */
export function blendPose(from: Pose, to: Pose, amount: number): Pose {
  const k = Math.min(1, Math.max(0, amount));
  return Object.fromEntries(
    KEYS.map((key) => [key, from[key] * (1 - k) + to[key] * k]),
  ) as unknown as Pose;
}

/** The share of the remaining distance to cover in `dt` seconds, so the blend is frame-rate independent. */
export function easeStep(dt: number, halfLife = 0.18): number {
  return 1 - Math.pow(0.5, Math.max(0, dt) / halfLife);
}

/** Head offset from the pointer position (each in -1..1), scaled by the pose's `follow`. */
export function lookAt(pose: Pose, px: number, py: number): { pitch: number; yaw: number } {
  const clamp = (v: number) => Math.min(1, Math.max(-1, v));
  return {
    pitch: pose.pitch + clamp(py) * 0.25 * pose.follow,
    yaw: pose.yaw + clamp(px) * 0.45 * pose.follow,
  };
}
