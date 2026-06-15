import { useEffect, useRef } from 'react'

export interface KeyboardState {
  ArrowUp: boolean
  ArrowDown: boolean
  ArrowLeft: boolean
  ArrowRight: boolean
  KeyW: boolean
  KeyS: boolean
  KeyA: boolean
  KeyD: boolean
}

const TRACKED_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyS', 'KeyA', 'KeyD',
])

/**
 * Returns a ref to the current keyboard state.
 * Reading the ref in useFrame gives zero-lag access.
 */
export function useKeyboard() {
  const keys = useRef<KeyboardState>({
    ArrowUp: false, ArrowDown: false,
    ArrowLeft: false, ArrowRight: false,
    KeyW: false, KeyS: false,
    KeyA: false, KeyD: false,
  })

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (TRACKED_KEYS.has(e.code)) {
        e.preventDefault()
        ;(keys.current as unknown as Record<string, boolean>)[e.code] = true
      }
    }
    const onUp = (e: KeyboardEvent) => {
      if (TRACKED_KEYS.has(e.code)) {
        ;(keys.current as unknown as Record<string, boolean>)[e.code] = false
      }
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  return keys
}
