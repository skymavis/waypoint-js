const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message

  return String(error)
}

export const debugError = (place: string, error: unknown) => {
  console.error(place, getErrorMessage(error))
}
