export interface SkillGroup {
  id: string;
  name: string;
  note: string;
  skills: string[];
}

export const skills: SkillGroup[] = [
  {
    id: 'genai',
    name: 'GEN AI',
    note: 'Fine-tuning and serving small language models end-to-end.',
    skills: [
      'LLMs', 'Llama 3.1/3.2', 'SLMs', 'Fine-tuning', 'SFT', 'PEFT', 'LoRA', 'QLoRA',
      '4-bit Quantization', 'Unsloth', 'Transformers', 'TRL', 'GGUF', 'llama.cpp', 'Ollama',
      'Prompt Engineering',
    ],
  },
  {
    id: 'rag',
    name: 'RAG',
    note: 'Retrieval systems from ingestion to citation-grounded generation.',
    skills: [
      'LangChain', 'ChromaDB', 'Embeddings', 'Sentence Transformers', 'BGE', 'Semantic Search',
      'Document Chunking', 'Document Ingestion', 'Citation-Grounded Generation', 'Retrieval Evaluation',
    ],
  },
  {
    id: 'agentic',
    name: 'AGENTIC AI',
    note: 'State machines over language-model calls, not chat wrappers.',
    skills: [
      'LangGraph', 'Stateful Workflows', 'Conditional Routing', 'Tool Calling',
      'Self-Correction Loops', 'Retrieval-Based Memory', 'Text-to-SQL',
    ],
  },
  {
    id: 'eval',
    name: 'EVALUATION & SAFETY',
    note: 'If it is not measured, it does not ship.',
    skills: [
      'RAGAS', 'NDCG', 'Semantic Similarity', 'Execution Accuracy', 'Hallucination Detection',
      'Regression Testing', 'Error Analysis', 'Leakage Prevention', 'Threat Modeling', 'SQL Allowlisting',
    ],
  },
  {
    id: 'engineering',
    name: 'ENGINEERING',
    note: 'Backend, packaging and delivery around the models.',
    skills: [
      'Python', 'PyTorch', 'FastAPI', 'REST APIs', 'Streamlit', 'Docker', 'Docker Compose',
      'Git', 'GitHub Actions', 'CI/CD', 'pytest', 'Model Serving',
    ],
  },
  {
    id: 'data',
    name: 'DATA',
    note: 'The layer every AI system is judged against.',
    skills: ['SQL', 'SQLite', 'Pandas', 'NumPy'],
  },
];
