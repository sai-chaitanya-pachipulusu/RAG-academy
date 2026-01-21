// Learning resources for each module (videos, blogs, papers, tutorials)
export const MODULE_RESOURCES: Record<string, {
  videos: { title: string; url: string; author: string }[];
  blogs: { title: string; url: string; author: string }[];
  papers: { title: string; url: string; year: number }[];
  tutorials: { title: string; url: string; type: string }[];
}> = {
  foundations: {
    videos: [
      { title: "RAG from Scratch - Part 1: Overview", url: "https://www.youtube.com/watch?v=wd7TZ4w1mSw", author: "LangChain" },
      { title: "What are Embeddings?", url: "https://www.youtube.com/watch?v=wjZofJX0v4M", author: "Computerphile" },
      { title: "Vector Databases Explained", url: "https://www.youtube.com/watch?v=klTvEwg3oJ4", author: "Fireship" },
      { title: "RAG Explained (Full Course)", url: "https://www.youtube.com/watch?v=T-D1OfcDW1M", author: "FreeCodeCamp" },
      { title: "Introduction to LangChain", url: "https://www.youtube.com/watch?v=_v_fgW2SkkQ", author: "Sam Witteveen" },
      { title: "RAG vs Fine-Tuning", url: "https://www.youtube.com/watch?v=00Q0G84kq3M", author: "AI Jason" },
      { title: "Build RAG in 10 Minutes", url: "https://www.youtube.com/watch?v=tcqEUSNCn8I", author: "Rabbit Hole Syndrome" },
    ],
    blogs: [
      { title: "What are Embeddings?", url: "https://vickiboykis.com/what_are_embeddings/", author: "Vicki Boykis" },
      { title: "The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", author: "Jay Alammar" },
      { title: "Patterns for LLM Systems", url: "https://eugeneyan.com/writing/llm-patterns/", author: "Eugene Yan" },
      { title: "RAG: A Practical Guide", url: "https://www.pinecone.io/learn/retrieval-augmented-generation/", author: "Pinecone" },
      { title: "Building LLMs for Production", url: "https://huyenchip.com/llm-production/", author: "Chip Huyen" },
      { title: "Emerging Architectures for LLM Apps", url: "https://a16z.com/emerging-architectures-for-llm-applications/", author: "a16z" },
    ],
    papers: [
      { title: "Retrieval-Augmented Generation (Original RAG Paper)", url: "https://arxiv.org/abs/2005.11401", year: 2020 },
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", year: 2017 },
      { title: "BERT: Pre-training of Deep Bidirectional Transformers", url: "https://arxiv.org/abs/1810.04805", year: 2018 },
      { title: "Sentence-BERT", url: "https://arxiv.org/abs/1908.10084", year: 2019 },
    ],
    tutorials: [
      { title: "Build a Simple RAG Pipeline", url: "https://python.langchain.com/docs/tutorials/rag/", type: "LangChain Docs" },
      { title: "RAG Zero to Hero", url: "https://www.linkedin.com/pulse/building-your-first-rag", type: "Article" },
      { title: "LlamaIndex Starter Tutorial", url: "https://docs.llamaindex.ai/en/stable/getting_started/starter_example/", type: "LlamaIndex" },
      { title: "OpenAI Cookbook: RAG", url: "https://cookbook.openai.com/examples/vector_databases/readme", type: "OpenAI" },
    ],
  },
  "data-ingestion": {
    videos: [
      { title: "Document Loading Best Practices", url: "https://www.youtube.com/watch?v=MlK6SIjcjE8", author: "LangChain" },
      { title: "LlamaParse Deep Dive", url: "https://www.youtube.com/watch?v=wfANqJnTjJE", author: "LlamaIndex" },
      { title: "PDF Parsing for LLMs", url: "https://www.youtube.com/watch?v=UfJOu2VZFg4", author: "Greg Kamradt" },
      { title: "Building RAG Data Pipelines", url: "https://www.youtube.com/watch?v=dI_TmTW9S4c", author: "Jerry Liu" },
      { title: "Unstructured.io Tutorial", url: "https://www.youtube.com/watch?v=Ib3r9Fy17_0", author: "Unstructured" },
      { title: "Table Extraction for RAG", url: "https://www.youtube.com/watch?v=g5c9VtT7Ak0", author: "LlamaIndex" },
    ],
    blogs: [
      { title: "Why Document Parsing Matters", url: "https://unstructured.io/blog/parsing-matters", author: "Unstructured" },
      { title: "Building LLMs for Production", url: "https://huyenchip.com/llm-production/", author: "Chip Huyen" },
      { title: "LlamaParse Guide", url: "https://docs.llamaindex.ai/en/stable/llama_cloud/llama_parse/", author: "LlamaIndex" },
      { title: "Extracting Tables from PDFs", url: "https://www.llamaindex.ai/blog/advanced-rag-with-tables", author: "LlamaIndex" },
      { title: "Document AI with LayoutParser", url: "https://layout-parser.github.io/", author: "Layout Parser" },
    ],
    papers: [
      { title: "LayoutParser: Document AI Toolkit", url: "https://arxiv.org/abs/2103.15348", year: 2021 },
      { title: "DocLayNet: Large-scale Document Layout", url: "https://arxiv.org/abs/2206.01062", year: 2022 },
      { title: "TableFormer: Table Structure Recognition", url: "https://arxiv.org/abs/2203.01017", year: 2022 },
    ],
    tutorials: [
      { title: "Unstructured.io Quickstart", url: "https://docs.unstructured.io/open-source/introduction/quick-start", type: "Docs" },
      { title: "RAG Techniques: Document Processing", url: "https://github.com/NirDiamant/RAG_Techniques", type: "GitHub" },
      { title: "LangChain Document Loaders", url: "https://python.langchain.com/docs/how_to/#document-loaders", type: "LangChain" },
      { title: "PyMuPDF Tutorial", url: "https://pymupdf.readthedocs.io/en/latest/tutorial.html", type: "Docs" },
    ],
  },
  chunking: {
    videos: [
      { title: "5 Levels of Text Splitting", url: "https://www.youtube.com/watch?v=8OJC21T2SL4", author: "Greg Kamradt" },
      { title: "Semantic Chunking Explained", url: "https://www.youtube.com/watch?v=8OJC21T2SL4", author: "Greg Kamradt" },
      { title: "RAG from Scratch - Indexing", url: "https://www.youtube.com/watch?v=bjb_EMsTDKI", author: "LangChain" },
      { title: "Late Chunking by Jina AI", url: "https://www.youtube.com/watch?v=3Q5hkPRVVRw", author: "Jina AI" },
      { title: "Optimal Chunk Sizes", url: "https://www.youtube.com/watch?v=sS_sZAT6nzE", author: "James Briggs" },
      { title: "Parent Document Retrieval", url: "https://www.youtube.com/watch?v=n60EkbT6IT4", author: "LangChain" },
    ],
    blogs: [
      { title: "Chunking Strategies for RAG", url: "https://www.pinecone.io/learn/chunking-strategies/", author: "Pinecone" },
      { title: "Semantic Chunking Guide", url: "https://docs.llamaindex.ai/en/stable/examples/node_parsers/semantic_chunking/", author: "LlamaIndex" },
      { title: "Parent Document Retrieval", url: "https://python.langchain.com/docs/how_to/parent_document_retriever/", author: "LangChain" },
      { title: "Late Chunking: Better RAG", url: "https://jina.ai/news/late-chunking/", author: "Jina AI" },
      { title: "The Art of Chunking", url: "https://www.rungalileo.io/blog/mastering-rag-chunking", author: "Galileo" },
      { title: "Proposition Chunking", url: "https://blog.langchain.dev/dense-x-retrieval-proposition-chunking/", author: "LangChain" },
    ],
    papers: [
      { title: "RAPTOR: Recursive Summarization Trees", url: "https://arxiv.org/abs/2401.18059", year: 2024 },
      { title: "Late Chunking: Contextual Retrieval", url: "https://jina.ai/news/late-chunking/", year: 2024 },
      { title: "Dense X Retrieval: Proposition Indexing", url: "https://arxiv.org/abs/2312.06648", year: 2023 },
    ],
    tutorials: [
      { title: "Semantic Chunking Notebook", url: "https://github.com/langchain-ai/langchain/blob/master/cookbook/semantic_chunking.ipynb", type: "Jupyter" },
      { title: "RAPTOR Implementation", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/raptor.ipynb", type: "Jupyter" },
      { title: "Text Splitters Guide", url: "https://python.langchain.com/docs/how_to/#text-splitters", type: "LangChain" },
      { title: "Agentic Chunking", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/agentic_chunking.ipynb", type: "Jupyter" },
    ],
  },
  indexing: {
    videos: [
      { title: "Vector Databases Deep Dive", url: "https://www.youtube.com/watch?v=dN0lsF2cvm4", author: "James Briggs" },
      { title: "HNSW Algorithm Explained", url: "https://www.youtube.com/watch?v=QvKMwLjdK-s", author: "Pinecone" },
      { title: "Metadata Filtering in Vector Search", url: "https://www.youtube.com/watch?v=OATCgQtNX2o", author: "Weaviate" },
      { title: "Choosing a Vector Database", url: "https://www.youtube.com/watch?v=NR-EkO60lOs", author: "AI Makerspace" },
      { title: "Qdrant Tutorial", url: "https://www.youtube.com/watch?v=LQ8_Wj7wj90", author: "Qdrant" },
      { title: "ChromaDB Getting Started", url: "https://www.youtube.com/watch?v=CtDLz8m0wbU", author: "Chroma" },
      { title: "Milvus Vector DB", url: "https://www.youtube.com/watch?v=wB0_YIqXWEg", author: "Milvus" },
    ],
    blogs: [
      { title: "Vector Database Comparison", url: "https://www.pinecone.io/learn/vector-database/", author: "Pinecone" },
      { title: "Hybrid Search with Weaviate", url: "https://weaviate.io/blog/hybrid-search-explained", author: "Weaviate" },
      { title: "Understanding HNSW", url: "https://www.pinecone.io/learn/series/faiss/hnsw/", author: "Pinecone" },
      { title: "Metadata Filtering Best Practices", url: "https://qdrant.tech/articles/filtering/", author: "Qdrant" },
      { title: "Scaling Vector Search", url: "https://www.pinecone.io/learn/vector-database-performance/", author: "Pinecone" },
      { title: "IVF vs HNSW Indexes", url: "https://weaviate.io/blog/vector-indexing", author: "Weaviate" },
    ],
    papers: [
      { title: "Efficient Nearest Neighbor Search (HNSW)", url: "https://arxiv.org/abs/1603.09320", year: 2018 },
      { title: "ScaNN: Efficient Vector Similarity Search", url: "https://arxiv.org/abs/1908.10396", year: 2020 },
      { title: "DiskANN: Fast Billion-scale Search", url: "https://arxiv.org/abs/1907.04206", year: 2019 },
    ],
    tutorials: [
      { title: "Pinecone Quickstart", url: "https://docs.pinecone.io/guides/getting-started/quickstart", type: "Docs" },
      { title: "Weaviate Getting Started", url: "https://weaviate.io/developers/weaviate/quickstart", type: "Docs" },
      { title: "Qdrant Tutorial", url: "https://qdrant.tech/documentation/quickstart/", type: "Docs" },
      { title: "ChromaDB Tutorial", url: "https://docs.trychroma.com/getting-started", type: "Docs" },
      { title: "Milvus Quickstart", url: "https://milvus.io/docs/quickstart.md", type: "Docs" },
    ],
  },
  "query-optimization": {
    videos: [
      { title: "RAG from Scratch - Query Translation", url: "https://www.youtube.com/watch?v=JChPi0CRnDY", author: "LangChain" },
      { title: "HyDE Explained", url: "https://www.youtube.com/watch?v=SaDzIVkYqyY", author: "James Briggs" },
      { title: "Multi-Query Retrieval", url: "https://www.youtube.com/watch?v=JChPi0CRnDY", author: "LangChain" },
      { title: "Query Decomposition", url: "https://www.youtube.com/watch?v=Ua8PAgvIgHI", author: "LangChain" },
      { title: "RAG Fusion Explained", url: "https://www.youtube.com/watch?v=77qELPbNgxA", author: "James Briggs" },
      { title: "Step-Back Prompting", url: "https://www.youtube.com/watch?v=xn1jEjRyJ2U", author: "AI Explained" },
    ],
    blogs: [
      { title: "Query Rewriting for RAG", url: "https://www.pinecone.io/learn/series/rag/rewrite-retrieve-read/", author: "Pinecone" },
      { title: "HyDE: Hypothetical Document Embeddings", url: "https://python.langchain.com/docs/how_to/hyde/", author: "LangChain" },
      { title: "Step-Back Prompting Guide", url: "https://blog.langchain.dev/step-back-prompting/", author: "LangChain" },
      { title: "Multi-Query RAG", url: "https://blog.langchain.dev/multi-query-retriver/", author: "LangChain" },
      { title: "RAG Fusion Technique", url: "https://towardsdatascience.com/forget-rag-the-future-is-rag-fusion-1147298d8ad1", author: "Towards Data Science" },
      { title: "Query Understanding in RAG", url: "https://www.pinecone.io/learn/query-understanding/", author: "Pinecone" },
    ],
    papers: [
      { title: "HyDE: Precise Zero-Shot Dense Retrieval", url: "https://arxiv.org/abs/2212.10496", year: 2022 },
      { title: "Step-Back Prompting", url: "https://arxiv.org/abs/2310.06117", year: 2023 },
      { title: "Query2Doc: Query Expansion with LLMs", url: "https://arxiv.org/abs/2303.07678", year: 2023 },
      { title: "Decomposed Prompting", url: "https://arxiv.org/abs/2210.02406", year: 2022 },
    ],
    tutorials: [
      { title: "Query Transformation Techniques", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/query_transformations.ipynb", type: "Jupyter" },
      { title: "Multi-Query Retriever", url: "https://python.langchain.com/docs/how_to/MultiQueryRetriever/", type: "LangChain" },
      { title: "HyDE Implementation", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/hyde.ipynb", type: "Jupyter" },
      { title: "RAG Fusion Notebook", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/rag_fusion.ipynb", type: "Jupyter" },
    ],
  },
  "hybrid-retrieval": {
    videos: [
      { title: "Hybrid Search Explained", url: "https://www.youtube.com/watch?v=lYxGYXjfrNI", author: "Weaviate" },
      { title: "BM25 vs Dense Retrieval", url: "https://www.youtube.com/watch?v=HVPwPxLqK1A", author: "James Briggs" },
      { title: "RAG from Scratch - Routing", url: "https://www.youtube.com/watch?v=pfpIndq7Fi8", author: "LangChain" },
      { title: "Sparse Embeddings (SPLADE)", url: "https://www.youtube.com/watch?v=8Vc6_bHEAyg", author: "Pinecone" },
      { title: "Elasticsearch for RAG", url: "https://www.youtube.com/watch?v=zE5lWqbazso", author: "Elastic" },
      { title: "Keyword vs Semantic Search", url: "https://www.youtube.com/watch?v=0Xn-3w1VRXA", author: "James Briggs" },
    ],
    blogs: [
      { title: "Hybrid Search Explained", url: "https://weaviate.io/blog/hybrid-search-explained", author: "Weaviate" },
      { title: "Reciprocal Rank Fusion", url: "https://www.elastic.co/blog/reciprocal-rank-fusion-rrf", author: "Elastic" },
      { title: "When Vector Search Fails", url: "https://www.pinecone.io/learn/hybrid-search-intro/", author: "Pinecone" },
      { title: "SPLADE: Sparse Retrieval", url: "https://www.pinecone.io/learn/splade/", author: "Pinecone" },
      { title: "BM25 Algorithm Explained", url: "https://www.elastic.co/blog/practical-bm25-part-1-how-shards-affect-relevance", author: "Elastic" },
      { title: "Combining Search Strategies", url: "https://qdrant.tech/articles/hybrid-search/", author: "Qdrant" },
    ],
    papers: [
      { title: "Reciprocal Rank Fusion", url: "https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf", year: 2009 },
      { title: "SPLADE: Sparse Lexical Dense", url: "https://arxiv.org/abs/2107.05720", year: 2021 },
      { title: "ColBERT: Efficient Passage Search", url: "https://arxiv.org/abs/2004.12832", year: 2020 },
      { title: "BGE-M3: Multi-Functionality Embedding", url: "https://arxiv.org/abs/2402.03216", year: 2024 },
    ],
    tutorials: [
      { title: "Hybrid Search with Weaviate", url: "https://weaviate.io/developers/weaviate/search/hybrid", type: "Docs" },
      { title: "Ensemble Retriever", url: "https://python.langchain.com/docs/how_to/ensemble_retriever/", type: "LangChain" },
      { title: "BM25 Retriever", url: "https://python.langchain.com/docs/integrations/retrievers/bm25/", type: "LangChain" },
      { title: "ColBERT Implementation", url: "https://github.com/stanford-futuredata/ColBERT", type: "GitHub" },
    ],
  },
  "post-retrieval": {
    videos: [
      { title: "Reranking Deep Dive", url: "https://www.youtube.com/watch?v=7h0usXZqXEw", author: "James Briggs" },
      { title: "Cohere Rerank Tutorial", url: "https://www.youtube.com/watch?v=L_graMbT0MA", author: "Cohere" },
      { title: "RAG from Scratch - Reranking", url: "https://www.youtube.com/watch?v=sVcwVQRHIc8", author: "LangChain" },
      { title: "Cross-Encoders Explained", url: "https://www.youtube.com/watch?v=3Q5hkPRVVRw", author: "James Briggs" },
      { title: "BGE Reranker Tutorial", url: "https://www.youtube.com/watch?v=5X-rZXX4M5E", author: "AI Makerspace" },
      { title: "Contextual Compression", url: "https://www.youtube.com/watch?v=nMrGK5QgPVE", author: "LangChain" },
    ],
    blogs: [
      { title: "Cross-Encoder Reranking", url: "https://www.pinecone.io/learn/series/rag/rerankers/", author: "Pinecone" },
      { title: "Contextual Compression", url: "https://python.langchain.com/docs/how_to/contextual_compression/", author: "LangChain" },
      { title: "Lost in the Middle Problem", url: "https://cs.stanford.edu/~nfliu/papers/lost-in-the-middle.arxiv2023.pdf", author: "Stanford" },
      { title: "Reranking Strategies", url: "https://www.sbert.net/examples/applications/cross-encoder/README.html", author: "SBERT" },
      { title: "Optimizing Context Windows", url: "https://www.anthropic.com/research/long-context", author: "Anthropic" },
      { title: "Document Reordering", url: "https://arxiv.org/abs/2307.03172", author: "Stanford" },
    ],
    papers: [
      { title: "Lost in the Middle", url: "https://arxiv.org/abs/2307.03172", year: 2023 },
      { title: "Sentence-BERT Reranking", url: "https://arxiv.org/abs/1908.10084", year: 2019 },
      { title: "ColBERT v2: Effective Retrieval", url: "https://arxiv.org/abs/2112.01488", year: 2021 },
      { title: "RankGPT: LLMs as Rerankers", url: "https://arxiv.org/abs/2304.09542", year: 2023 },
    ],
    tutorials: [
      { title: "Cohere Rerank Integration", url: "https://python.langchain.com/docs/integrations/retrievers/cohere-reranker/", type: "LangChain" },
      { title: "BGE Reranker Guide", url: "https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/reranker", type: "GitHub" },
      { title: "Sentence Transformers Rerank", url: "https://www.sbert.net/docs/cross_encoder/usage/usage.html", type: "SBERT" },
      { title: "Jina Reranker", url: "https://jina.ai/reranker/", type: "Jina AI" },
    ],
  },
  "answer-generation": {
    videos: [
      { title: "Self-RAG Explained", url: "https://www.youtube.com/watch?v=pbAd8O1Lvm4", author: "LangChain" },
      { title: "Chain of Thought Prompting", url: "https://www.youtube.com/watch?v=H4I9O3AvJFQ", author: "AI Explained" },
      { title: "Grounding LLM Responses", url: "https://www.youtube.com/watch?v=LhnCsygAvzY", author: "Google Cloud" },
      { title: "Corrective RAG Tutorial", url: "https://www.youtube.com/watch?v=w0C-s--kZ0o", author: "LangChain" },
      { title: "Citations in LLM Responses", url: "https://www.youtube.com/watch?v=5rOKZ5QXMBI", author: "Anthropic" },
      { title: "Prompt Engineering for RAG", url: "https://www.youtube.com/watch?v=T9aRN5JkmL8", author: "OpenAI" },
    ],
    blogs: [
      { title: "Self-RAG Guide", url: "https://blog.langchain.dev/self-rag/", author: "LangChain" },
      { title: "Citations in RAG", url: "https://www.anthropic.com/research/citations", author: "Anthropic" },
      { title: "Chain-of-Verification", url: "https://arxiv.org/abs/2309.11495", author: "Meta AI" },
      { title: "Reducing Hallucinations", url: "https://lilianweng.github.io/posts/2024-07-07-hallucination/", author: "Lilian Weng" },
      { title: "Prompt Engineering Guide", url: "https://www.promptingguide.ai/techniques/rag", author: "DAIR.AI" },
      { title: "Constitutional AI", url: "https://www.anthropic.com/research/constitutional-ai", author: "Anthropic" },
    ],
    papers: [
      { title: "Self-RAG: Learn to Retrieve, Generate, Reflect", url: "https://arxiv.org/abs/2310.11511", year: 2023 },
      { title: "Chain-of-Verification (CoVe)", url: "https://arxiv.org/abs/2309.11495", year: 2023 },
      { title: "Corrective RAG (CRAG)", url: "https://arxiv.org/abs/2401.15884", year: 2024 },
      { title: "Chain-of-Noting", url: "https://arxiv.org/abs/2311.09210", year: 2023 },
      { title: "Retrieval-Augmented Generation for Knowledge-Intensive Tasks", url: "https://arxiv.org/abs/2005.11401", year: 2020 },
    ],
    tutorials: [
      { title: "Self-RAG Implementation", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/self_rag.ipynb", type: "Jupyter" },
      { title: "Corrective RAG Notebook", url: "https://github.com/langchain-ai/langgraph/blob/main/examples/rag/langgraph_crag.ipynb", type: "Jupyter" },
      { title: "Citation Generation", url: "https://python.langchain.com/docs/how_to/qa_citations/", type: "LangChain" },
      { title: "Structured Output", url: "https://python.langchain.com/docs/how_to/structured_output/", type: "LangChain" },
    ],
  },
  evaluation: {
    videos: [
      { title: "Evaluating RAG Applications", url: "https://www.youtube.com/watch?v=Anr1br0lL38", author: "DeepLearning.AI" },
      { title: "RAGAS Framework Tutorial", url: "https://www.youtube.com/watch?v=jwMtqbk4RNI", author: "Confident AI" },
      { title: "LLM-as-a-Judge", url: "https://www.youtube.com/watch?v=6OozYgjK_NA", author: "LangChain" },
      { title: "Building Eval Datasets", url: "https://www.youtube.com/watch?v=2b_rYL3mQGM", author: "Hamel Husain" },
      { title: "DeepEval Tutorial", url: "https://www.youtube.com/watch?v=BYlD2Z9LtJY", author: "Confident AI" },
      { title: "LangSmith for Evaluation", url: "https://www.youtube.com/watch?v=tFXm5ijih98", author: "LangChain" },
      { title: "Trulens Evaluation", url: "https://www.youtube.com/watch?v=3pDQVbIL4wU", author: "TruEra" },
    ],
    blogs: [
      { title: "Your AI Product Needs Evals", url: "https://hamel.dev/blog/posts/evals/", author: "Hamel Husain" },
      { title: "RAG Triad of Metrics", url: "https://docs.confident-ai.com/docs/metrics-rag-triad", author: "DeepEval" },
      { title: "Evaluating LLM Applications", url: "https://www.mlexpert.io/machine-learning/tutorials/evaluating-rag", author: "MLExpert" },
      { title: "Building Golden Datasets", url: "https://hamel.dev/blog/posts/golden/", author: "Hamel Husain" },
      { title: "LLM Evaluation Best Practices", url: "https://eugeneyan.com/writing/llm-evaluations/", author: "Eugene Yan" },
      { title: "How to Evaluate RAG", url: "https://www.rungalileo.io/blog/mastering-rag-evaluation-guide", author: "Galileo" },
    ],
    papers: [
      { title: "RAGAS: Automated RAG Evaluation", url: "https://arxiv.org/abs/2309.15217", year: 2023 },
      { title: "Judging LLM-as-a-Judge", url: "https://arxiv.org/abs/2306.05685", year: 2023 },
      { title: "G-Eval: NLG Evaluation Using GPT-4", url: "https://arxiv.org/abs/2303.16634", year: 2023 },
      { title: "ARES: Automated RAG Evaluation System", url: "https://arxiv.org/abs/2311.09476", year: 2023 },
    ],
    tutorials: [
      { title: "RAGAS Quickstart", url: "https://docs.ragas.io/en/stable/getstarted/", type: "Docs" },
      { title: "DeepEval Getting Started", url: "https://docs.confident-ai.com/docs/getting-started", type: "Docs" },
      { title: "LangSmith Evaluation", url: "https://docs.smith.langchain.com/evaluation", type: "Docs" },
      { title: "Trulens Quickstart", url: "https://www.trulens.org/trulens_eval/getting_started/", type: "Docs" },
      { title: "Phoenix Arize Evaluation", url: "https://docs.arize.com/phoenix/tracing/llm-evaluation", type: "Docs" },
    ],
  },
  advanced: {
    videos: [
      { title: "GraphRAG Explained", url: "https://www.youtube.com/watch?v=r09tJfON6kE", author: "Microsoft" },
      { title: "Agentic RAG with LangGraph", url: "https://www.youtube.com/watch?v=hvAPnpSfSGo", author: "LangChain" },
      { title: "Multimodal RAG", url: "https://www.youtube.com/watch?v=B9SQVRdIfEM", author: "LlamaIndex" },
      { title: "Building AI Agents", url: "https://www.youtube.com/watch?v=F_Bi_33SQPY", author: "AI Jason" },
      { title: "Knowledge Graphs for RAG", url: "https://www.youtube.com/watch?v=DGb4jBaUg7E", author: "Neo4j" },
      { title: "Vision RAG Tutorial", url: "https://www.youtube.com/watch?v=YU7C7R9HBHQ", author: "LlamaIndex" },
      { title: "RAG with Audio/Video", url: "https://www.youtube.com/watch?v=X_kG6n3Vn7k", author: "AssemblyAI" },
    ],
    blogs: [
      { title: "GraphRAG: Knowledge Graphs for RAG", url: "https://microsoft.github.io/graphrag/", author: "Microsoft" },
      { title: "Agentic RAG Patterns", url: "https://blog.langchain.dev/agentic-rag-with-langgraph/", author: "LangChain" },
      { title: "ColPali: Multimodal Retrieval", url: "https://huggingface.co/blog/manu/colpali", author: "HuggingFace" },
      { title: "Building AI Agents", url: "https://lilianweng.github.io/posts/2023-06-23-agent/", author: "Lilian Weng" },
      { title: "Tool Use in LLMs", url: "https://www.anthropic.com/research/tool-use", author: "Anthropic" },
      { title: "Neo4j + RAG Guide", url: "https://neo4j.com/developer-blog/knowledge-graph-rag/", author: "Neo4j" },
    ],
    papers: [
      { title: "GraphRAG: From Local to Global", url: "https://arxiv.org/abs/2404.16130", year: 2024 },
      { title: "ColPali: Document Retrieval with Vision LLMs", url: "https://arxiv.org/abs/2407.01449", year: 2024 },
      { title: "RAG 2.0: End-to-End Retrieval", url: "https://arxiv.org/abs/2312.10997", year: 2024 },
      { title: "ReAct: Reasoning and Acting", url: "https://arxiv.org/abs/2210.03629", year: 2022 },
      { title: "Toolformer: LLMs as Tool Users", url: "https://arxiv.org/abs/2302.04761", year: 2023 },
    ],
    tutorials: [
      { title: "GraphRAG Quickstart", url: "https://microsoft.github.io/graphrag/posts/get_started/", type: "Docs" },
      { title: "LangGraph Agentic RAG", url: "https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_agentic_rag/", type: "Docs" },
      { title: "Multimodal RAG Notebook", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/multimodal_rag.ipynb", type: "Jupyter" },
      { title: "Neo4j GraphRAG", url: "https://neo4j.com/labs/genai-ecosystem/", type: "Docs" },
      { title: "LlamaIndex Agents", url: "https://docs.llamaindex.ai/en/stable/understanding/agent/", type: "LlamaIndex" },
    ],
  },
  "fine-tuning": {
    videos: [
      { title: "Fine-Tuning Embeddings", url: "https://www.youtube.com/watch?v=QdDoFfkVkcw", author: "James Briggs" },
      { title: "LoRA Fine-Tuning Explained", url: "https://www.youtube.com/watch?v=PXWYUTMt-AU", author: "Weights & Biases" },
      { title: "Building RAG Training Datasets", url: "https://www.youtube.com/watch?v=2J3_eXVpq70", author: "Jerry Liu" },
      { title: "QLoRA Tutorial", url: "https://www.youtube.com/watch?v=XpoKB3usmKc", author: "Trelis Research" },
      { title: "Fine-Tuning for RAG", url: "https://www.youtube.com/watch?v=qa6zOG5jJ8Y", author: "AI Makerspace" },
      { title: "Synthetic Data Generation", url: "https://www.youtube.com/watch?v=3VNOCbvCzN8", author: "LlamaIndex" },
      { title: "PEFT and Adapters", url: "https://www.youtube.com/watch?v=Us5ZFp16PaU", author: "HuggingFace" },
    ],
    blogs: [
      { title: "Fine-Tuning Embedding Models", url: "https://docs.llamaindex.ai/en/stable/examples/finetuning/embeddings/", author: "LlamaIndex" },
      { title: "LoRA for LLMs", url: "https://huggingface.co/blog/lora", author: "HuggingFace" },
      { title: "Synthetic Data for RAG", url: "https://www.anyscale.com/blog/fine-tuning-llms-for-rag", author: "Anyscale" },
      { title: "When to Fine-Tune", url: "https://eugeneyan.com/writing/finetuning/", author: "Eugene Yan" },
      { title: "Distilling LLMs", url: "https://blog.langchain.dev/distilling-llms/", author: "LangChain" },
      { title: "Building Training Datasets", url: "https://hamel.dev/blog/posts/datasets/", author: "Hamel Husain" },
    ],
    papers: [
      { title: "LoRA: Low-Rank Adaptation", url: "https://arxiv.org/abs/2106.09685", year: 2021 },
      { title: "Matryoshka Representation Learning", url: "https://arxiv.org/abs/2205.13147", year: 2022 },
      { title: "QLoRA: Efficient Finetuning", url: "https://arxiv.org/abs/2305.14314", year: 2023 },
      { title: "RAFT: Retrieval-Augmented Fine-Tuning", url: "https://arxiv.org/abs/2403.10131", year: 2024 },
      { title: "Nomic Embed: Training Embeddings", url: "https://arxiv.org/abs/2402.01613", year: 2024 },
    ],
    tutorials: [
      { title: "Sentence Transformers Fine-Tuning", url: "https://sbert.net/docs/sentence_transformer/training_overview.html", type: "Docs" },
      { title: "LlamaIndex Embedding Fine-Tuning", url: "https://docs.llamaindex.ai/en/stable/examples/finetuning/embeddings/finetune_embedding/", type: "Jupyter" },
      { title: "HuggingFace PEFT", url: "https://huggingface.co/docs/peft/index", type: "Docs" },
      { title: "Unsloth Fine-Tuning", url: "https://github.com/unslothai/unsloth", type: "GitHub" },
      { title: "Axolotl Training", url: "https://github.com/OpenAccess-AI-Collective/axolotl", type: "GitHub" },
    ],
  },
  // Module aliases for the new structure
  "advanced-retrieval": {
    videos: [
      { title: "Parent Document Retrieval", url: "https://www.youtube.com/watch?v=n60EkbT6IT4", author: "LangChain" },
      { title: "RAPTOR Explained", url: "https://www.youtube.com/watch?v=jbGchdTL7d0", author: "AI Explained" },
      { title: "ColBERT Deep Dive", url: "https://www.youtube.com/watch?v=cN6S0Ehm7_4", author: "James Briggs" },
      { title: "HNSW Algorithm", url: "https://www.youtube.com/watch?v=QvKMwLjdK-s", author: "Pinecone" },
    ],
    blogs: [
      { title: "Parent Document Retrieval", url: "https://python.langchain.com/docs/how_to/parent_document_retriever/", author: "LangChain" },
      { title: "RAPTOR Paper Summary", url: "https://blog.langchain.dev/raptor/", author: "LangChain" },
      { title: "ColBERT Guide", url: "https://www.pinecone.io/learn/colbert/", author: "Pinecone" },
    ],
    papers: [
      { title: "RAPTOR: Recursive Summarization Trees", url: "https://arxiv.org/abs/2401.18059", year: 2024 },
      { title: "ColBERT: Efficient Passage Search", url: "https://arxiv.org/abs/2004.12832", year: 2020 },
    ],
    tutorials: [
      { title: "RAPTOR Implementation", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/raptor.ipynb", type: "Jupyter" },
      { title: "Parent Doc Retriever", url: "https://python.langchain.com/docs/how_to/parent_document_retriever/", type: "LangChain" },
    ],
  },
  "grounding-safety": {
    videos: [
      { title: "Grounding LLM Responses", url: "https://www.youtube.com/watch?v=LhnCsygAvzY", author: "Google Cloud" },
      { title: "Prompt Injection Defense", url: "https://www.youtube.com/watch?v=FdW_Ga8-DK0", author: "AI Explained" },
      { title: "Citations in LLM Responses", url: "https://www.youtube.com/watch?v=5rOKZ5QXMBI", author: "Anthropic" },
    ],
    blogs: [
      { title: "Reducing Hallucinations", url: "https://lilianweng.github.io/posts/2024-07-07-hallucination/", author: "Lilian Weng" },
      { title: "Prompt Injection Guide", url: "https://www.promptingguide.ai/risks/adversarial", author: "DAIR.AI" },
      { title: "PII Detection in LLMs", url: "https://microsoft.com/en-us/security/blog/", author: "Microsoft" },
    ],
    papers: [
      { title: "Constitutional AI", url: "https://arxiv.org/abs/2212.08073", year: 2022 },
      { title: "Prompt Injection Attacks", url: "https://arxiv.org/abs/2302.12173", year: 2023 },
    ],
    tutorials: [
      { title: "Citation Generation", url: "https://python.langchain.com/docs/how_to/qa_citations/", type: "LangChain" },
      { title: "Guardrails AI", url: "https://www.guardrailsai.com/docs/", type: "Docs" },
    ],
  },
  "agentic-rag": {
    videos: [
      { title: "Agentic RAG with LangGraph", url: "https://www.youtube.com/watch?v=hvAPnpSfSGo", author: "LangChain" },
      { title: "Building AI Agents", url: "https://www.youtube.com/watch?v=F_Bi_33SQPY", author: "AI Jason" },
      { title: "ReAct Prompting", url: "https://www.youtube.com/watch?v=Eug2clsLtFs", author: "Sam Witteveen" },
      { title: "Self-RAG Explained", url: "https://www.youtube.com/watch?v=pbAd8O1Lvm4", author: "LangChain" },
    ],
    blogs: [
      { title: "Agentic RAG Patterns", url: "https://blog.langchain.dev/agentic-rag-with-langgraph/", author: "LangChain" },
      { title: "Building AI Agents", url: "https://lilianweng.github.io/posts/2023-06-23-agent/", author: "Lilian Weng" },
      { title: "Tool Use in LLMs", url: "https://www.anthropic.com/research/tool-use", author: "Anthropic" },
    ],
    papers: [
      { title: "ReAct: Reasoning and Acting", url: "https://arxiv.org/abs/2210.03629", year: 2022 },
      { title: "Self-RAG", url: "https://arxiv.org/abs/2310.11511", year: 2023 },
      { title: "Corrective RAG", url: "https://arxiv.org/abs/2401.15884", year: 2024 },
    ],
    tutorials: [
      { title: "LangGraph Agentic RAG", url: "https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_agentic_rag/", type: "Docs" },
      { title: "Self-RAG Implementation", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/self_rag.ipynb", type: "Jupyter" },
    ],
  },
  "production-ops": {
    videos: [
      { title: "RAG in Production", url: "https://www.youtube.com/watch?v=Zj5RCweUHIk", author: "AI Makerspace" },
      { title: "Caching for LLMs", url: "https://www.youtube.com/watch?v=TcYZq8fWNQg", author: "LangChain" },
      { title: "Cost Optimization", url: "https://www.youtube.com/watch?v=WAKb4aLlvg4", author: "AI Jason" },
    ],
    blogs: [
      { title: "Building LLMs for Production", url: "https://huyenchip.com/llm-production/", author: "Chip Huyen" },
      { title: "Scaling RAG Systems", url: "https://www.pinecone.io/learn/vector-database-performance/", author: "Pinecone" },
      { title: "LLM Cost Optimization", url: "https://www.latent.space/p/cost-optimization", author: "Latent Space" },
    ],
    papers: [
      { title: "Efficient Inference for LLMs", url: "https://arxiv.org/abs/2312.12456", year: 2023 },
    ],
    tutorials: [
      { title: "LangSmith Monitoring", url: "https://docs.smith.langchain.com/", type: "Docs" },
      { title: "Semantic Caching", url: "https://python.langchain.com/docs/integrations/llm_caching/", type: "LangChain" },
    ],
  },
  multimodal: {
    videos: [
      { title: "Multimodal RAG", url: "https://www.youtube.com/watch?v=B9SQVRdIfEM", author: "LlamaIndex" },
      { title: "Vision RAG Tutorial", url: "https://www.youtube.com/watch?v=YU7C7R9HBHQ", author: "LlamaIndex" },
      { title: "RAG with Audio/Video", url: "https://www.youtube.com/watch?v=X_kG6n3Vn7k", author: "AssemblyAI" },
      { title: "ColPali Explained", url: "https://www.youtube.com/watch?v=KLtpDkLDfk4", author: "HuggingFace" },
    ],
    blogs: [
      { title: "ColPali: Multimodal Retrieval", url: "https://huggingface.co/blog/manu/colpali", author: "HuggingFace" },
      { title: "GraphRAG for Knowledge Graphs", url: "https://microsoft.github.io/graphrag/", author: "Microsoft" },
      { title: "Table Extraction for RAG", url: "https://www.llamaindex.ai/blog/advanced-rag-with-tables", author: "LlamaIndex" },
    ],
    papers: [
      { title: "ColPali: Document Retrieval with Vision LLMs", url: "https://arxiv.org/abs/2407.01449", year: 2024 },
      { title: "GraphRAG: From Local to Global", url: "https://arxiv.org/abs/2404.16130", year: 2024 },
    ],
    tutorials: [
      { title: "Multimodal RAG Notebook", url: "https://github.com/NirDiamant/RAG_Techniques/blob/main/all_rag_techniques/multimodal_rag.ipynb", type: "Jupyter" },
      { title: "GraphRAG Quickstart", url: "https://microsoft.github.io/graphrag/posts/get_started/", type: "Docs" },
    ],
  },
};

