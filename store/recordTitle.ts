import { create } from 'zustand';

type ID = number | string;

type TitlePair = { id: ID; title: string };

type RecordTitleState = {
  titles: Record<string, string>;

  setInitial: (items: TitlePair[]) => void;
  setTitle: (id: ID, title: string) => void;

  mergeFromServer: (items: TitlePair[]) => void;

  remove: (id: ID) => void;
  getTitle: (id: ID) => string | undefined;

  reset: () => void;
};

const toKey = (id: ID) => String(id);

export const useRecordTitleStore = create<RecordTitleState>((set, get) => ({
  titles: {},

  setInitial: (items) =>
    set(() => {
      const next: Record<string, string> = {};
      for (const it of items) next[toKey(it.id)] = it.title ?? '';
      return { titles: next };
    }),

  setTitle: (id, title) =>
    set((s) => ({
      titles: { ...s.titles, [toKey(id)]: title ?? '' },
    })),

  mergeFromServer: (items) =>
    set((s) => {
      const next = { ...s.titles };
      for (const it of items) next[toKey(it.id)] = it.title ?? '';
      return { titles: next };
    }),

  remove: (id) =>
    set((s) => {
      const next = { ...s.titles };
      delete next[toKey(id)];
      return { titles: next };
    }),

  getTitle: (id) => get().titles[toKey(id)],

  reset: () => set({ titles: {} }),
}));
