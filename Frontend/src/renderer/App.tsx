import {MemoryRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import './App.css';
import './normalize.css';
import { SignUp_2 } from './components/sign-up-component/sign-up-2';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-up-2" replace/>}/>
        <Route path="/sign-up-2" element={<SignUp_2/>}/>
      </Routes>
    </Router>
  );
}
