const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message

  return error
}

export const debug = (place: string, error: unknown) => {
  console.debug(place, getErrorMessage(error))
}
