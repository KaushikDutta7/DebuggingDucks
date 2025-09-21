import React from 'react';
import { createRoot } from 'react-dom/client';
import TruthGuardAI from './TruthGuardAI';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <TruthGuardAI />
  </React.StrictMode>
);
