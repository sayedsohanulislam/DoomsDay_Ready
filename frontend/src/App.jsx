import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Toast from './components/Toast';
import Movies from './pages/Movies';
import RewatchPlan from './pages/RewatchPlan';
import Booking from './pages/Booking';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Toast />
        <Layout>
          <Routes>
            <Route path="/" element={<Movies />} />
            <Route path="/rewatch" element={<RewatchPlan />} />
            <Route path="/booking" element={<Booking />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}
