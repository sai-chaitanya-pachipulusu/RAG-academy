"use client";

import Link from "next/link";
import { getCurrentWeekEvents, getEventStatus, getUpcomingEvents } from "@/lib/events/schedule";
import type { WeeklyEvent, EventType } from "@/lib/events/types";
import { Card } from "@/components/ui/Card";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  weekly_challenge: "Challenge",
  paper_of_the_week: "Paper",
  community_challenge: "Community",
  workshop: "Workshop",
  study_group: "Study Group",
};

const BANNER_COLORS: Record<string, string> = {
  emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
  purple: "from-purple-500/20 to-purple-600/5 border-purple-500/30",
  red: "from-red-500/20 to-red-600/5 border-red-500/30",
  indigo: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/30",
  cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30",
  pink: "from-pink-500/20 to-pink-600/5 border-pink-500/30",
  violet: "from-violet-500/20 to-violet-600/5 border-violet-500/30",
  teal: "from-teal-500/20 to-teal-600/5 border-teal-500/30",
  orange: "from-orange-500/20 to-orange-600/5 border-orange-500/30",
  lime: "from-lime-500/20 to-lime-600/5 border-lime-500/30",
  slate: "from-slate-500/20 to-slate-600/5 border-slate-500/30",
  gray: "from-gray-500/20 to-gray-600/5 border-gray-500/30",
  sky: "from-sky-500/20 to-sky-600/5 border-sky-500/30",
  rose: "from-rose-500/20 to-rose-600/5 border-rose-500/30",
};

function EventCard({ event, compact = false }: { event: WeeklyEvent; compact?: boolean }) {
  const status = getEventStatus(event);
  const colorClass = BANNER_COLORS[event.bannerColor || "blue"];
  
  const getEventLink = () => {
    if (event.challengeSlug) return `/challenges/${event.challengeSlug}`;
    if (event.paperUrl) return event.paperUrl;
    if (event.workshopUrl) return event.workshopUrl;
    return null;
  };
  
  const link = getEventLink();
  
  const content = (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 ${colorClass}`}>
      {/* Status badge */}
      <div className="absolute right-3 top-3">
        {status === "active" && (
          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
            </span>
            Live
          </span>
        )}
        {status === "upcoming" && (
          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
            Coming Soon
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="flex items-start gap-3">
        <span className="text-2xl">{event.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            {event.xpBonus && (
              <span className="rounded-full bg-yellow-400/30 px-2 py-0.5 text-[10px] font-bold text-yellow-700 dark:text-yellow-300">
                +{event.xpBonus} XP
              </span>
            )}
            {event.badgeId && (
              <span className="rounded-full bg-purple-400/30 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300">
                🏅 Badge
              </span>
            )}
          </div>
          <h3 className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
            {event.title}
          </h3>
          {!compact && (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {event.description}
            </p>
          )}
          <p className="mt-2 text-[10px] text-zinc-500 dark:text-zinc-500">
            {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} 
            {" - "}
            {new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
  
  if (link) {
    if (link.startsWith("http")) {
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:scale-[1.02]">
          {content}
        </a>
      );
    }
    return (
      <Link href={link} className="block transition-transform hover:scale-[1.02]">
        {content}
      </Link>
    );
  }
  
  return content;
}

export function WeeklyEventsCard() {
  const currentEvents = getCurrentWeekEvents();
  const upcomingEvents = getUpcomingEvents().slice(0, 2);
  
  if (currentEvents.length === 0 && upcomingEvents.length === 0) {
    return null;
  }
  
  return (
    <Card className="p-0 overflow-hidden">
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">This Week</h2>
          </div>
          <Link
            href="/events"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            View all →
          </Link>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {currentEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        
        {upcomingEvents.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Coming Up
              </span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </>
        )}
      </div>
    </Card>
  );
}

/**
 * Minimal event banner for the dashboard hero.
 */
export function EventBanner() {
  const currentEvents = getCurrentWeekEvents();
  const featuredEvent = currentEvents.find((e) => e.type === "weekly_challenge");
  
  if (!featuredEvent) return null;
  
  const status = getEventStatus(featuredEvent);
  if (status !== "active") return null;
  
  return (
    <Link 
      href={featuredEvent.challengeSlug ? `/challenges/${featuredEvent.challengeSlug}` : "/events"}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-xl dark:bg-indigo-900/50">
              {featuredEvent.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Weekly Challenge
                </span>
                <span className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-medium text-green-600 dark:text-green-400">Live</span>
                </span>
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {featuredEvent.title}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {featuredEvent.xpBonus && (
              <div className="rounded-full bg-yellow-100 px-3 py-1 dark:bg-yellow-900/30">
                <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                  +{featuredEvent.xpBonus} XP
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
              Join →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
