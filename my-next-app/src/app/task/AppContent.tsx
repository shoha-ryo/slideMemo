"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { showToast } from "@/components/ui/CustomToaster";
import { getAuth } from "firebase/auth";
//todo import { useLiveQuery } from "dexie-react-hooks";
//todo import { db } from "../../../dexie/dexie";
import { motion, AnimatePresence } from "framer-motion";

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
import { DraggableLabel } from "./components/Sidebar/Label/Label";
import { LabelSidebar } from "./components/Sidebar/Label/LabelSidebar";
import { SideToolBar } from "./components/Sidebar/SaidToolMenu";

// 型設定
import { SidebarType } from "./components/Sidebar/SaidToolMenu";

// デバッグ
// import { DebugInfo } from "./components/devOnly/DebugInfo";
// import { DebugCollision } from "./components/devOnly/DebugCollision";

// 操作
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
import {
  toLocalDataBase,
  updateLocalSyncMeta,
} from "./actions/toLocalDataBase";
import { ThemeSidebar } from "./components/Sidebar/Theme/ThemeSideBar";

export default function AppContent({ projectId }: { projectId: string }) {
  const auth = getAuth();

  const { userId } = useUserStore(
    useShallow((state) => ({
      userId: state.user?.id,
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
    deleteLabel,
    deleteMasterLabel,
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
      deleteMasterLabel: state.deleteMasterLabel,
      setProjectId: state.setProjectId,
      applyDiff: state.applyDiff,
      initializeProject: state.initializeProject,
    })),
  );

  // todo まずはローカルから取得
  // const projects =
  //   useLiveQuery(async () => {
  //     if (!userId) return [];
  //     return await db.projects.where("userId").equals(userId).toArray();
  //   }, [userId]) || [];

  // 初期値取得
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      initializeProject(user.uid, projectId); // ストアのサーバー→ローカルまで一元管理
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
      (payload: {
        diffTasks: typeof emptyTasks;
        lastSyncAt: number;
        userId: string;
      }) => {
        if (payload.userId === userId) {
          showToast("success", "正常に同期されました");
        } else {
          console.log("送信：", payload.userId, "自分：", userId);
          showToast("info", "他のユーザーが更新しました");
          const { diffTasks, lastSyncAt } = payload;
          if (!userId || !projectTitle) return;
          applyDiff(diffTasks, userId);
          toLocalDataBase(diffTasks, projectId);
          updateLocalSyncMeta(lastSyncAt, projectId);
        }
      },
    );
    return () => {
      pusher.unsubscribe(`project-${projectId}`);
    };
  }, [projectId, userId, applyDiff]);

  const { isShowModal, modalType, clickedActiveId } = useModalStore();
  const { x, y } = useMousePointer();
  // サイドバー
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>(null);
  const toggleSidebar = (type: SidebarType) => {
    setActiveSidebar((prev) => (prev === type ? null : type));
  };

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
      if (activeId?.includes("label-") && !activeId?.includes("master")) {
        // カードIDの抽出も必要なのでactiveIdを渡す
        deleteLabel(currentActiveId);
      }
      if (
        activeId?.includes("label-") &&
        activeId?.includes("master") &&
        activeOriginalLabelId
      ) {
        // ラベルIDだけ必要なので純正のIDを渡す
        deleteMasterLabel(activeOriginalLabelId);
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
    const activeId = active.id.toString();

    // マウスの下にあるものをすべて取得
    const collisions = pointerWithin(args);
    if (collisions.length === 0) {
      return [];
    }

    const isActiveLabel = activeId.startsWith("label-");

    // ヒットしたものを ID の種類で仕分ける
    const cardCollisions = collisions.filter((c) => {
      const cId = c.id.toString();
      // 基本の除外（ボードやゴミ箱はカードではない）
      if (cId.startsWith("board-") || cId === "trash") return false;
      // 【重要】ラベルをドラッグ中の場合、静止している他のラベルは「透明」として扱う
      if (isActiveLabel && cId.startsWith("label-")) return false;
      return true;
    });

    const boardCollisions = collisions.filter((c) =>
      c.id.toString().startsWith("board-"),
    );

    // 【ケースA】ドラッグしているのが「ボード」の場合
    if (active.id.toString().startsWith("board-")) {
      // ボード移動中は、カードの上にいてもその「親ボード」をターゲットにする
      if (boardCollisions.length > 0) return boardCollisions;
      if (cardCollisions.length > 0) {
        const overCardId = cardCollisions[0].id.toString();
        const overCard = cards[overCardId];
        if (overCard) return [{ id: overCard.boardId }];
      }
      return collisions;
    }
    // 【ケースB】ドラッグしているのが「カード」の場合
    if (cardCollisions.length > 0) {
      // ひとつでもカードがあれば「カード」をターゲットにする
      return cardCollisions;
    }

    // カードがヒットせず、ボードだけがヒットしているならボードを返す
    return boardCollisions.length > 0 ? boardCollisions : collisions;
  };

  return (
    <div
      className="
				min-h-screen
				bg-background text-foreground
			"
    >
      <TaskHeader />
      <div
        style={{
          position: "relative",
          height: "calc(100vh - 65px)",
        }}
      >
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

          <div className="flex h-full w-full overflow-auto">
            {/* ツールバー */}
            <SideToolBar
              activeSidebar={activeSidebar}
              onToggle={toggleSidebar}
            />
            {/* 1. 外側の枠：activeSidebarが「あるかないか」で幅をアニメーションさせる */}
            <motion.div
              initial={false} // 初回レンダリング時はアニメーションさせない
              animate={{ width: activeSidebar ? 280 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10 border-r border-border/10 bg-sidebar overflow-hidden shrink-0 h-full shadow-[10px_0_10px_0] shadow-accent-foreground/20"
            >
              <div className="w-[280px]">
                {/* 2. 中身：activeSidebarの「値が変わる時」にフェードで切り替える */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSidebar} // IDが変わるたびにこれが走る
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }} // 切り替えは素早く
                    className="h-full w-full"
                  >
                    {activeSidebar === "label" && (
                      <LabelSidebar
                        activeSidebar={activeSidebar}
                        labels={labels}
                        onToggle={toggleSidebar}
                      />
                    )}
                    {activeSidebar === "theme" && (
                      <ThemeSidebar
                        activeSidebar={activeSidebar}
                        onToggle={toggleSidebar}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ボードリスト */}
            <main className="flex-1 relative overflow-x-auto">
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
          {/* <DebugInfo /> */}
          {/* <DebugCollision/> */}
        </DndContext>
      </div>
    </div>
  );
}
