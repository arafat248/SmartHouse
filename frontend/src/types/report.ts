export interface Report {
  id: number;
  household: number;
  report_type: string;
  period_start: string;
  period_end: string;
  data: any; // Ideally we can make this more specific later based on backend payload, e.g. Record<string, unknown>
  created_at: string;
}

export interface ReportInput {
  household: number;
  report_type: string;
  period_start: string;
  period_end: string;
}
