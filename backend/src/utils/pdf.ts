import pdf from "pdf-parse";
import fs from "fs/promises";

export async function extractPdfText(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  const res = await pdf(data);
  return res.text.replace(/\u0000/g, " ").replace(/\s+\n/g, "\n");
}
