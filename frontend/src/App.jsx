import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NovaTransacao from './pages/NovaTransacao';
import Relatorios from "./pages/Relatorios";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registrar" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nova" element={<NovaTransacao />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
