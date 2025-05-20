import { useState, useCallback } from 'react';

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState('Carregando...');

  const showLoading = useCallback((message = 'Carregando...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async (promise, message = 'Carregando...') => {
    try {
      showLoading(message);
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    withLoading
  };
}; 
