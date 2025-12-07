import { create } from "zustand";

interface ModalStore {
  isShowModal: boolean;
  clickedActiveId: string | null;
  showModal: (id: string) => void;
  hideModal: () => void;
}

export const useModalStore = create<ModalStore>()((set) => ({
  isShowModal: false,
  clickedActiveId: null,

  // idからノードを取得してモーダルを表示する
  showModal: (id) =>
    set(() => ({
      isShowModal: true,
      clickedActiveId: id,
    })),

  // モーダルを非表示にする
  hideModal: () =>
    set(() => ({
      isShowModal: false,
      clickedActiveId: null,
    })),
}));
