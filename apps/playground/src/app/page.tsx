import { Intro } from "src/components/Intro"
import { NewUserActions } from "src/components/new-user-action/NewUserActions"

const RootPage = () => {
  return (
    <>
      <div className="flex h-screen w-screen items-stretch justify-start">
        <div className="flex flex-[3] flex-col bg-tc-itr-plain-hovered p-40">
          <Intro />
        </div>

        <div className="flex-[7] overflow-auto bg-tc-bg p-40">
          <div className="mx-auto flex max-w-[600px] flex-col justify-center gap-40">
            <NewUserActions />
          </div>
        </div>
      </div>
    </>
  )
}

export default RootPage
