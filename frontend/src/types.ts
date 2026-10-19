export type SupportedLanguage =
  | 'python'
  | 'typescript'
  | 'javascript'
  | 'go'
  | 'rust'
  | 'java'
  | 'cpp'
  | 'c';

export type IngestionMode = 'paste' | 'upload' | 'github';

export interface CodePayload {
  code: string;
  language: SupportedLanguage;
  source: string;
}

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AstTarget {
  id: string;
  lineStart: number;
  lineEnd: number;
  category: string;
  threatLevel: ThreatLevel;
  ruleTitle: string;
  codeSnippet: string;
}

export interface InterrogationQuestion {
  id: string;
  architectName: string;
  threatBadge: string;
  question: string;
  timestamp: string;
  targetLineStart?: number;
  targetLineEnd?: number;
}

export interface CandidateDefense {
  questionId: string;
  defenseText: string;
  timestamp: string;
}

export interface GrillResponse {
  threatLevel: ThreatLevel;
  astTargets: AstTarget[];
  openingQuestions: InterrogationQuestion[];
  systemAnalysis: string;
}