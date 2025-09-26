import { create } from 'zustand';

type AvatarVersionState = {
  ver: Record<string, number>;
  bump: (userId: string | number) => void;
  get: (userId: string | number) => number;
};

export const useAvatarVersion = create<AvatarVersionState>((set, get) => ({
  ver: {},
  bump: (userId) => set((s) => ({ ver: { ...s.ver, [String(userId)]: Date.now() } })),
  get: (userId) => get().ver[String(userId)] ?? 0,
}));
