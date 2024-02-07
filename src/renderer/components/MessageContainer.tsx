import { MESSAGE } from '../utils/interfaces';
import { Monitor, User } from 'react-feather';
import ReactMarkdown from 'react-markdown';
import { BeatLoader } from 'react-spinners';

export default function MessageContainer(props: { message: MESSAGE }) {
  const { message } = props;

  const renderIcon = () => {
    // is the message from the user or the assistant
    const isUser = message.role === 'user';
    // icon sizing and style
    const iconSize = 15;
    const iconStyle = 'transform translate-y-[7px] text-blue-400';
    // render the icon based on the role
    const icon = isUser ? (
      <User size={iconSize} className={iconStyle} />
    ) : (
      <Monitor size={iconSize} className={iconStyle} />
    );
    return <div className="">{icon}</div>;
  };

  // render the loading state for when a message hasn't started streaming yet
  const messageLoadingLogic = () => {
    const regularMessage = <ReactMarkdown>{message.content}</ReactMarkdown>;
    // if the message is from the user show the message
    if (message.role === 'user') return regularMessage;
    // if the message hasn't started streaming yet show the loading indicator
    else if (message.content === '')
      return (
        <div className="w-full h-auto">
          <BeatLoader color="rgba(255,255,255)" size={10} />
        </div>
      );
    // if the response has started streaming show the streamed text
    else return regularMessage;
  };

  const renderMessage = () => {
    return (
      <div className="flex gap-4 items-start">
        {renderIcon()}
        <div className="flex flex-col markdown-content pr-2">
          <span className="font-bold capitalize">{message.role}</span>
          {messageLoadingLogic()}
        </div>
      </div>
    );
  };

  return renderMessage();
}
