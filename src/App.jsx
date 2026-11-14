/**
 * App
 * Path: src/App.jsx
 *
 * Router and toast provider. Pages not built yet render PlaceholderPage.
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toasts';
import { useTheme } from './hooks/useTheme';
import HomePage from './features/home/HomePage';
import StudioPage from './features/studio/StudioPage';
import IconsPage from './features/icons/IconsPage';
import PlaceholderPage from './pages/PlaceholderPage';

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
          <Route path="/pdf" element={<PlaceholderPage title="Images to PDF" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />

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