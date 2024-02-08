import { useRef, useState } from 'react';
import { MESSAGE } from '../utils/interfaces';
import MessageContainer from './MessageContainer';
import TopBar from './TopBar';
import { useAtom } from 'jotai';
import {
  chatTypeAtom,
  currentModelNameAtom,
  modelOptionsAtom,
} from '../utils/atoms';
import { useInterval } from 'usehooks-ts';
import Sidebar from './Sidebar';
let window: any = global;

export default function Chat() {
  const [currentModelName] = useAtom(currentModelNameAtom);
  const [chatType] = useAtom(chatTypeAtom);
  const [modelOptions] = useAtom(modelOptionsAtom);

  const [input, setInput] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [_, forceUpdate] = useState<number>(0);

  const messagesRef = useRef<MESSAGE[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useInterval(
    () => {
      if (containerRef.current) {
        // check if the user is scrolled to the bottom of the messages container
        const isScrolledToBottom =
          containerRef.current?.scrollHeight -
            containerRef.current?.scrollTop -
            containerRef.current?.clientHeight <= 100;
        // scroll to the bottom of the messages container if the user is already at the bottom
        if (isScrolledToBottom) {
          scrollToBottom();
        }
      }
    },
    pending ? 500 : null,
  );

  const scrollToBottom = () => {
    containerRef.current?.scrollTo(0, containerRef.current?.scrollHeight);
  };

  const streamResponse = async (stream: Response) => {
    setPending(true);
    let done = false;
    // get the reader from the response body
    const reader = stream.body?.getReader();
    // create a new message from the assistant
    let fullResponse = '';
    let assistantResponse: MESSAGE = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    forceUpdate((prev) => prev + 1);
    // listen for updates to the response
    while (!done && reader) {
      try {
        const { value, done: streamDone } = await reader.read();
        if (value) {
          const text = new TextDecoder('utf-8').decode(value);
          const data = JSON.parse(text);
          // const { done: isDone, message } = data;
          const isDone = data.done;
          const partialResponse =
            chatType === 'chat' ? data.message.content : data.response;
          fullResponse += partialResponse;
          assistantResponse.content = fullResponse;
          // replace the last message with the new message
          messagesRef.current[messagesRef.current.length - 1] =
            assistantResponse;
          // force update the component
          forceUpdate((prev) => prev + 1);
          done = isDone;
        }
        done = streamDone;
      } catch (e) {}
    }
    setPending(false);
  };

  const formatRequest = async () => {
    // get the server address from the environment variables
    const addr =
      window.envVars.OLLAMA_SERVER_ADDRESS || 'http://localhost:11434';
    // store the user input before clearing
    const userInput = input;
    // clear input
    setInput('');
    // setup request body based on chat type
    let body = {};
    if (chatType === 'chat') {
      body = {
        model: currentModelName,
        messages: messagesRef.current.map((message) => {
          return {
            role: message.role,
            content: message.content,
            options: modelOptions,
          };
        }),
      };
    } else {
      body = {
        model: currentModelName,
        prompt: userInput,
        options: modelOptions,
      };
    }
    // request a response from the assistant
    const response = await fetch(`${addr}/api/${chatType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response;
  };

  const sendMessage = async () => {
    if (!input) return;
    // create new message from user
    const newMessage: MESSAGE = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    // add the new message to the messages array
    messagesRef.current = [
      ...messagesRef.current,
      newMessage,
      {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      },
    ];
    // request a response from the assistant
    const response = await formatRequest();
    // stream the response
    await streamResponse(response);
  };

  const keyDown = (e: any) => {
    if (e.key === 'Enter') {
      sendMessage();
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    }
  };

  const renderInput = () => {
    return (
      <div>
        <input
          className="w-full h-12 border-[1px] border-zinc-700 min-h-10 px-3 rounded-md bg-zinc-800 text-white outline-zinc-900"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={keyDown}
        />
      </div>
    );
  };

  const renderMessagesContainer = () => {
    return (
      <div
        className="overflow-y-auto text-white min-h-full flex flex-col gap-1 pt-8"
        ref={containerRef}
      >
        {messagesRef.current.map((message, index) => (
          <MessageContainer key={index} message={message} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-screen min-h-screen max-h-screen flex flex-col p-3 gap-3 bg-zinc-900 justify-between">
      <TopBar />
      <Sidebar />
      {renderMessagesContainer()}
      {renderInput()}
    </div>
  );
}
