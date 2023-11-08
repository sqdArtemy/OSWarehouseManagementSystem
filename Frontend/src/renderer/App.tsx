import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import SignUp from './components/sign-up-component/sign-up';
import './App.css';
import './normalize.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-up" replace />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </Router>
  );
}
