
import { type ReactNode } from "react";

type RetrievalHit = {
  doc_id: number;
  score: number;
  preview: string;
};

type RetrievalSample = {
  query: string;
  hits: RetrievalHit[];
};

type Props = {
  data: {
    type: "retrieval";
    samples: RetrievalSample[];
  };
};

export function RetrievalVisualizer({ data }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {data.samples.map((sample, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#7C3AED]">
          <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Query: <span className="text-gray-900 dark:text-gray-100">{sample.query}</span>
          </div>
          <div className="p-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400">
                  <th className="pb-2 font-medium">Rank</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Doc ID</th>
                  <th className="pb-2 font-medium">Content Preview</th>
                </tr>
              </thead>
              <tbody>
                {sample.hits.length > 0 ? (
                  sample.hits.map((hit, rank) => (
                    <tr
                      key={hit.doc_id}
                      className="border-b border-dashed border-gray-100 last:border-0 dark:border-gray-800/50"
                    >
                      <td className="py-1.5 align-top text-gray-400">{rank + 1}</td>
                      <td className="py-1.5 align-top font-mono text-gray-600 dark:text-gray-400">
                        {hit.score.toFixed(4)}
                      </td>
                      <td className="py-1.5 align-top font-mono text-gray-500">{hit.doc_id}</td>
                      <td className="py-1.5 align-top text-gray-700 dark:text-gray-300">
                        {hit.preview}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-2 text-center text-gray-400 italic">
                      No documents retrieved
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
