import { RefreshCcw, Volume1 } from 'react-feather';
import { MESSAGE } from '../utils/interfaces';
import { useEffect, useRef, useState } from 'react';
import { BounceLoader, ScaleLoader } from 'react-spinners';
import { useAtom } from 'jotai';
import { autoReadAtom, currentVoiceAtom } from '../utils/atoms';
let window: any = global;

interface Props {
  message: MESSAGE;
}

const MessageActions = ({ message }: Props) => {
  const [pendingAudioGeneration, setPendingAudioGeneration] =
    useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoReadRef = useRef<boolean>(false);
  const [autoRead] = useAtom(autoReadAtom);
  const [currentVoice] = useAtom(currentVoiceAtom);

  useEffect(() => {
    triggerAutoReadMessage();
  }, [message.content, message.streaming]);

  // auto read the message if the assistant message is completed
  const triggerAutoReadMessage = () => {
    if (
      autoRead &&
      message.role === 'assistant' &&
      !message.streaming &&
      message.content !== '' &&
      !autoReadRef.current
    ) {
      speechClicked();
      autoReadRef.current = true;
    }
  };

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
    await window.electron.ipcRenderer.sendMessage('generate-audio', {
      content: message.content,
      voice: currentVoice.file,
    });
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const shouldShowSpeech = () => {
    return (
      message.content !== '' &&
      message.role === 'assistant' &&
      !message.streaming
    );
  };

  // render a loading indicator while the audio is being generated
  const renderSpeechSymbol = () => {
    if (shouldShowSpeech() === false) return null;
    const iconStyle =
      'text-white z-1 hover:text-blue-500 cursor-pointer transition';
    if (pendingAudioGeneration)
      return <BounceLoader size={10} color={'rgba(255,255,255)'} />;
    else if (isPlaying)
      return (
        <ScaleLoader
          height={10}
          width={1}
          color={'rgba(255,255,255)'}
          onClick={pauseAudio}
        />
      );
    else
      return (
        <Volume1 className={iconStyle} size={16} onClick={speechClicked} />
      );
  };

  const shouldShowRefresh = () => {
    return message.role === 'user';
  };

  const renderRefreshIcon = () => {
    if (!shouldShowRefresh()) return null;
    const iconStyle =
      'text-white z-1 hover:text-blue-500 cursor-pointer transition';
    return <RefreshCcw className={iconStyle} size={13} onClick={() => {}} />;
  };

  return (
    <div className="flex items-center translate-y-[-5px] gap-3">
      {/* {renderRefreshIcon()} */}
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
