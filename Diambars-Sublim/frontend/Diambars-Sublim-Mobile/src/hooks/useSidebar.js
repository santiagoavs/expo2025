// src/hooks/useSidebar.js - Hook para manejar el estado del sidebar
import { useState, useCallback } from 'react';

const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return {
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar
  };
};

export default useSidebar;
