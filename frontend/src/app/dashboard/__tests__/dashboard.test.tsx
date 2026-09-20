import { render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const routerMocks = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerMocks.push,
    back: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) => (
    <a href={typeof href === "string" ? href : "/"} {...rest}>
      {children}
    </a>
  ),
}))

import Dashboard from "@/app/dashboard/page"

function okResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response
}

function fetchMockFor(role: string) {
  return vi.fn((input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes("/api/auth/me")) {
      return Promise.resolve(
        okResponse({ id: 1, email: "admin@example.com", role, is_active: true, created_at: "2026-01-01" })
      )
    }
    if (url.includes("/api/admin/summary")) {
      return Promise.resolve(
        okResponse({
          users: 12,
          projects: 34,
          projects_by_status: { completed: 20, analyzing: 2, failed: 3, pending: 9 },
        })
      )
    }
    return Promise.resolve(okResponse([]))
  })
}

describe("Dashboard admin panel", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("shows the admin summary panel for the admin role", async () => {
    vi.stubGlobal("fetch", fetchMockFor("admin"))
    render(<Dashboard />)

    await waitFor(() => expect(screen.getByText("Admin Platform Summary")).toBeTruthy())
    const panel = within(screen.getByText("Admin Platform Summary").closest(".glass-panel") as HTMLElement)
    expect(panel.getByText(/total users/i)).toHaveTextContent("12")
    expect(panel.getByText(/total projects/i)).toHaveTextContent("34")
    expect(panel.getByText(/completed/i)).toHaveTextContent("20")
  })

  it("hides the admin panel for a regular user", async () => {
    vi.stubGlobal("fetch", fetchMockFor("user"))
    render(<Dashboard />)

    await waitFor(() => expect(screen.getByText("Idea Validation Workspace")).toBeTruthy())
    expect(screen.queryByText("Admin Platform Summary")).toBeNull()
  })
})