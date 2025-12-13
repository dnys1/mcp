import { render } from "ink";
import { createElement } from "react";
import { TodosDatabase } from "../../db/client.js";
import { TodosMigrationService } from "../../db/migrations.js";
import { TodoRepository } from "../../db/repository.js";
import { ProjectService } from "../../services/project-service.js";
import { TodoService } from "../../services/todo-service.js";
import { App } from "../../tui/app.js";

export async function tuiCommand(): Promise<void> {
  // Check if stdin is a TTY (required for interactive TUI)
  if (!process.stdin.isTTY) {
    console.error("Error: Interactive TUI requires a terminal (TTY).");
    console.error("Use 'todo list' to see todos in non-interactive mode.");
    process.exit(1);
  }

  const db = new TodosDatabase();
  const migrationService = new TodosMigrationService(db.client);
  await migrationService.initialize();
  const repo = new TodoRepository(db.client);
  const projectService = new ProjectService(repo);
  const todoService = new TodoService(repo);

  const cwd = process.cwd();
  const project = await projectService.getOrCreateProject(cwd);

  const { waitUntilExit } = render(
    createElement(App, {
      projectService,
      todoService,
      initialProject: project,
    }),
  );

  await waitUntilExit();
  await repo.close();
}
