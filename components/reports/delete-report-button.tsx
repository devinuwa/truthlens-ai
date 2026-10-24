"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteReportButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setLoading(true);
    setError("");
    const response = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("The report could not be deleted.");
      setLoading(false);
      return;
    }
    router.push("/reports");
    router.refresh();
  }

  return (
    <div>
      <Button type="button" variant="secondary" onClick={() => void remove()} disabled={loading}>
        {loading ? "Deleting…" : "Delete report"}
      </Button>
      {error ? <p className="mt-2 text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
