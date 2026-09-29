import { create } from 'zustand';

interface UiState {
  /** Sidebar expandido o compacto (solo escritorio). */
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  /** Menú lateral deslizable (celular / tablet). */
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ mobileMenuOpen: isOpen }),
}));
