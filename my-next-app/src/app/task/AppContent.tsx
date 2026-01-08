"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { toast, Toaster } from "sonner";
import { getAuth } from "firebase/auth";

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
  CollisionDetection,
} from "@dnd-kit/core";

// 必要なコンポーネント
import TaskHeader from "../header/TaskHeader";
import Card from "./components/Card/Card";
import CardModal from "./components/Card/CardModal";
import Board from "./components/Board/Board";
import BoardList from "./components/Board/BoardList";
import BoardModal from "./components/Board/BoardModal";
import TrashDropArea, { TRASH_ID } from "./components/TrashArea/TrashDropArea"; // ★ 追加
import { DraggableLabel } from "./components/Label/Label";
import { LabelSidebar } from "./components/Sidebar/LabelSidebar";

import { DebugInfo } from "./components/devOnly/DebugInfo";

import { handleGlobalKeyDown } from "./actions/handler";
import { getDropPosition } from "./lib/getDropPosition";
import { useMousePointer } from "./components/useMousePointer";

// Store
import { useTaskStore } from "./store/taskStore/taskStore";
import { useModalStore } from "./store/ModalStore";
import { Payload } from "@/app/task/store/taskStore/types/TasksType";
import { useShallow } from "zustand/shallow";
import { useUserStore } from "../../store/userStore";
import { emptyTasks } from "./actions/emptyTasks";
import { toLocalDataBase } from "./actions/toLocalDataBase";

