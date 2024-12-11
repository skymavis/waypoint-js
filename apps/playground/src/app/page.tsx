"use client"

import { Intro } from "src/components/Intro"
import { UserAction } from "src/components/UserAction"

const RootPage = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-start w-screen lg:h-screen lg:items-stretch lg:flex-row">
        <div className="flex px-4 sm:px-20 py-8 justify-center w-full flex-[3] flex-col bg-secondary lg:p-20 lg:items-start">
          <Intro />
        </div>

        <div className="flex-[7] px-4 sm:px-20 py-8 overflow-auto bg-background lg:p-20 w-full">
          <div className="lg:mx-auto flex lg:max-w-[660px] flex-col justify-center gap-4 overflow-hidden">
            <UserAction />
          </div>
        </div>
      </div>
    </>
  )
}

export default RootPage
