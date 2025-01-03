import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

export const usePdfStore = create(
    devtools((set) => ({
    pdf: null,
    setPdf: (pdf) => set({ pdf }),
})));

