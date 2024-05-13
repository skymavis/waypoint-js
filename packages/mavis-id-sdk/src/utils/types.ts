export type Requires<T, K extends keyof T> = {
  [key in keyof T as key extends K ? never : key]: T[key]
} & {
  [key in keyof T as key extends K ? key : never]-?: T[key]
}
