import { useCallback, useEffect, useState } from "react";
import type { TodoService } from "../../services/todo-service.js";
import type { Project, Todo, TodoStatus } from "../../types/index.js";

type UseTodosResult = {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addTodo: (title: string) => Promise<Todo | null>;
  toggleTodo: (todo: Todo) => Promise<void>;
  updateTodoTitle: (todo: Todo, title: string) => Promise<void>;
  deleteTodo: (todo: Todo) => Promise<void>;
};

export function useTodos(
  todoService: TodoService,
  project: Project,
): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await todoService.list(project.id);
      setTodos(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }, [todoService, project.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTodo = useCallback(
    async (title: string): Promise<Todo | null> => {
      if (!title.trim()) return null;
      try {
        const todo = await todoService.add(project.id, { title: title.trim() });
        setTodos((prev) => [todo, ...prev]);
        return todo;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add todo");
        return null;
      }
    },
    [todoService, project.id],
  );

  const toggleTodo = useCallback(
    async (todo: Todo) => {
      const nextStatus: TodoStatus =
        todo.status === "done"
          ? "open"
          : todo.status === "open"
            ? "in_progress"
            : "done";
      try {
        const updated = await todoService.update(todo.id, {
          status: nextStatus,
        });
        if (updated) {
          setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update todo");
      }
    },
    [todoService],
  );

  const updateTodoTitle = useCallback(
    async (todo: Todo, title: string) => {
      if (!title.trim()) return;
      try {
        const updated = await todoService.update(todo.id, {
          title: title.trim(),
        });
        if (updated) {
          setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update todo");
      }
    },
    [todoService],
  );

  const deleteTodo = useCallback(
    async (todo: Todo) => {
      try {
        const deleted = await todoService.delete(todo.id);
        if (deleted) {
          setTodos((prev) => prev.filter((t) => t.id !== todo.id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete todo");
      }
    },
    [todoService],
  );

  return {
    todos,
    loading,
    error,
    refresh,
    addTodo,
    toggleTodo,
    updateTodoTitle,
    deleteTodo,
  };
}
