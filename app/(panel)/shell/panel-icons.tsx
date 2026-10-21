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

export function UploadIcon(p_props: IconProps): ReactElement {
  return (
    <UploadSimpleIcon size={16} weight="bold" alt={p_props.label} aria-hidden="true" focusable="false" />
  );
}
