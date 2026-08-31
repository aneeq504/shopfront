import { Suspense } from "react";
import { AccountForm } from "@/components/account/AccountForm";

export default function CustomerLoginPage() {
  return (
    <Suspense>
      <AccountForm mode="login" />
    </Suspense>
  );
}
