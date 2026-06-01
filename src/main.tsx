import { createRoot } from 'react-dom/client'
import App from './AppMVP.tsx'
import './index.css'

// Unregister stale service workers that break Vite HMR in dev
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
