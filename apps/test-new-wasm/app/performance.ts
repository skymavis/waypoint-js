// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calcExecutionTime = async (name: string, task: () => Promise<any>) => {
  const start = performance.now()
  const result = await task()
  const end = performance.now()

  console.debug(`[${name}] Execution result:`, result)
  console.debug(`[${name}] Execution time: ${end - start} ms`)
}
