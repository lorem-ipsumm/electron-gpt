import { PlusCircle, Trash2, X } from 'react-feather';
import { useAtom } from 'jotai';
import {
  currentConversationAtom,
  isConversationsMenuOpenAtom,
} from '../utils/atoms';
import { useEffect, useState } from 'react';
import {
  deleteAllConversations,
  deleteConversation,
  loadConversations,
} from '../utils/managers/conversationManager';
import { CONVERSATION } from '../utils/interfaces';
import { useInterval } from 'usehooks-ts';

export default function ConversationsMenu() {
  const [isConversationsMenuOpen, setIsConversationsMenuOpen] = useAtom(
    isConversationsMenuOpenAtom,
  );
  const [conversations, setConversations] = useState<CONVERSATION[]>([]);
  const [currentConversation, setCurrentConversation] = useAtom(
    currentConversationAtom,
  );

  // fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // fetch conversations on a fixed interval to ensure
  // that new conversations appear on the list
  useInterval(() => {
    fetchConversations();
  }, 1000);

  const fetchConversations = async () => {
    const conversations = await loadConversations();
    setConversations(conversations);
  };

  // style for the menu based on whether it is open or not
  const menuSizeStyle = () => {
    if (isConversationsMenuOpen) {
      return 'w-1/2 md:w-1/4 px-3';
    } else {
      return 'w-0 px-0';
    }
  };

  const renderMenuButton = (label: string, icon: any, onClick: () => void) => {
    return (
      <div
        className={`flex justify-between w-full h-10 cursor-pointer items-center hover:bg-zinc-900 transition all rounded-md text-white border border-zinc-800`}
        onClick={onClick}
      >
        <span className="block h-full flex-1 text-white text-nowrap flex items-center px-2">
          {label}
        </span>
        <div className="h-full w-1/5 flex justify-center items-center">
          {icon}
        </div>
      </div>
    );
  };

  // on click listener for deleting all conversations
  const deleteAllConversationsClicked = () => {
    deleteAllConversations();
    fetchConversations();
    setCurrentConversation(null);
  };

  // on click listener for starting new conversations
  const newConversationClicked = () => {
    setCurrentConversation(null);
    setIsConversationsMenuOpen(false);
  };

  const renderConversations = () => {
    const conversationClicked = (conversation: CONVERSATION) => {
      setCurrentConversation(conversation);
      setIsConversationsMenuOpen(false);
    };

    const deleteClicked = (conversation: CONVERSATION) => {
      deleteConversation(conversation.uid);
      fetchConversations();
    };

    return (
      <>
        {conversations.map((conversation: CONVERSATION) => {
          const messages = conversation.messages;
          const firstMessage = messages[0];
          const title = firstMessage.content.substring(0, 15);
          const isActiveConversation =
            conversation.uid === currentConversation?.uid;
          const isActiveStyle = `${isActiveConversation ? 'bg-zinc-900' : ''}`;
          return (
            <div
              className={`${isActiveStyle} flex justify-between w-full h-10 cursor-pointer items-center hover:bg-zinc-900 transition all rounded-md overflow-hidden`}
              onClick={() => conversationClicked(conversation)}
            >
              <span className="block h-full flex-1 text-white text-nowrap flex items-center px-2">
                {title}
              </span>
              <div
                className="h-full w-1/5 flex justify-center items-center hover:bg-zinc-800"
                onClick={() => deleteClicked(conversation)}
              >
                <Trash2 className="text-red-500 cursor-pointer" size={15} />
              </div>
            </div>
          );
        })}
        {renderMenuButton(
          'New Chat',
          <PlusCircle size={15} />,
          newConversationClicked,
        )}
        {renderMenuButton(
          'Delete All',
          <Trash2 size={15} className="text-red-500" />,
          deleteAllConversationsClicked,
        )}
      </>
    );
  };

  return (
    <>
      <div
        className={`z-2 absolute top-0 left-0 h-screen ${menuSizeStyle()} z-10 bg-zinc-950 overflow-hidden transition-all pt-10 flex flex-col gap-3 items-center shadow-xl`}
      >
        {renderConversations()}
        <X
          className="absolute top-2 left-3 text-blue-400 cursor-pointer"
          onClick={() => setIsConversationsMenuOpen(false)}
          size={15}
        />
      </div>
    </>
  );
}
