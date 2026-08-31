"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/account/session", { method: "DELETE" });
        router.push("/");
        router.refresh();
      }}
      className="btn-ghost text-sm"
    >
      Sign out
    </button>
  );
}
