import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ReportPage from './pages/Report';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report/:id" element={<ReportPage />} />
          </Routes>
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-ink-muted">
          VibeCheck audits publicly reachable URLs only. Only scan sites you own or have permission to test.
        </footer>
      </div>
    </BrowserRouter>
  );
}
