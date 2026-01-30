import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '';

// Initialize Google Sheets API client
const getGoogleSheetsClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

export const sheets = getGoogleSheetsClient();

// Helper function to get all data from a sheet
export async function getSheetData(sheetName: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    return response.data.values || [];
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error);
    throw error;
  }
}

// Helper function to append data to a sheet
export async function appendSheetData(sheetName: string, values: any[][]) {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error appending to sheet ${sheetName}:`, error);
    throw error;
  }
}

// Helper function to update a specific row
export async function updateSheetRow(sheetName: string, row: number, values: any[]) {
  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${row}:Z${row}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating row ${row} in sheet ${sheetName}:`, error);
    throw error;
  }
}

// Helper function to delete a row (by clearing it)
export async function deleteSheetRow(sheetName: string, row: number) {
  try {
    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${row}:Z${row}`,
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting row ${row} in sheet ${sheetName}:`, error);
    throw error;
  }
}

// Helper function to find a row by ID (assumes ID is in column A)
export async function findRowById(sheetName: string, id: string): Promise<number | null> {
  try {
    const data = await getSheetData(sheetName);
    const rowIndex = data.findIndex((row, index) => index > 0 && row[0] === id);
    return rowIndex >= 0 ? rowIndex + 1 : null;
  } catch (error) {
    console.error(`Error finding row with ID ${id} in sheet ${sheetName}:`, error);
    return null;
  }
}

// Get data by ID
export async function getDataById(sheetName: string, id: string) {
  try {
    const data = await getSheetData(sheetName);
    const row = data.find((row, index) => index > 0 && row[0] === id);
    return row || null;
  } catch (error) {
    console.error(`Error getting data with ID ${id} from sheet ${sheetName}:`, error);
    return null;
  }
}

// Batch update multiple rows
export async function batchUpdateSheet(sheetName: string, updates: { row: number; values: any[] }[]) {
  try {
    const data = updates.map(update => ({
      range: `${sheetName}!A${update.row}:Z${update.row}`,
      values: [update.values],
    }));

    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: data,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error batch updating sheet ${sheetName}:`, error);
    throw error;
  }
}

// Get specific columns from a sheet
export async function getSheetColumns(sheetName: string, columns: string[]) {
  try {
    const ranges = columns.map(col => `${sheetName}!${col}:${col}`);
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ranges,
    });
    return response.data.valueRanges || [];
  } catch (error) {
    console.error(`Error getting columns from sheet ${sheetName}:`, error);
    throw error;
  }
}

export default sheets;
