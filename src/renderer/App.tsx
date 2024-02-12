import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Chat from './components/Chat';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { currentConversationAtom, currentModelNameAtom, modelOptionsAtom } from './utils/atoms';
import { loadSettings, updateSettings } from './utils/settingsManager';
import { SETTINGS } from './utils/interfaces';

export default function App() {

  const [modelOptions] = useAtom(modelOptionsAtom);
  const [currentModelName] = useAtom(currentModelNameAtom);
  const [currentConversation] = useAtom(currentConversationAtom);

  useEffect(() => {
    const refresh = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'r')
        window.location.reload();
    }
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
    let newSettings:any = {
      ...settings
    }
    if (currentModelName)
      newSettings.lastModelName = currentModelName;
    if (currentConversation)
      newSettings.lastConversation = currentConversation;
    updateSettings(newSettings);
  }, [currentModelName, currentConversation]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat/>} />
      </Routes>
    </Router>
  );
}
