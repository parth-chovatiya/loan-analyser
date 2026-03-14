import type { LoanInput, PrePayment, RateChange } from './loan';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  loan: LoanInput;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
}

export interface ScenarioIntent {
  type: 'none' | 'prepayment_whatif' | 'rate_change_whatif' | 'target_closure';
  prepaymentAmount?: number;
  prepaymentDate?: string;
  newRate?: number;
  rateChangeDate?: string;
  targetYears?: number;
}
