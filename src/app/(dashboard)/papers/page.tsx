import { redirect } from "next/navigation";

export default function PapersPage() {
  // Papers are part of the Research section now.
  redirect("/research/papers");
}


