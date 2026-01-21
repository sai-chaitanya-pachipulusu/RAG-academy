import { notFound } from "next/navigation";

import { ChallengeIDE } from "@/components/challenge/ChallengeIDE";
import { MDXRenderer } from "@/components/learn/MDXRenderer";
import { getChallengeBySlug, getChallengeNeighbors } from "@/lib/challenges/catalog";
import { getChallengePrompt } from "@/lib/challenges/fs";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ChallengePage({ params }: Props) {
  const { slug } = await params;
  const challenge = getChallengeBySlug(slug);
  if (!challenge) notFound();

  const { prev, next } = getChallengeNeighbors(slug);
  const prompt = await getChallengePrompt(slug);

  return (
    <ChallengeIDE challenge={challenge} prev={prev} next={next}>
      {prompt ? <MDXRenderer source={prompt} /> : null}
    </ChallengeIDE>
  );
}


