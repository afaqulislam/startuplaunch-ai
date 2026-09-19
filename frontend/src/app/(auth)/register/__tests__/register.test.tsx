import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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

import RegisterPage from "@/app/(auth)/register/page"

function okResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response
}

describe("RegisterPage", () => {
  beforeEach(() => {
    routerMocks.push.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shows an inline error and never submits when passwords differ", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByLabelText("Email Address"), "founder@acme.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.type(screen.getByLabelText("Confirm Password"), "different")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match")
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("registers and redirects to the login page", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse({ id: 1, email: "founder@acme.com", role: "user", is_active: true })
    )
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByLabelText("Email Address"), "founder@acme.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.type(screen.getByLabelText("Confirm Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() => expect(routerMocks.push).toHaveBeenCalledWith("/login"))
    const [, init] = fetchMock.mock.calls[0]
    expect(JSON.parse((init.body as string))).toEqual({
      email: "founder@acme.com",
      password: "secret123",
    })
  })

  it("surfaces a server duplicate-account error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Email already registered" }),
    } as Response)
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByLabelText("Email Address"), "founder@acme.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.type(screen.getByLabelText("Confirm Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Email already registered")
    )
    expect(routerMocks.push).not.toHaveBeenCalled()
  })
})