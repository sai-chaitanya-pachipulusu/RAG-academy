import { Dataset } from "./types";

/**
 * Research Papers Dataset
 * 
 * Use case: Academic search, literature review, citation analysis
 * Real-world inspiration: Semantic Scholar, Google Scholar, Elicit
 */
export const RESEARCH_DATASET: Dataset = {
  id: "research-papers",
  name: "Research Paper Abstracts",
  description: "Academic paper abstracts for literature review and research assistance.",
  docs: [
    {
      id: "paper_attention",
      content: "Attention Is All You Need (Vaswani et al., 2017). We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. The Transformer generalizes well, achieving 28.4 BLEU on English-to-German translation after training for 3.5 days on eight GPUs.",
      metadata: { year: 2017, venue: "NeurIPS", citations: 90000, topics: ["transformers", "nlp", "attention"] },
    },
    {
      id: "paper_bert",
      content: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding (Devlin et al., 2019). We introduce BERT, designed to pre-train deep bidirectional representations by jointly conditioning on both left and right context. BERT obtains state-of-the-art results on eleven NLP tasks including question answering and natural language inference.",
      metadata: { year: 2019, venue: "NAACL", citations: 75000, topics: ["bert", "nlp", "pretraining"] },
    },
    {
      id: "paper_gpt3",
      content: "Language Models are Few-Shot Learners (Brown et al., 2020). We demonstrate that scaling up language models greatly improves task-agnostic, few-shot performance. GPT-3, a 175 billion parameter autoregressive language model, achieves strong performance on many NLP tasks without gradient updates or fine-tuning.",
      metadata: { year: 2020, venue: "NeurIPS", citations: 25000, topics: ["gpt", "large-language-models", "few-shot"] },
    },
    {
      id: "paper_rag",
      content: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020). We explore retrieval-augmented generation (RAG) models which combine pre-trained parametric and non-parametric memory. RAG models achieve state-of-the-art results on open-domain QA, outperforming seq2seq and extractive models.",
      metadata: { year: 2020, venue: "NeurIPS", citations: 3000, topics: ["rag", "retrieval", "nlp"] },
    },
    {
      id: "paper_dpr",
      content: "Dense Passage Retrieval for Open-Domain Question Answering (Karpukhin et al., 2020). We show that retrieval using a simple dual-encoder trained on existing QA data performs remarkably well. Our dense retriever outperforms BM25 by a large margin (9-19% absolute), confirming the importance of learned representations.",
      metadata: { year: 2020, venue: "EMNLP", citations: 4500, topics: ["retrieval", "qa", "embeddings"] },
    },
    {
      id: "paper_colbert",
      content: "ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction (Khattab & Zaharia, 2020). ColBERT introduces a late interaction architecture that independently encodes queries and documents using BERT then employs cheap and prunable interaction. This enables leveraging deep LMs for retrieval while scaling to large collections.",
      metadata: { year: 2020, venue: "SIGIR", citations: 1800, topics: ["retrieval", "colbert", "efficient-search"] },
    },
    {
      id: "paper_self_rag",
      content: "Self-RAG: Learning to Retrieve, Generate, and Critique (Asai et al., 2023). We propose Self-RAG, a framework that trains a single LM to adaptively retrieve passages and generate/critique its own outputs. Self-RAG significantly outperforms vanilla ChatGPT and retrieval-augmented LLMs on various tasks requiring factuality.",
      metadata: { year: 2023, venue: "ICLR", citations: 500, topics: ["rag", "self-reflection", "factuality"] },
    },
    {
      id: "paper_lost_middle",
      content: "Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023). We analyze how LLMs use long contexts in practice. We find that performance degrades significantly when relevant information is in the middle of the context. Models are most accurate when relevant data appears at the very beginning or end.",
      metadata: { year: 2023, venue: "TACL", citations: 800, topics: ["long-context", "attention", "rag"] },
    },
    {
      id: "paper_hyde",
      content: "Precise Zero-Shot Dense Retrieval without Relevance Labels (Gao et al., 2022). We propose HyDE (Hypothetical Document Embeddings) which instructs an LLM to generate a hypothetical document that answers a given query. The generated document is then encoded and used to retrieve similar real documents.",
      metadata: { year: 2022, venue: "ACL", citations: 600, topics: ["retrieval", "zero-shot", "generation"] },
    },
    {
      id: "paper_rlhf",
      content: "Training Language Models to Follow Instructions with Human Feedback (Ouyang et al., 2022). We show that fine-tuning with human feedback greatly improves following instructions. InstructGPT models with 1.3B parameters produce outputs preferred to 175B GPT-3 outputs, despite having 100x fewer parameters.",
      metadata: { year: 2022, venue: "NeurIPS", citations: 5000, topics: ["rlhf", "instruction-tuning", "alignment"] },
    },
    {
      id: "paper_chain_of_thought",
      content: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (Wei et al., 2022). We explore how generating a chain of thought—a series of intermediate reasoning steps—significantly improves the ability of large language models to perform complex reasoning. With chain-of-thought prompting, LLMs can solve problems they otherwise couldn't.",
      metadata: { year: 2022, venue: "NeurIPS", citations: 4000, topics: ["prompting", "reasoning", "cot"] },
    },
    {
      id: "paper_llama",
      content: "LLaMA: Open and Efficient Foundation Language Models (Touvron et al., 2023). We introduce LLaMA, a collection of foundation language models ranging from 7B to 65B parameters trained on publicly available datasets. LLaMA-13B outperforms GPT-3 (175B) on most benchmarks while being much smaller and more efficient.",
      metadata: { year: 2023, venue: "arXiv", citations: 8000, topics: ["llm", "open-source", "efficient"] },
    },
  ],
  queries: [
    {
      id: "q_transformer_arch",
      text: "original paper that introduced the transformer architecture",
      relevantDocs: ["paper_attention"],
    },
    {
      id: "q_bert_pretraining",
      text: "how does BERT pre-training work with bidirectional context",
      relevantDocs: ["paper_bert"],
    },
    {
      id: "q_few_shot",
      text: "how do large language models perform few-shot learning",
      relevantDocs: ["paper_gpt3"],
    },
    {
      id: "q_rag_papers",
      text: "papers about retrieval augmented generation for QA",
      relevantDocs: ["paper_rag", "paper_dpr"],
    },
    {
      id: "q_efficient_retrieval",
      text: "efficient dense retrieval methods that scale to large collections",
      relevantDocs: ["paper_colbert", "paper_dpr"],
    },
    {
      id: "q_self_correction",
      text: "how can models learn to critique and improve their own outputs",
      relevantDocs: ["paper_self_rag"],
    },
    {
      id: "q_context_position",
      text: "does position of information in context affect LLM accuracy",
      relevantDocs: ["paper_lost_middle"],
    },
    {
      id: "q_hypothetical_docs",
      text: "using generated hypothetical documents for zero-shot retrieval",
      relevantDocs: ["paper_hyde"],
    },
    {
      id: "q_reasoning_prompts",
      text: "prompting techniques to improve reasoning in language models",
      relevantDocs: ["paper_chain_of_thought"],
    },
    {
      id: "q_open_source_llm",
      text: "open source language model that competes with GPT-3",
      relevantDocs: ["paper_llama"],
    },
  ],
};
