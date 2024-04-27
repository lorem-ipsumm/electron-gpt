import { RefreshCcw, Volume1 } from 'react-feather';
import { MESSAGE } from '../utils/interfaces';
import { useRef, useState } from 'react';
import { BounceLoader, ScaleLoader } from 'react-spinners';
let window: any = global;

interface Props {
  message: MESSAGE;
}

const MessageActions = ({ message }: Props) => {
  const [pendingAudioGeneration, setPendingAudioGeneration] =
    useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const speechClicked = async () => {
    // if the audio has already been generated play it
    if (audioRef.current) {
      if (audioRef.current.src !== '') {
        audioRef.current.play();
        return;
      }
    }
    setPendingAudioGeneration(true);
    // setup listener for a response from the main process
    window.electron.ipcRenderer.once(
      'generate-audio',
      (response: { base64: string | null }) => {
        if (!response.base64) {
          console.error('Error generating audio');
          setPendingAudioGeneration(false);
          return;
        }
        // get the base64 audio data from the response
        const base64Audio = response.base64;
        setPendingAudioGeneration(false);
        // set the audio source to the base64 audio data and play it
        if (audioRef.current) {
          audioRef.current.src = `data:audio/wav;base64,${base64Audio}`;
          audioRef.current.play();
        }
      },
    );

    // send a message to the main process to open the file dialog
    await window.electron.ipcRenderer.sendMessage(
      'generate-audio',
      message.content,
    );
  };

  // render a loading indicator while the audio is being generated
  const renderSpeechSymbol = () => {
    const iconStyle =
      'text-white z-1 hover:text-blue-500 cursor-pointer transition';
    if (pendingAudioGeneration)
      return <BounceLoader size={10} color={'rgba(255,255,255)'} />;
    else if (isPlaying)
      return <ScaleLoader height={10} width={1} color={'rgba(255,255,255)'} />;
    else
      return (
        <Volume1 className={iconStyle} size={16} onClick={speechClicked} />
      );
  };

  const shouldShowIcons = () => {
    return (
      message.content !== '' &&
      message.role === 'assistant' &&
      !message.streaming
    );
  };

  if (shouldShowIcons())
    return (
      <div className="flex items-center">
        {renderSpeechSymbol()}
        <audio
          ref={audioRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    );
};

export default MessageActions;
