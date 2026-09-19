import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

// React 19 requires an explicit act() environment declaration in tests.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// next-themes and other components probe matchMedia during render.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// next/navigation is mocked per-test via vi.mock; keep a default here so tests
// that import pages but forget it don't crash on missing globals.
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => "blob:mock"
}

export { vi }