export default function AppContent({ projectId }: { projectId: string }) {
  const auth = getAuth();

  const { userId, setUserId } = useUserStore(
    useShallow((state) => ({
      userId: state.userId,
      setUserId: state.setUserId,
    })),
  );

  const {
    activeId,
    overId,
    dropPosition,
    activeOriginalLabelId,
    cards,
    boards,
    labels,
    projectTitle,
    setActiveId,
    setHoverInfo,
    moveTask,
    moveBoard,
    deleteTask,
    deleteBoard,
    setProjectId,
    applyDiff,
    initializeProject,
    moveLabel,
		deleteLabel
  } = useTaskStore(
    useShallow((state) => ({
      activeId: state.activeId,
      overId: state.overId,
      dropPosition: state.dropPosition,
      activeOriginalLabelId: state.activeOriginalLabelId,
      cards: state.cards,
      boards: state.boards,
      labels: state.labels,
      projectTitle: state.projectTitle,
      setActiveId: state.setActiveId,
      setHoverInfo: state.setPayload,
      moveTask: state.moveTask,
      moveBoard: state.moveBoard,
      moveLabel: state.moveLabel,
      deleteTask: state.deleteTask,
      deleteBoard: state.deleteBoard,
			deleteLabel: state.deleteLabel,
      setProjectId: state.setProjectId,
      applyDiff: state.applyDiff,
      initializeProject: state.initializeProject,
    })),
  );

  // 初期値取得
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      initializeProject(user.uid, projectId);
      setUserId(user.uid);
      setProjectId(projectId);
    }

    // キーイベントの設定と解除
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [auth]);

  // DB更新時の処理
  useEffect(() => {
    // Pusherの接続設定
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    // チャンネルを購読
    const channel = pusher.subscribe(`project-${projectId}`);
    // "task-updated" という叫び声が聞こえたら実行
    channel.bind(
      "task-updated",
      (payload: { diffTasks: typeof emptyTasks; lastSyncAt: number }) => {
        toast.info("他のユーザーがタスクを更新しました！", {});
        const { diffTasks, lastSyncAt } = payload;
        if (!userId || !projectTitle) return;
        applyDiff(diffTasks, userId);
        toLocalDataBase(diffTasks, projectId, projectTitle, userId, lastSyncAt);
      },
    );
    return () => {
      pusher.unsubscribe(`project-${projectId}`);
    };
  }, [projectId, userId, applyDiff]);

  const { isShowModal, modalType, clickedActiveId } = useModalStore();
  const { x, y } = useMousePointer();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    setHoverInfo({
      activeId: currentActiveId,
      overId: null,
      dropPosition: null,
    });
    if (currentActiveId?.includes("label-")) {
      useTaskStore.setState({
        activeOriginalLabelId: currentActiveId.split("_")[0],
      });
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;

    if (!over) {
      setHoverInfo({
        activeId: String(active.id),
        overId: null,
        dropPosition: null,
      });
      return;
    }
    // ★ 追加: ゴミ箱の上にいる場合は象限計算などは不要なのでスキップ
    if (over.id === TRASH_ID) {
      setHoverInfo({
        activeId: String(active.id),
        overId: TRASH_ID, // Store状のoverIdをゴミ箱IDにする
        dropPosition: null,
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

    // ラベルID保持をクリア
    if (currentActiveId?.includes("label-")) {
      useTaskStore.setState({
        activeOriginalLabelId: null,
      });
    }
    // ドロップ先がない場合はリセットして終了
    if (!over) {
      setHoverInfo({ activeId: null, overId: null, dropPosition: null });
      return;
    }

    // ゴミ箱ロジック
    if (over.id === TRASH_ID) {
          if (activeId?.includes("card-")) {
      deleteTask(currentActiveId);
    }
    if (activeId?.includes("board-")) {
      deleteBoard(currentActiveId);
    }
    if (activeId?.includes("label")) {
      deleteLabel(currentActiveId);
    }

      // 状態リセットして早期リターン (移動ロジックを実行させない)
      setHoverInfo({ activeId: null, overId: null, dropPosition: null });
      return;
    }

    // 移動ロジック
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
    if (activeId?.includes("card-")) {
      moveTask(payload);
    }
    if (activeId?.includes("board-")) {
      moveBoard(payload);
    }
    if (activeId?.includes("label") && overId?.includes("card")) {
      moveLabel(payload);
    }

		// リセット処理
    setHoverInfo({
      activeId: null,
      overId: null,
      dropPosition: null,
    });
  };

  const customCollisionDetection: CollisionDetection = (args) => {
    const { active } = args;

    // 1. まずは標準の判定（ポインタの下にある要素を探す）を行う
    const pointerCollisions = pointerWithin(args);

    // 衝突がない、またはドラッグしているのが「ボード」ではない場合は、標準の結果を返す
    if (
      pointerCollisions.length === 0 ||
      !active.id.toString().startsWith("board-")
    ) {
      return pointerCollisions;
    }

    // 2. ドラッグ中の要素が「ボード」の場合の特別処理
    const overId = pointerCollisions[0].id.toString();

    // もしマウスの下にあるのが「ボード」なら、そのまま返す
    if (overId.startsWith("board-")) {
      return pointerCollisions;
    }

    // もしマウスの下にあるのが「カード」なら、「親ボード」を見つけて返す
    const overCard = cards[overId];
    if (overCard) {
      // ここが魔法の処理：ヒットした対象を「親ボード」にすり替える
      return [{ id: overCard.boardId }];
    }

    // それ以外（念のため）
    return pointerCollisions;
  };

  return (
    <div className="min-h-screen">
      <TaskHeader />
      <div style={{ position: "relative" }}>
        {isShowModal && (
          <>
            {modalType === "card" && <CardModal key={clickedActiveId} />}
            {modalType === "board" && <BoardModal key={clickedActiveId} />}
          </>
        )}

        <DndContext
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          {/* ゴミ箱エリア */}
          <TrashDropArea isVisible={!!activeId} />

          <div
            className="flex h-full w-full overflow-auto overflow-y-hidden"
            style={{ height: "calc(100vh - 65px)" }}
          >
            {/* サイドバーが閉じている時だけ「ラベル」ボタンを表示する */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed top-20 left-4 z-30 p-2 bg-gray-800 rounded-md hover:bg-gray-700 text-white border border-white/10"
              >
                ラベルを表示
              </button>
            )}
            {/* サイドバー本体 */}
            <LabelSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              labels={labels}
            />

            <main className="flex-1 relative overflow-x-auto overflow-y-hidden">
              {/* ボードリスト */}
              <BoardList />
            </main>

            {/* オーバーレイ */}
            <DragOverlay>
              {activeId && cards[activeId] ? <Card cardId={activeId} /> : null}
              {activeId && boards[activeId] ? (
                <Board board={boards[activeId]}></Board>
              ) : null}
              {activeOriginalLabelId && labels[activeOriginalLabelId] ? (
                <DraggableLabel
                  label={labels[activeOriginalLabelId]}
                  cardId="overlay"
                ></DraggableLabel>
              ) : null}
            </DragOverlay>
          </div>

          {/* デバッグ情報 */}
          <DebugInfo />
        </DndContext>
        <Toaster richColors />
      </div>
    </div>
  );
}
