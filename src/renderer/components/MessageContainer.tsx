import { MESSAGE } from "../utils/interfaces";
import { Monitor, User } from "react-feather";
import ReactMarkdown from "react-markdown";

export default function MessageContainer(props: {
  message: MESSAGE,
}) {

  const {
    message
  } = props;

  const renderIcon = () => {
    // is the message from the user or the assistant
    const isUser = message.role === "user";
    // icon sizing and style
    const iconSize = 15;
    const iconStyle = "transform translate-y-[7px] text-blue-400"
    // render the icon based on the role
    const icon = isUser 
      ? <User size={iconSize} className={iconStyle}/>
      : <Monitor size={iconSize} className={iconStyle}/>
    return (
      <div className="">
        {icon}
      </div>
    )
  }

  const renderMessage = () => {
    return (
      <div className="flex gap-4 items-start">
        {renderIcon()}
        <div className="flex flex-col markdown-content pr-2">
          <span className="font-bold capitalize">{message.role}</span>
          {/* <span>{message.content}</span> */}
          <ReactMarkdown>{message.content}</ReactMarkdown> 
        </div>
      </div>
    )
  }

  return (
    renderMessage()
  )
}