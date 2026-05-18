import type { Metadata } from "next";

import { CurriculumCompassDocs } from "@/components/mcp/CurriculumCompassDocs";
import { MCP_DISPLAY_NAME } from "@/lib/mcp/branding";

export const metadata: Metadata = {
  title: `${MCP_DISPLAY_NAME} · RAG Academy`,
  description:
    "Connect Cursor, Claude Desktop, and other MCP clients to the RAG Academy curriculum with search, MDX content, challenges, and public pricing.",
};

export default function CurriculumCompassPage() {
  return <CurriculumCompassDocs variant="full" />;
}
