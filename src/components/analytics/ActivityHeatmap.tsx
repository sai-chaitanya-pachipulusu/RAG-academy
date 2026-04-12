"use client";

import { useEffect, useState } from "react";

interface DayActivity {
  date: string;
  count: number;
  challenges: string[];
}

interface Props {
  activityData?: DayActivity[];
}

function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDayOfWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export function ActivityHeatmap({ activityData: propData }: Props) {
  const [activity, setActivity] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Load from localStorage if no prop data
    if (propData) {
      const map = new Map<string, number>();
      propData.forEach((d) => map.set(d.date, d.count));
      setActivity(map);
    } else {
      const stored = localStorage.getItem("activity_dates");
      if (stored) {
        const dates = JSON.parse(stored) as string[];
        const counts = new Map<string, number>();
        dates.forEach((d) => {
          counts.set(d, (counts.get(d) || 0) + 1);
        });
        setActivity(counts);
      }
    }
  }, [propData]);

  // Generate last 365 days (or last 52 weeks)
  const weeks: Date[][] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);

  // Align to Monday
  while (getDayOfWeek(startDate) !== 0) {
    startDate.setDate(startDate.getDate() - 1);
  }

  let currentWeek: Date[] = [];
  const current = new Date(startDate);

  while (current <= today) {
    currentWeek.push(new Date(current));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    current.setDate(current.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getActivityLevel = (date: Date): number => {
    const key = getDateKey(date);
    const count = activity.get(key) || 0;
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
  };

  const levelColors = [
    "bg-gray-100 dark:bg-[#2563EB]", // 0
    "bg-emerald-200 dark:bg-emerald-900", // 1
    "bg-emerald-400 dark:bg-emerald-700", // 2
    "bg-emerald-500 dark:bg-emerald-600", // 3
    "bg-emerald-600 dark:bg-emerald-500", // 4
  ];

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get month labels
  const monthLabels: { week: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const month = week[0].getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ week: i, label: months[month] });
      lastMonth = month;
    }
  });

  const totalContributions = Array.from(activity.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#2563EB]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Activity</h3>
        <span className="text-xs text-gray-500">
          {totalContributions} contributions in the last year
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        {/* Month labels */}
        <div className="mb-1 flex text-[10px] text-gray-400">
          <div className="w-4" /> {/* Spacer for day labels */}
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="flex-shrink-0"
              style={{
                width: `${(m.week - (monthLabels[i - 1]?.week || 0)) * 12}px`,
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 text-[10px] text-gray-400">
            <div className="h-[10px]" />
            <div className="h-[10px]">Mon</div>
            <div className="h-[10px]" />
            <div className="h-[10px]">Wed</div>
            <div className="h-[10px]" />
            <div className="h-[10px]">Fri</div>
            <div className="h-[10px]" />
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => {
                const level = getActivityLevel(day);
                const isToday = getDateKey(day) === getDateKey(today);
                const count = activity.get(getDateKey(day)) || 0;

                return (
                  <div
                    key={di}
                    className={`h-[10px] w-[10px] rounded-sm ${levelColors[level]} ${
                      isToday ? "ring-1 ring-indigo-500" : ""
                    }`}
                    title={`${getDateKey(day)}: ${count} contribution${count !== 1 ? "s" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-gray-400">
        <span>Less</span>
        {levelColors.map((color, i) => (
          <div key={i} className={`h-[10px] w-[10px] rounded-sm ${color}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
