import { create } from 'zustand';

interface ExhibitState {
  currentExhibitId: string | null;
  filterCategory: string | null;
  filterRoom: string | null;
  filterEndingStatus: string | null;
  searchQuery: string;
  setCurrentExhibit: (id: string | null) => void;
  setFilterCategory: (category: string | null) => void;
  setFilterRoom: (room: string | null) => void;
  setFilterEndingStatus: (status: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useExhibitStore = create<ExhibitState>((set) => ({
  currentExhibitId: null,
  filterCategory: null,
  filterRoom: null,
  filterEndingStatus: null,
  searchQuery: '',
  setCurrentExhibit: (id) => set({ currentExhibitId: id }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setFilterRoom: (room) => set({ filterRoom: room }),
  setFilterEndingStatus: (status) => set({ filterEndingStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearFilters: () =>
    set({
      filterCategory: null,
      filterRoom: null,
      filterEndingStatus: null,
      searchQuery: '',
    }),
}));
