import { create } from 'zustand';

const useNavigationStore = create((set) => ({
  activeTab: 'Home',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useNavigationStore; 
