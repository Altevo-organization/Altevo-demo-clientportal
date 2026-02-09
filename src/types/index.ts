export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export const REQUEST_STATUSES: Record<string, StatusConfig> = {
  open: { label: "Ouvert", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  in_progress: { label: "En cours", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  waiting: { label: "En attente", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200" },
  resolved: { label: "Résolu", color: "text-green-700", bgColor: "bg-green-50 border-green-200" },
  closed: { label: "Fermé", color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200" },
};

export const PRIORITY_CONFIGS: Record<string, StatusConfig> = {
  low: { label: "Basse", color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200" },
  medium: { label: "Moyenne", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  high: { label: "Haute", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" },
  urgent: { label: "Urgente", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
};

export const DOCUMENT_CATEGORIES: Record<string, { label: string; icon: string }> = {
  contract: { label: "Contrat", icon: "FileText" },
  invoice: { label: "Facture", icon: "Receipt" },
  report: { label: "Rapport", icon: "BarChart3" },
  general: { label: "Général", icon: "File" },
};
