// import { describe, it, expect } from "vitest";
// import { moveBoardLogic } from "./moveBoard"; // パスは適宜調整してください
// import {
//   AppState,
//   Payload,
//   CardType,
// } from "@/app/task/store/taskStore/types/TasksType";
// import { emptyTasks } from "@/app/task/actions/emptyTasks";

// describe("moveBoardLogic", () => {
//   const mockInitialState: AppState = {
//     boardOrder: ["board-1", "board-2", "board-3"],
//     boards: {
//       "board-1": {
//         id: "board-1",
//         title: "B1",
//         cardIds: ["card-1"],
//         projectId: "p1",
//       },
//       "board-2": { id: "board-2", title: "B2", cardIds: [], projectId: "p1" },
//       "board-3": { id: "board-3", title: "B3", cardIds: [], projectId: "p1" },
//     },
//     cards: {
//       "card-1": { id: "card-1", boardId: "board-1" } as unknown as CardType,
//     },
//   };

//   it("ボードを別のボードの位置へ正しく移動できること (1を3の位置へ)", () => {
//     const payload: Payload = {
//       activeId: "board-1",
//       overId: "board-3",
//       dropPosition: null,
//     };
//     const result = moveBoardLogic(payload, mockInitialState);

//     // [B1, B2, B3] -> [B2, B3, B1] になるはず
//     const expectedOrder = ["board-2", "board-3", "board-1"];

//     expect(result.newState.boardOrder).toEqual(expectedOrder);
//     expect(result.diffTasks.updateTasks.boardOrder).toEqual(expectedOrder);
//   });

//   it("ボードをカードの上にドロップしたとき、そのカードの所属ボードをターゲットにすること", () => {
//     // board-3 を card-1（board-1に所属）の上にドロップ
//     const payload: Payload = {
//       activeId: "board-3",
//       overId: "card-1",
//       dropPosition: null,
//     };
//     const result = moveBoardLogic(payload, mockInitialState);

//     // board-3 が board-1 の位置（インデックス0）に来るはず
//     // [B1, B2, B3] -> [B3, B1, B2]
//     const expectedOrder = ["board-3", "board-1", "board-2"];

//     expect(result.newState.boardOrder).toEqual(expectedOrder);
//     expect(result.newState.boardOrder[0]).toBe("board-3");
//   });

//   it("移動元と移動先が同じ場合は、何もしないこと", () => {
//     const payload: Payload = {
//       activeId: "board-1",
//       overId: "board-1",
//       dropPosition: null,
//     };
//     const result = moveBoardLogic(payload, mockInitialState);

//     expect(result.newState).toEqual(mockInitialState);
//     expect(result.diffTasks).toEqual(emptyTasks);
//   });

//   it("存在しないIDが含まれる場合、何もしないこと", () => {
//     const payload: Payload = {
//       activeId: "board-1",
//       overId: "ghost-board",
//       dropPosition: null,
//     };
//     const result = moveBoardLogic(payload, mockInitialState);

//     expect(result.newState).toEqual(mockInitialState);
//     expect(result.diffTasks).toEqual(emptyTasks);
//   });
// });
