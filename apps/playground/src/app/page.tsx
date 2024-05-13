import { Intro } from "src/components/Intro"
import { UserAction } from "src/components/UserAction"

const RootPage = () => {
  return (
    <>
      <div className="flex h-screen w-screen items-stretch justify-start">
        <div className="flex flex-[3] flex-col bg-secondary p-20">
          <Intro />
        </div>

        <div className="flex-[7] overflow-auto bg-background p-20">
          <div className="mx-auto flex max-w-[660px] flex-col justify-center gap-4">
            <UserAction />
          </div>
        </div>
      </div>
    </>
  )
}

export default RootPage
