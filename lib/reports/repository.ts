export function ownedReportScope(userId: string, reportId?: string) {
  if (!userId) {
    throw new Error("A signed-in user is required.");
  }
  const filters: Record<string, string> = { user_id: userId };
  if (reportId) filters.id = reportId;
  return { table: "analysis_reports" as const, filters };
}

export type StoredReport = {
  id: string;
  kind: "message" | "url";
  label: string;
  category: string;
  assessment: string;
  assessmentLabel: string;
  confidenceLevel: "low" | "medium" | "high" | null;
  indicators: unknown;
  recommendations: string[];
  limitations: string;
  storeSource: boolean;
  sourceExcerpt: string | null;
  createdAt: string;
};

type ReportRow = {
  id: string;
  kind: "message" | "url";
  label: string | null;
  category: string;
  assessment: string;
  assessment_label: string;
  confidence_level: "low" | "medium" | "high" | null;
  indicators: unknown;
  recommendations: string[] | null;
  limitations: string;
  store_source: boolean;
  source_excerpt: string | null;
  created_at: string;
};

function fromRow(row: ReportRow): StoredReport {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label || "Untitled check",
    category: row.category,
    assessment: row.assessment,
    assessmentLabel: row.assessment_label,
    confidenceLevel: row.confidence_level,
    indicators: row.indicators,
    recommendations: row.recommendations ?? [],
    limitations: row.limitations,
    storeSource: row.store_source,
    sourceExcerpt: row.source_excerpt,
    createdAt: row.created_at,
  };
}

type ReportQueryClient = {
  from: (table: string) => {
    select: (columns: string) => {
      match: (filters: Record<string, string>) => {
        order: (
          column: string,
          options: { ascending: boolean },
        ) => PromiseLike<{ data: ReportRow[] | null; error: { message: string } | null }>;
        maybeSingle: () => PromiseLike<{ data: ReportRow | null; error: { message: string } | null }>;
      };
    };
    delete: () => {
      match: (filters: Record<string, string>) => PromiseLike<{ error: { message: string } | null }>;
    };
  };
};

export async function listOwnedReports(client: ReportQueryClient, userId: string): Promise<StoredReport[]> {
  const scope = ownedReportScope(userId);
  const { data, error } = await client
    .from(scope.table)
    .select(
      "id, kind, label, category, assessment, assessment_label, confidence_level, indicators, recommendations, limitations, store_source, source_excerpt, created_at",
    )
    .match(scope.filters)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load reports.");
  return (data ?? []).map(fromRow);
}

export async function getOwnedReport(
  client: ReportQueryClient,
  userId: string,
  reportId: string,
): Promise<StoredReport | null> {
  const scope = ownedReportScope(userId, reportId);
  const { data, error } = await client
    .from(scope.table)
    .select(
      "id, kind, label, category, assessment, assessment_label, confidence_level, indicators, recommendations, limitations, store_source, source_excerpt, created_at",
    )
    .match(scope.filters)
    .maybeSingle();
  if (error) throw new Error("Could not load that report.");
  return data ? fromRow(data) : null;
}

export async function deleteOwnedReport(client: ReportQueryClient, userId: string, reportId: string) {
  const scope = ownedReportScope(userId, reportId);
  const { error } = await client.from(scope.table).delete().match(scope.filters);
  if (error) throw new Error("Could not delete that report.");
}
