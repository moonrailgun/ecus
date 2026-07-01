import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UseAdminStoreState {
  projectId: string;
  projectName: string;
}

export const adminProjectStorageKey = "ecus:admin:project";

export const useAdminStore = create<UseAdminStoreState>()(
  persist(
    () => ({
      projectId: "",
      projectName: "",
    }),
    {
      name: adminProjectStorageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projectId: state.projectId,
        projectName: state.projectName,
      }),
    },
  ),
);
