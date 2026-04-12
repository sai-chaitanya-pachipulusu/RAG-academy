import Link from "next/link";
import { 
  getAllContributions, 
  getTopContributors,
} from "@/lib/contributions/mockData";
import type { Contribution, ContributionType, ContributionStatus } from "@/lib/contributions/types";
import { Card } from "@/components/ui/Card";

const TYPE_LABELS: Record<ContributionType, { label: string; icon: string; color: string }> = {
  challenge: { label: "Challenge", icon: "🎯", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  solution: { label: "Solution", icon: "✅", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  paper: { label: "Paper", icon: "📄", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  correction: { label: "Correction", icon: "🔧", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  translation: { label: "Translation", icon: "🌐", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
};

const STATUS_LABELS: Record<ContributionStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600 dark:bg-[#7C3AED] dark:text-gray-400" },
  submitted: { label: "Submitted", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  in_review: { label: "In Review", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  changes_requested: { label: "Changes Requested", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

function ContributionCard({ contribution }: { contribution: Contribution }) {
  const typeStyle = TYPE_LABELS[contribution.type];
  const statusStyle = STATUS_LABELS[contribution.status];
  
  return (
    <Card className="p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeStyle.color}`}>
              {typeStyle.icon} {typeStyle.label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.color}`}>
              {statusStyle.label}
            </span>
            {contribution.xpAwarded && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                +{contribution.xpAwarded} XP
              </span>
            )}
          </div>
          
          <h3 className="font-medium text-gray-900 dark:text-white">
            {contribution.title}
          </h3>
          
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {contribution.description}
          </p>
          
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>by <span className="font-medium text-gray-700 dark:text-gray-300">{contribution.userName}</span></span>
            <span>•</span>
            <span>{new Date(contribution.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ContributePage() {
  const contributions = getAllContributions();
  const topContributors = getTopContributors(5);
  
  const approved = contributions.filter(c => c.status === "approved");
  const pending = contributions.filter(c => c.status === "submitted" || c.status === "in_review");
  
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Contribute
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Help build RAG Academy! Submit challenges, solutions, papers, and corrections to earn XP and recognition.
        </p>
      </div>
      
      {/* Coming Soon Banner */}
      <Card className="border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚧</span>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">Contribution Portal Coming Soon</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              We&apos;re building the contribution submission system. For now, reach out on{" "}
              <a href="https://github.com" className="underline hover:no-underline cursor-pointer">GitHub</a>{" "}
              or <a href="https://discord.gg" className="underline hover:no-underline cursor-pointer">Discord</a> to contribute!
            </p>
          </div>
        </div>
      </Card>
      
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">{contributions.length}</p>
          <p className="text-sm text-gray-500">Total Contributions</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{approved.length}</p>
          <p className="text-sm text-gray-500">Approved</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{pending.length}</p>
          <p className="text-sm text-gray-500">In Review</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{topContributors.length}</p>
          <p className="text-sm text-gray-500">Contributors</p>
        </Card>
      </div>
      
      {/* Contribution types */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Ways to Contribute
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-4 border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-950/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Submit a Challenge</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create a new coding challenge with tests</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-indigo-600 dark:text-indigo-400">+500 XP when approved</p>
          </Card>
          
          <Card className="p-4 border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Share a Solution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alternative approaches to existing challenges</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-green-600 dark:text-green-400">+100 XP when approved</p>
          </Card>
          
          <Card className="p-4 border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Suggest a Paper</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add important research to our reading list</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-blue-600 dark:text-blue-400">+150 XP when approved</p>
          </Card>
          
          <Card className="p-4 border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Report a Bug</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fix errors in challenges or content</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">+75 XP when approved</p>
          </Card>
          
          <Card className="p-4 border-purple-200 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-950/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Translate Content</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Help localize lessons and challenges</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-purple-600 dark:text-purple-400">+200 XP when approved</p>
          </Card>
          
          <Card className="p-4 flex items-center justify-center border-dashed">
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer">
              + Start Contributing
            </button>
          </Card>
        </div>
      </section>
      
      {/* Top contributors */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Top Contributors
        </h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Contributor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Contributions</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">XP Earned</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Rank</th>
              </tr>
            </thead>
            <tbody>
              {topContributors.map((contributor, idx) => (
                <tr 
                  key={contributor.userId}
                  className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {contributor.userName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-green-600">{contributor.stats.approved}</span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-gray-600 dark:text-gray-400">{contributor.stats.totalContributions}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {contributor.stats.xpEarned.toLocaleString()} XP
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {contributor.stats.rank && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {contributor.stats.rank}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
      
      {/* Recent contributions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Contributions
          </h2>
          <Link
            href="/contribute/all"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {contributions.slice(0, 5).map(contribution => (
            <ContributionCard key={contribution.id} contribution={contribution} />
          ))}
        </div>
      </section>
      
      {/* Guidelines */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Contribution Guidelines
        </h2>
        <Card className="p-5">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">✅ Good Contributions</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Clear, well-documented code</li>
                <li>• Comprehensive test cases</li>
                <li>• Accurate complexity analysis</li>
                <li>• Real-world context and use cases</li>
                <li>• Links to relevant papers/resources</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">❌ Avoid</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Copy-pasted solutions without attribution</li>
                <li>• Incomplete or untested code</li>
                <li>• Duplicate submissions</li>
                <li>• Off-topic content</li>
                <li>• Promotional content</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
