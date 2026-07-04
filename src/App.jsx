// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Hero from './components/converter/Hero';
// import ConvertOptionsPage from './components/converter/ConvertOptionsPage';
// import './App.css';
// import HomePage from './components/HomePage';
// import Resize from './components/resize/Resize';

// function App() {
//   return (
//      <Router>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/converter" element={<Hero />} />
//         <Route path="/convert-options" element={<ConvertOptionsPage />} />
//         <Route path="/resize" element={<Resize />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './features/home/HomePage';
import ConverterUploadPage from './features/convert/ConverterUploadPage';
import ConvertOptionsPage from './features/convert/ConvertOptionsPage';
import ResizePage from './features/resize/ResizePage';

function App() {
  return (
    <Router>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--font-size-sm)',
          },
          success: { iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-bg-surface)' } },
          error: { iconTheme: { primary: 'var(--color-danger)', secondary: 'var(--color-bg-surface)' } },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/converter" element={<ConverterUploadPage />} />
        <Route path="/convert-options" element={<ConvertOptionsPage />} />
        <Route path="/resize" element={<ResizePage />} />
      </Routes>
    </Router>
  );
}

export default App;