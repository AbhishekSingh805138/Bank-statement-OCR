import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from "../utils/fileUtils";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PROMPT = `
You are an expert in OCR data extraction and financial data processing.
Your task is to extract structured transaction data from the provided bank statement image or PDF.

**Instructions:**

1.  **Identify Currency:** First, analyze the document to identify the primary currency (e.g., USD, CAD, EUR, INR).
2.  **Extract Transactions:** Process the bank statement to extract all transaction rows.
3.  **Ignore Non-Transaction Data:** Discard any headers, footers, summary lines, page numbers, or opening balance statements.
4.  **Generate CSV Output:** Create CSV data with the following fixed columns in this exact order: \`Date\`, \`Description\`, \`Amount\`, \`Category\`, \`Notes\`.
5.  **Formatting Rules:**
    *   **Date:** Format as \`YYYY-MM-DD\`.
    *   **Amount:** Use a \`+\` prefix for credits/deposits and a \`-\` prefix for debits/withdrawals.
    *   **Category:** Automatically detect a relevant category (e.g., 'Transfer', 'Groceries', 'Dining', 'Salary', 'Bills', 'Investment') based on the transaction description.
    *   **Notes:** From the transaction 'Description', extract a short, 1-3 word note for context if it's easily identifiable. This could be a location, person's name, or a memo. If no clear note is available, leave it blank.
    *   **Consistency:** Do not include commas in numeric fields (\`Amount\`).

**Output Format:**

1.  On the very first line, provide the detected currency code, prefixed with "CURRENCY: " (e.g., \`CURRENCY: USD\`).
2.  On a new line, add a unique separator: \`---CSV-START---\`.
3.  Next, provide the raw CSV data, starting with the header row.
4.  Do not add any text before the currency line or after the CSV data block.
`;

export const analyzeStatement = async (file: File) => {
  const base64Image = await fileToBase64(file);
  const imagePart = {
    inlineData: {
      mimeType: file.type,
      data: base64Image,
    },
  };
  const textPart = {
    text: PROMPT,
  };

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    const rawText = response.text;

    const currencySeparator = "CURRENCY: ";
    const csvSeparator = '---CSV-START---';

    const currencyLineEnd = rawText.indexOf('\n');
    const currencyLine = rawText.substring(0, currencyLineEnd !== -1 ? currencyLineEnd : rawText.length).trim();
    const currency = currencyLine.startsWith(currencySeparator) 
      ? currencyLine.substring(currencySeparator.length).trim() 
      : 'USD'; // Default fallback

    const csvStartIndex = rawText.indexOf(csvSeparator);

    if (csvStartIndex === -1) {
      // Graceful fallback if CSV separator is missing
      const potentialCsv = currencyLineEnd !== -1 ? rawText.substring(currencyLineEnd).trim() : rawText;
      return {
        currency: 'USD',
        csv: potentialCsv,
      };
    }
    
    const csv = rawText.substring(csvStartIndex + csvSeparator.length).trim();

    return { currency, csv };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to get a response from the AI model.');
  }
};