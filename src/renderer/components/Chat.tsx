import { useRef, useState } from 'react';
import { MESSAGE } from '../utils/interfaces';
import MessageContainer from './MessageContainer';
import TopBar from './TopBar';
import { useAtom } from 'jotai';
import { chatTypeAtom, currentModelNameAtom } from '../utils/atoms';
import { useInterval } from 'usehooks-ts';
import Sidebar from './Sidebar';
let window: any = global;

export default function Chat() {
  const [currentModelName] = useAtom(currentModelNameAtom);
  const [chatType] = useAtom(chatTypeAtom);

  const [input, setInput] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [_, forceUpdate] = useState<number>(0);

  const messagesRef = useRef<MESSAGE[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useInterval(
    () => {
      // scroll to the bottom of the messages container
      scrollToBottom();
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
          const { done: isDone, message } = data;
          fullResponse += message.content;
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
    // clear input
    setInput('');
    const addr = window.envVars.OLLAMA_SERVER_ADDRESS || "http://localhost:11434";
    // request a response from the assistant
    const response = await fetch(`${addr}/api/${chatType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: currentModelName,
        messages: messagesRef.current.map((message) => {
          return {
            role: message.role,
            content: message.content,
          };
        }),
      }),
    });

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
