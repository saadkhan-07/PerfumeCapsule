import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees and reset persisted storage between tests.
afterEach(() => {
  cleanup()
  localStorage.clear()
})
