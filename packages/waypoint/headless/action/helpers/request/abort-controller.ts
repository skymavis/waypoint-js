type RequestList = Record<string, AbortController | undefined>

const requestList: RequestList = {}

const handler: ProxyHandler<RequestList> = {
  get(target, property: string) {
    return Reflect.get(target, property)
  },
  set(target, property: string, value) {
    const isExist = property in target
    const isDeletion = value === undefined

    if (isExist && isDeletion) {
      return Reflect.deleteProperty(target, property)
    }

    if (isExist) {
      target[property]?.abort?.()
    }

    if (value instanceof AbortController) {
      return Reflect.set(target, property, value)
    }

    return true
  },
}

export const requestController = new Proxy(requestList, handler)
