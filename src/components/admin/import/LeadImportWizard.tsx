"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IMPORT_TARGET_FIELDS,
  IMPORT_TARGET_LABELS,
  LEAD_SOURCE_TYPES,
  type DuplicateAction,
  type ImportPreviewSummary,
  type ImportTargetField,
  type LeadSourceType,
  type ParsedImportPayload,
  type PreparedImportRow,
} from "@/lib/leads/import/types";

const STEPS = [
  "Nahrání",
  "Mapování",
  "Kontrola",
  "Duplicity",
  "Import",
  "Výsledek",
] as const;

const SOURCE_LABELS: Record<LeadSourceType, string> = {
  google_maps: "Google Maps",
  firmy_cz: "Firmy.cz",
  instagram: "Instagram",
  manual: "Manuální",
  csv: "CSV",
  xlsx: "XLSX",
  other: "Jiný",
};

type ExecuteResult = {
  importId: string;
  total: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  invalidCount: number;
};

export function LeadImportWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [payload, setPayload] = useState<ParsedImportPayload | null>(null);
  const [mapping, setMapping] = useState<Record<string, ImportTargetField>>({});
  const [sourceType, setSourceType] = useState<LeadSourceType>("google_maps");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [paste, setPaste] = useState("");
  const [defaultAction, setDefaultAction] =
    useState<DuplicateAction>("fill_blank");

  const [prepared, setPrepared] = useState<PreparedImportRow[]>([]);
  const [summary, setSummary] = useState<ImportPreviewSummary | null>(null);
  const [actions, setActions] = useState<
    Record<number, DuplicateAction | "create">
  >({});
  const [result, setResult] = useState<ExecuteResult | null>(null);

  const headers = payload?.headers ?? [];

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/leads/import/parse", {
      method: "POST",
      body: form,
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Nahrání selhalo.");
      return;
    }
    setPayload(data.payload);
    setMapping(data.suggestedMapping);
    setStep(1);
  }

  async function handlePaste() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/leads/import/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paste }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Paste selhal.");
      return;
    }
    setPayload(data.payload);
    setMapping(data.suggestedMapping);
    setStep(1);
  }

  async function handleSheetChange(sheet: string) {
    if (!payload) return;
    setLoading(true);
    const response = await fetch("/api/admin/leads/import/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sheets: payload.sheets,
        sheet,
        method: payload.method,
        fileName: payload.fileName,
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Výběr listu selhal.");
      return;
    }
    setPayload(data.payload);
    setMapping(data.suggestedMapping);
  }

  async function runPreview() {
    if (!payload) return;
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/leads/import/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: payload.allRows,
        mapping,
        defaultDuplicateAction: defaultAction,
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Kontrola selhala.");
      return;
    }
    setPrepared(data.rows);
    setSummary(data.summary);
    const nextActions: Record<number, DuplicateAction | "create"> = {};
    for (const row of data.rows as PreparedImportRow[]) {
      nextActions[row.rowNumber] = row.suggestedAction;
    }
    setActions(nextActions);
    setStep(2);
  }

  async function runImport() {
    if (!payload) return;
    setLoading(true);
    setError(null);
    setStep(4);
    const response = await fetch("/api/admin/leads/import/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: prepared,
        actions: Object.fromEntries(
          Object.entries(actions).map(([k, v]) => [String(k), v]),
        ),
        mapping,
        fileName: payload.fileName,
        importMethod: payload.method,
        sourceType,
        sourceName: sourceName || null,
        sourceUrl: sourceUrl || null,
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Import selhal.");
      setStep(3);
      return;
    }
    setResult(data.result);
    setStep(5);
    router.refresh();
  }

  const previewTable = useMemo(() => {
    if (!payload) return null;
    return payload.previewRows;
  }, [payload]);

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              disabled={index > step || loading}
              onClick={() => index <= step && setStep(index)}
              className={`border px-3 py-1.5 text-xs tracking-wide ${
                index === step
                  ? "border-ink bg-ink text-foam"
                  : index < step
                    ? "border-ink/40 bg-foam text-ink"
                    : "border-line bg-mist text-ink-soft"
              }`}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      {error ? (
        <p className="border border-copper/40 bg-copper/10 px-4 py-3 text-sm text-copper-deep">
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="border border-line bg-foam p-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Soubor CSV / XLSX
            </h2>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-mist px-4 py-10 text-center hover:border-ink">
              <span className="text-sm text-ink">
                Přetáhni soubor nebo klikni pro výběr
              </span>
              <span className="mt-1 text-xs text-ink-soft">
                .csv · .xlsx · max ~10 000 řádků
              </span>
              <input
                type="file"
                accept=".csv,.tsv,.txt,.xlsx,.xls"
                className="hidden"
                disabled={loading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </label>
          </div>

          <div className="border border-line bg-foam p-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Copy & paste
            </h2>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={8}
              placeholder="Vlož tabulku z Google Sheets / Excel (tab nebo |)"
              className="mt-4 w-full border border-line bg-mist px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={loading || !paste.trim()}
              onClick={() => void handlePaste()}
              className="mt-3 bg-ink px-4 py-2 text-sm text-foam disabled:opacity-60"
            >
              {loading ? "Zpracovávám…" : "Načíst data"}
            </button>
          </div>

          <div className="border border-line bg-foam p-5 lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Zdroj dat (ne způsob importu)
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="text-sm">
                <span className="text-ink-soft">Typ zdroje</span>
                <select
                  value={sourceType}
                  onChange={(e) =>
                    setSourceType(e.target.value as LeadSourceType)
                  }
                  className="mt-1 w-full border border-line bg-mist px-3 py-2"
                >
                  {LEAD_SOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {SOURCE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-ink-soft">Název zdroje</span>
                <input
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="Praha – Google Maps"
                  className="mt-1 w-full border border-line bg-mist px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="text-ink-soft">URL zdroje</span>
                <input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://…"
                  className="mt-1 w-full border border-line bg-mist px-3 py-2"
                />
              </label>
            </div>
          </div>
        </section>
      ) : null}

      {step === 1 && payload ? (
        <section className="space-y-4 border border-line bg-foam p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
                Mapování sloupců
              </h2>
              <p className="text-sm text-ink-soft">
                {payload.allRows.length} řádků
                {payload.fileName ? ` · ${payload.fileName}` : ""}
              </p>
            </div>
            {payload.sheets.length > 1 ? (
              <select
                value={payload.activeSheet}
                onChange={(e) => void handleSheetChange(e.target.value)}
                className="border border-line bg-mist px-3 py-2 text-sm"
              >
                {payload.sheets.map((sheet) => (
                  <option key={sheet.name} value={sheet.name}>
                    {sheet.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  {headers.map((header) => (
                    <th key={header} className="px-2 py-2 align-bottom">
                      <div className="mb-1 font-medium normal-case text-ink">
                        {header}
                      </div>
                      <select
                        value={mapping[header] || "ignore"}
                        onChange={(e) =>
                          setMapping((prev) => ({
                            ...prev,
                            [header]: e.target.value as ImportTargetField,
                          }))
                        }
                        className="w-full min-w-[140px] border border-line bg-mist px-2 py-1 text-xs"
                      >
                        {IMPORT_TARGET_FIELDS.map((field) => (
                          <option key={field} value={field}>
                            {IMPORT_TARGET_LABELS[field]}
                          </option>
                        ))}
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewTable?.map((row) => (
                  <tr key={row.rowNumber} className="border-b border-line/60">
                    {headers.map((header) => (
                      <td key={header} className="px-2 py-2 text-ink-soft">
                        {row.raw[header] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="border border-line px-4 py-2 text-sm"
            >
              Zpět
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void runPreview()}
              className="bg-ink px-4 py-2 text-sm text-foam disabled:opacity-60"
            >
              {loading ? "Kontroluji…" : "Pokračovat na kontrolu"}
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 && summary ? (
        <section className="space-y-4 border border-line bg-foam p-5">
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
            Kontrola a validace
          </h2>
          <div className="grid gap-3 sm:grid-cols-5">
            <Stat label="Celkem" value={summary.total} />
            <Stat label="Nové" value={summary.newCount} />
            <Stat label="Duplicity" value={summary.duplicateCount} />
            <Stat label="Možné" value={summary.possibleDuplicateCount} />
            <Stat label="Chybné" value={summary.invalidCount} />
          </div>
          <div className="max-h-[420px] overflow-auto">
            <PreviewRowsTable rows={prepared.slice(0, 200)} actions={null} />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="border border-line px-4 py-2 text-sm"
            >
              Zpět
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-ink px-4 py-2 text-sm text-foam"
            >
              Řešit duplicity
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 && summary ? (
        <section className="space-y-4 border border-line bg-foam p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
              Duplicity
            </h2>
            <label className="text-sm text-ink-soft">
              Výchozí akce
              <select
                value={defaultAction}
                onChange={(e) => {
                  const value = e.target.value as DuplicateAction;
                  setDefaultAction(value);
                  setActions((prev) => {
                    const next = { ...prev };
                    for (const row of prepared) {
                      if (
                        row.status === "duplicate" ||
                        row.status === "possible_duplicate"
                      ) {
                        next[row.rowNumber] = value;
                      }
                    }
                    return next;
                  });
                }}
                className="ml-2 border border-line bg-mist px-2 py-1 text-ink"
              >
                <option value="fill_blank">Sloučit jen prázdná pole</option>
                <option value="skip">Přeskočit</option>
                <option value="update">Aktualizovat (přepsat)</option>
              </select>
            </label>
          </div>
          <div className="max-h-[480px] overflow-auto">
            <PreviewRowsTable
              rows={prepared.filter(
                (row) =>
                  row.status === "duplicate" ||
                  row.status === "possible_duplicate" ||
                  row.status === "new",
              )}
              actions={actions}
              onActionChange={(rowNumber, action) =>
                setActions((prev) => ({ ...prev, [rowNumber]: action }))
              }
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="border border-line px-4 py-2 text-sm"
            >
              Zpět
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void runImport()}
              className="bg-ink px-4 py-2 text-sm text-foam disabled:opacity-60"
            >
              Spustit import
            </button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="border border-line bg-foam p-10 text-center">
          <p className="text-sm text-ink-soft">Importuji leady…</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl">
            {loading ? "Zpracovávám dávky" : "Dokončuji"}
          </p>
        </section>
      ) : null}

      {step === 5 && result ? (
        <section className="space-y-5 border border-line bg-foam p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl">
            Import dokončen
          </h2>
          <p className="text-ink-soft">{result.total} zpracovaných řádků</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Nových" value={result.newCount} />
            <Stat label="Aktualizovaných" value={result.updatedCount} />
            <Stat label="Přeskočeno" value={result.skippedCount} />
            <Stat label="Chyb" value={result.invalidCount} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/leads?import_id=${result.importId}`}
              className="bg-ink px-4 py-2 text-sm text-foam"
            >
              Zobrazit importované
            </Link>
            <Link
              href={`/admin/leads?import_id=${result.importId}&grade=A`}
              className="border border-line px-4 py-2 text-sm"
            >
              Zobrazit A leady
            </Link>
            <Link
              href={`/admin/leads/imports/${result.importId}`}
              className="border border-line px-4 py-2 text-sm"
            >
              Detail importu
            </Link>
            <Link
              href="/admin/leads"
              className="border border-line px-4 py-2 text-sm"
            >
              Zpět na leady
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line bg-mist px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl">
        {value}
      </p>
    </div>
  );
}

function statusBadge(status: PreparedImportRow["status"]) {
  const styles: Record<PreparedImportRow["status"], string> = {
    new: "bg-emerald-800 text-white",
    duplicate: "bg-copper/20 text-copper-deep",
    possible_duplicate: "bg-amber-100 text-amber-900",
    invalid: "bg-stone-deep text-ink-soft",
  };
  const labels = {
    new: "NEW",
    duplicate: "DUPLICATE",
    possible_duplicate: "POSSIBLE",
    invalid: "INVALID",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function PreviewRowsTable({
  rows,
  actions,
  onActionChange,
}: {
  rows: PreparedImportRow[];
  actions: Record<number, DuplicateAction | "create"> | null;
  onActionChange?: (
    rowNumber: number,
    action: DuplicateAction | "create",
  ) => void;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead>
        <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
          <th className="px-2 py-2">#</th>
          <th className="px-2 py-2">Název</th>
          <th className="px-2 py-2">Město</th>
          <th className="px-2 py-2">Web</th>
          <th className="px-2 py-2">Telefon</th>
          <th className="px-2 py-2">E-mail</th>
          <th className="px-2 py-2">Stav</th>
          {actions ? <th className="px-2 py-2">Akce</th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.rowNumber} className="border-b border-line/50">
            <td className="px-2 py-2 text-ink-soft">{row.rowNumber}</td>
            <td className="px-2 py-2">{row.normalized.salon_name || "—"}</td>
            <td className="px-2 py-2">{row.normalized.city || "—"}</td>
            <td className="px-2 py-2">{row.normalized.website_domain || "—"}</td>
            <td className="px-2 py-2">
              {row.normalized.phone_normalized || row.normalized.phone || "—"}
            </td>
            <td className="px-2 py-2">{row.normalized.email || "—"}</td>
            <td className="px-2 py-2">
              {statusBadge(row.status)}
              {row.status === "invalid" ? (
                <p className="mt-1 text-xs text-copper-deep">
                  {row.validation.errors[0]}
                </p>
              ) : null}
              {row.duplicate.match ? (
                <p className="mt-1 text-xs text-ink-soft">
                  {row.duplicate.match.reason}
                </p>
              ) : null}
            </td>
            {actions ? (
              <td className="px-2 py-2">
                {row.status === "new" ? (
                  <span className="text-xs text-ink-soft">Vytvořit</span>
                ) : row.status === "invalid" ? (
                  <span className="text-xs text-ink-soft">Přeskočit</span>
                ) : (
                  <select
                    value={actions[row.rowNumber] || "fill_blank"}
                    onChange={(e) =>
                      onActionChange?.(
                        row.rowNumber,
                        e.target.value as DuplicateAction,
                      )
                    }
                    className="border border-line bg-mist px-2 py-1 text-xs"
                  >
                    <option value="fill_blank">Sloučit prázdná</option>
                    <option value="skip">Přeskočit</option>
                    <option value="update">Přepsat</option>
                  </select>
                )}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
