import Image from "next/image";

type HairwebLogoProps = {
  className?: string;
  /** Visual height in CSS pixels */
  height?: number;
  priority?: boolean;
  variant?: "dark" | "light";
};

const ASPECT = 2715 / 405;

export function HairwebLogo({
  className = "",
  height = 22,
  priority = false,
  variant = "dark",
}: HairwebLogoProps) {
  const width = Math.round(height * ASPECT);
  const src =
    variant === "light" ? "/logo-hairweb-light.png" : "/logo-hairweb.png";

  return (
    <Image
      src={src}
      alt="HAIRWEB"
      width={width}
      height={height}
      priority={priority}
      className={`w-auto ${className}`.trim()}
      style={{ height, width: "auto" }}
    />
  );
}
