/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';

export interface SheetData {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Extracts the spreadsheet ID and gid from a Google Sheets URL.
 */
export function parseSheetUrl(url: string) {
  try {
    const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/gid=([0-9]+)/);
    
    if (!idMatch) return null;
    
    return {
      spreadsheetId: idMatch[1],
      gid: gidMatch ? gidMatch[1] : '0'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Fetches sheet data as CSV and parses it.
 */
export async function fetchSheetData(url: string): Promise<SheetData> {
  const parsed = parseSheetUrl(url);
  if (!parsed) {
    throw new Error('Invalid Google Sheets URL. Please make sure it follows the format: https://docs.google.com/spreadsheets/d/ID/edit');
  }

  const { spreadsheetId, gid } = parsed;
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

  const response = await fetch(csvUrl);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Spreadsheet not found. Check the ID and ensure the sheet isn\'t deleted.');
    }
    throw new Error('Failed to fetch sheet data. Ensure the spreadsheet is shared as "Anyone with the link can view".');
  }

  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data as Record<string, string>[]
        });
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}
