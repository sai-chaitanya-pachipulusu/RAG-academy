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
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-[1400px] px-8 py-12 lg:px-16 lg:py-16">
        {children}
      </main>
      <ChatWidget />
      <CommandPalette />
    </div>
  );
}
