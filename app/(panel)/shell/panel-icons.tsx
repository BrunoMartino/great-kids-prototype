import type { ReactElement } from "react";

type IconProps = {
  label: string;
};

export function PencilIcon(p_props: IconProps): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <title>{p_props.label}</title>
      <path
        fill="currentColor"
        d="M11.7 1.3c.4-.4 1-.4 1.4 0l1.6 1.6c.4.4.4 1 0 1.4l-8.5 8.5-3.2.7.7-3.2 8-8zM3.5 13.2l1.1-.2-0.9-0.9-.2 1.1z"
      />
    </svg>
  );
}

export function TrashIcon(p_props: IconProps): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <title>{p_props.label}</title>
      <path
        fill="currentColor"
        d="M6 1h4l.7 1H14v2H2V2h3.3L6 1zm1 5v6H6V6h1zm3 0v6H9V6h1zM4 5h8l-.6 9.2c-.1.9-.8 1.8-1.7 1.8H6.3c-.9 0-1.6-.8-1.7-1.8L4 5z"
      />
    </svg>
  );
}

export function UploadIcon(p_props: IconProps): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <title>{p_props.label}</title>
      <path
        fill="currentColor"
        d="M8 2l3.5 3.5H9.5V10h-3V5.5H4.5L8 2zM3 12h10v2H3v-2z"
      />
    </svg>
  );
}
