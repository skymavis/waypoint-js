import cls from "classnames"
import { HTMLAttributes } from "react"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DividerProps extends HTMLAttributes<HTMLDivElement> {}

export const Divider: React.FC<DividerProps> = ({ className, ...restProps }) => {
  return (
    <div
      className={cls("my-24 border-t-[2px] border-b-0 border-dashed border-tc-border", className)}
      {...restProps}
    ></div>
  )
}
