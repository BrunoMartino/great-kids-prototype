import type { ReactElement } from "react";
import {
  FileImageIcon,
  FilePdfIcon,
  PencilSimpleIcon,
  TrashIcon as PhosphorTrashIcon,
  UploadSimpleIcon,
} from "@/app/design-system/icons";

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

/** File-kind glyphs for the upload dropzone: Phosphor duotone 24px, tinted by the dropzone (MASTER §7). */
export function ImageFileIcon(p_props: IconProps): ReactElement {
  return <FileImageIcon size={24} weight="duotone" alt={p_props.label} aria-hidden="true" focusable="false" />;
}

export function PdfFileIcon(p_props: IconProps): ReactElement {
  return <FilePdfIcon size={24} weight="duotone" alt={p_props.label} aria-hidden="true" focusable="false" />;
}

export function UploadIcon(p_props: IconProps): ReactElement {
  return (
    <UploadSimpleIcon size={16} weight="bold" alt={p_props.label} aria-hidden="true" focusable="false" />
  );
}
