import { create } from "zustand";

interface UseAdminStoreState {
  projectId: string;
  projectName: string;
}

export const useAdminStore = create<UseAdminStoreState>((set) => ({
  projectId: "",
  projectName: "",
}));
