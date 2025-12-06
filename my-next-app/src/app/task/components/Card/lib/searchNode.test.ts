// searchNode.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// 🚨 【重要】元のファイルで export されていることを前提とします
import { useSearchNode, findNodeById } from '../lib/searchNode';

import { useItemStore } from '@/app/task/store/ItemStore';
import { useModalStore } from '@/app/task/store/ModalStore';
import { Item } from '@/types/item';

// --- テストデータ ---
// Item 型の簡略化されたモック関数 (テストデータ生成用)
const createMockItem = (
  id: string,
  title: string,
  level: number,
  children: Item[] = []
): Item => ({
    id,
    title,
    level,
    details: 'test detail',
    useOverlay: false,
    children,
    startOffset: { x: 0, y: 0 }
});


const mockItems: Item[] = [
  createMockItem('root-1', 'Root 1', 1, [
    createMockItem('child-1-1', 'Child 1-1', 2, [
      createMockItem('grandchild-1-1-1', 'Grandchild', 3, [])
    ]),
    createMockItem('child-1-2', 'Child 1-2', 2, [])
  ]),
  createMockItem('root-2', 'Root 2', 1, [])
];


// ----------------------------------------------------
// 1. 純粋な関数 (findNodeById) のテスト
// ----------------------------------------------------
describe('findNodeById 検索ロジックのテスト', () => {

    it('ルートノードが見つかるべき', () => {
        const found = findNodeById('root-2', mockItems);
        expect(found?.id).toBe('root-2');
    });

    it('深くネストされたノード（孫ノード）が見つかるべき', () => {
        const found = findNodeById('grandchild-1-1-1', mockItems);
        expect(found?.id).toBe('grandchild-1-1-1');
        expect(found?.title).toBe('Grandchild');
    });

    it('存在しないIDの場合、nullを返す', () => {
        const found = findNodeById('non-existent-id', mockItems);
        expect(found).toBeNull();
    });

    it('activeIdがnullの場合、nullを返す', () => {
        const found = findNodeById(null, mockItems);
        expect(found).toBeNull();
    });
});

// ----------------------------------------------------
// 2. カスタムフック (useSearchNode) のテスト
// ----------------------------------------------------
describe('useSearchNode フックのテスト', () => {

    // 各テスト実行前にストアの状態を初期化（クリーンアップ）
    beforeEach(() => {
        // useItemStore の状態をモックデータに設定
        act(() => {
            useItemStore.setState({ items: mockItems });
        });
        // useModalStore の activeId を初期値 (null) に設定
        act(() => {
            // モーダルストアの初期化に必要な全ての状態を含めます
            useModalStore.setState({ activeId: null, isShowModal: false });
        });
    });

    it('activeIdがnullの場合、nullを返す', () => {
        const { result } = renderHook(() => useSearchNode());
        expect(result.current).toBeNull();
    });

    it('activeIdが設定されている場合、ルートノードが見つかるべき', () => {
        const { result } = renderHook(() => useSearchNode());

        act(() => {
            useModalStore.setState({ activeId: 'root-2' });
        });

        expect(result.current?.id).toBe('root-2');
        expect(result.current?.title).toBe('Root 2');
    });

    it('アイテムストアが変更されたとき、結果が更新されるべき', () => {
        const { result } = renderHook(() => useSearchNode());

        // 1. activeId を 'new-node-id' に設定 (まだストアに存在しない)
        act(() => {
            useModalStore.setState({ activeId: 'new-node-id' });
        });
        expect(result.current).toBeNull()

        // 2. アイテムストアを更新し、新しいノードを追加
        const newItem = createMockItem('new-node-id', 'New Task', 1);
        const updatedItems = [...mockItems, newItem];

        act(() => {
            useItemStore.setState({ items: updatedItems });
        });

        // 3. useSearchNode の結果が新しいノードに更新されることを確認
        expect(result.current?.id).toBe('new-node-id');
        expect(result.current?.title).toBe('New Task');
    });
});