"use client";

import React from "react"; // useState削除 (Store管理のため不要なら)
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  useSensor,
  useSensors,
  MouseSensor,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
} from "@dnd-kit/core";

// 必要なコンポーネント
import { getDropPosition } from "./lib/getDropPosition";
import { useMousePointer } from "./components/useMousePointer";
import Modal from "./components/Card/Modal";
import BoardList from "./components/Board/BoardList";
import Card from "./components/Card/Card";
import TrashDropArea, { TRASH_ID } from "./components/TrashArea/TrashDropArea"; // ★ 追加

// Store
import { useTaskStore } from "./store/taskStore/taskStore";
import { useModalStore } from "./store/ModalStore";
import { Payload } from "@/types/task";
import { useShallow } from "zustand/shallow";

export default function App() {
  // ★ deleteTask アクションを追加取得
  const { 
    activeId, overId, dropPosition, cards, setActiveId, setHoverInfo, 
    moveTask, deleteTask 
  } = useTaskStore(
    useShallow((state) => ({
      activeId: state.activeId,
      overId: state.overId,
      dropPosition: state.dropPosition,
      cards: state.cards,
      boards: state.boards,
      setActiveId: state.setActiveId,
      setOverId: state.setOverId,
      setHoverInfo: state.setPayload,
      moveTask: state.moveTask,
      deleteTask: state.deleteTask,
    }))
  );

  const { isShowModal } = useModalStore();
  const { x, y } = useMousePointer();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
      tolerance: 1000,
    },
  });
  const sensors = useSensors(mouseSensor);

  // --- ハンドラー ---

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const currentActiveId = String(active.id);
    setActiveId(currentActiveId);
    setHoverInfo({ activeId: currentActiveId, overId: null, dropPosition: null });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setHoverInfo({ activeId: String(active.id), overId: null, dropPosition: null });
      return;
    }

    // ★ 追加: ゴミ箱の上にいる場合は象限計算などは不要なのでスキップ
    if (over.id === TRASH_ID) {
      setHoverInfo({ 
        activeId: String(active.id), 
        overId: TRASH_ID, // Store状のoverIdをゴミ箱IDにする
        dropPosition: null 
      });
      return;
    }

    const e = event.activatorEvent;
    if (!(e instanceof MouseEvent)) return;

    const pointer = { x: x, y: y };
    const dropPosition = getDropPosition(pointer, over.rect);

    setHoverInfo({
      activeId: String(active.id),
      overId: String(over.id),
      dropPosition: dropPosition,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const currentActiveId = String(active.id);
    
    // ドロップ先がない場合はリセットして終了
    if (!over) {
      setHoverInfo({ activeId: null, overId: null, dropPosition: null });
      return;
    }

    // ドロップ先がゴミ箱IDと一致する場合
    if (over.id === TRASH_ID) {
      // 削除アクションを実行
      deleteTask(currentActiveId);
      // 状態リセットして早期リターン (moveTaskを実行させない)
      setHoverInfo({ activeId: null, overId: null, dropPosition: null });
      return;
    }

    // --- 以下、通常の移動ロジック ---
    const currentOverId = String(over.id);
    const currentDropPosition = dropPosition;

    if (!currentActiveId || !currentOverId || !currentDropPosition) {
      setHoverInfo({ activeId: null, overId: null, dropPosition: null });
      return;
    }

    const payload: Payload = {
      activeId: currentActiveId,
      overId: currentOverId,
      dropPosition: currentDropPosition,
    };

    moveTask(payload);

    setHoverInfo({
      activeId: null,
      overId: null,
      dropPosition: null,
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {isShowModal ? <Modal /> : null}

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        {/* ★ 追加: 削除エリア (DndContextの中に配置する必要があります) */}
        {/* activeIdが存在する(=ドラッグ中)ときだけスライドダウン表示 */}
        <TrashDropArea isVisible={!!activeId} />

        <div style={{ width: "auto", margin: "20px auto" }}>
          <BoardList />

          <DragOverlay>
            {activeId && cards[activeId] ? (
              <Card cardId={activeId} />
            ) : null}
          </DragOverlay>

          {/* デバッグ表示 */}
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "#fafafa",
              textAlign: "center",
              fontSize: "0.9rem",
            }}
          >
            {activeId ? (
              <>
                <p>🟦 Active: <strong>{activeId}</strong></p>
                <p>📍 Over: <strong>{overId === TRASH_ID ? "🗑️ ゴミ箱" : overId}</strong></p>
                <p>🧭 dropPosition: <strong>{dropPosition}</strong></p>
              </>
            ) : (
              <p style={{ color: "#888" }}>ドラッグして移動を開始してください</p>
            )}
          </div>
        </div>
      </DndContext>
    </div>
  );
}