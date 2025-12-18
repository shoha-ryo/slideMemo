"use client";

import React, { useState } from "react";
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

// 必要なコンポーネントとライブラリ
import { getQuadrant } from "./lib/quadrantCollisionDetection";
import { useMousePointer } from "./components/useMousePointer";
import Modal from "./components/Card/Modal";
import BoardList from "./components/Board/BoardList";
import Card from "./components/Card/Card";

// ★ Storeと型のインポート変更
import { useTaskStore } from "./store/taskStore/taskStore"; // パスは環境に合わせてください
import { useModalStore } from "./store/ModalStore";
import { Payload } from "@/types/task"; // または types/task
import { useShallow } from "zustand/shallow";

// 象限の型定義（Payloadの一部として使う文字列リテラル）
type QuadrantValue = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export default function App() {
  // ★ TaskStoreからアクションと状態を取得
  // cardsはOverlay表示判定などに使う
  const moveTask = useTaskStore(state => state.moveTask)
	// const cards = useTaskStore(state => state.cards) // ボードも必要そうだが？
	// const setActiveId = useTaskStore(state => state.setActiveId)
	const {activeId, overId, quadrant, cards, boards, setActiveId, setHoverInfo} = useTaskStore(
		useShallow((state) =>
		({
			activeId: state.activeId,
			overId: state.overId,
			quadrant: state.quadrant,
			cards: state.cards,
			boards: state.boards,
			setActiveId: state.setActiveId,
			setOverId: state.setOverId,
			setHoverInfo: state.setPayload
		})
	))

  const { isShowModal, clickedActiveId } = useModalStore();
  const { x, y } = useMousePointer();

  // センサー設定
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5, // 5px以内のわずかな移動は無視
			tolerance: 1000,
    },
  });
  const sensors = useSensors(mouseSensor);

  // --- ハンドラー ---

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const currentActiveId = String(active.id);
    setActiveId(currentActiveId);

    // オフセット計算（マウス位置と要素位置のズレ補正）
    const e = event.activatorEvent;
    if (e instanceof MouseEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cardEl = el?.closest(".card");
      const rect = cardEl?.getBoundingClientRect();
      if (rect) {

      }
    }

    setHoverInfo({
      activeId: currentActiveId,
      overId: null,
      quadrant: null,
    });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setHoverInfo({ 
        activeId: String(active.id), 
        overId: null, 
        quadrant: null 
      });
      return;
    }

    // マウスイベント以外（キーボード等）の場合は象限判定をスキップなどのガードが必要なら追加
    const e = event.activatorEvent;
    if (!(e instanceof MouseEvent)) return;

    // 動的に象限を判定
    const pointer = { x: x, y: y };
    // getQuadrantは "topLeft" | "topRight" ... を返すと仮定
    const quadrant = getQuadrant(pointer, over.rect) as QuadrantValue;

    setHoverInfo({
      activeId: String(active.id),
      overId: String(over.id),
      quadrant: quadrant,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const currentActiveId = String(active.id);
    const currentOverId = over ? String(over.id) : null;
    const currentQuadrant = quadrant;

    // バリデーション: 必要な情報が揃っているか
    if (!currentActiveId || !currentOverId || !currentQuadrant) {
      // リセットして終了
      setHoverInfo({ activeId: null, overId: null, quadrant: null });
      return;
    }

    // ★ moveTask アクションの実行
    const payload: Payload = {
      activeId: currentActiveId,
      overId: currentOverId,
      quadrant: currentQuadrant,
    };

    moveTask(payload);

    // 状態リセット
    setHoverInfo({
      activeId: null,
      overId: null,
      quadrant: null,
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {isShowModal ? <Modal/> : null}

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div style={{ width: "auto", margin: "20px auto" }}>

          {/* ボードリストの表示（内部でuseTaskStoreを参照している前提） */}
          <BoardList/>

          {/* DragOverlay: ドラッグ中のアイテム表示 */}
          <DragOverlay>
            {activeId && cards[activeId] ? (
              // CardコンポーネントがIDを受け取って自己描画する設計の場合
              <Card cardId={activeId} />
            ) : null}
          </DragOverlay>

          {/* デバッグ用: 衝突状況の表示領域 */}
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "#fafafa",
              textAlign: "center",
              fontSize: "0.9rem"
            }}
          >
            {activeId ? (
              <>
                <p>🟦 Active: <strong>{activeId}</strong></p>
                <p>📍 Over: <strong>{overId}</strong></p>
                <p>🧭 Quadrant: <strong>{quadrant}</strong></p>
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