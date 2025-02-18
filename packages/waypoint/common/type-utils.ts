/* eslint-disable @typescript-eslint/no-explicit-any */

export type Includes<T extends readonly any[] | undefined, U> = T extends readonly any[]
  ? {
      [P in T[number]]: true
    }[U] extends true
    ? true
    : false
  : false
