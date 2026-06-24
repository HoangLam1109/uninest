import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function LandlordProfileEditPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/landlord/profile_page" as any);
  }, [router]);

  return null;
}
