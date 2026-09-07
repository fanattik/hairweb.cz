import Papa from "papaparse";
import * as XLSX from "xlsx";
import type {
  ImportMethod,
  ImportRow,
  ParsedImportPayload,
  ParsedSheet,
} from "@/lib/leads/import/types";

function rowsToImportRows(headers: string[], matrix: string[][]): ImportRow[] {
  return matrix.map((cells, index) => {
    const raw: Record<string, string | null> = {};
    headers.forEach((header, i) => {
      const value = cells[i]?.trim() ?? "";
      raw[header] = value.length ? value : null;
    });
    return { rowNumber: index + 1, raw };
  });
}

function detectDelimiter(sample: string): string {
  const firstLine = sample.split(/\r?\n/).find((line) => line.trim()) || "";
  const counts = {
    ";": (firstLine.match(/;/g) || []).length,
    ",": (firstLine.match(/,/g) || []).length,
    "\t": (firstLine.match(/\t/g) || []).length,
    "|": (firstLine.match(/\|/g) || []).length,
  };
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return ranked[0][1] > 0 ? ranked[0][0] : ",";
}

export function parseCsvText(
  text: string,
  fileName: string | null = null,
): ParsedImportPayload {
  const delimiter = detectDelimiter(text);
  const parsed = Papa.parse<string[]>(text, {
    delimiter,
    skipEmptyLines: "greedy",
  });

  const matrix = (parsed.data || []).filter((row) =>
    row.some((cell) => String(cell || "").trim()),
  );
  if (matrix.length === 0) {
    throw new Error("CSV neobsahuje žádná data.");
  }

  const headers = matrix[0].map((cell, i) => {
    const h = String(cell || "").trim();
    return h || `Sloupec ${i + 1}`;
  });
  const body = matrix.slice(1).map((row) =>
    headers.map((_, i) => String(row[i] ?? "")),
  );
  const allRows = rowsToImportRows(headers, body);

  return {
    method: "csv",
    fileName,
    sheets: [{ name: "CSV", headers, rows: body }],
    activeSheet: "CSV",
    headers,
    previewRows: allRows.slice(0, 10),
    allRows,
    delimiter,
  };
}

export function parsePasteText(text: string): ParsedImportPayload {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Vlož tabulková data.");

  // Prefer tab / pipe from Sheets/Excel paste; fall back to CSV detection.
  const firstLine = trimmed.split(/\r?\n/)[0] || "";
  if (firstLine.includes("\t") || firstLine.includes("|")) {
    const delimiter = firstLine.includes("\t") ? "\t" : "|";
    const matrix = trimmed
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map((line) => line.split(delimiter).map((cell) => cell.trim()));
    const headers = matrix[0].map((cell, i) => cell || `Sloupec ${i + 1}`);
    const body = matrix.slice(1);
    // If first row looks like data (no header words), synthesize headers.
    const looksLikeHeader = headers.some((h) =>
      /name|web|city|phone|email|salon|firma|město|telefon/i.test(h),
    );
    if (!looksLikeHeader && body.length === 0) {
      // single row paste without header
      const synth = headers.map((_, i) => `Sloupec ${i + 1}`);
      const allRows = rowsToImportRows(synth, [headers]);
      return {
        method: "paste",
        fileName: null,
        sheets: [{ name: "Paste", headers: synth, rows: [headers] }],
        activeSheet: "Paste",
        headers: synth,
        previewRows: allRows.slice(0, 10),
        allRows,
        delimiter,
      };
    }
    if (!looksLikeHeader) {
      const synth = headers.map((_, i) => `Sloupec ${i + 1}`);
      const rows = [headers, ...body];
      const allRows = rowsToImportRows(synth, rows);
      return {
        method: "paste",
        fileName: null,
        sheets: [{ name: "Paste", headers: synth, rows }],
        activeSheet: "Paste",
        headers: synth,
        previewRows: allRows.slice(0, 10),
        allRows,
        delimiter,
      };
    }
    const allRows = rowsToImportRows(headers, body);
    return {
      method: "paste",
      fileName: null,
      sheets: [{ name: "Paste", headers, rows: body }],
      activeSheet: "Paste",
      headers,
      previewRows: allRows.slice(0, 10),
      allRows,
      delimiter,
    };
  }

  const csv = parseCsvText(trimmed, null);
  return { ...csv, method: "paste", fileName: null, activeSheet: "Paste" };
}

export function parseXlsxArrayBuffer(
  buffer: ArrayBuffer,
  fileName: string | null,
): ParsedImportPayload {
  const workbook = XLSX.read(buffer, { type: "array" });
  if (!workbook.SheetNames.length) {
    throw new Error("XLSX neobsahuje žádný list.");
  }

  const sheets: ParsedSheet[] = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    }) as string[][];
    const nonEmpty = matrix.filter((row) =>
      row.some((cell) => String(cell || "").trim()),
    );
    if (!nonEmpty.length) {
      return { name, headers: [], rows: [] };
    }
    const headers = nonEmpty[0].map((cell, i) => {
      const h = String(cell || "").trim();
      return h || `Sloupec ${i + 1}`;
    });
    const rows = nonEmpty.slice(1).map((row) =>
      headers.map((_, i) => String(row[i] ?? "")),
    );
    return { name, headers, rows };
  }).filter((sheet) => sheet.headers.length > 0);

  if (!sheets.length) throw new Error("XLSX listy jsou prázdné.");

  const active = sheets[0];
  const allRows = rowsToImportRows(active.headers, active.rows);

  return {
    method: "xlsx",
    fileName,
    sheets,
    activeSheet: active.name,
    headers: active.headers,
    previewRows: allRows.slice(0, 10),
    allRows,
  };
}

export function selectSheet(
  payload: ParsedImportPayload,
  sheetName: string,
): ParsedImportPayload {
  const sheet = payload.sheets.find((item) => item.name === sheetName);
  if (!sheet) throw new Error(`List „${sheetName}“ neexistuje.`);
  const allRows = rowsToImportRows(sheet.headers, sheet.rows);
  return {
    ...payload,
    activeSheet: sheet.name,
    headers: sheet.headers,
    previewRows: allRows.slice(0, 10),
    allRows,
  };
}

export async function parseImportFile(
  file: File,
): Promise<ParsedImportPayload> {
  const name = file.name || "upload";
  const lower = name.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    return parseXlsxArrayBuffer(await file.arrayBuffer(), name);
  }
  if (lower.endsWith(".csv") || lower.endsWith(".tsv") || lower.endsWith(".txt")) {
    return parseCsvText(await file.text(), name);
  }
  // sniff
  const buffer = await file.arrayBuffer();
  try {
    return parseXlsxArrayBuffer(buffer, name);
  } catch {
    const text = new TextDecoder("utf-8").decode(buffer);
    return parseCsvText(text, name);
  }
}

export function methodFromFileName(fileName: string | null): ImportMethod {
  if (!fileName) return "paste";
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "xlsx";
  return "csv";
}
