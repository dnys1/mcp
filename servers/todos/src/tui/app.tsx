import { useApp, useInput } from "ink";
import { useState } from "react";
import type { ProjectService } from "../services/project-service.js";
import type { TodoService } from "../services/todo-service.js";
import type { Project } from "../types/index.js";
import { ProjectsView } from "./components/projects-view.js";
import { TodoListView } from "./components/todo-list.js";

type View = "todos" | "projects";

type AppProps = {
  projectService: ProjectService;
  todoService: TodoService;
  initialProject: Project;
};

export function App({ projectService, todoService, initialProject }: AppProps) {
  const { exit } = useApp();
  const [view, setView] = useState<View>("todos");
  const [project, setProject] = useState<Project>(initialProject);

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      exit();
    }
  });

  const handleSwitchToProjects = () => setView("projects");
  const handleSwitchToTodos = () => setView("todos");

  const handleSelectProject = (selectedProject: Project) => {
    setProject(selectedProject);
    setView("todos");
  };

  if (view === "projects") {
    return (
      <ProjectsView
        projectService={projectService}
        currentProject={project}
        onSelectProject={handleSelectProject}
        onBack={handleSwitchToTodos}
      />
    );
  }

  return (
    <TodoListView
      todoService={todoService}
      project={project}
      onSwitchToProjects={handleSwitchToProjects}
    />
  );
}
