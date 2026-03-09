import { NextResponse } from 'next/server';
import type { LoanInput, PrePayment, RateChange } from '@/types/loan';
import { validateLoan } from '@/utils/validation';
import { getRecommendations } from '@/services/recommendations';

interface RequestBody {
  loan: LoanInput;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
}

export const POST = async (request: Request) => {
  try {
    const body: RequestBody = await request.json();
    const { loan, prePayments = [], rateChanges = [] } = body;

    if (!loan) {
      return NextResponse.json({ error: 'Loan data is required' }, { status: 400 });
    }

    const validationError = validateLoan(loan);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const result = getRecommendations(loan, prePayments, rateChanges);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
};
