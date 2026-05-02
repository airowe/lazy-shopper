import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'scan_stats';

type Milestone = { threshold: number; badge: string; isTopContributor?: boolean };

const MILESTONES: Milestone[] = [
  { threshold: 5, badge: '5 scans' },
  { threshold: 25, badge: '25 scans' },
  { threshold: 50, badge: '50 scans' },
  { threshold: 100, badge: '100 scans' },
  { threshold: 50, badge: 'Top 5%', isTopContributor: true },
];

type ScanContextType = {
  scanCount: number;
  badges: string[];
  isTopContributor: boolean;
  incrementScanCount: (count?: number) => void;
  getContributionStats: () => { totalScans: number; percentile: number };
};

const ScanContext = createContext<ScanContextType | null>(null);

function computeBadges(count: number): { badges: string[]; isTopContributor: boolean } {
  const badges: string[] = [];
  let isTopContributor = false;
  for (const m of MILESTONES) {
    if (count >= m.threshold) {
      if (m.isTopContributor) {
        isTopContributor = true;
      }
      badges.push(m.badge);
    }
  }
  return { badges, isTopContributor };
}

function computePercentile(count: number): number {
  if (count >= 100) return 95;
  if (count >= 50) return 85;
  if (count >= 25) return 70;
  if (count >= 5) return 40;
  return 10;
}

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scanCount, setScanCount] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [isTopContributor, setIsTopContributor] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const count = JSON.parse(stored) as number;
          setScanCount(count);
          const { badges: b, isTopContributor: itc } = computeBadges(count);
          setBadges(b);
          setIsTopContributor(itc);
        } catch {}
      }
    });
  }, []);

  const incrementScanCount = useCallback((count = 1) => {
    setScanCount((prev) => {
      const next = prev + count;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      const { badges: b, isTopContributor: itc } = computeBadges(next);
      setBadges(b);
      setIsTopContributor(itc);
      return next;
    });
  }, []);

  const getContributionStats = useCallback(() => {
    return {
      totalScans: scanCount,
      percentile: computePercentile(scanCount),
    };
  }, [scanCount]);

  return (
    <ScanContext.Provider
      value={{ scanCount, badges, isTopContributor, incrementScanCount, getContributionStats }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within ScanProvider');
  return ctx;
}
