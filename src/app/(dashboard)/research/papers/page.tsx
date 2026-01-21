import { PapersReadingList } from "@/components/research/PapersReadingList";
import { PAPERS_READING_LIST } from "@/lib/research/readingList";

export default function ResearchPapersPage() {
  return <PapersReadingList papers={PAPERS_READING_LIST} />;
}


