import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function IconBase({ title, children, className = "", ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 shrink-0 ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function IconAudit(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" />
    </IconBase>
  );
}

export function IconPlan(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </IconBase>
  );
}

export function IconBuild(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20l5-1 9-9a2.1 2.1 0 00-3-3l-9 9-1 4z" />
      <path d="M13.5 6.5l3 3" />
    </IconBase>
  );
}

export function IconLink(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 12a4 4 0 004 4h2a4 4 0 000-8h-1" />
      <path d="M15 12a4 4 0 00-4-4H9a4 4 0 000 8h1" />
    </IconBase>
  );
}

export function IconCare(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
    </IconBase>
  );
}

export function IconGrowth(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 19h16" />
      <path d="M7 15l4-5 3 3 5-7" />
    </IconBase>
  );
}

export function IconWeb(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3 9h18" />
      <circle cx="6" cy="7" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="8.2" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconBooking(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 10h16M9 3v4M15 3v4" />
      <path d="M9 14h2M13 14h2M9 17h2" />
    </IconBase>
  );
}

export function IconGoogle(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
      <circle cx="12" cy="12" r="2.5" />
    </IconBase>
  );
}

export function IconReviews(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5l2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 14.3 7.8 16.5l.8-4.7-3.4-3.3 4.7-.7L12 3.5z" />
    </IconBase>
  );
}

export function IconSocial(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
      <path d="M9 7h6M9 10h6" />
    </IconBase>
  );
}

export function IconCustomers(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="9" r="3" />
      <circle cx="16" cy="10" r="2.2" />
      <path d="M3.5 19a5.5 5.5 0 0111 0" />
      <path d="M14 19a4 4 0 016.5-3" />
    </IconBase>
  );
}

export function IconAnalytics(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15v-4M12 15V8M16 15v-6" />
    </IconBase>
  );
}

export function IconMarketing(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 10v4l10 3V7L4 10z" />
      <path d="M14 9.5a4 4 0 010 5" />
      <path d="M16.5 8a6.5 6.5 0 010 8" />
    </IconBase>
  );
}

export function IconSeo(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-3.5-3.5" />
      <path d="M8.5 11h5M11 8.5v5" />
    </IconBase>
  );
}

export function IconIntegrations(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="7" cy="7" r="2.2" />
      <circle cx="17" cy="7" r="2.2" />
      <circle cx="12" cy="17" r="2.2" />
      <path d="M8.8 8.5l2.4 6M15.2 8.5l-2.4 6M9.2 7h5.6" />
    </IconBase>
  );
}

export function IconPrice(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M12 8v8M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.3-2.5 1.5c-1.5.2-2.5.7-2.5 1.7s1 1.5 2.5 1.5 2.5-.5 2.5-1.5" />
    </IconBase>
  );
}

export function IconTeam(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0111 0" />
      <path d="M16 8h4M18 6v4" />
      <path d="M15.5 19a4 4 0 014.5-3.8" />
    </IconBase>
  );
}

export function IconVacation(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 10h16M9 3v4M15 3v4" />
      <path d="M8 14h3M13 14h3M8 17h8" />
    </IconBase>
  );
}

export function IconService(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4v16M8 8l4-4 4 4" />
      <path d="M6 14h12" />
    </IconBase>
  );
}

export function IconFirmy(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M9 20v-6h6v6" />
      <path d="M9 11h.01M15 11h.01" />
    </IconBase>
  );
}
