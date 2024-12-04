import clsx from "clsx"
import { FC } from "react"

export const Divider: FC = () => {
  return <div className={clsx("w-full", "border-dashed border-t border-slate-600 my-1")} />
}
