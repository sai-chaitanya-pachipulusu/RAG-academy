import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { Callout } from "@/components/learn/Callout";
import { ChallengeLinks } from "@/components/learn/ChallengeLinks";
import { Tabs, Tab } from "@/components/learn/Tabs";

export function MDXRenderer({ source }: { source: string }) {
  return (
    <div className="mdx">
      <MDXRemote
        source={source}
        components={{
          Callout,
          ChallengeLinks,
          Tabs,
          Tab,
        }}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  );
}


