
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialData, AssessmentResult, SavedReport } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = (error?.message || "").toLowerCase();
      
      // Determine if error is a rate limit
      const isRateLimit = errorMessage.includes('429') || 
                          error?.status === 429 || 
                          errorMessage.includes('resource_exhausted');
      
      // Determine if error is transient (500s or MakerSuite proxy errors)
      const isTransient = errorMessage.includes('500') || 
                          errorMessage.includes('503') || 
                          errorMessage.includes('xhr error') || 
                          errorMessage.includes('rpc failed') ||
                          errorMessage.includes('unknown error');
      
      if ((isRateLimit || isTransient) && i < maxRetries - 1) {
        // Exponential backoff: 2s, 4s, 8s, 16s... + jitter
        const waitTime = (Math.pow(2, i) * 2000) + (Math.random() * 1000);
        console.warn(`Transient error encountered: ${errorMessage}. Retrying in ${Math.round(waitTime)}ms...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const analyzeFinancialHealth = async (data: FinancialData, history: SavedReport[] = []): Promise<AssessmentResult> => {
  return withRetry(async () => {
    // Re-initialize to ensure fresh environment key access and session state
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    if (data.revenue < 0 || data.expenses < 0) {
      throw new Error("Financial values cannot be negative. Data integrity check failed.");
    }

    const historicalContext = history.length > 0 
      ? `Historical Trend: Last analysis revenue was ₹${history[0].data.revenue}.` 
      : "Historical Trend: Initial analysis cycle.";

    const prompt = `Act as an SME Financial Auditor and AI Business Analyst. 
    Analyze this Indian business in the ${data.industry} sector. 
    
    Current Financial Snapshot:
    - Revenue: ₹${data.revenue} | Expenses: ₹${data.expenses}
    - Receivables: ₹${data.accountsReceivable} | Inventory: ₹${data.inventory} | Payables: ₹${data.accountsPayable}
    - Debt: ₹${data.loans} | Balance: ₹${data.bankBalance || 0}
    - ${historicalContext}

    Required Strategic Output (JSON):
    1. Working Capital Metrics: Compute exact Working Capital (AR + Inv - AP), Current Ratio, Debt-to-income, and EMI Burden (%).
    2. Tax Integrity: Estimate expected tax based on Indian SME slabs vs provided health. Flag under/overpayment.
    3. Bookkeeping Assistance: Provide 3 suggested ledger entry categorizations for this specific business type.
    4. Industry Benchmarking: Compare profit margin and expense ratio against ${data.industry} averages.
    5. Financial Forecasting: Provide next 3 months revenue, expense, and profit using predictive logic.
    6. Loan Eligibility: Detailed limit, propensity, and tenure options. 
       For each tenure option (12, 24, 36 months), provide estimated EMI and total interest based on eligible amount and avg interest rates.

    Return data in the specified JSON structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Pro model selected for its superior complex reasoning in auditing tasks
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            creditScore: { type: Type.NUMBER },
            riskRating: { type: Type.STRING },
            complianceScore: { type: Type.NUMBER },
            workingCapitalStatus: { type: Type.STRING },
            workingCapitalMetrics: {
              type: Type.OBJECT,
              properties: {
                workingCapital: { type: Type.NUMBER },
                currentRatio: { type: Type.NUMBER },
                debtToIncome: { type: Type.NUMBER },
                emiBurden: { type: Type.NUMBER }
              },
              required: ["workingCapital", "currentRatio", "debtToIncome", "emiBurden"]
            },
            bookkeepingAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedLedgerEntries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestedAccount: { type: Type.STRING }
                },
                required: ["category", "description", "suggestedAccount"]
              }
            },
            taxComplianceNotes: { type: Type.STRING },
            taxIntegrity: {
              type: Type.OBJECT,
              properties: {
                expectedTax: { type: Type.NUMBER },
                actualPaid: { type: Type.NUMBER },
                status: { type: Type.STRING }
              },
              required: ["expectedTax", "actualPaid", "status"]
            },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["title", "description", "impact"]
              }
            },
            benchmarks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  businessValue: { type: Type.NUMBER },
                  industryAverage: { type: Type.NUMBER },
                  status: { type: Type.STRING }
                },
                required: ["metric", "businessValue", "industryAverage", "status"]
              }
            },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  projectedRevenue: { type: Type.NUMBER },
                  projectedExpense: { type: Type.NUMBER },
                  projectedProfit: { type: Type.NUMBER }
                },
                required: ["month", "projectedRevenue", "projectedExpense", "projectedProfit"]
              }
            },
            fiveYearForecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.STRING },
                  revenue: { type: Type.NUMBER },
                  profit: { type: Type.NUMBER },
                  workingCapital: { type: Type.NUMBER }
                },
                required: ["year", "revenue", "profit"]
              }
            },
            revenueBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  percentage: { type: Type.NUMBER }
                },
                required: ["category", "amount", "percentage"]
              }
            },
            loanEligibility: {
              type: Type.OBJECT,
              properties: {
                eligibleAmount: { type: Type.NUMBER },
                interestRateRange: { type: Type.STRING },
                propensityScore: { type: Type.NUMBER },
                growthFactor: { type: Type.NUMBER },
                tenureOptions: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      months: { type: Type.NUMBER },
                      isEligible: { type: Type.BOOLEAN },
                      reason: { type: Type.STRING },
                      estimatedEmi: { type: Type.NUMBER },
                      totalInterest: { type: Type.NUMBER }
                    },
                    required: ["label", "months", "isEligible", "estimatedEmi", "totalInterest"]
                  } 
                }
              },
              required: ["eligibleAmount", "interestRateRange", "propensityScore", "growthFactor", "tenureOptions"]
            },
            financialProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  provider: { type: Type.STRING },
                  product: { type: Type.STRING },
                  rate: { type: Type.STRING },
                  suitability: { type: Type.STRING }
                },
                required: ["provider", "product", "rate", "suitability"]
              }
            },
            longTermTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            "creditScore", "riskRating", "complianceScore", "workingCapitalStatus", "workingCapitalMetrics",
            "bookkeepingAdvice", "suggestedLedgerEntries", "taxComplianceNotes", "taxIntegrity", 
            "insights", "recommendations", "benchmarks", "forecast", "fiveYearForecast", 
            "revenueBreakdown", "loanEligibility", "longTermTips", "financialProducts"
          ]
        }
      }
    });

    return JSON.parse(response.text.trim());
  });
};

export const askSupport = async (userMessage: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a professional financial assistant for FinPulse AI. Help users with questions about creditworthiness, bookkeeping, and business loans. User: "${userMessage}"`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "I'm sorry, I couldn't understand that.";
  });
};
