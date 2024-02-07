import { useAtom } from "jotai"
import { chatTypeAtom, isSidebarOpenAtom } from "../utils/atoms"
import { X } from "react-feather";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Sidebar() {

  const [chatType, setChatType] = useAtom(chatTypeAtom);
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(isSidebarOpenAtom);

  const renderChatType = () => {
    return (
      <div className="w-full">
        <span
          className="block text-white text-sm font-bold mb-1 text-nowrap"
        >
          Chat Type
        </span>
        <Tabs 
          defaultValue={chatType}
          className="w-full dark h-8"
        >
          <TabsList className="w-full">
            <TabsTrigger 
              value="chat"
              onClick={() => setChatType("chat")}
              className="w-1/2"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="generate"
              onClick={() => setChatType("generate")}
              className="w-1/2"
            >
              Generate
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    )
  }

  const getSidebarSize = () => {
    if (isSidebarOpen) {
      return "w-1/2 px-2";
    } else {
      return "w-0 px-0";
    }
  }

  return (
    <div className={`absolute top-0 left-0 h-screen ${getSidebarSize()} z-10 bg-zinc-950 overflow-hidden transition-all pt-10 flex flex-col items-center`}>
      <X
        className="absolute top-2 left-3 text-blue-400 cursor-pointer"
        onClick={() => setIsSidebarOpen(false)}
        size={15}
      />
      {renderChatType()}
    </div>
  )
}