import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Chat from './components/Chat';
import { useEffect } from 'react';

export default function App() {

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat/>} />
      </Routes>
    </Router>
  );
}
