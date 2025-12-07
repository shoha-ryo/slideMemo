import { Button } from "@/components/ui/button";
import { useItemStore } from "../../store/ItemStore";
import { Item } from "@/types/item";

// BoardCreateButton: ボード追加用コンポーネント
export default function BoardCreateButton({}) {
  const { items } = useItemStore();

  const handleSubmit = () => {
    const newBoard = {
      id: `board-${Date.now()}`,
      level: 0,
      children: [],
    };
    console.log(items);
    //useItemStore.setState([...items, newBoard]);
    useItemStore.setState((prev) => ({
      ...prev,
      items: [...prev.items, newBoard],
    }));
  };

  return (
    <div className="p-2">
      <Button onClick={handleSubmit} className="rounded-2xl w-full">
        ＋ ボードを追加
      </Button>
    </div>
  );
}
