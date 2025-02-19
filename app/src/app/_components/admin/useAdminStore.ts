import { create } from "zustand";

interface UseAdminStoreState {
  projectId: string;
}

export const useAdminStore = create<UseAdminStoreState>((set) => ({
  projectId: "1", // TODO
}));
