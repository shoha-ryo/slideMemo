"use client";

import { useEffect, useRef } from "react";
import { useTaskStore } from "./taskStore";
import { TaskStore } from "@/types/task";

export default function TaskStoreInitializer(props: { 
  boardOrder: string[]; 
  boards: any; 
  cards: any 
}) {
  const initialized = useRef(false);

  if (!initialized.current) {
    // 最初のレンダリング時に一度だけストアを更新
    useTaskStore.getState().initState(props);
    initialized.current = true;
  }

  return null;
}