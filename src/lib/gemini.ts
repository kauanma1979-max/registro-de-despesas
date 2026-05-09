/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeSheetData(data: any[]) {
  if (!data || data.length === 0) return "No data to analyze.";

  // Limit data sent to Gemini to prevent token overflow for large sheets
  const sampleData = data.slice(0, 50);
  const dataString = JSON.stringify(sampleData);

  const prompt = `
    Analyze the following spreadsheet data and provide:
    1. A brief summary of what this data appears to be.
    2. 3-5 key insights or trends.
    3. Suggested improvements or potential issues found in the data (duplicates, missing values, etc).
    
    Data (first 50 rows):
    ${dataString}

    Respond in Portuguese (Brasil) as requested by the user. Use markdown for formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Não foi possível realizar a análise no momento.";
  }
}
