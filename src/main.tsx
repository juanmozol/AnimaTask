import {createRoot} from 'react-dom/client';
import '@fontsource/zen-maru-gothic/latin-400.css';
import '@fontsource/zen-maru-gothic/latin-500.css';
import '@fontsource/zen-maru-gothic/latin-700.css';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
