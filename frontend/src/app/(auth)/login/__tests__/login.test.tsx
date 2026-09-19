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

import LoginPage from "@/app/(auth)/login/page"

function okResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response
}

describe("LoginPage", () => {
  beforeEach(() => {
    routerMocks.push.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("submits credentials and redirects to the dashboard on success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse({ access_token: "tok", token_type: "bearer" }))
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText("Email Address"), "founder@acme.com")
    await user.type(screen.getByLabelText("Password"), "supersecret123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => expect(routerMocks.push).toHaveBeenCalledWith("/dashboard"))
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("http://localhost:8000/api/auth/login")
    expect(init.method).toBe("POST")
    expect(init.credentials).toBe("include")
    expect(init.body.toString()).toContain("founder%40acme.com")
  })

  it("surfaces the server error and stays on the page when login fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Incorrect email or password" }),
    } as Response)
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText("Email Address"), "founder@acme.com")
    await user.type(screen.getByLabelText("Password"), "wrongpass")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Incorrect email or password")
    )
    expect(routerMocks.push).not.toHaveBeenCalled()
  })
})