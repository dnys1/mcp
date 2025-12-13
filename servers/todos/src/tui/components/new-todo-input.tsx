import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";

type NewTodoInputProps = {
  isSelected: boolean;
  onSubmit: (title: string) => void;
};

export function NewTodoInput({ isSelected, onSubmit }: NewTodoInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  const prefix = isSelected ? ">" : " ";

  return (
    <Box>
      <Text color={isSelected ? "cyan" : "gray"}>{prefix} </Text>
      <Text color="gray">[+] </Text>
      {isSelected ? (
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="Add new todo..."
        />
      ) : (
        <Text dimColor>{value || "Add new todo..."}</Text>
      )}
    </Box>
  );
}
