<<<<<<< Updated upstream
import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import SignUp from './components/sign-up-component/sign-up';
=======
import {MemoryRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
>>>>>>> Stashed changes
import './App.css';
import './normalize.css';
import { SignUp } from './components/sign-up-component/sign-up';

export default function App() {
  return (
    <Router>
      <Routes>
<<<<<<< Updated upstream
        <Route path="/" element={<Navigate to="/sign-up" replace />} />
        <Route path="/sign-up" element={<SignUp />} />
=======
        <Route path="/" element={<Navigate to="/sign-up" replace/>}/>
        <Route path="/sign-up" element={<SignUp/>}/>
>>>>>>> Stashed changes
      </Routes>
    </Router>
  );
}
