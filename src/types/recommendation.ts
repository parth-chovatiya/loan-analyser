export interface Recommendation {
  id: string;
  type: 'prepayment' | 'refinance' | 'emi_increase' | 'lump_sum_timing';
  title: string;
  description: string;
  impact: {
    interestSaved: number;
    monthsSaved: number;
    newClosureDate: string;
  };
  priority: 'high' | 'medium' | 'low';
}

export interface RecommendResponse {
  recommendations: Recommendation[];
  currentSummary: {
    totalInterest: number;
    totalMonths: number;
    closureDate: string;
  };
}
