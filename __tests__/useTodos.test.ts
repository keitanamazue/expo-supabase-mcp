import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '@/hooks/useTodos';
import { supabase } from '@/lib/supabase';

// Supabaseクライアントをモック
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(),
    },
}));

describe('useTodos', () => {
    const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
    };

    const mockTodo = {
        id: 'test-todo-id',
        user_id: 'test-user-id',
        title: 'テストTodo',
        description: null,
        completed: false,
        priority: 'medium',
        category: 'other',
        due_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: mockUser },
        });
    });

    describe('addTodo', () => {
        it('基本的なTodoを追加できる', async () => {
            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockTodo,
                        error: null,
                    }),
                }),
            });

            const mockQuery = {
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: [],
                            error: null,
                        }),
                    }),
                }),
            };

            (supabase.from as jest.Mock).mockImplementation((table) => {
                if (table === 'todos') {
                    return {
                        select: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue({
                                data: [],
                                error: null,
                            }),
                        }),
                        insert: mockInsert,
                    };
                }
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.addTodo('テストTodo');
            });

            expect(mockInsert).toHaveBeenCalledWith([
                expect.objectContaining({
                    title: 'テストTodo',
                    completed: false,
                    priority: 'medium',
                    category: 'other',
                    user_id: 'test-user-id',
                }),
            ]);

            await waitFor(() => {
                expect(result.current.todos).toHaveLength(1);
                expect(result.current.todos[0].title).toBe('テストTodo');
            });
        });

        it('説明、優先度、カテゴリ、期限を含むTodoを追加できる', async () => {
            const mockTodoWithDetails = {
                ...mockTodo,
                description: 'テスト説明',
                priority: 'high',
                category: 'work',
                due_date: '2024-12-31T00:00:00Z',
            };

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockTodoWithDetails,
                        error: null,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
                insert: mockInsert,
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.addTodo(
                    '詳細なTodo',
                    'テスト説明',
                    'high',
                    'work',
                    '2024-12-31'
                );
            });

            expect(mockInsert).toHaveBeenCalledWith([
                expect.objectContaining({
                    title: '詳細なTodo',
                    description: 'テスト説明',
                    priority: 'high',
                    category: 'work',
                    due_date: '2024-12-31',
                    user_id: 'test-user-id',
                }),
            ]);

            await waitFor(() => {
                expect(result.current.todos[0].description).toBe('テスト説明');
                expect(result.current.todos[0].priority).toBe('high');
                expect(result.current.todos[0].category).toBe('work');
            });
        });

        it('ユーザーが認証されていない場合エラーを投げる', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: null },
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await expect(
                    result.current.addTodo('テストTodo')
                ).rejects.toThrow('ログインが必要です');
            });
        });

        it('タイトルの前後の空白をトリムする', async () => {
            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockTodo,
                        error: null,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
                insert: mockInsert,
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.addTodo('  トリムテスト  ');
            });

            expect(mockInsert).toHaveBeenCalledWith([
                expect.objectContaining({
                    title: 'トリムテスト',
                }),
            ]);
        });

        it('追加に失敗した場合エラーを設定する', async () => {
            const mockError = { message: 'データベースエラー', code: 'PGRST_ERROR' };

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: mockError,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
                insert: mockInsert,
            });

            const { result } = renderHook(() => useTodos());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await expect(result.current.addTodo('テストTodo')).rejects.toEqual(
                    mockError
                );
            });

            await waitFor(() => {
                expect(result.current.error).toBe('データベースエラー');
            });
        });
    });
});

