
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './serviceWorkerRegistration'

// Register the service worker
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
