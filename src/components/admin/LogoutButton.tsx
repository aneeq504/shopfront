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
      className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
    >
      Log out
    </button>
  );
}
