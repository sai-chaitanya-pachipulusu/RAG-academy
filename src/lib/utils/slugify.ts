export function slugifyId(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      // Replace non-alphanumeric with hyphen
      .replace(/[^a-z0-9]+/g, "-")
      // Collapse multiple hyphens
      .replace(/-+/g, "-")
      // Trim hyphens
      .replace(/^-|-$/g, "")
  );
}


