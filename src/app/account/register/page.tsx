import { Suspense } from "react";
import { AccountForm } from "@/components/account/AccountForm";

export default function CustomerRegisterPage() {
  return (
    <Suspense>
      <AccountForm mode="register" />
    </Suspense>
  );
}
