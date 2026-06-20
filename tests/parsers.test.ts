import { describe, expect, it } from "vitest";
import { detectType, isSupported, parseFile } from "@/lib/parsers";

describe("detectType (F01)", () => {
  it("detects by extension", () => {
    expect(detectType("a.md")).toBe("md");
    expect(detectType("a.markdown")).toBe("md");
    expect(detectType("a.txt")).toBe("txt");
    expect(detectType("a.PDF")).toBe("pdf");
  });

  it("falls back to MIME type when extension is missing", () => {
    expect(detectType("noext", "text/markdown")).toBe("md");
    expect(detectType("noext", "text/plain")).toBe("txt");
    expect(detectType("noext", "application/pdf")).toBe("pdf");
  });

  it("returns null for unsupported files", () => {
    expect(detectType("a.docx")).toBeNull();
    expect(detectType("image.png", "image/png")).toBeNull();
    expect(isSupported("a.docx")).toBe(false);
    expect(isSupported("a.md")).toBe(true);
  });
});

describe("parseFile (F01)", () => {
  it("reads markdown content as text", async () => {
    const file = new File(["# Title\n\nbody"], "doc.md", { type: "text/markdown" });
    const parsed = await parseFile(file);
    expect(parsed.type).toBe("md");
    expect(parsed.content).toContain("# Title");
  });

  it("reads plain text content", async () => {
    const file = new File(["hello world"], "doc.txt", { type: "text/plain" });
    const parsed = await parseFile(file);
    expect(parsed.type).toBe("txt");
    expect(parsed.content).toBe("hello world");
  });

  it("throws on unsupported files", async () => {
    const file = new File(["x"], "doc.docx");
    await expect(parseFile(file)).rejects.toThrow(/tidak didukung/i);
  });
});
