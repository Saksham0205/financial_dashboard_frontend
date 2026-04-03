"use client";

import { useEffect } from "react";
import { startKeepAlive } from "@/lib/keepAlive";

export default function KeepAlive() {
  useEffect(() => {
    startKeepAlive();
  }, []);
  return null;
}
