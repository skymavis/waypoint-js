import type { Mock } from "vitest"
import { afterEach, describe, expect, test, vi } from "vitest"

import { openPopup } from "../../common/popup"
import { Deposit } from "../../deposit"

vi.mock("../../common/popup", async () => {
  const actual = await vi.importActual<typeof import("../../common/popup")>("../../common/popup")
  return {
    ...actual,
    openPopup: vi.fn(async () => window as unknown as Window),
  }
})

vi.mock("../../common/communicate", () => {
  return {
    CommunicateHelper: vi.fn().mockImplementation(() => {
      return {
        sendRequest: async (action: (state: string) => Promise<Window>) => {
          await action("state-123")
          return {
            provider: "Onramp",
            transaction_hash: "0xabc",
            fiat_currency: "USD",
            crypto_currency: "RON",
            fiat_amount: 50,
            crypto_amount: 5,
          }
        },
      }
    }),
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("Deposit.start", () => {
  test("opens popup with correct URL and query, maps response fields", async () => {
    const deposit = new Deposit({
      clientId: "client-123",
      waypointOrigin: "https://waypoint.example",
      redirectUri: "https://app.example/callback",
      environment: "development",
      theme: "dark",
    })

    const result = await deposit.start({
      email: "user@example.com",
      walletAddress: "0x0000000000000000000000000000000000000001",
      fiatCurrency: "USD",
      fiatAmount: 50,
      cryptoCurrency: "RON",
    })

    expect(openPopup).toHaveBeenCalledTimes(1)
    const [url, query, popupCfg] = (openPopup as unknown as Mock).mock.calls[0]

    expect(url).toBe("https://waypoint.example/client/client-123/deposit")
    expect(popupCfg).toStrictEqual({ width: 500, height: 728 })
    expect(query).toMatchObject({
      state: "state-123",
      email: "user@example.com",
      environment: "development",
      theme: "dark",
      origin: "https://app.example/callback",
      redirect_uri: "https://app.example/callback",
      wallet_address: "0x0000000000000000000000000000000000000001",
      fiat_currency: "USD",
      crypto_currency: "RON",
      fiat_amount: 50,
    })

    expect(result).toStrictEqual({
      provider: "Onramp",
      transactionHash: "0xabc",
      fiatCurrency: "USD",
      cryptoCurrency: "RON",
      fiatAmount: 50,
      cryptoAmount: 5,
    })
  })
})

describe("Deposit.dryRun", () => {
  test("returns correct URL with query params and generated state", () => {
    const deposit = new Deposit({
      clientId: "client-123",
      waypointOrigin: "https://waypoint.example",
      redirectUri: "https://app.example/callback",
      environment: "development",
      theme: "dark",
    })

    const result = deposit.dryRun({
      email: "user@example.com",
      walletAddress: "0x0000000000000000000000000000000000000001",
      fiatCurrency: "USD",
      fiatAmount: 50,
      cryptoCurrency: "RON",
    })

    const url = new URL(result)
    expect(url.origin).toBe("https://waypoint.example")
    expect(url.pathname).toBe("/client/client-123/deposit")
    expect(url.hash).toBe("")

    const params = url.searchParams
    const state = params.get("state")
    expect(typeof state).toBe("string")
    expect((state ?? "").length).toBeGreaterThan(0)
    // UUID v4 shape (best-effort validation)
    expect(state).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

    expect(params.get("email")).toBe("user@example.com")
    expect(params.get("environment")).toBe("development")
    expect(params.get("theme")).toBe("dark")
    expect(params.get("origin")).toBe("https://app.example/callback")
    expect(params.get("redirect_uri")).toBe("https://app.example/callback")
    expect(params.get("wallet_address")).toBe("0x0000000000000000000000000000000000000001")
    expect(params.get("fiat_currency")).toBe("USD")
    expect(params.get("crypto_currency")).toBe("RON")
    expect(params.get("fiat_amount")).toBe("50")
  })
})
