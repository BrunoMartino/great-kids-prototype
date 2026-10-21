import type { ReactElement } from "react";
import { PencilSimpleIcon, TrashIcon as PhosphorTrashIcon, UploadSimpleIcon } from "@/app/design-system/icons";

type IconProps = {
  label: string;
};

/** Admin table glyphs: Phosphor `bold` 16px (MASTER §7). The label stays as the SVG title. */
export function PencilIcon(p_props: IconProps): ReactElement {
  return (
    <PencilSimpleIcon size={16} weight="bold" alt={p_props.label} aria-hidden="true" focusable="false" />
  );
}

export function TrashIcon(p_props: IconProps): ReactElement {
  return (
    <PhosphorTrashIcon size={16} weight="bold" alt={p_props.label} aria-hidden="true" focusable="false" />
  );
}

export function ImageFileIcon(p_props: IconProps): ReactElement {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <title>{p_props.label}</title>
      <rect x="4" y="6" width="32" height="28" rx="6" fill="#1f9d8a" />
      <path fill="#f3f8ff" d="M8 28h24l-8-10-5 6.4-3.4-4.2L8 28z" />
      <circle cx="27" cy="14" r="3" fill="#ffc43d" />
    </svg>
  );
}

export function PdfFileIcon(p_props: IconProps): ReactElement {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <title>{p_props.label}</title>
      <path fill="#e23d4d" d="M10 4h14l8 8v24H10V4z" />
      <path fill="#f3f8ff" opacity="0.35" d="M24 4v8h8" />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fill="#f3f8ff"
        fontSize="9"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

export function UploadIcon(p_props: IconProps): ReactElement {
  return (
    <UploadSimpleIcon size={16} weight="bold" alt={p_props.label} aria-hidden="true" focusable="false" />
  );
}
