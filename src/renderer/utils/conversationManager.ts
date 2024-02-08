import { CONVERSATION, MESSAGE } from "./interfaces";

export const deleteConversation = (uid: string) => {
  const conversations = [...loadConversations()];
  // if the user is deleting the last conversation, remove the conversations key from local storage
  if (conversations.length === 1) {
    localStorage.removeItem('conversations');
    return;
  }
  // find the conversation with the passed in uid
  const index = conversations.findIndex((c: any) => c.uid === uid);
  // if the conversation exists delete it from the array
  if (index) {
    conversations.splice(index, 1);
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }
}

export const updateConversation = (uid: string, messages: MESSAGE[]) => {
  const conversations = [...loadConversations()];
  // find the conversation with the passed in uid
  const conversation = conversations.find((c: any) => c.uid === uid);
  // update the messages if the conversation exists
  if (conversation) {
    conversation.messages = messages;
  }
  // update localstorage state
  localStorage.setItem('conversations', JSON.stringify(conversations));
}

// create and store a new conversation in local storage
export const createConversation = (
  messages: MESSAGE[], 
  modelName: string
):CONVERSATION => {
  const uid = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  const conversations = loadConversations();
  const conversation:CONVERSATION = {
    uid: uid,
    messages: messages,
    timestamp: Date.now(),
    modelName: modelName
  };
  conversations.push(conversation);
  localStorage.setItem('conversations', JSON.stringify(conversations));
  return conversation;
};

export const loadConversations = () => {
  const conversations = localStorage.getItem('conversations');
  if (conversations) {
    return JSON.parse(conversations);
  } else {
    return [];
  }
};
