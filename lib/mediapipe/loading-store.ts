import { create } from 'zustand';

interface MediaPipeLoadingState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
}

export const useMediaPipeLoading = create<MediaPipeLoadingState>((set) => ({
  isLoading: false,
  progress: 0,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error, isLoading: false }),
}));
