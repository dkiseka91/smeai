import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Report } from './types';

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'vibecheck.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT NOT NULL,
    score REAL,
    category_scores TEXT,
    findings TEXT NOT NULL DEFAULT '[]',
    error TEXT
  );
`);

interface ReportRow {
  id: string;
  url: string;
  created_at: string;
  completed_at: string | null;
  status: string;
  score: number | null;
  category_scores: string | null;
  findings: string;
  error: string | null;
}

function rowToReport(row: ReportRow): Report {
  return {
    id: row.id,
    url: row.url,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    status: row.status as Report['status'],
    score: row.score,
    categoryScores: row.category_scores ? JSON.parse(row.category_scores) : null,
    findings: JSON.parse(row.findings),
    error: row.error,
  };
}

export function createReport(id: string, url: string): Report {
  const report: Report = {
    id,
    url,
    createdAt: new Date().toISOString(),
    completedAt: null,
    status: 'pending',
    score: null,
    categoryScores: null,
    findings: [],
    error: null,
  };
  db.prepare(
    `INSERT INTO reports (id, url, created_at, completed_at, status, score, category_scores, findings, error)
     VALUES (@id, @url, @createdAt, @completedAt, @status, @score, @categoryScores, @findings, @error)`
  ).run({
    id: report.id,
    url: report.url,
    createdAt: report.createdAt,
    completedAt: report.completedAt,
    status: report.status,
    score: report.score,
    categoryScores: null,
    findings: JSON.stringify(report.findings),
    error: report.error,
  });
  return report;
}

export function getReport(id: string): Report | undefined {
  const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as ReportRow | undefined;
  return row ? rowToReport(row) : undefined;
}

export function updateReport(id: string, patch: Partial<Report>): void {
  const existing = getReport(id);
  if (!existing) return;
  const merged: Report = { ...existing, ...patch };
  db.prepare(
    `UPDATE reports SET url=@url, completed_at=@completedAt, status=@status, score=@score,
     category_scores=@categoryScores, findings=@findings, error=@error WHERE id=@id`
  ).run({
    id: merged.id,
    url: merged.url,
    completedAt: merged.completedAt,
    status: merged.status,
    score: merged.score,
    categoryScores: merged.categoryScores ? JSON.stringify(merged.categoryScores) : null,
    findings: JSON.stringify(merged.findings),
    error: merged.error,
  });
}

export function listRecentReports(limit = 20): Report[] {
  const rows = db.prepare('SELECT * FROM reports ORDER BY created_at DESC LIMIT ?').all(limit) as ReportRow[];
  return rows.map(rowToReport);
}

export default db;
