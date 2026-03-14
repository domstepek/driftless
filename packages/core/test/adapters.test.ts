import { describe, expect, it } from "vitest";
import {
  docusaurusPrompt,
  fumadocsPrompt,
  getAdapterPrompt,
  plainMdPrompt,
} from "../src/adapters.js";

describe("framework adapters", () => {
  describe("plainMdPrompt", () => {
    it("mentions YAML frontmatter", () => {
      const prompt = plainMdPrompt();
      expect(prompt).toContain("YAML");
      expect(prompt).toContain("frontmatter");
      expect(prompt).toContain("---");
    });

    it("requires title and description in frontmatter", () => {
      const prompt = plainMdPrompt();
      expect(prompt).toContain("title");
      expect(prompt).toContain("description");
    });

    it("does not mention Callout or ::: admonitions", () => {
      const prompt = plainMdPrompt();
      expect(prompt).not.toContain("<Callout");
      expect(prompt).not.toContain(":::");
    });

    it("uses blockquotes for tips and warnings", () => {
      const prompt = plainMdPrompt();
      expect(prompt).toContain("blockquote");
    });

    it("specifies .md file extension", () => {
      const prompt = plainMdPrompt();
      expect(prompt).toContain(".md");
    });
  });

  describe("fumadocsPrompt", () => {
    it("mentions <Callout> components", () => {
      const prompt = fumadocsPrompt();
      expect(prompt).toContain("<Callout");
      expect(prompt).toContain("</Callout>");
    });

    it("requires title and description frontmatter", () => {
      const prompt = fumadocsPrompt();
      expect(prompt).toContain("title");
      expect(prompt).toContain("description");
    });

    it("does not mention ::: admonition syntax", () => {
      const prompt = fumadocsPrompt();
      expect(prompt).not.toContain(":::");
    });

    it("specifies .mdx file extension", () => {
      const prompt = fumadocsPrompt();
      expect(prompt).toContain(".mdx");
    });

    it("lists available Callout types", () => {
      const prompt = fumadocsPrompt();
      expect(prompt).toContain("info");
      expect(prompt).toContain("warn");
    });
  });

  describe("docusaurusPrompt", () => {
    it("mentions ::: admonition syntax", () => {
      const prompt = docusaurusPrompt();
      expect(prompt).toContain(":::");
    });

    it("requires sidebar_position in frontmatter", () => {
      const prompt = docusaurusPrompt();
      expect(prompt).toContain("sidebar_position");
    });

    it("requires id, title, and description in frontmatter", () => {
      const prompt = docusaurusPrompt();
      expect(prompt).toContain("id");
      expect(prompt).toContain("title");
      expect(prompt).toContain("description");
    });

    it("does not mention <Callout> components", () => {
      const prompt = docusaurusPrompt();
      expect(prompt).not.toContain("<Callout");
    });

    it("specifies .mdx file extension", () => {
      const prompt = docusaurusPrompt();
      expect(prompt).toContain(".mdx");
    });

    it("lists available admonition types", () => {
      const prompt = docusaurusPrompt();
      expect(prompt).toContain("tip");
      expect(prompt).toContain("warning");
      expect(prompt).toContain("danger");
    });
  });

  describe("getAdapterPrompt", () => {
    it("dispatches to plainMdPrompt for plain-md", () => {
      expect(getAdapterPrompt("plain-md")).toBe(plainMdPrompt());
    });

    it("dispatches to fumadocsPrompt for fumadocs", () => {
      expect(getAdapterPrompt("fumadocs")).toBe(fumadocsPrompt());
    });

    it("dispatches to docusaurusPrompt for docusaurus", () => {
      expect(getAdapterPrompt("docusaurus")).toBe(docusaurusPrompt());
    });

    it("throws on unknown framework", () => {
      expect(() => getAdapterPrompt("unknown" as never)).toThrow("Unknown doc framework: unknown");
    });
  });

  describe("shared rules", () => {
    it("all prompts include writing style rules", () => {
      for (const prompt of [plainMdPrompt(), fumadocsPrompt(), docusaurusPrompt()]) {
        expect(prompt).toContain("second person");
        expect(prompt).toContain("Bold UI element names");
        expect(prompt).toContain("present tense");
      }
    });

    it("all prompts include document structure requirements", () => {
      for (const prompt of [plainMdPrompt(), fumadocsPrompt(), docusaurusPrompt()]) {
        expect(prompt).toContain("Intro paragraph");
        expect(prompt).toContain("Numbered steps");
        expect(prompt).toContain("Common Problems");
      }
    });
  });
});
