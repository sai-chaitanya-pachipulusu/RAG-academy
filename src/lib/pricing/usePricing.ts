"use client";

import { useState, useEffect } from "react";
import {
  getCurrentPricingPhase,
  getDaysRemainingInPhase,
  getNextPhaseInfo,
  type PricingPhaseConfig,
} from "./config";

export interface UsePricingReturn {
  currentPhase: PricingPhaseConfig;
  daysRemaining: number | null;
  nextPhase: PricingPhaseConfig | null;
  priceIncrease: number | null;
  isEarlyBird: boolean;
  freeChallengeLimit: number;
}

/**
 * Hook to access current pricing information
 * Automatically updates when phase transitions occur
 */
export function usePricing(): UsePricingReturn {
  const [currentPhase, setCurrentPhase] = useState(getCurrentPricingPhase());
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [nextPhaseInfo, setNextPhaseInfo] = useState(getNextPhaseInfo());

  useEffect(() => {
    const updatePricingInfo = () => {
      const now = new Date();
      setCurrentPhase(getCurrentPricingPhase(now));
      setDaysRemaining(getDaysRemainingInPhase(now));
      setNextPhaseInfo(getNextPhaseInfo(now));
    };

    updatePricingInfo();

    // Check for phase transitions every hour
    const interval = setInterval(updatePricingInfo, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  return {
    currentPhase,
    daysRemaining,
    nextPhase: nextPhaseInfo.nextPhase,
    priceIncrease: nextPhaseInfo.priceIncrease,
    isEarlyBird: currentPhase.phase === "phase1",
    freeChallengeLimit: currentPhase.tiers.free.freeChallengeCount,
  };
}
