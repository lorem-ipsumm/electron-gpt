import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Chat from './components/Chat';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat/>} />
      </Routes>
    </Router>
  );
}
