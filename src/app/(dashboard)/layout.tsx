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
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
      <ChatWidget />
      <CommandPalette />
    </div>
  );
}
