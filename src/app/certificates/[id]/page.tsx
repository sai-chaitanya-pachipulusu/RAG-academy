/**
 * Certificate Page
 * 
 * Displays a shareable certificate when a user completes a project track.
 * Accessible at /certificates/[id]
 */

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: certificate } = await supabase
    .from("project_certificates")
    .select("*, profiles(username, avatar_url)")
    .eq("id", id)
    .single();

  if (!certificate) {
    notFound();
  }

  const completedDate = new Date(certificate.completed_at);
  const formattedDate = completedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200">
        {/* Certificate Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate of Completion</h1>
          <p className="mt-2 text-gray-600">RAG Academy</p>
        </div>

        {/* Certificate Body */}
        <div className="text-center space-y-6 py-8 border-y border-gray-200">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">This certifies that</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {certificate.profiles?.username || "RAG Academy Student"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">has successfully completed</p>
            <p className="mt-2 text-xl font-medium text-gray-900">
              {certificate.track_title}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Project Track on RAG Academy
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Completed on</p>
            <p className="mt-1 text-lg text-gray-900">{formattedDate}</p>
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
          <div>
            <p>Certificate ID</p>
            <p className="font-mono text-xs mt-1">{certificate.id}</p>
          </div>
          <div className="text-right">
            <p>Verified by</p>
            <p className="font-medium text-gray-900">RAG Academy</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-all duration-200-all duration-200 text-sm cursor-pointer"
          >
            Print / Save PDF
          </button>
          <a
            href="/projects"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200-all duration-200 text-sm cursor-pointer"
          >
            Back to Projects
          </a>
        </div>
      </div>
    </div>
  );
}
