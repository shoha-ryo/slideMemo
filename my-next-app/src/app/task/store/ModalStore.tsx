import { create } from "zustand";

type ModalType = "card" | "board";
export interface ModalStore {
  isShowModal: boolean;
  modalType: ModalType | null;
  clickedActiveId: string | null;
  showModal: (id: string, type: ModalType) => void;
  hideModal: () => void;
}

export const useModalStore = create<ModalStore>()((set) => ({
  isShowModal: false,
  modalType: null,
  clickedActiveId: null,

  // idからノードを取得してモーダルを表示する
  showModal: (id, type) =>
    set(() => ({
      isShowModal: true,
      clickedActiveId: id,
      modalType: type,
    })),

  // モーダルを非表示にする
  hideModal: () =>
    set(() => ({
      isShowModal: false,
      clickedActiveId: null,
      modalType: null,
    })),
}));
