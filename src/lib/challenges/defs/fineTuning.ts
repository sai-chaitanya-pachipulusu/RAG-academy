
import type { RawChallenge } from "@/lib/challenges/types";

export const FINE_TUNING_CHALLENGES: RawChallenge[] = [
  {
    slug: "synthetic-data-gen",
    title: "Synthetic Question Generation",
    description: "Use an LLM to generate high-quality (Question, Context, Answer) triplets from raw text. Why: Manually labeling datasets is the #1 bottleneck in RAG. Solves: Automates dataset creation for evaluation and fine-tuning.",
    group: "Phase 10 — Fine-Tuning & Adaptation",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import Dict, List

def generate_triplet(text_chunk: str) -> Dict[str, str]:
    """
    Simulate a prompt to an LLM to generate a question and answer based on a chunk.
    
    Requirements:
    - The question should be answerable ONLY using text_chunk.
    - The answer should be concise.
    """
    # TODO: Implement a heuristic or mock LLM call
    # For this lab:
    # 1. Identify a key noun in the text (e.g. "Paris").
    # 2. Formulate "What is the capital of France?" if text contains it.
    return {
        "question": "",
        "answer": "",
        "context": text_chunk
    }
`,
    testCode: `chunk = "The capital of France is Paris and it has the Eiffel Tower."
triplet = generate_triplet(chunk)
assert "Paris" in triplet["answer"]
assert "France" in triplet["question"]
print("Synthetic generation passed!")`,
    hints: [
        "In production, use pipelines like 'RAGAS' or 'Gemma-2' to generate thousands of these.",
        "Ensure the question is grammatically sound and factually grounded.",
    ],
    solution: `from typing import Dict, List
import re

def generate_triplet(text_chunk: str) -> Dict[str, str]:
    # Extract key facts using simple patterns
    lower = text_chunk.lower()
    
    # Pattern: "The capital of X is Y"
    capital_match = re.search(r'capital of (\\w+) is (\\w+)', lower)
    if capital_match:
        country = capital_match.group(1).title()
        capital = capital_match.group(2).title()
        return {
            "question": f"What is the capital of {country}?",
            "answer": capital,
            "context": text_chunk
        }
    
    # Pattern: "X is Y" (for definitions)
    is_match = re.search(r'(\\w+) is (?:a |an |the )?(\\w+)', lower)
    if is_match:
        subject = is_match.group(1).title()
        return {
            "question": f"What is {subject}?",
            "answer": text_chunk.split('.')[0],
            "context": text_chunk
        }
    
    return {
        "question": "What does this text describe?",
        "answer": text_chunk.split('.')[0] if '.' in text_chunk else text_chunk,
        "context": text_chunk
    }
`,
    realWorld: {
        description: "Modern companies like Cohere and OpenAI use synthetic data to boost model performance on specific domains. If your RAG is on 'Legal Docs', you generate 10,000 legal Q&A pairs to specialize the model.",
        companies: ["Microsoft (MMLU)", "Anthropic", "Lamini"],
        useCases: ["Domain Adaptation", "Benchmarking New Models"],
    },
    relatedPlaybooks: ["rag-evaluation-suite", "rag-techniques-encyclopedia"],
  },
  {
    slug: "dataset-tokenization",
    title: "RLHF/SFT Dataset Formatting",
    description: "Format raw data into ChatML or Alpaca templates for Supervised Fine-Tuning (SFT).",
    group: "Phase 10 — Fine-Tuning & Adaptation",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List

def format_for_sft(instruction: str, context: str, response: str) -> str:
    """
    Format into ChatML style:
    <|im_start|>user
    Instruction: {instruction}
    Context: {context}<|im_end|>
    <|im_start|>assistant
    {response}<|im_end|>
    """
    # TODO: Implement template logic
    return ""
`,
    testCode: `fmt = format_for_sft("Who is Alice?", "Alice is an engineer.", "Alice is an engineer.")
assert "<|im_start|>user" in fmt
assert "<|im_start|>assistant" in fmt
print("Dataset formatting passed!")`,
    hints: [
        "Pay attention to special tokens like <|im_start|> and <|im_end|>.",
        "Consistency in formatting is key for successful training.",
    ],
    solution: `from typing import Dict, List

def format_for_sft(instruction: str, context: str, response: str) -> str:
    return f"""<|im_start|>user
Instruction: {instruction}
Context: {context}<|im_end|>
<|im_start|>assistant
{response}<|im_end|>"""
`,
    realWorld: {
        description: "Small variations in formatting (e.g., adding a colon or extra newline) can degrade model performance by 10-20% during fine-tuning. Standardizing formats like ChatML is an industry necessity.",
        companies: ["Hugging Face", "Anyscale", "Weights & Biases"],
        useCases: ["Model Fine-Tuning", "Dataset Publishing"],
    },
    prerequisites: ["synthetic-data-gen"],
    relatedPlaybooks: ["prompt-templates"],
  },
  {
    slug: "ranker-distillation",
    title: "Cross-Encoder Model Distillation",
    description: "Train a 'Student' model to match the ranking scores of a larger 'Teacher' model. Why: Large rerankers (BERT-Large) are slow. Solves: Get 95% of the accuracy with 5x the speed.",
    group: "Phase 10 — Fine-Tuning & Adaptation",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List

def distillation_loss(student_score: float, teacher_score: float) -> float:
    """
    Calculate the Mean Squared Error (MSE) between scores.
    This is a simplified version of knowledge distillation loss.
    """
    # TODO: Implement loss calculation
    return 0.0
`,
    testCode: `loss = distillation_loss(0.8, 0.9)
assert loss > 0.0
assert distillation_loss(0.5, 0.5) == 0.0
print("Distillation logic passed!")`,
    hints: [
        "MSE = (TeacherScore - StudentScore) ^ 2.",
        "In reality, you'd use Kullback-Leibler (KL) Divergence on the full probability distribution.",
    ],
    solution: `from typing import List

def distillation_loss(student_score: float, teacher_score: float) -> float:
    # Mean Squared Error between student and teacher
    return (teacher_score - student_score) ** 2
`,
    realWorld: {
        description: "Google and Bing do not run their massive models for every search. They use distillation to create tiny, hyper-efficient models that 'shadow' the reasoning of their giant twins.",
        companies: ["Google", "DeepMind", "NVIDIA"],
        useCases: ["Mobile On-Device AI", "Cost Reduction for High-Traffic Apps"],
    },
    prerequisites: ["rerank-cascade"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
  },
];
