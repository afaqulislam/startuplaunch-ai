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

import NewProjectPage from "@/app/dashboard/new/page"

function okResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response
}

describe("NewProjectPage", () => {
  beforeEach(() => {
    routerMocks.push.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fills from a preset, dispatches create + analyze, and opens the report", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse({ id: 7, title: "DevAI Code Reviewer", status: "pending" }))
      .mockResolvedValueOnce(okResponse({ message: "Analysis started" }))
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<NewProjectPage />)
    await user.click(screen.getByRole("button", { name: /devai code reviewer/i }))
    await user.click(screen.getByRole("button", { name: /dispatch swarm analysis/i }))

    await waitFor(() => expect(routerMocks.push).toHaveBeenCalledWith("/dashboard/project/7"))
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const [createUrl, createInit] = fetchMock.mock.calls[0]
    expect(createUrl).toBe("http://localhost:8000/api/projects/")
    expect(createInit.method).toBe("POST")
    expect(createInit.credentials).toBe("include")

    const [analyzeUrl, analyzeInit] = fetchMock.mock.calls[1]
    expect(analyzeUrl).toBe("http://localhost:8000/api/projects/7/analyze")
    expect(analyzeInit.method).toBe("POST")
  })

  it("surfaces a validation error when project creation is rejected", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ detail: [{ msg: "Field required" }] }),
    } as Response)
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<NewProjectPage />)
    await user.click(screen.getByRole("button", { name: /devai code reviewer/i }))
    await user.click(screen.getByRole("button", { name: /dispatch swarm analysis/i }))

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Field required"))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(routerMocks.push).not.toHaveBeenCalled()
  })
})