import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Background } from '@/components/ui/Background';
import { useScrollManager } from '@/hooks/useScrollManager';
import { Home } from '@/pages/Home';
import { InstallationPage } from '@/pages/InstallationPage';
import { CliPage } from '@/pages/CliPage';
import { WebPage } from '@/pages/WebPage';
import { VSCodePage } from '@/pages/VSCodePage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { FaqPage } from '@/pages/FaqPage';
import { DocumentationPage } from '@/pages/DocumentationPage';
import { NotFound } from '@/pages/NotFound';

function ScrollManager() {
  useScrollManager();
  return null;
}

function App() {
  return (
    <BrowserRouter basename="/cloak">
      <ScrollManager />
      <Background />
      <Navbar />
      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/installation" element={<InstallationPage />} />
          <Route path="/cli" element={<CliPage />} />
          <Route path="/web" element={<WebPage />} />
          <Route path="/vscode" element={<VSCodePage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="/docs/:slug" element={<DocumentationPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
