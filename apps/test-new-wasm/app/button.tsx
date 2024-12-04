import clsx from "clsx"
import { FC, HTMLProps, ReactNode } from "react"

type ButtonProps = HTMLProps<HTMLButtonElement> & {
  children: ReactNode
}

export const Button: FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full px-8 py-2",
        "inline-flex justify-center items-center",
        "rounded-xl bg-sky-500 hover:bg-sky-600 active:bg-sky-600",
        "font-semibold text-slate-100 text-md bg-",
      )}
    >
      {children}
    </button>
  )
}
