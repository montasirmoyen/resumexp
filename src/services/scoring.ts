import { AnalysisResult } from '@/types/analysis';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function unique<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

export function computeJdMatch(resumeText: string, jdText: string): { match: number; missing: string[] } {
  const resumeTokens = new Set(unique(tokenize(resumeText)));
  const jdTokens = unique(tokenize(jdText)).filter(t => t.length > 2);

  let hits = 0;
  const missing: string[] = [];
  jdTokens.forEach(tok => {
    if (resumeTokens.has(tok)) hits += 1; else missing.push(tok);
  });

  const match = jdTokens.length ? hits / jdTokens.length : 0;
  return { match, missing: missing.slice(0, 20) };
}

export function scoreInterviewLikelihood(result: AnalysisResult, jdMatch: number): number {
  const clamp10 = (n: number) => Math.max(0, Math.min(10, n));
  const overall = clamp10(result.ratings.overall);
  const k = clamp10(result.ratings.keywords);
  const a = clamp10(result.ratings.achievements);
  const m = Math.max(0, Math.min(10, Math.round(jdMatch * 10)));

  const weighted = overall * 0.4 + k * 0.25 + a * 0.25 + m * 0.1;
  return Math.round(weighted * 10); // 0–100 scale
}

export function atsChecks(resumeText: string): { label: string; passed: boolean }[] {
  const hasEmail = /\b[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/.test(resumeText);
  const hasPhone = /(?:\+?\d[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/.test(resumeText);
  const hasDates = /\b(20\d{2}|19\d{2})\b/.test(resumeText);
  const hasSections = /(experience|education|skills)/i.test(resumeText);
  return [
    { label: 'Parsable email', passed: hasEmail },
    { label: 'Parsable phone', passed: hasPhone },
    { label: 'Dates present', passed: hasDates },
    { label: 'Common sections present', passed: hasSections },
  ];
}


