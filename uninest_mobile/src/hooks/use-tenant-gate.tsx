import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { UpgradeRequiredPrompt } from "@/components/upgrade-required-prompt";
import type { UpgradeFeatureKey } from "@/constants/upgrade-features";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  isGuestUser,
  isTenantUser,
  isUpgradeRequiredError,
} from "@/utils/tenant-access";

export function useTenantGate() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [promptFeature, setPromptFeature] = useState<UpgradeFeatureKey | null>(
    null,
  );

  const closePrompt = useCallback(() => {
    setPromptFeature(null);
  }, []);

  const goToUpgrade = useCallback(() => {
    setPromptFeature(null);
    router.push("/sv/upgrade_package_page" as any);
  }, [router]);

  const requireTenant = useCallback(
    (feature: UpgradeFeatureKey, options?: { requireAuth?: boolean }): boolean => {
      if (options?.requireAuth && !isAuthenticated) {
        router.push("/sv/login_page" as any);
        return false;
      }
      if (isTenantUser(user?.role)) return true;
      setPromptFeature(feature);
      return false;
    },
    [isAuthenticated, router, user?.role],
  );

  const handleTenantApiError = useCallback(
    (error: unknown, feature: UpgradeFeatureKey): boolean => {
      if (isGuestUser(user?.role) && isUpgradeRequiredError(getApiErrorMessage(error, ""))) {
        setPromptFeature(feature);
        return true;
      }
      return false;
    },
    [user?.role],
  );

  function TenantGatePrompt() {
    if (promptFeature === null) return null;

    return (
      <UpgradeRequiredPrompt
        visible
        feature={promptFeature}
        userRole={user?.role}
        onClose={closePrompt}
        onUpgrade={goToUpgrade}
      />
    );
  }

  return {
    requireTenant,
    handleTenantApiError,
    closePrompt,
    TenantGatePrompt,
    isGuest: isGuestUser(user?.role),
    isTenant: isTenantUser(user?.role),
  };
}
