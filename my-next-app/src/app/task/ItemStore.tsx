// store.js
import { create } from "zustand";
import ItemData from './data.json';

export const useItemStore = create(() => ({
  items: ItemData,
}));
