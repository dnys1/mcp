import { logger } from "@mcp/shared/logger";
import type { LanguageModel } from "ai";
import { generateText } from "ai";

/**
 * Service for generating descriptions for documentation sources.
 */
export class DescriptionService {
  private log = logger.child({ service: "DescriptionService" });

  constructor(private model: LanguageModel) {}

  /**
   * Generate a description for a documentation source.
   * Uses document titles to provide context about what the documentation covers.
   */
  async generateSourceDescription(
    name: string,
    url: string,
    documentTitles: string[],
  ): Promise<string> {
    try {
      // Take a sample of titles to provide context
      const sampleTitles = documentTitles.slice(0, 15).join(", ");

      const { text } = await generateText({
        model: this.model,
        prompt: `Generate a one-sentence description for a documentation search tool called "${name}" from ${url}.

Sample document titles: ${sampleTitles}

The description should explain what kind of documentation this is and what users can search for. Keep it under 100 characters. Do not include quotes around the response.`,
        maxOutputTokens: 50,
      });

      const description = text.trim();
      this.log.debug("Generated source description", { name, description });
      return description;
    } catch (error) {
      this.log.warn("Failed to generate description, using fallback", {
        name,
        error: error instanceof Error ? error.message : String(error),
      });
      return `Search ${name} documentation.`;
    }
  }

  /**
   * Generate a description for a group of documentation sources.
   * Uses the individual source descriptions to provide context.
   */
  async generateGroupDescription(
    groupName: string,
    sourceDescriptions: string[],
  ): Promise<string> {
    try {
      const descList = sourceDescriptions
        .filter((d) => d && !d.startsWith("Search "))
        .slice(0, 5)
        .join("; ");

      // If we don't have meaningful descriptions, use fallback
      if (!descList) {
        return `Search ${groupName} documentation.`;
      }

      const { text } = await generateText({
        model: this.model,
        prompt: `Generate a one-sentence description for a documentation search tool that searches across multiple ${groupName} documentation sources.

The individual sources cover: ${descList}

The description should summarize what users can search for across all these sources. Keep it under 100 characters. Do not include quotes around the response.`,
        maxOutputTokens: 50,
      });

      const description = text.trim();
      this.log.debug("Generated group description", { groupName, description });
      return description;
    } catch (error) {
      this.log.warn("Failed to generate group description, using fallback", {
        groupName,
        error: error instanceof Error ? error.message : String(error),
      });
      return `Search ${groupName} documentation.`;
    }
  }
}
