
import Papa from 'papaparse';
import { FinancialData, Industry } from '../types';

export const parseFinancialCSV = (file: File): Promise<Partial<FinancialData>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const row = results.data[0] as any;
          
          // Map flexible keys (handle different CSV headers)
          const data: Partial<FinancialData> = {
            revenue: parseFloat(row.revenue || row.Revenue || row.sales || 0),
            expenses: parseFloat(row.expenses || row.Expenses || row.cost || 0),
            accountsReceivable: parseFloat(row.receivables || row.AR || 0),
            accountsPayable: parseFloat(row.payables || row.AP || 0),
            inventory: parseFloat(row.inventory || row.Inventory || 0),
            loans: parseFloat(row.loans || row.Loans || row.debt || 0),
            cashInHand: parseFloat(row.cash || row.Cash || 0),
            industry: (row.industry || row.Industry || 'Services') as Industry
          };
          
          resolve(data);
        } catch (err) {
          reject(new Error("Failed to parse CSV data format."));
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
