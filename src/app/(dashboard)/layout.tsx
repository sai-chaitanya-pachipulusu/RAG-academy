import type { Metadata } from "next";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CommandPalette } from "@/components/navigation/CommandPalette";

export const metadata: Metadata = {
  title: "RAG Academy",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-transparent">
      <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
      <ChatWidget />
      <CommandPalette />
    </div>
  );
}
