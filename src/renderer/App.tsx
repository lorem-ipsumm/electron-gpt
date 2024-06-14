import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Chat from './components/Chat';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  currentConversationAtom,
  currentModelNameAtom,
  privateModeAtom,
} from './utils/atoms';
import { loadSettings, updateSettings } from './utils/managers/settingsManager';

export default function App() {
  const [currentModelName] = useAtom(currentModelNameAtom);
  const [currentConversation] = useAtom(currentConversationAtom);
  const [privateMode] = useAtom(privateModeAtom);

  useEffect(() => {
    const refresh = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'r') window.location.reload();
    };
    // create keydown event listener for ctrl + r
    window.addEventListener('keydown', refresh);
    // remove event listeners on unmount
    return () => {
      window.removeEventListener('keydown', refresh);
    };
  }, []);

  useEffect(() => {
    // whenever the currentModelName or modelOptions updates
    // update the settings in local storage
    const settings = loadSettings();
    let newSettings: any = {
      ...settings,
    };
    if (!privateMode) {
      if (currentModelName) newSettings.lastModelName = currentModelName;
      if (currentConversation) newSettings.lastConversation = currentConversation;
    }
    updateSettings(newSettings);
  }, [currentModelName, currentConversation]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat />} />
      </Routes>
    </Router>
  );
}
