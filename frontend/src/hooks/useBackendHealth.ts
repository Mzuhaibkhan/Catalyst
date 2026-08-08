import { useState, useEffect } from 'react';
import { checkBackendHealth } from '../services/api';
import { showToast } from '../components/Toast';

export function useBackendHealth() {
  const [serverStatus, setServerStatus] = useState<string>('checking');

  useEffect(() => {
    checkBackendHealth().then(res => {
      setServerStatus(res.status);
      if (res.status === 'ok') {
        showToast(`Backend online — ${res.availableProviders.length} LLM provider(s) available`, 'success');
      } else {
        showToast('Backend is offline. Make sure the server is running on port 3000.', 'error');
      }
    });
  }, []);

  return { serverStatus };
}
