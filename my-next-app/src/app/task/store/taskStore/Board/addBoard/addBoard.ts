import { v4 as uuidv4 } from "uuid";
import {
  BoardType,
  AppState,
  TaskStore,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";
import { ReturnTasks } from "@/app/task/store/taskStore/types/TasksType";

// 新しいカードの情報を作成
function createNewBoard(title: string, projectId: string) {
  const newBoard: BoardType = {
    id: `board-${uuidv4()}`, // 一意のIDを生成
    projectId: projectId,
    title: title.trim(),
    cardIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return newBoard;
}

export function addBoardLogic(title: string, allState: TaskStore): ReturnTasks {
  const state: AppState = allState;
  const { boardOrder, boards, projectId } = allState;

  if (!title.trim() || !projectId) {
    return {
      newState: state,
      diffTasks: emptyTasks,
    };
  }

  const newBoard = createNewBoard(title, projectId);
  const newBoardOrder = [...boardOrder, newBoard.id];

  return {
    newState: {
      ...state,
      boardOrder: newBoardOrder,
      boards: {
        ...boards,
        [newBoard.id]: newBoard,
      },
    },
    diffTasks: {
      ...emptyTasks,
      createTasks: {
        ...emptyTasks.createTasks,
        boards: [newBoard],
      },
      updateTasks: {
        ...emptyTasks.updateTasks,
        boardOrder: newBoardOrder,
      },
    },
  };
}
