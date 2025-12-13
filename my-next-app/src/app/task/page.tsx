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

// 象限の型定義（Payloadの一部として使う文字列リテラル）
type QuadrantValue = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export default function App() {
  // ★ TaskStoreからアクションと状態を取得
  // cardsはOverlay表示判定などに使う
  const moveTask = useTaskStore(state => state.moveTask)
	const cards = useTaskStore(state => state.cards)

  const { isShowModal, clickedActiveId } = useModalStore();
  const { x, y } = useMousePointer();

  // 表示・制御用のローカルステート
  const [hoverInfo, setHoverInfo] = useState<{
    droppableId: string | null;
    activeId: string | null;
    quadrant: QuadrantValue | null;
  }>({
    droppableId: null,
    activeId: null,
    quadrant: null,
  });

  const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);

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
        setStartOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }

    setHoverInfo({
      activeId: currentActiveId,
      droppableId: null,
      quadrant: null,
    });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setHoverInfo({ 
        activeId: String(active.id), 
        droppableId: null, 
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
      droppableId: String(over.id),
      quadrant: quadrant,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const currentActiveId = String(active.id);
    const currentOverId = over ? String(over.id) : null;
    const currentQuadrant = hoverInfo.quadrant;

    // バリデーション: 必要な情報が揃っているか
    if (!currentActiveId || !currentOverId || !currentQuadrant) {
      // リセットして終了
      setActiveId(null);
      setHoverInfo({ activeId: null, droppableId: null, quadrant: null });
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
    setActiveId(null);
    setHoverInfo({
      activeId: null,
      droppableId: null,
      quadrant: null,
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {isShowModal ? <Modal key={clickedActiveId} /> : null}

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div style={{ width: "auto", margin: "20px auto" }}>

          {/* ボードリストの表示（内部でuseTaskStoreを参照している前提） */}
          <BoardList />

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
            {hoverInfo.activeId ? (
              <>
                <p>🟦 Active: <strong>{hoverInfo.activeId}</strong></p>
                <p>📍 Over: <strong>{hoverInfo.droppableId}</strong></p>
                <p>🧭 Quadrant: <strong>{hoverInfo.quadrant}</strong></p>
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