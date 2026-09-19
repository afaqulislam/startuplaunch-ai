import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  apiFetch,
  ApiError,
  clearToken,
  formatDate,
  getToken,
  parseDate,
  setToken,
} from "@/lib/api"

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(async () => {
  fetchMock = vi.fn()
  vi.stubGlobal("fetch", fetchMock)
  fetchMock.mockResolvedValue(jsonResponse({ ok: true }))
  await clearToken()
  fetchMock.mockClear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("parseDate", () => {
  it("normalizes SQLite naive datetimes (space separator) to UTC ISO", () => {
    expect(parseDate("2026-08-07 12:34:56").toISOString()).toBe("2026-08-07T12:34:56.000Z")
  })

  it("preserves the instant for timezone-aware ISO input", () => {
    expect(parseDate("2026-08-07T14:00:00+02:00").toISOString()).toBe("2026-08-07T12:00:00.000Z")
  })

  it("appends UTC to naive ISO strings missing a zone", () => {
    expect(parseDate("2026-08-07T12:34:56").toISOString()).toBe("2026-08-07T12:34:56.000Z")
  })

  it("falls back to the epoch for invalid input", () => {
    expect(parseDate("not a date").toISOString()).toBe("1970-01-01T00:00:00.000Z")
  })
})

describe("formatDate", () => {
  it("renders a localized medium date string", () => {
    const input = "2026-08-07 00:00:00"
    expect(formatDate(input)).toContain("2026")
    expect(formatDate(input)).toBe(
      new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parseDate(input))
    )
  })
})

describe("token helpers", () => {
  it("keeps the token in memory only and drops it on clearToken", async () => {
    expect(getToken()).toBeNull()
    setToken("abc")
    expect(getToken()).toBe("abc")
    await clearToken()
    expect(getToken()).toBeNull()
  })

  it("clearToken best-effort calls the backend logout endpoint", async () => {
    setToken("abc")
    await clearToken()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("http://localhost:8000/api/auth/logout")
    expect(init.method).toBe("POST")
    expect(init.credentials).toBe("include")
  })

  it("does not throw when the backend is unreachable during logout", async () => {
    fetchMock.mockRejectedValue(new Error("network down"))
    await expect(clearToken()).resolves.toBeUndefined()
    expect(getToken()).toBeNull()
  })
})

describe("apiFetch", () => {
  it("sends the Authorization header and credentials when a token is set", async () => {
    setToken("tok")
    fetchMock.mockResolvedValue(jsonResponse([{ id: 1 }]))
    const data = await apiFetch<{ id: number }[]>("/api/projects/")
    expect(data).toEqual([{ id: 1 }])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("http://localhost:8000/api/projects/")
    expect((init.headers as Headers).get("Authorization")).toBe("Bearer tok")
    expect(init.credentials).toBe("include")
  })

  it("works without a token and still sends credentials for the session cookie", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]))
    await apiFetch("/api/projects/")
    const [, init] = fetchMock.mock.calls[0]
    expect((init.headers as Headers).get("Authorization")).toBeNull()
    expect(init.credentials).toBe("include")
  })

  it("clears the in-memory session on a 401", async () => {
    setToken("stale")
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: "Could not validate credentials" }, false, 401)
    )
    await expect(apiFetch("/api/projects/")).rejects.toBeInstanceOf(ApiError)
    expect(getToken()).toBeNull()
  })

  it("throws ApiError with the string detail", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Email already registered" }, false, 400))
    await expect(
      apiFetch("/api/auth/register", { method: "POST" })
    ).rejects.toThrow("Email already registered")
  })

  it("joins FastAPI validation-error detail arrays", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: [{ msg: "Field required" }, { msg: "Too long" }] }, false, 422)
    )
    const err = (await apiFetch("/api/projects/").catch((e: Error) => e)) as ApiError
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toBe("Field required, Too long")
    expect(err.status).toBe(422)
  })

  it("uses a fallback message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("bad json")
      },
    } as unknown as Response)
    await expect(apiFetch("/api/projects/")).rejects.toThrow("Request failed (500)")
  })
})