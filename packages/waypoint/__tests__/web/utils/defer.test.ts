import { describe, expect, test } from "vitest"

import { Deferred } from "./../../../web/utils/defer"

describe("Deferred Class", () => {
  test('should have an initial state of "unresolved"', () => {
    const deferred = new Deferred<number>()
    expect(deferred.state).toBe("unresolved")
  })

  test('should change state to "resolved" after calling resolve', async () => {
    const expectedResult = 42
    const deferred = new Deferred<number>()

    deferred.promise.then(number => number)

    deferred.resolve(expectedResult)

    await expect(deferred.promise).resolves.toBe(expectedResult)
    expect(deferred.state).toBe("resolved")
  })

  test('should change state to "rejected" after calling reject', async () => {
    const deferred = new Deferred<number>()

    deferred.promise.catch(error => error)

    deferred.reject(new Error("Something went wrong"))

    await expect(deferred.promise).rejects.toThrow("Something went wrong")
    expect(deferred.state).toBe("rejected")
  })

  test("should not allow state to be changed after being resolved or rejected", async () => {
    const deferred = new Deferred<number>()

    deferred.promise.then(number => number)
    deferred.resolve(10)
    await deferred.promise
    expect(deferred.state).toBe("resolved")

    deferred.resolve(20)
    await deferred.promise
    deferred.reject(new Error("New error"))

    expect(deferred.state).toBe("resolved")
  })
})
