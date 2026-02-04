/**
 * Competition Card Component
 * 
 * Displays competition information, registration status,
 * and leaderboard preview.
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  Users,
  Calendar,
  ArrowRight,
  Medal,
  Timer,
  Target,
  Flame,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TouchButton } from "@/components/ui/TouchButton";
import { useToast } from "@/components/ui/Toast";
import type {
  Competition,
  CompetitionLeaderboardEntry,
  WeeklyEvent,
} from "@/lib/events/competitions";
import {
  registerForCompetition,
  getCompetitionLeaderboard,
  getTimeUntil,
  canRegister,
  formatDuration,
} from "@/lib/events/competitions";
import Link from "next/link";

interface CompetitionCardProps {
  competition: Competition;
  showLeaderboard?: boolean;
  compact?: boolean;
}

const TYPE_ICONS: Record<Competition["type"], React.ReactNode> = {
  weekly_challenge: <Target className="h-5 w-5" />,
  hackathon: <Flame className="h-5 w-5" />,
  speed_run: <Timer className="h-5 w-5" />,
  tournament: <Trophy className="h-5 w-5" />,
  community_event: <Users className="h-5 w-5" />,
};

const TYPE_COLORS: Record<Competition["type"], string> = {
  weekly_challenge: "from-blue-500 to-blue-600",
  hackathon: "from-orange-500 to-red-600",
  speed_run: "from-purple-500 to-pink-600",
  tournament: "from-amber-500 to-yellow-600",
  community_event: "from-green-500 to-emerald-600",
};

export function CompetitionCard({
  competition,
  showLeaderboard = true,
  compact = false,
}: CompetitionCardProps) {
  const [leaderboard, setLeaderboard] = useState<CompetitionLeaderboardEntry[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(competition.endDate));
  const { addToast } = useToast();

  useEffect(() => {
    if (showLeaderboard && competition.status === "active") {
      loadLeaderboard();
    }

    const timer = setInterval(() => {
      setTimeLeft(getTimeUntil(competition.endDate));
    }, 60000);

    return () => clearInterval(timer);
  }, [competition.id, competition.status]);

  const loadLeaderboard = async () => {
    const entries = await getCompetitionLeaderboard(competition.id, 5);
    setLeaderboard(entries);
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    const result = await registerForCompetition(competition.id);
    setIsRegistering(false);

    if (result.success) {
      addToast("Successfully registered!", "success");
      setIsRegistered(true);
    } else {
      addToast(result.error || "Registration failed", "error");
    }
  };

  const registrationStatus = canRegister(competition);

  if (compact) {
    return (
      <Card className="overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${TYPE_COLORS[competition.type]}`} />
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-gradient-to-br ${TYPE_COLORS[competition.type]} p-2 text-white`}>
                {TYPE_ICONS[competition.type]}
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {competition.title}
                </h3>
                <p className="text-xs text-zinc-500">
                  Ends in {timeLeft.days}d {timeLeft.hours}h
                </p>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              +{competition.xpBonus} XP
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header Banner */}
      <div className={`h-24 bg-gradient-to-r ${TYPE_COLORS[competition.type]} p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-3 text-white backdrop-blur-sm">
              {TYPE_ICONS[competition.type]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{competition.title}</h3>
              <p className="text-white/80">{competition.description}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
              +{competition.xpBonus} XP
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Info Grid */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <Clock className="mb-1 h-4 w-4 text-zinc-500" />
            <p className="text-xs text-zinc-500">Time Remaining</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <Target className="mb-1 h-4 w-4 text-zinc-500" />
            <p className="text-xs text-zinc-500">Challenges</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {competition.challengeSlugs.length}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <Trophy className="mb-1 h-4 w-4 text-zinc-500" />
            <p className="text-xs text-zinc-500">Scoring</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
              {competition.scoringType.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Challenges List */}
        <div className="mb-6">
          <h4 className="mb-3 font-medium text-zinc-900 dark:text-zinc-100">
            Featured Challenges
          </h4>
          <div className="flex flex-wrap gap-2">
            {competition.challengeSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/challenges/${slug}`}
                className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                {slug.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>

        {/* Leaderboard Preview */}
        {showLeaderboard && leaderboard.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-zinc-900 dark:text-zinc-100">
              Top Performers
            </h4>
            <div className="space-y-2">
              {leaderboard.slice(0, 3).map((entry) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        entry.rank === 1
                          ? "bg-amber-100 text-amber-700"
                          : entry.rank === 2
                          ? "bg-zinc-200 text-zinc-700"
                          : entry.rank === 3
                          ? "bg-orange-100 text-orange-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {entry.username || `User ${entry.userId.slice(0, 6)}`}
                    </span>
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-3">
          {competition.status === "upcoming" && (
            <TouchButton
              onClick={handleRegister}
              disabled={!registrationStatus.can || isRegistering || isRegistered}
              className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isRegistered
                ? "Registered!"
                : isRegistering
                ? "Registering..."
                : registrationStatus.can
                ? "Register Now"
                : registrationStatus.reason}
            </TouchButton>
          )}
          {competition.status === "active" && (
            <Link href={`/competitions/${competition.id}`} className="flex-1">
              <TouchButton className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                View Competition
                <ArrowRight className="ml-2 h-4 w-4" />
              </TouchButton>
            </Link>
          )}
          {competition.status === "completed" && (
            <TouchButton disabled className="flex-1">
              Competition Ended
            </TouchButton>
          )}
        </div>
      </div>
    </Card>
  );
}

// ============================================
// Weekly Event Card
// ============================================

interface WeeklyEventCardProps {
  event: WeeklyEvent;
  isCurrent?: boolean;
}

export function WeeklyEventCard({ event, isCurrent = false }: WeeklyEventCardProps) {
  const timeLeft = getTimeUntil(event.weekEnd);

  return (
    <Card className={`overflow-hidden ${isCurrent ? "ring-2 ring-indigo-500" : ""}`}>
      {isCurrent && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 text-center text-xs font-medium text-white">
          This Week's Challenge
        </div>
      )}
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className="mb-2 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              {event.theme}
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {event.challengeTitle}
            </h3>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              +{event.xpBonus} XP
            </span>
          </div>
        </div>

        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          {event.description}
        </p>

        {isCurrent && (
          <div className="mb-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Clock className="h-4 w-4" />
              <span>
                Ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
              </span>
            </div>
          </div>
        )}

        <Link href={`/challenges/${event.featuredChallengeSlug}`}>
          <TouchButton
            variant={isCurrent ? "primary" : "secondary"}
            className="w-full"
          >
            {isCurrent ? "Start Challenge" : "View Challenge"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </TouchButton>
        </Link>
      </div>
    </Card>
  );
}

// ============================================
// Competition Leaderboard
// ============================================

interface CompetitionLeaderboardProps {
  competitionId: string;
}

export function CompetitionLeaderboard({ competitionId }: CompetitionLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<CompetitionLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [competitionId]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const entries = await getCompetitionLeaderboard(competitionId, 100);
    setLeaderboard(entries);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
          <Trophy className="h-5 w-5 text-amber-500" />
          Leaderboard
        </h3>
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {leaderboard.map((entry) => (
          <div
            key={entry.userId}
            className="flex items-center justify-between px-6 py-4"
          >
            <div className="flex items-center gap-4">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  entry.rank === 1
                    ? "bg-amber-100 text-amber-700"
                    : entry.rank === 2
                    ? "bg-zinc-200 text-zinc-700"
                    : entry.rank === 3
                    ? "bg-orange-100 text-orange-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {entry.rank <= 3 ? (
                  <Medal className="h-4 w-4" />
                ) : (
                  entry.rank
                )}
              </span>
              <div className="flex items-center gap-3">
                {entry.avatarUrl ? (
                  <img
                    src={entry.avatarUrl}
                    alt={entry.username || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <Users className="h-4 w-4 text-zinc-500" />
                  </div>
                )}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {entry.username || `User ${entry.userId.slice(0, 6)}`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                {entry.score.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500">
                {entry.challengesCompleted} challenges
              </p>
            </div>
          </div>
        ))}

        {leaderboard.length === 0 && (
          <div className="p-8 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
            <p className="text-zinc-500">No entries yet. Be the first!</p>
          </div>
        )}
      </div>
    </Card>
  );
}
