import type { Metadata, Viewport } from "next";
import type { ReactElement, ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

const ROOT_DOCUMENT_STYLES: string = `
html {
  box-sizing: border-box;
  min-height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100dvh;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  color-scheme: light;
}
*,
*::before,
*::after {
  box-sizing: inherit;
}
body {
  margin: 0;
  min-height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100dvh;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #2c2a28;
  background: #faf8f5;
}
`;

export const metadata: Metadata = {
  title: "Great Kids",
  description: "Family activities for loving parents.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout(p_props: RootLayoutProps): ReactElement {
  return (
    <html lang="pt-BR">
      <body>
        <style href="root-document" precedence="high">
          {ROOT_DOCUMENT_STYLES}
        </style>
        {p_props.children}
      </body>
    </html>
  );
}
