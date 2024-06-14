import { useAtom } from 'jotai';
import {
  autoReadAtom,
  chatTypeAtom,
  currentVoiceAtom,
  isSettingsMenuOpenAtom,
  modelOptionsAtom,
  privateModeAtom,
} from '../utils/atoms';
import { X } from 'react-feather';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VOICE } from '../utils/interfaces';
import { voices } from '../utils/utils';

export default function SettingsMenu() {
  const [chatType, setChatType] = useAtom(chatTypeAtom);
  const [, setAutoRead] = useAtom(autoReadAtom);
  const [, setPrivateMode] = useAtom(privateModeAtom);
  const [currentVoice, setCurrentVoice] = useAtom(currentVoiceAtom);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useAtom(
    isSettingsMenuOpenAtom,
  );
  const [modelOptions, setModelOptions] = useAtom(modelOptionsAtom);

  const [temperature, setTemperature] = useState<number>(
    modelOptions.temperature,
  );
  const [repeatPenalty, setRepeatPenalty] = useState<number>(
    modelOptions.repeat_penalty,
  );
  const [topP, setTopP] = useState<number>(modelOptions.top_p);

  useEffect(() => {
    // set the model options
    setModelOptions({
      temperature,
      repeat_penalty: repeatPenalty,
      top_p: topP,
    });
  }, [temperature, repeatPenalty, topP]);

  const renderSliders = () => {
    const slider = (
      label: string,
      min: number,
      max: number,
      step: number,
      value: number,
      onChange: (value: number) => void,
    ) => {
      return (
        <div className="w-full">
          <div className="flex justify-between text-white text-sm font-bold mb-2">
            <span>{label}</span>
            <span>{value}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full dark bg-zinc-900 h-3 rounded-md appearance-none"
          />
        </div>
      );
    };

    return (
      <div className="w-full flex flex-col gap-4">
        {slider('Temperature', 0, 5, 0.1, temperature, setTemperature)}
        {slider('Top P', 0, 1, 0.1, topP, setTopP)}
        {slider('Repeat Penalty', 0, 2, 0.1, repeatPenalty, setRepeatPenalty)}
      </div>
    );
  };

  const renderChatType = () => {
    return (
      <div className="w-full">
        <span className="block text-white text-sm font-bold mb-2 text-nowrap">
          Chat Type
        </span>
        <Tabs defaultValue={chatType} className="w-full dark h-8">
          <TabsList className="w-full">
            <TabsTrigger
              value="chat"
              onClick={() => setChatType('chat')}
              className="w-1/2"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="generate"
              onClick={() => setChatType('generate')}
              className="w-1/2"
            >
              Generate
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  };

  const renderVoiceSelection = () => {
    const renderOption = (voice: VOICE) => {
      return (
        <DropdownMenuItem
          className="w-full cursor-pointer w-[200px] color-white"
          onClick={() => setCurrentVoice(voice)}
        >
          {voice.name}
        </DropdownMenuItem>
      );
    };

    return (
      <div className="w-full relative">
        <span className="block text-white text-sm font-bold mb-2 text-nowrap">
          Voice
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-white w-full text-left bg-zinc-800 h-10 px-3 rounded-md hover:bg-zinc-900">
            {currentVoice.name}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full dark relative">
            <DropdownMenuRadioGroup className="w-full">
              {voices.map((voice: VOICE) => renderOption(voice))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderAutoRead = () => {
    return (
      <div className="w-full">
        <span className="block text-white text-sm font-bold mb-2 text-nowrap">
          Auto Read
        </span>
        <Tabs defaultValue={'On'} className="w-full dark h-8">
          <TabsList className="w-full">
            <TabsTrigger
              value="On"
              onClick={() => setAutoRead(true)}
              className="w-1/2"
            >
              On
            </TabsTrigger>
            <TabsTrigger
              value="Off"
              onClick={() => setAutoRead(false)}
              className="w-1/2"
            >
              Off
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  };

  const renderPrivateMode = () => {
    return (
      <div className="w-full">
        <span className="block text-white text-sm font-bold mb-2 text-nowrap">
          Private Mode 
        </span>
        <Tabs defaultValue={'Off'} className="w-full dark h-8">
          <TabsList className="w-full">
            <TabsTrigger
              value="On"
              onClick={() => setPrivateMode(true)}
              className="w-1/2"
            >
              On
            </TabsTrigger>
            <TabsTrigger
              value="Off"
              onClick={() => setPrivateMode(false)}
              className="w-1/2"
            >
              Off
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  };

  const getMenuSize = () => {
    if (isSettingsMenuOpen) {
      return 'w-1/2 md:w-1/4 px-3';
    } else {
      return 'w-0 px-0';
    }
  };

  return (
    <>
      <div
        className={`z-2 absolute top-0 right-0 h-screen ${getMenuSize()} z-10 bg-zinc-950 overflow-hidden transition-all pt-10 flex flex-col gap-8 items-center shadow-xl`}
      >
        <X
          className="absolute top-2 right-3 text-blue-400 cursor-pointer"
          onClick={() => setIsSettingsMenuOpen(false)}
          size={15}
        />
        {renderChatType()}
        {renderAutoRead()}
        {renderPrivateMode()}
        {renderVoiceSelection()}
        {renderSliders()}
      </div>
    </>
  );
}
