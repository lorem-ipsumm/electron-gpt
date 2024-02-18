import { MESSAGE } from '../utils/interfaces';
import { User, Monitor } from 'react-feather';
import ReactMarkdown from 'react-markdown';
import { BeatLoader } from 'react-spinners';
import { useState } from 'react';

export default function MessageContainer(props: { message: MESSAGE }) {
  const { message } = props;
  const [selectedImage, setSelectedImage] = useState<number>(-1);

  const renderIcon = () => {
    // is the message from the user or the assistant
    const isUser = message.role === 'user';
    // icon sizing and style
    const iconSize = 15;
    const iconStyle = 'transform translate-y-[5px] text-blue-400 z-1';
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

  const renderAttachedImages = () => {
    // if there are no images attached to the message return null
    if (!message.images || message.images.length === 0) return null
    return (
      <div className="min-w-full flex gap-2 justify-start overflow-x-auto">
        {message.images.map((image, index) => {
          return (
            <img
              key={index}
              src={`data:image/jpeg;base64,${image.base64}`}
              alt="attached image"
              className="w-20 h-20 object-cover rounded-md mb-2 cursor-pointer"
              onClick={() => setSelectedImage(index)}
            />
          );
        })}
      </div>
    );
  }

  // render a full screen view of the selected image
  const renderFullScreenImage = () => {
    // check if there is an image selected
    if (
      selectedImage === -1 ||
      !message.images
    ) return null
    return (
      <div 
        className="fixed left-0 top-0 w-full h-full flex justify-center items-center z-10 fade-in"
        onClick={() => {
          setSelectedImage(-1);
        }}
      >
        <div
          className="fixed left-0 top-0 w-full h-full bg-black opacity-90 z-[-1]"
        />
        <img
          src={`data:image/jpeg;base64,${message.images[selectedImage].base64}`}
          alt="full screen image"
          className="w-[90%] h-auto object-cover"
        />
      </div>
    )
  }

  const renderMessage = () => {
    return (
      <div className="flex gap-3 items-start">
        {renderIcon()}
        <div className="flex flex-col pr-2 w-full">
          <span className="font-bold capitalize">{message.role}</span>
          <div className="markdown-content">
            {messageLoadingLogic()}
          </div>
          {renderAttachedImages()}
        </div>
        {renderFullScreenImage()}
      </div>
    );
  };

  return renderMessage();
}
