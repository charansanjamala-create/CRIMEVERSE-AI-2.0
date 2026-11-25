import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { casesAPI } from '../api';
import toast from 'react-hot-toast';

export interface CaseItem {
  _id: string;
  caseId: string;
  caseNumber?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  riskScore: number;
  riskFactors?: {
    connectedEntitiesScore: number;
    unresolvedRelationshipsScore: number;
    evidenceGapsScore: number;
    contradictionsScore: number;
  };
  entityCount: number;
  evidenceCount: number;
  tags?: string[];
  lastActivityAt?: string;
}

interface CaseContextType {
  activeCaseId: string | null;
  activeCaseDocId: string | null;
  activeCase: CaseItem | null;
  setActiveCaseId: (caseId: string) => void;
  availableCases: CaseItem[];
  cases: CaseItem[];
  isLoadingCases: boolean;
  refetchCases: () => void;
  isSwitcherOpen: boolean;
  setIsSwitcherOpen: (open: boolean) => void;
}

const CaseContext = createContext<CaseContextType | null>(null);

export const CaseProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(() => {
    return localStorage.getItem('crimeverse_active_case_id') || null;
  });
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Fetch all cases
  const { data: casesRes, isLoading: isLoadingCases, refetch: refetchCases } = useQuery({
    queryKey: ['cases-switcher-list'],
    queryFn: () => casesAPI.getAll({ limit: 50 }),
    staleTime: 30000,
  });

  const availableCases: CaseItem[] = (casesRes?.data?.data || []).map((c: any) => ({
    ...c,
    caseNumber: c.caseNumber || c.caseId,
  }));

  // Default to first case if none selected
  useEffect(() => {
    if (availableCases.length > 0 && !selectedCaseId) {
      const first = availableCases[0];
      setSelectedCaseId(first.caseId);
      localStorage.setItem('crimeverse_active_case_id', first.caseId);
    }
  }, [availableCases, selectedCaseId]);

  const activeCase = availableCases.find(c => c.caseId === selectedCaseId || c._id === selectedCaseId) || availableCases[0] || null;

  const setActiveCaseId = (caseId: string) => {
    setSelectedCaseId(caseId);
    localStorage.setItem('crimeverse_active_case_id', caseId);
    const c = availableCases.find(item => item.caseId === caseId || item._id === caseId);
    if (c) {
      toast.success(`Switched active investigation to ${c.caseNumber || c.caseId}: ${c.title}`, {
        icon: '📁',
      });
    }
  };

  return (
    <CaseContext.Provider
      value={{
        activeCaseId: activeCase?.caseId || null,
        activeCaseDocId: activeCase?._id || null,
        activeCase,
        setActiveCaseId,
        availableCases,
        cases: availableCases,
        isLoadingCases,
        refetchCases,
        isSwitcherOpen,
        setIsSwitcherOpen,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};


export const useActiveCase = () => {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error('useActiveCase must be used within CaseProvider');
  return ctx;
};
