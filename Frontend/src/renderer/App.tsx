import {MemoryRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import './App.css';
import './normalize.css';
import { SignIn } from './components/sign-in-component/sign-in';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace/>}/>
        <Route path="/sign-in" element={<SignIn/>}/>
      </Routes>
    </Router>
  );
}
