// store.js
import { create } from "zustand";
import ItemData from "../data.json";
import { Item } from "@/types/item";

interface ItemStore {
  items: Item[];
  setItems: (items: Item[]) => void;
}

export const useItemStore = create<ItemStore>((set) => ({
  items: ItemData as Item[],
  setItems: (items) => set({ items }),
}));
