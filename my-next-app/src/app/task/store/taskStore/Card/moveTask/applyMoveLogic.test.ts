// import { describe, it, expect } from "vitest";
// import { applyMoveLogic } from "./applyMoveLogic";
// import {
//   AppState,
//   Payload,
//   CardType,
//   BoardType,
// } from "@/app/task/store/taskStore/types/TasksType";

// describe("applyMoveLogic - 全パターン網羅テスト", () => {
//   const createInitialState = (): AppState => ({
//     boardOrder: ["board-1", "board-2"],
//     boards: {
//       "board-1": {
//         id: "board-1",
//         cardIds: ["card-root-1", "card-root-2"],
//       } as unknown as BoardType,
//       "board-2": { id: "board-2", cardIds: [] } as unknown as BoardType,
//     },
//     cards: {
//       "card-root-1": {
//         id: "card-root-1",
//         parentId: null,
//         boardId: "board-1",
//         childrenIds: ["card-child-1"],
//         title: "R1",
//       } as unknown as CardType,
//       "card-child-1": {
//         id: "card-child-1",
//         parentId: "card-root-1",
//         boardId: "board-1",
//         childrenIds: [],
//         title: "C1",
//       } as unknown as CardType,
//       "card-root-2": {
//         id: "card-root-2",
//         parentId: null,
//         boardId: "board-1",
//         childrenIds: [],
//         title: "R2",
//       } as unknown as CardType,
//     },
//   });

//   // 整合性チェック用ヘルパー：移動後のカードが「どこか1箇所にだけ存在し、親子関係が正しいか」を確認
//   const verifyIntegrity = (state: AppState, cardId: string) => {
//     const card = state.cards[cardId];
//     const parentId = card.parentId;

//     if (parentId) {
//       // 親がいる場合、その親の childrenIds に自分だけが含まれているか
//       const parent = state.cards[parentId];
//       const count = parent.childrenIds.filter((id) => id === cardId).length;
//       expect(
//         count,
//         `Card ${cardId} should exist exactly once in parent ${parentId}`,
//       ).toBe(1);
//     } else {
//       // 親がいない場合、ボードの cardIds に自分だけが含まれているか
//       const board = state.boards[card.boardId];
//       const count = board.cardIds.filter((id) => id === cardId).length;
//       expect(
//         count,
//         `Card ${cardId} should exist exactly once in board ${card.boardId}`,
//       ).toBe(1);
//     }
//   };

//   describe("1. 基本のネスト・フラット化パターン", () => {
//     it("ルートカードを別のルートカードの中にネストできる (Root -> Child)", () => {
//       const state = createInitialState();
//       const payload: Payload = {
//         activeId: "card-root-2",
//         overId: "card-root-1",
//         dropPosition: "center",
//       };
//       const { newState } = applyMoveLogic(payload, state);

//       expect(newState.cards["card-root-2"].parentId).toBe("card-root-1");
//       expect(newState.cards["card-root-1"].childrenIds).toContain(
//         "card-root-2",
//       );
//       verifyIntegrity(newState, "card-root-2");
//     });

//     it("子カードをルートに引き上げることができる (Child -> Root)", () => {
//       const state = createInitialState();
//       const payload: Payload = {
//         activeId: "card-child-1",
//         overId: "board-1",
//         dropPosition: null,
//       };
//       const { newState } = applyMoveLogic(payload, state);

//       expect(newState.cards["card-child-1"].parentId).toBeNull();
//       expect(newState.boards["board-1"].cardIds).toContain("card-child-1");
//       expect(newState.cards["card-root-1"].childrenIds).not.toContain(
//         "card-child-1",
//       );
//       verifyIntegrity(newState, "card-child-1");
//     });
//   });

//   describe("2. 並び替え(Reorder)パターン", () => {
//     it("ルートレベルでカードの前後を入れ替えられる (top)", () => {
//       const state = createInitialState();
//       const payload: Payload = {
//         activeId: "card-root-2",
//         overId: "card-root-1",
//         dropPosition: "top",
//       };
//       const { newState } = applyMoveLogic(payload, state);

//       expect(newState.boards["board-1"].cardIds).toEqual([
//         "card-root-2",
//         "card-root-1",
//       ]);
//       verifyIntegrity(newState, "card-root-2");
//     });

//     it("異なる親を持つ子カード同士で並び替えができる (Cross-Parent Reorder)", () => {
//       const state = createInitialState();
//       // 準備: card-root-2 に子を作る
//       state.cards["card-root-2"].childrenIds = ["card-child-2"];
//       state.cards["card-child-2"] = {
//         id: "card-child-2",
//         parentId: "card-root-2",
//         boardId: "board-1",
//         childrenIds: [],
//       } as unknown as CardType;

//       const payload: Payload = {
//         activeId: "card-child-1",
//         overId: "card-child-2",
//         dropPosition: "bottom",
//       };
//       const { newState } = applyMoveLogic(payload, state);

//       expect(newState.cards["card-child-1"].parentId).toBe("card-root-2");
//       expect(newState.cards["card-root-2"].childrenIds).toEqual([
//         "card-child-2",
//         "card-child-1",
//       ]);
//       expect(newState.cards["card-root-1"].childrenIds).toHaveLength(0);
//       verifyIntegrity(newState, "card-child-1");
//     });
//   });

//   describe("3. ボード跨ぎパターン", () => {
//     it("子カードを別ボードのルートへ直接移動できる", () => {
//       const state = createInitialState();
//       const payload: Payload = {
//         activeId: "card-child-1",
//         overId: "board-2",
//         dropPosition: "center",
//       };
//       const { newState } = applyMoveLogic(payload, state);

//       expect(newState.cards["card-child-1"].boardId).toBe("board-2");
//       expect(newState.boards["board-2"].cardIds).toContain("card-child-1");
//       verifyIntegrity(newState, "card-child-1");
//     });
//   });

//   describe("4. 異常系・エッジケース", () => {
//     it("自分自身へのドロップは何もしない", () => {
//       const state = createInitialState();
//       const payload: Payload = {
//         activeId: "card-root-1",
//         overId: "card-root-1",
//         dropPosition: "center",
//       };
//       const { newState } = applyMoveLogic(payload, state);
//       expect(newState).toEqual(state);
//     });

//     it("無効なID(存在しないID)への移動は状態を維持する", () => {
//       const state = createInitialState();
//       const payload: Payload = {
//         activeId: "card-root-1",
//         overId: "non-existent",
//         dropPosition: "center",
//       };
//       // isOverBoard が false になり cards["non-existent"] が undefined なのでエラー回避が必要
//       // ロジック側で防御されている前提
//       const { newState } = applyMoveLogic(payload, state);
//       expect(newState).toEqual(state);
//     });
//   });
// });
