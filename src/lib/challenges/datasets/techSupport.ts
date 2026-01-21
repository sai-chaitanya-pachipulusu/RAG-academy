
import { Dataset } from "./types";

export const TECH_SUPPORT_DATASET: Dataset = {
  id: "tech-support-logs-small",
  name: "Tech Support Logs (Mini)",
  description: "A small collection of technical support tickets and solutions.",
  docs: [
    {
      id: "doc_503",
      content: "Error 503: Service Unavailable. This error often indicates that the server is overloaded or down for maintenance. Try restarting the load balancer or checking the health check endpoint.",
      metadata: { category: "server", severity: "high" },
    },
    {
      id: "doc_504",
      content: "Error 504: Gateway Timeout. The upstream server failed to send a request in the time allowed by the server. Check firewall rules and upstream connectivity.",
      metadata: { category: "network", severity: "medium" },
    },
    {
      id: "doc_password_reset",
      content: "To reset your password, visit the /auth/reset endpoint or click 'Forgot Password' on the login screen. An email will be sent with a temporary token.",
      metadata: { category: "auth", severity: "low" },
    },
    {
      id: "doc_slow_query",
      content: "Slow database queries can be optimized by adding indexes to frequently filtered columns. Use EXPLAIN ANALYZE to inspect the query plan.",
      metadata: { category: "database", severity: "medium" },
    },
    {
      id: "doc_out_of_memory",
      content: "OOM Killed (Out of Memory). The process consumed more RAM than the container limit. Increase the memory definition in kubernetes.yaml or optimize memory usage.",
      metadata: { category: "server", severity: "high" },
    },
    {
      id: "doc_cors",
      content: "CORS (Cross-Origin Resource Sharing) error. Access to fetch at URL from origin has been blocked by CORS policy. Configure the Access-Control-Allow-Origin header.",
      metadata: { category: "frontend", severity: "low" },
    },
  ],
  queries: [
    {
      id: "q_1",
      text: "How do I fix a 503 error?",
      relevantDocs: ["doc_503"],
    },
    {
      id: "q_2",
      text: "Users can't log in, forgot credentials",
      relevantDocs: ["doc_password_reset"],
    },
    {
      id: "q_3",
      text: "Database is running very slowly",
      relevantDocs: ["doc_slow_query"],
    },
    {
      id: "q_4",
      text: "Server crashed with memory error",
      relevantDocs: ["doc_out_of_memory"],
    },
  ],
};
