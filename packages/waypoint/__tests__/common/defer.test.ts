import { describe, expect, test } from "vitest"

import { Deferred } from "../../common/defer"

describe("Deferred Class", () => {
  test('should have an initial state of "pending"', () => {
    const deferred = new Deferred<number>()
    expect(deferred.state).toBe("pending")
  })

  test('should change state to "fulfilled" after calling resolve', async () => {
    const expectedResult = 42
    const deferred = new Deferred<number>()

    deferred.promise.then(number => number)

    deferred.resolve(expectedResult)

    await expect(deferred.promise).resolves.toBe(expectedResult)
    expect(deferred.state).toBe("fulfilled")
  })

  test('should change state to "rejected" after calling reject', async () => {
    const deferred = new Deferred<number>()

    deferred.promise.catch(error => error)

    deferred.reject(new Error("Something went wrong"))

    await expect(deferred.promise).rejects.toThrow("Something went wrong")
    expect(deferred.state).toBe("rejected")
  })

  test("should not allow state to be changed after being fulfilled or rejected", async () => {
    const deferred = new Deferred<number>()

    deferred.promise.then(number => number)
    deferred.resolve(10)
    await deferred.promise
    expect(deferred.state).toBe("fulfilled")

    deferred.resolve(20)
    await deferred.promise
    deferred.reject(new Error("New error"))

    expect(deferred.state).toBe("fulfilled")
  })
})
