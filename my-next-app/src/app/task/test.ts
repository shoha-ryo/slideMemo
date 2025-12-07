"use client";
import { create } from "zustand";

const Test = () => {
  const useBearStore = create()((set) => ({
    bears: 0,
    increase: () => set((state) => ({ bears: state.bears + 1 })),
  }));

  // console.log(useBearStore())
};

export { Test };
