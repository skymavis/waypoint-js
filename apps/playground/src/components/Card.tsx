import cls from "classnames"
import { HTMLAttributes } from "react"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...restProps }) => {
  return (
    <div
      className={cls("flex flex-col rounded-2x bg-tc-sf p-16 shadow-popover", className)}
      {...restProps}
    ></div>
  )
}
