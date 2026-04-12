import Link from "next/link";
import { 
  WEEKLY_EVENTS_SCHEDULE, 
  getWeekStart, 
  getEventStatus,
  getCurrentWeekEvents,
  getUpcomingEvents,
} from "@/lib/events/schedule";
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
  gray: "from-[#3B82F6]-500/20 to-[#3B82F6]-600/5 border-gray-500/30",
  sky: "from-sky-500/20 to-sky-600/5 border-sky-500/30",
  rose: "from-rose-500/20 to-rose-600/5 border-rose-500/30",
};

function EventCard({ event }: { event: WeeklyEvent }) {
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
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 ${colorClass}`}>
      {/* Status badge */}
      <div className="absolute right-4 top-4">
        {status === "active" && (
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Live Now
          </span>
        )}
        {status === "upcoming" && (
          <span className="rounded-full bg-yellow-500/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
            Upcoming
          </span>
        )}
        {status === "ended" && (
          <span className="rounded-full bg-gray-500/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Ended
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="flex items-start gap-4">
        <span className="text-3xl">{event.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-gray-600 dark:bg-white/10 dark:text-gray-300">
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            {event.xpBonus && (
              <span className="rounded-full bg-yellow-400/30 px-2.5 py-0.5 text-xs font-bold text-yellow-700 dark:text-yellow-300">
                +{event.xpBonus} XP Bonus
              </span>
            )}
            {event.badgeId && (
              <span className="rounded-full bg-purple-400/30 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                🏅 Earn Badge
              </span>
            )}
          </div>
          
          <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {event.title}
          </h3>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {event.description}
          </p>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              📆 {new Date(event.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} 
              {" – "}
              {new Date(event.endDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
            
            {link && status === "active" && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Join Now →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  if (link && status !== "ended") {
    if (link.startsWith("http")) {
      return (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block transition-all duration-200-transform hover:scale-[1.01] cursor-pointer"
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={link} className="block transition-all duration-200-transform hover:scale-[1.01] cursor-pointer">
        {content}
      </Link>
    );
  }
  
  return content;
}

export default function EventsPage() {
  const currentEvents = getCurrentWeekEvents();
  const upcomingEvents = getUpcomingEvents();
  
  // Group all events by week for the full schedule
  const eventsByWeek = new Map<string, WeeklyEvent[]>();
  for (const event of WEEKLY_EVENTS_SCHEDULE) {
    const weekStart = event.startDate;
    if (!eventsByWeek.has(weekStart)) {
      eventsByWeek.set(weekStart, []);
    }
    eventsByWeek.get(weekStart)!.push(event);
  }
  
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Weekly Events
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          New challenges, papers, and workshops every week. Participate to earn bonus XP and exclusive badges!
        </p>
      </div>
      
      {/* This Week */}
      {currentEvents.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
            </span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              This Week
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {currentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
      
      {/* Upcoming */}
      {upcomingEvents.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Coming Up
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
      
      {/* Full Schedule */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Full Schedule
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Week</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Challenge</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Paper/Workshop</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">XP Bonus</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Badge</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(eventsByWeek.entries()).map(([weekStart, events], idx) => {
                  const challenge = events.find(e => e.type === "weekly_challenge");
                  const paper = events.find(e => e.type === "paper_of_the_week" || e.type === "workshop" || e.type === "study_group");
                  const startDate = new Date(weekStart);
                  const endDate = new Date(startDate);
                  endDate.setDate(endDate.getDate() + 6);
                  
                  return (
                    <tr 
                      key={weekStart} 
                      className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          Week {idx + 1}
                        </div>
                        <div className="text-xs text-gray-500">
                          {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" - "}
                          {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {challenge ? (
                          <div className="flex items-center gap-2">
                            <span>{challenge.icon}</span>
                            <span className="text-gray-900 dark:text-white">{challenge.title.replace("Weekly Challenge: ", "").replace("Foundation Friday: ", "")}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {paper ? (
                          <div className="flex items-center gap-2">
                            <span>{paper.icon}</span>
                            <span className="text-gray-900 dark:text-white">{paper.title.replace("Paper Deep Dive: ", "").replace("Paper: ", "").replace("Workshop: ", "").replace("Study Group: ", "")}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {challenge?.xpBonus ? (
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                            +{challenge.xpBonus}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {challenge?.badgeId ? (
                          <span className="text-lg">🏅</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
      
      {/* How it works */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          How Weekly Events Work
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="text-2xl">📅</div>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">New Every Week</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Fresh challenges and papers drop every Monday. Events run for 7 days.
            </p>
          </Card>
          <Card>
            <div className="text-2xl">⚡</div>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">Bonus XP</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Complete weekly challenges during the event window to earn bonus XP.
            </p>
          </Card>
          <Card>
            <div className="text-2xl">🏅</div>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">Earn Badges</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Some events unlock exclusive badges for your profile.
            </p>
          </Card>
          <Card>
            <div className="text-2xl">👥</div>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">Community</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Join Discord discussions around the weekly paper and challenge.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
