import { Box, Text, useInput } from "ink";
import { useEffect, useState } from "react";
import type { ProjectService } from "../../services/project-service.js";
import type { Project } from "../../types/index.js";

type ProjectsViewProps = {
  projectService: ProjectService;
  currentProject: Project;
  onSelectProject: (project: Project) => void;
  onBack: () => void;
};

type ProjectWithStats = {
  project: Project;
  stats: { open: number; inProgress: number; done: number };
};

export function ProjectsView({
  projectService,
  currentProject,
  onSelectProject,
  onBack,
}: ProjectsViewProps) {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      const list = await projectService.listProjects();
      const withStats = await Promise.all(
        list.map(async (project) => ({
          project,
          stats: await projectService.getProjectStats(project.id),
        })),
      );
      setProjects(withStats);

      // Set initial selection to current project
      const currentIndex = withStats.findIndex(
        (p) => p.project.id === currentProject.id,
      );
      if (currentIndex >= 0) {
        setSelectedIndex(currentIndex);
      }

      setLoading(false);
    }
    loadProjects();
  }, [projectService, currentProject.id]);

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelectedIndex((i) => Math.min(projects.length - 1, i + 1));
    } else if (key.return) {
      const selected = projects[selectedIndex];
      if (selected) {
        onSelectProject(selected.project);
      }
    } else if (key.rightArrow || key.escape) {
      onBack();
    }
  });

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text>Loading projects...</Text>
      </Box>
    );
  }

  if (projects.length === 0) {
    return (
      <Box flexDirection="column">
        <Text bold color="blue">
          Projects
        </Text>
        <Box marginTop={1}>
          <Text dimColor>No projects found.</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>→ or Esc to go back</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="blue">
          Projects
        </Text>
        <Text dimColor> ({projects.length})</Text>
      </Box>

      {/* Project list */}
      {projects.map(({ project, stats }, index) => {
        const isSelected = selectedIndex === index;
        const isCurrent = project.id === currentProject.id;
        const prefix = isSelected ? ">" : " ";

        return (
          <Box key={project.id}>
            <Text color={isSelected ? "cyan" : undefined}>{prefix} </Text>
            <Text bold={isCurrent} color={isCurrent ? "green" : undefined}>
              {project.name}
            </Text>
            <Text dimColor>
              {" "}
              ({stats.open} open
              {stats.inProgress > 0 ? `, ${stats.inProgress} in progress` : ""}
              {stats.done > 0 ? `, ${stats.done} done` : ""})
            </Text>
            {isCurrent && <Text color="green"> *</Text>}
          </Box>
        );
      })}

      {/* Help footer */}
      <Box marginTop={1}>
        <Text dimColor>↑/↓ navigate enter select → back q quit</Text>
      </Box>
    </Box>
  );
}
