export type Industry = 'Manufacturing' | 'Retail' | 'Agriculture' | 'Services' | 'Logistics' | 'E-commerce';
export type UserRole = 'admin' | 'owner';
export type Permission = 'analyze' | 'reports' | 'export' | 'settings';

export interface LoginSession {
  date: string;
  status: 'Success' | 'Failed';
  ip?: string;
}

export interface DailySalesEntry {
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  businessName?: string;
  industry?: Industry;
  permissions?: Permission[];
  age?: number;
  phoneNumber?: string;
  location?: string;
  gstNumber?: string;
  businessStartDate?: string;
  employeeCount?: number;
  loginHistory?: LoginSession[];
}

export interface FinancialData {
  revenue: number;
  expenses: number;
  accountsReceivable: number;
  accountsPayable: number;
  inventory: number;
  loans: number;
  cashInHand: number;
  industry: Industry;
  gstStatus?: 'Filed' | 'Pending' | 'Overdue';
  bankBalance?: number;
}

export interface SavedReport {
  id: string;
  date: string;
  data: FinancialData;
  assessment: AssessmentResult;
}

export interface TenureOption {
  label: string; // e.g. "12 Months"
  months: number;
  isEligible: boolean;
  reason?: string;
  estimatedEmi: number;
  totalInterest: number;
}

export interface AssessmentResult {
  creditScore: number;
  riskRating: 'Low' | 'Medium' | 'High';
  complianceScore: number; 
  workingCapitalStatus: string;
  workingCapitalMetrics: {
    workingCapital: number;
    currentRatio: number;
    debtToIncome: number;
    emiBurden: number;
  };
  bookkeepingAdvice: string[];
  suggestedLedgerEntries: {
    category: string;
    description: string;
    suggestedAccount: string;
  }[];
  taxComplianceNotes: string;
  taxIntegrity: {
    expectedTax: number;
    actualPaid: number;
    status: 'Compliant' | 'Underpaid' | 'Overpaid';
  };
  insights: string[];
  recommendations: {
    title: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
  }[];
  benchmarks: {
    metric: string;
    businessValue: number;
    industryAverage: number;
    status: 'Above' | 'Below' | 'Par';
  }[];
  forecast: {
    month: string;
    projectedRevenue: number;
    projectedExpense: number;
    projectedProfit: number;
  }[];
  fiveYearForecast: {
    year: string;
    revenue: number;
    profit: number;
    workingCapital?: number;
  }[];
  revenueBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  financialProducts: {
    provider: string;
    product: string;
    rate: string;
    suitability: string;
  }[];
  loanEligibility: {
    eligibleAmount: number;
    interestRateRange: string;
    propensityScore: number; 
    growthFactor: number; 
    tenureOptions: TenureOption[];
  };
  longTermTips: string[];
}

export type Language = 'en' | 'hi';

export interface Translations {
  dashboard: string;
  analyze: string;
  reports: string;
  liveFeed: string;
  settings: string;
  uploadData: string;
  creditScore: string;
  riskLevel: string;
  recommendations: string;
  industryBenchmarking: string;
  financialForecast: string;
}