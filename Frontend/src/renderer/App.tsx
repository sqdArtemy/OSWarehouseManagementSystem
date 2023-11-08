import {MemoryRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import './App.css';
import './normalize.css';
import { SignUp } from './components/sign-up-component/sign-up';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-up" replace/>}/>
        <Route path="/sign-up" element={<SignUp/>}/>
      </Routes>
    </Router>
  );
}
