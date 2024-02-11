import { useEffect, useRef, useState } from 'react';
import { MESSAGE } from '../utils/interfaces';
import MessageContainer from './MessageContainer';
import TopBar from './TopBar';
import { useAtom } from 'jotai';
import {
  chatTypeAtom,
  currentConversationAtom,
  currentModelNameAtom,
  modelOptionsAtom,
} from '../utils/atoms';
import { useInterval } from 'usehooks-ts';
import { createConversation, updateConversation } from '../utils/conversationManager';
import { BounceLoader } from 'react-spinners';
import { getSystemPrompt } from '../utils/utils';
let window: any = global;

export default function Chat() {

  const [currentModelName, setCurrentModelName] = useAtom(currentModelNameAtom);
  const [chatType] = useAtom(chatTypeAtom);
  const [modelOptions] = useAtom(modelOptionsAtom);
  const [currentConversation, setCurrentConversation] = useAtom(currentConversationAtom);

  const [input, setInput] = useState<string>('');
  const [pending, setPending] = useState<boolean>(false);
  const [_, forceUpdate] = useState<number>(0);

  const messagesRef = useRef<MESSAGE[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // listen for updates to the current conversation
    if (currentConversation) {
      // update messages
      messagesRef.current = currentConversation.messages;
      // update selected model
      setCurrentModelName(currentConversation.modelName);
    } else {
      // if a new conversation is selected clear the chat
      messagesRef.current = [];
    }
    // force update the view
    forceUpdate((prev) => prev + 1);
  }, [currentConversation]);


  useInterval(
    () => {
      if (containerRef.current) {
        // check if the user is scrolled to the bottom of the messages container
        const isScrolledToBottom =
          containerRef.current?.scrollHeight -
            containerRef.current?.scrollTop -
            containerRef.current?.clientHeight <= 40;
        // scroll to the bottom of the messages container if the user is already at the bottom
        if (isScrolledToBottom) {
          scrollToBottom();
        }
      }
    },
    pending ? 100 : null,
  );

  const scrollToBottom = () => {
    containerRef.current?.scrollTo(0, containerRef.current?.scrollHeight);
  };

  const streamResponse = async (stream: Response) => {
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
          const systemPrompt = getSystemPrompt(currentModelName as string, message.content);
          return {
            role: message.role,
            content: message.content,
            options: modelOptions,
            template: getSystemPrompt(currentModelName as string, message.content),
          };
        }),
      };
    } else {
      body = {
        model: currentModelName,
        prompt: userInput,
        options: modelOptions,
        template: getSystemPrompt(currentModelName as string, userInput),
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
    try {
      setPending(true);
      if (!input) return;
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
      // create a new conversation if there are no messages
      let conversationUid;
      if (messagesRef.current.length === 2) {
        const newConversation = createConversation(
          messagesRef.current,
          currentModelName as string
        );
        setCurrentConversation(newConversation);
        console.log(newConversation);
        conversationUid = newConversation.uid;
      } else {
        conversationUid = currentConversation?.uid;
      }
      // request a response from the assistant
      const response = await formatRequest();
      // stream the response
      await streamResponse(response);
      // update the conversation local storage
      updateConversation(conversationUid as string, messagesRef.current)
    } catch (e) {
      console.log(e);
    }
    setPending(false);
  };

  const keyDown = (e: any) => {
    if (e.key === 'Enter' && !pending) {
      e.preventDefault();
      sendMessage();
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    }
  };

  const renderInput = () => {
    return (
      <div className="relative w-full h-auto flex">
        <textarea
          className="w-full h-12 border-[1px] border-zinc-700 min-h-10 px-3 rounded-md bg-zinc-800 text-white outline-zinc-900 pt-[10px] pr-10"
          disabled={!currentModelName}
          placeholder={`${!currentModelName ? "No model selected" :  "Type a message..."}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={keyDown}
        />
        {pending &&
          <BounceLoader
            className="!absolute right-3 top-1/2 transform -translate-y-1/2"
            size={20}
            color='rgb(96 165 250)'
          />
        }
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
      {renderMessagesContainer()}
      {renderInput()}
    </div>
  );
}
