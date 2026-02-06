
import { LayoutDashboard, FileSearch, FileText, Settings, PlusCircle, Globe, Wallet, ShieldAlert, BarChart3, HelpCircle, MessageSquare, Activity, Plus } from 'lucide-react';
import { Translations } from './types';

export const ICONS = {
  Dashboard: LayoutDashboard,
  Analyze: FileSearch,
  Reports: FileText,
  Settings: Settings,
  Plus: PlusCircle,
  Language: Globe,
  Financial: Wallet,
  Risk: ShieldAlert,
  Chart: BarChart3,
  Help: HelpCircle,
  Chat: MessageSquare,
  Live: Activity,
  Add: Plus
};

export const TRANSLATIONS: Record<string, Translations> = {
  en: {
    dashboard: "My Shop Status",
    analyze: "Check My Profits",
    reports: "My Shop Papers",
    liveFeed: "Daily Money Tracker",
    settings: "Settings",
    uploadData: "Put your shop file here",
    creditScore: "Bank Trust Score",
    riskLevel: "Danger Level",
    recommendations: "How to Grow & Save",
    industryBenchmarking: "Me vs Other Shops",
    financialForecast: "Next 6 Months Plan"
  },
  hi: {
    dashboard: "मेरे दुकान की स्थिति",
    analyze: "फायदे की जांच",
    reports: "मेरी रिपोर्ट लें",
    liveFeed: "रोजाना कमाई का हिसाब",
    settings: "सेटिंग्स",
    uploadData: "अपनी फाइल यहाँ डालें",
    creditScore: "बैंक भरोसा स्कोर",
    riskLevel: "खतरे का स्तर",
    recommendations: "पैसे बचाने के तरीके",
    industryBenchmarking: "मेरी और अन्य दुकानों की तुलना",
    financialForecast: "अगले 6 महीने की योजना"
  }
};
