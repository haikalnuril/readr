import { describe, expect, it } from "vitest";
import { pdfTextFromItems } from "@/lib/parsers/pdf";

// Helper: build a pdfjs-like text item at a given y (and optional x), with a
// font height. transform = [a, b, c, d, e(x), f(y)].
function item(str: string, y: number, height = 12, x = 0) {
  return { str, transform: [1, 0, 0, height, x, y], height };
}

describe("pdfTextFromItems (B04)", () => {
  it("merges runs on the same line", () => {
    const text = pdfTextFromItems([item("Hello", 100), item("world", 100)]);
    expect(text).toBe("Hello world");
  });

  it("joins wrapped lines within a paragraph with a space", () => {
    // Consistent small leading (gap 14) → one flowing paragraph.
    const text = pdfTextFromItems([
      item("the quick", 100),
      item("brown fox", 86),
      item("jumps over", 72),
    ]);
    expect(text).toBe("the quick brown fox jumps over");
  });

  it("inserts a blank line when the vertical gap is large", () => {
    // Paragraph 1: y 100,86,72 (gap 14). Paragraph 2 starts at y 44 (gap 28).
    const text = pdfTextFromItems([
      item("first para", 100),
      item("still first", 86),
      item("line three", 72),
      item("second para", 44),
      item("its second line", 30),
    ]);
    expect(text).toBe("first para still first line three\n\nsecond para its second line");
  });

  it("separates short, mostly single-line paragraphs (the novel case)", () => {
    // One 2-line paragraph (gap 14 = real leading) then several single-line
    // paragraphs spaced ~28 apart. Median gap would be ~28 and merge them all;
    // the percentile+height baseline must keep them separate.
    const text = pdfTextFromItems([
      item("para one line a", 200),
      item("para one line b", 186),
      item("Here I am at a department store.", 158),
      item("And yes, I got one of those tickets.", 130),
      item("“Finally!”", 102),
      item("“Hey, let’s go!”", 74),
    ]);
    expect(text).toBe(
      "para one line a para one line b\n\n" +
        "Here I am at a department store.\n\n" +
        "And yes, I got one of those tickets.\n\n" +
        "“Finally!”\n\n" +
        "“Hey, let’s go!”",
    );
  });

  it("ignores empty / non-text items", () => {
    const text = pdfTextFromItems([
      item("a", 100),
      { foo: "bar" },
      item("", 100),
      item("b", 100),
    ]);
    expect(text).toBe("a b");
  });

  it("splits paragraphs by first-line indent with no vertical gap (B06)", () => {
    // Novel style: constant line spacing (gap 14), paragraphs marked only by an
    // indented first line (x=20) vs wrapped lines at the left margin (x=0).
    const text = pdfTextFromItems([
      item("Shota was the one who suggested", 200, 12, 20),
      item("the “handy shack.”", 186, 12, 0),
      item("“A handy shack? What the hell", 172, 12, 20),
      item("are you talking about?”", 158, 12, 0),
    ]);
    expect(text).toBe(
      "Shota was the one who suggested the “handy shack.”\n\n" +
        "“A handy shack? What the hell are you talking about?”",
    );
  });

  it("factor controls how aggressively paragraphs split (F08)", () => {
    // Two single lines with a medium gap (22, font height 12). A tight factor
    // treats it as two paragraphs; a normal/loose factor keeps them together.
    const items = [item("alpha", 100), item("beta", 78)];
    expect(pdfTextFromItems(items, 1.25)).toBe("alpha\n\nbeta"); // tight
    expect(pdfTextFromItems(items, 1.4)).toBe("alpha beta"); // normal
    expect(pdfTextFromItems(items, 1.7)).toBe("alpha beta"); // loose
  });

  it("returns empty string for no usable items", () => {
    expect(pdfTextFromItems([])).toBe("");
    expect(pdfTextFromItems([{ nope: true }])).toBe("");
  });
});
