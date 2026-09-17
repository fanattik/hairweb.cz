"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  clearLeadsListUrl,
  getLeadsListUrl,
  LEADS_LIST_DEFAULT_PATH,
  saveLeadsListUrl,
} from "@/lib/admin/leads-list-url";

/** Saves current list query to session whenever the leads list is viewed. */
export function PersistLeadsListUrl() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    if (qs) {
      saveLeadsListUrl(`${LEADS_LIST_DEFAULT_PATH}?${qs}`);
    }
  }, [searchParams]);

  return null;
}

/** Link that restores the last filtered leads list URL. */
export function LeadsListLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [href, setHref] = useState(LEADS_LIST_DEFAULT_PATH);

  useEffect(() => {
    setHref(getLeadsListUrl());
  }, []);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** Clears persisted filters and returns to the unfiltered list. */
export function ClearLeadsFiltersLink({
  className,
  children = "Vyčistit filtry",
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={LEADS_LIST_DEFAULT_PATH}
      className={className}
      onClick={() => clearLeadsListUrl()}
    >
      {children}
    </Link>
  );
}
