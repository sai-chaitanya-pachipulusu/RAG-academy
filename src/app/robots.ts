import { MetadataRoute } from "next";
import { generateRobotsTxt } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/settings/billing/test/"],
    },
    sitemap: "https://ragacademy.com/sitemap.xml",
  };
}
