"Card.tsx"
"use client";

import { useEffect, useState } from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { useModalStore } from "../../store/ModalStore";
import FormattedText from "./FormattedText";
import { useTaskStore } from "../../store/taskStore/taskStore";
import DroppedActionsInfo from "./DroppedActionsInfo";
import { useShallow } from "zustand/shallow";
import CardCreateButton from "./CardCreateButton";

// Draggable/Droppable コンポーネント
const Card = ({ cardId }: { cardId: string }) => {

	const [isNew, setIsNew] = useState(true); // 初期表示時はtrue

  // マウントから一定時間後にアニメーションフラグを落とす
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNew(false);
    }, 1500); // アニメーション時間と合わせる
    return () => clearTimeout(timer);
  }, []);

	const {
		isDragging,
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({
    id: cardId,
    data: {
      quadrant: null,
    },
  });

	const { isOver, setNodeRef: setDroppableRef } = useDroppable({
		id: cardId, // Draggableと同じIDを使用
    data: {
			quadrant: null,
    },
  });

	const {activeId, overId, cards} = useTaskStore(
		useShallow(state => ({
			activeId: state.activeId,
			overId: state.overId,
			cards: state.cards
		}))
	)
	const card = cards[cardId];


  const { active, over } = useDndContext();
	const [showInfo, setShowInfo] = useState(false)

  const isActive = active?.id === cardId;
  const quadrant = over?.id === cardId ? over?.data?.current?.quadrant : null;
	const isSameId = activeId === overId




  // --- スタイリングとネストレベルの決定 ---
  const draggableStyle = isDragging
    ? {
        outline: "2px solid #00bcd4",
        cursor: "grabbing",
      } : {
        opacity: isActive ? 0.2 : 1,
        cursor: isActive ? "grabbing" : "grab",
      };

  // DraggableとDroppableのrefを両方設定
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  // クリックされた時にモーダルを呼び出す
  const { showModal } = useModalStore();
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 回帰されていても最前面の1回しかイベントを呼び出さないようにする
    showModal(cardId);
  };

	// // Infoの表示を遅延させてチラつき防止
	// useEffect(() => {
	// 	let timer: NodeJS.Timeout;
	// 	// 「同じIDではない」かつ「ホバー中」の場合のみタイマー開始
	// 	if (!isSameId && isOver) {
	// 		// 30 ms 後に表示を許可する
	// 		timer = setTimeout(() => {
	// 			setShowInfo(true);
	// 		}, 30);
	// 	} else {
	// 		// それ以外（ホバー外れた、または同じIDになった）なら即座に非表示
	// 		setShowInfo(false);
	// 	}

	// 	// クリーンアップ関数（連打された時などに前のタイマーを消す）
	// 	return () => {
	// 		if (timer) clearTimeout(timer);
	// 	};
	// }, [isSameId, isOver, !!card]); // 監視対象



	// カード削除後の再レンダリング防止
	if (!card) {
		return null;
	}



  return (
    <div
      ref={setNodeRef} // 両方のrefを設定
      style={{
        padding: "10px",
        paddingLeft: `$10px`,
        border: "1px solid #ccc",
        borderRadius: "10px",
        transition: "background-color 0.2s, outline 0.2s",
        position: "relative", // transformがなくても常にrelative固定
        ...draggableStyle,
				marginBottom: "5px",
				marginLeft: "10px",
      }}
      className={`card ${isOver ? `q-${quadrant}` : ""} ${isNew ? 'animate-highlight' : ''} bg-white`}
      {...listeners} // ドラッグイベントのリスナー
      {...attributes} // アクセシビリティ属性
      onClick={handleCardClick}
    >
			{/* 表示アシスト */}
				{/* ホバーされた時だけ点線で３分割の表示 */}
				{showInfo && (
					a
				)}

			{/* カードの内容を表示 */}
      <div 
				style={{ paddingLeft: `10px` }}
				className="flex justify-between"
			>
        {/* 文字用エリア */}
				<div>
					<strong>
						<FormattedText text={card.title}/>
					</strong>
					<div>{card.id}</div>
					<FormattedText
						text={card.details}
						style={{ fontSize: "0.8em", color: "#666" }}
					/>
				</div>
				{/* ユーティリティ用エリア ホバー時のみ表示 */}
				<div onClick={(e) => e.stopPropagation()}>
					<CardCreateButton source={{ type: "card", data: card}}/>
				</div>
      </div>

			{/* カードの子孫を表示 */}
      {card.childrenIds.length > 0 && (
        <div>
					<div className="h-3"></div>
          {card.childrenIds.map((childId) => (
            <Card key={childId} cardId={childId} />
          ))}
					<div className="h-3"></div>
        </div>
      )}
    </div>
  );
};

export default Card;
