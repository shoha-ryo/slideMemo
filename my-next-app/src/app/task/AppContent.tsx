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

import { getInitialData } from "./actions/getTasks";
import { getDropPosition } from "./lib/getDropPosition";
import { useMousePointer } from "./components/useMousePointer";

// Store
import { useTaskStore } from "./store/taskStore/taskStore";
import { useModalStore } from "./store/ModalStore";
import { AppState, Payload } from "@/types/TasksType";
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
    cards,
    boards,
		projectTitle,
		syncStatus,
    setActiveId,
    setHoverInfo,
    moveTask,
    deleteTask,
    moveBoard,
    deleteBoard,
    setProjectId,
    setProjectTitle,
    setBoardOrder,
    setBoards,
    setCards,
		applyDiff,
		initializeProject,
  } = useTaskStore(
    useShallow((state) => ({
      activeId: state.activeId,
      overId: state.overId,
      dropPosition: state.dropPosition,
      cards: state.cards,
      boards: state.boards,
			projectTitle: state.projectTitle,
			syncStatus: state.syncStatus,
      setActiveId: state.setActiveId,
      setOverId: state.setOverId,
      setHoverInfo: state.setPayload,
      moveTask: state.moveTask,
      deleteTask: state.deleteTask,
      moveBoard: state.moveBoard,
      deleteBoard: state.deleteBoard,
      setProjectId: state.setProjectId,
      setProjectTitle: state.setProjectTitle,
      setBoardOrder: state.setBoardOrder,
      setBoards: state.setBoards,
      setCards: state.setCards,
			applyDiff: state.applyDiff,
			initializeProject: state.initializeProject,
    })),
  );

	// 初期値取得
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      initializeProject(user.uid, projectId)
			setUserId(user.uid);
			setProjectId(projectId);
    }
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
    channel.bind("task-updated", (payload: {diffTasks: typeof emptyTasks, lastSyncAt: number}) => {
      toast.info("他のユーザーがタスクを更新しました！", {});
			const { diffTasks, lastSyncAt } = payload
			if (!userId || !projectTitle) return;
			applyDiff(diffTasks, userId)
			toLocalDataBase(diffTasks, projectId, projectTitle, userId, lastSyncAt)
    });
    return () => {
      pusher.unsubscribe(`project-${projectId}`);
    };
  }, [projectId, userId, applyDiff]);


  const { isShowModal, modalType, clickedActiveId } = useModalStore();
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
    setHoverInfo({
      activeId: currentActiveId,
      overId: null,
      dropPosition: null,
    });
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

    // ドロップ先がない場合はリセットして終了
    if (!over) {
      setHoverInfo({ activeId: null, overId: null, dropPosition: null });
      return;
    }

    // ドロップ先がゴミ箱IDと一致する場合
    if (over.id === TRASH_ID) {
      // 削除アクションを実行
      if (activeId?.includes("card-")) {
        deleteTask(currentActiveId);
      } else {
        deleteBoard(currentActiveId);
      }

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

    if (activeId?.includes("card-")) moveTask(payload);
    else moveBoard(payload);

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


	// if (syncStatus === "initializing" ) return "初期化中"
	// if (syncStatus === "syncing" ) return "ロード中"
	// if (syncStatus === "synced" ) {
	// 	return "ロード完了"
	// }



  return (
		<div className="min-h-screen">
			{projectTitle
				? <TaskHeader projectTitle={projectTitle}></TaskHeader>
				: null}
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
					{/* ★ 追加: 削除エリア (DndContextの中に配置する必要があります) */}
					{/* activeIdが存在する(=ドラッグ中)ときだけスライドダウン表示 */}
					<TrashDropArea isVisible={!!activeId} />

					<div style={{ width: "auto", margin: "20px auto" }}>
						<BoardList />

						<DragOverlay>
							{activeId && cards[activeId] ? <Card cardId={activeId} /> : null}
							{activeId && boards[activeId] ? (
								<Board board={boards[activeId]}></Board>
							) : null}
						</DragOverlay>
					</div>
				</DndContext>
				<Toaster richColors />
			</div>
		</div>
  );
}
