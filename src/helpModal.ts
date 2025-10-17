import { marked } from 'marked';
import readmeContent from '../README.md?raw';
import { analytics } from './analytics';

export function initializeHelpModal(): void {
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeModal = document.getElementById('close-modal');
  const modalContent = helpModal?.querySelector('.modal-body');

  if (!helpBtn || !helpModal || !closeModal || !modalContent) {
    console.error('Help modal elements not found');
    return;
  }

  // Convert markdown to HTML
  const htmlContent = marked.parse(readmeContent);
  modalContent.innerHTML = htmlContent as string;

  helpBtn.addEventListener('click', () => {
    analytics.trackHelpOpened();
    helpModal.classList.add('active');
  });

  closeModal.addEventListener('click', () => {
    analytics.trackHelpClosed('close_button');
    helpModal.classList.remove('active');
  });

  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      analytics.trackHelpClosed('backdrop_click');
      helpModal.classList.remove('active');
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal.classList.contains('active')) {
      analytics.trackHelpClosed('escape_key');
      helpModal.classList.remove('active');
    }
  });
}
