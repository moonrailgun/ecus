"use client";

import React from "react";
import { Modal } from "tushan";
import { create } from "zustand";

export const AdminGlobalModal: React.FC = React.memo(() => {
  const modalComponent = useModalStore((state) => state.modalComponent);

  return (
    <Modal
      // title="Modal Title"
      visible={Boolean(modalComponent)}
      onOk={closeModal}
      onCancel={closeModal}
      autoFocus={false}
      focusLock={true}
      footer={null}
    >
      {modalComponent}
    </Modal>
  );
});
AdminGlobalModal.displayName = "AdminGlobalModal";

interface UseModalStoreState {
  modalComponent: React.ReactNode;
}

export const useModalStore = create<UseModalStoreState>(() => ({
  modalComponent: null,
}));

export function openModal(component: React.ReactNode) {
  useModalStore.setState({
    modalComponent: component,
  });
}

export function closeModal() {
  useModalStore.setState({
    modalComponent: null,
  });
}
