/**
 * App
 * Path: src/App.jsx
 *
 * Router and toast provider.
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toasts';
import { useTheme } from './hooks/useTheme';
import './lib/installPrompt'; // catches beforeinstallprompt at startup, for Settings' Install button
import HomePage from './features/home/HomePage';
import StudioPage from './features/studio/StudioPage';
import IconsPage from './features/icons/IconsPage';
import PdfPage from './features/pdf/PdfPage';
import SettingsPage from './features/settings/SettingsPage';

const toStudio = (hash) => <Navigate to={{ pathname: '/studio', hash }} replace />;

export default function App() {
  useTheme(); // keeps <html data-theme> in sync with the OS while the app is open

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/icons" element={<IconsPage />} />
          <Route path="/pdf" element={<PdfPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* v2 routes redirect into Studio */}
          <Route path="/converter" element={toStudio('#convert')} />
          <Route path="/convert-options" element={toStudio('#convert')} />
          <Route path="/resize" element={toStudio('#resize')} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}