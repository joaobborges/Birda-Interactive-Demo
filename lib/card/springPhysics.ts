/**
 * springPhysics.ts — Pure spring integration helper (no Three.js dependencies).
 *
 * Implements Hooke's law with damping to produce natural snap-back motion with
 * overshoot for the 3D card interaction system (Phase 2 Plan 03).
 *
 * Exported symbols:
 *   SpringState — configuration + current position/velocity
 *   stepSpring  — advance simulation one time-step
 *   isSettled   — check if spring has come to rest
 */

export interface SpringState {
  position: number
  velocity: number
  target: number
  stiffness: number
  damping: number
  mass: number
}

/**
 * Advance the spring simulation by dt seconds.
 * Uses semi-implicit (symplectic) Euler integration — stable at the dt values
 * we use (≤50ms clamped). Returns a new SpringState object; input is not mutated.
 */
export function stepSpring(state: SpringState, dt: number): SpringState {
  const displacement = state.position - state.target
  const springForce = -state.stiffness * displacement
  const dampingForce = -state.damping * state.velocity
  const acceleration = (springForce + dampingForce) / state.mass
  const newVelocity = state.velocity + acceleration * dt
  const newPosition = state.position + newVelocity * dt
  return { ...state, velocity: newVelocity, position: newPosition }
}

/**
 * Returns true when the spring has essentially stopped moving.
 * Both position error and velocity must be below threshold.
 */
export function isSettled(state: SpringState, threshold = 0.001): boolean {
  return (
    Math.abs(state.position - state.target) < threshold &&
    Math.abs(state.velocity) < threshold
  )
}
