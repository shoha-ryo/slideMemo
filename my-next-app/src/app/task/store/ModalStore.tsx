import { create } from "zustand";

interface ModalStore {
  isShowModal: boolean;
  activeId: string | null;
  showModal: (id: string) => void;
  hideModal: () => void;
}

export const useModalStore = create<ModalStore>()((set) => ({
  isShowModal: false,
  activeId: null,

  // idからノードを取得してモーダルを表示する
  showModal: (id) =>
    set((state) => ({
      isShowModal: true,
      activeId: id,
    })),

  // モーダルを非表示にする
  hideModal: () =>
    set(() => ({
      isShowModal: false,
      activeId: null,
    })),
}));
