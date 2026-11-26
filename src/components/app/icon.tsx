import Image from "next/image";

// Figma에서 내려받은 아이콘 (public/icons). 크기는 원본 SVG 크기를 그대로 쓴다.
const ICONS = {
  "tab-home": [24, 24],
  "tab-chat": [23, 24],
  "tab-profile": [24, 24],
  "tab-products": [24, 24],
  "tab-settings": [24, 24],
  "chevron-right": [24, 24],
  "arrow-circle": [27, 27],
  "arrow-up-right-circle": [40, 40],
  "chat-start": [40, 40],
  star: [13, 13],
  back: [7.57969, 14.2535],
  more: [40, 40],
  send: [55, 55],
  "check-circle": [27, 26],
  edit: [12, 12],
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className,
  alt = "",
}: {
  name: IconName;
  className?: string;
  alt?: string;
}) {
  const [width, height] = ICONS[name];
  return (
    <Image
      src={`/icons/${name}.svg`}
      width={width}
      height={height}
      alt={alt}
      className={className}
      unoptimized
    />
  );
}
