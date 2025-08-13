import { Routes, Route } from 'react-router';
import {
  LoginPage,
  NotFoundPage,
  VerificationPage,
  ConfirmationPage,
} from './pages';

function App() {
  return (
    <Routes>
      <Route path='/' element={<LoginPage />} />
      <Route path='/verification' element={<VerificationPage />} />
      <Route path='/confirmation' element={<ConfirmationPage />} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
