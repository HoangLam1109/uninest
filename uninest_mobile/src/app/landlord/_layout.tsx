import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, type ReactNode } from "react";

import { useAuth } from "@/context/auth-context";
import { isLandlordRole } from "@/utils/landlord-access";

function LandlordAccessGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        router.replace("/sv/login_page" as any);
        return;
      }
      if (!isLandlordRole(user?.role)) {
        router.replace("/" as any);
      }
    }, [isAuthenticated, router, user?.role]),
  );

  return children;
}

export default function LandlordLayout() {
  return (
    <LandlordAccessGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </LandlordAccessGuard>
  );
}
