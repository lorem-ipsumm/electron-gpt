import { useAtom } from "jotai"
import { chatTypeAtom, isSidebarOpenAtom } from "../utils/atoms"
import { X } from "react-feather";

export default function Sidebar() {

  const [chatType, setChatType] = useAtom(chatTypeAtom);
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(isSidebarOpenAtom);

  const renderChatType = () => {
    return (
      <div>

      </div>
    )
  }

  const getSidebarSize = () => {
    if (isSidebarOpen) {
      return "w-1/2";
    } else {
      return "w-0";
    }
  }

  return (
    <div className={`absolute top-0 left-0 h-screen ${getSidebarSize()} z-10 bg-zinc-950 overflow-hidden transition-all`}>
      <X
        className="absolute top-2 left-3 text-blue-400"
        onClick={() => setIsSidebarOpen(false)}
        size={15}
      />
    </div>
  )
}