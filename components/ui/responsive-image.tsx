import Image, { type ImageProps } from "next/image";

type ResponsiveImageProps = Omit<ImageProps, "alt" | "sizes"> & {
  alt: string;
  sizes?: string;
  decorative?: boolean;
};

export function ResponsiveImage({
  alt,
  decorative = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  ...props
}: ResponsiveImageProps) {
  return <Image alt={decorative ? "" : alt} sizes={sizes} {...props} />;
}
