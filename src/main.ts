import './style.css';
import { UIController } from './lib/UIController';
import { initializeHelpModal } from './helpModal';

// Initialize the UI controller when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new UIController();
  initializeHelpModal();
});
