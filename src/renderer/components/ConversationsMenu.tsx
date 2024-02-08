import { PlusCircle, Trash, Trash2, X } from 'react-feather';
import { useAtom } from 'jotai';
import { currentConversationAtom, isConversationsMenuOpenAtom } from '../utils/atoms';
import { useEffect, useState } from 'react';
import { deleteConversation, loadConversations } from '../utils/conversationManager';
import { CONVERSATION } from '../utils/interfaces';

export default function ConversationsMenu() {

  const [isConversationsMenuOpen, setIsConversationsMenuOpen] = useAtom(
    isConversationsMenuOpenAtom,
  );
  const [conversations, setConversations] = useState<CONVERSATION[]>([]);
  const [currentConversation, setCurrentConversation] = useAtom(currentConversationAtom);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const conversations = await loadConversations();
    setConversations(conversations);
  }

  const getMenuSize = () => {
    if (isConversationsMenuOpen) {
      return 'w-1/2 px-3';
    } else {
      return 'w-0 px-0';
    }
  };

  const renderNewConversationButton = () => {

    const onClick = () => {
      setCurrentConversation(null);
      setIsConversationsMenuOpen(false);
    }

    return (
      <div 
        className={`flex justify-between w-full h-10 cursor-pointer items-center hover:bg-zinc-900 px-2 transition all rounded-md text-white border border-zinc-800`}
        onClick={onClick}
      >
        <span className="text-nowrap">New Conversation</span>
        <PlusCircle
          size={15}
        />
      </div>
    )
  }

  const renderConversations = () => {

    const conversationClicked = (conversation: CONVERSATION) => {
      setCurrentConversation(conversation);
      setIsConversationsMenuOpen(false);
    }

    const deleteClicked = (conversation: CONVERSATION) => {
      deleteConversation(conversation.uid);
      fetchConversations();
    }

    return (
      <>
        {conversations.map((conversation: CONVERSATION) => {
          const messages = conversation.messages;
          const firstMessage = messages[0];
          const title = firstMessage.content.substring(0, 15);
          const isActiveConversation = conversation.uid === currentConversation?.uid;
          const isActiveStyle = `${isActiveConversation ? "bg-zinc-900" : ""}`
          return (
            <div 
              className={`${isActiveStyle} flex justify-between w-full h-10 cursor-pointer items-center hover:bg-zinc-900 px-2 transition all rounded-md`}
              onClick={() => conversationClicked(conversation)}
            >
              <span 
                className="text-white text-nowrap"
              >
                {title}
              </span>
              <Trash2 
                className="text-red-500 cursor-pointer"
                size={15}
                onClick={() => deleteClicked(conversation)}
              />
            </div>
          )
        })}
        {renderNewConversationButton()}
      </>
    )
  }

  return (
    <>
      <div
        className={`z-2 absolute top-0 left-0 h-screen ${getMenuSize()} z-10 bg-zinc-950 overflow-hidden transition-all pt-10 flex flex-col gap-3 items-center shadow-xl`}
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
