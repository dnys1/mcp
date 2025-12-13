import { Box, Text, useInput } from "ink";
import { useCallback, useState } from "react";
import type { TodoService } from "../../services/todo-service.js";
import type { Project } from "../../types/index.js";
import { useTodos } from "../hooks/use-todos.js";
import { NewTodoInput } from "./new-todo-input.js";
import { TodoItem } from "./todo-item.js";

type TodoListViewProps = {
  todoService: TodoService;
  project: Project;
  onSwitchToProjects: () => void;
};

export function TodoListView({
  todoService,
  project,
  onSwitchToProjects,
}: TodoListViewProps) {
  const {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    updateTodoTitle,
    deleteTodo,
  } = useTodos(todoService, project);

  // Index 0 = new todo input, 1+ = todos
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const maxIndex = todos.length; // 0 = input, 1..todos.length = todos

  const isEditing = editingIndex !== null;

  useInput(
    (input, key) => {
      // Don't process navigation keys while editing
      if (isEditing) {
        if (key.escape) {
          setEditingIndex(null);
        }
        return;
      }

      // Navigation
      if (key.upArrow) {
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (key.downArrow) {
        setSelectedIndex((i) => Math.min(maxIndex, i + 1));
      }

      // Switch to projects view
      if (key.leftArrow) {
        onSwitchToProjects();
      }

      // Actions on todos (not on input line)
      if (selectedIndex > 0) {
        const todo = todos[selectedIndex - 1];
        if (!todo) return;

        if (input === " ") {
          toggleTodo(todo);
        } else if (input === "e") {
          setEditingIndex(selectedIndex);
        } else if (input === "d" || input === "x") {
          deleteTodo(todo);
          // Adjust selection if we deleted the last item
          if (selectedIndex > todos.length - 1) {
            setSelectedIndex(Math.max(0, todos.length - 1));
          }
        }
      }
    },
    { isActive: true },
  );

  const handleAddTodo = useCallback(
    async (title: string) => {
      const todo = await addTodo(title);
      if (todo) {
        // Move selection to the newly added todo (index 1)
        setSelectedIndex(1);
      }
    },
    [addTodo],
  );

  const handleEditTodo = useCallback(
    async (title: string) => {
      if (editingIndex !== null && editingIndex > 0) {
        const todo = todos[editingIndex - 1];
        if (todo) {
          await updateTodoTitle(todo, title);
        }
      }
      setEditingIndex(null);
    },
    [editingIndex, todos, updateTodoTitle],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
  }, []);

  // Count stats
  const openCount = todos.filter((t) => t.status === "open").length;
  const inProgressCount = todos.filter(
    (t) => t.status === "in_progress",
  ).length;
  const doneCount = todos.filter((t) => t.status === "done").length;

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text>Loading todos...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="blue">
          todo
        </Text>
        <Text> - </Text>
        <Text bold>{project.name}</Text>
        <Text dimColor>
          {" "}
          ({openCount} open
          {inProgressCount > 0 ? `, ${inProgressCount} in progress` : ""}
          {doneCount > 0 ? `, ${doneCount} done` : ""})
        </Text>
      </Box>

      {/* New todo input */}
      <NewTodoInput isSelected={selectedIndex === 0} onSubmit={handleAddTodo} />

      {/* Separator */}
      {todos.length > 0 && (
        <Box marginY={0}>
          <Text dimColor>─────────────────────────────────────────</Text>
        </Box>
      )}

      {/* Todo list */}
      {todos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isSelected={selectedIndex === index + 1}
          isEditing={editingIndex === index + 1}
          onEdit={handleEditTodo}
          onCancelEdit={handleCancelEdit}
        />
      ))}

      {/* Empty state */}
      {todos.length === 0 && (
        <Box marginTop={1}>
          <Text dimColor>No todos yet. Add one above!</Text>
        </Box>
      )}

      {/* Help footer */}
      <Box marginTop={1}>
        <Text dimColor>
          ↑/↓ navigate space toggle e edit d delete ← projects q quit
        </Text>
      </Box>
    </Box>
  );
}
