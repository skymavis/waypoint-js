import cls from "classnames"
import { HTMLAttributes } from "react"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ResultBoxProps extends HTMLAttributes<HTMLDivElement> {}

export const ResultBox: React.FC<ResultBoxProps> = ({ className, ...restProps }) => {
  return (
    <div
      className={cls("truncate rounded-x border border-solid border-tc-border p-8", className)}
      {...restProps}
    ></div>
  )
}
