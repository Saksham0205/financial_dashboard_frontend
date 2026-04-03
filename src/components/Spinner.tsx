"use client";

export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`${dims[size]} animate-spin rounded-full border-4 border-slate-200 border-t-balance`}
      />
    </div>
  );
}
