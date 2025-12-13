import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";
import type { Todo } from "../../types/index.js";
import { shortId } from "../../utils/id.js";

type TodoItemProps = {
  todo: Todo;
  isSelected: boolean;
  isEditing: boolean;
  onEdit: (title: string) => void;
  onCancelEdit: () => void;
};

function getStatusIcon(status: Todo["status"]): string {
  switch (status) {
    case "done":
      return "[x]";
    case "in_progress":
      return "[~]";
    default:
      return "[ ]";
  }
}

function getStatusColor(status: Todo["status"]): string {
  switch (status) {
    case "done":
      return "green";
    case "in_progress":
      return "yellow";
    default:
      return "white";
  }
}

export function TodoItem({
  todo,
  isSelected,
  isEditing,
  onEdit,
  onCancelEdit,
}: TodoItemProps) {
  const [editValue, setEditValue] = useState(todo.title);

  const handleSubmit = () => {
    if (editValue.trim()) {
      onEdit(editValue.trim());
    } else {
      onCancelEdit();
    }
  };

  const statusIcon = getStatusIcon(todo.status);
  const statusColor = getStatusColor(todo.status);
  const prefix = isSelected ? ">" : " ";

  if (isEditing) {
    return (
      <Box>
        <Text color="cyan">{prefix} </Text>
        <Text color={statusColor}>{statusIcon} </Text>
        <TextInput
          value={editValue}
          onChange={setEditValue}
          onSubmit={handleSubmit}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Text color={isSelected ? "cyan" : undefined}>{prefix} </Text>
      <Text color={statusColor}>{statusIcon} </Text>
      <Text
        color={todo.status === "done" ? "gray" : undefined}
        strikethrough={todo.status === "done"}
      >
        {todo.title}
      </Text>
      <Text dimColor> {shortId(todo.id)}</Text>
    </Box>
  );
}
