"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/session", { method: "DELETE" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="btn-ghost text-sm"
    >
      Log out
    </button>
  );
}
