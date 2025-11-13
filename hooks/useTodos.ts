import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Todo, TodoInsert, TodoUpdate } from '@/types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 現在のユーザーを取得
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  // Todoリストを取得
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await getCurrentUser();
      
      let query = supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      // ユーザーが認証されている場合は、そのユーザーのTodoのみ取得
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        // 認証されていない場合は空のリストを返す
        setTodos([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setTodos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // 新しいTodoを追加
  const addTodo = async (
    title: string,
    description?: string,
    priority?: string,
    category?: string,
    dueDate?: string
  ) => {
    try {
      setError(null);
      const user = await getCurrentUser();

      const newTodo: TodoInsert = {
        title: title.trim(),
        description: description?.trim() || undefined,
        completed: false,
        priority: (priority as any) || 'medium',
        category: (category as any) || 'other',
        due_date: dueDate || undefined,
      };

      if (!user) {
        throw new Error('ログインが必要です');
      }

      const insertData: any = { ...newTodo, user_id: user.id };

      const { data, error: insertError } = await supabase
        .from('todos')
        .insert([insertData])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setTodos((prev) => [data, ...prev]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error adding todo:', err);
      throw err;
    }
  };

  // Todoを更新
  const updateTodo = async (id: string, updates: TodoUpdate) => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        setTodos((prev) => prev.map((todo) => (todo.id === id ? data : todo)));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error updating todo:', err);
      throw err;
    }
  };

  // Todoを削除
  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error deleting todo:', err);
      throw err;
    }
  };

  // Todoの完了状態を切り替え
  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  };

  // 初回ロード時にTodoを取得
  useEffect(() => {
    fetchTodos();
  }, []);

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refetch: fetchTodos,
  };
}

