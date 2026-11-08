export const identity = {
  name: 'Gaurav Shinde',
  brand: 'GAURAV.AI',
  role: 'AI Engineer',
  tagline: 'I engineer intelligence into systems.',
  support:
    'Building intelligent applications through Generative AI, retrieval systems, fine-tuned language models and autonomous agent workflows.',
  objective:
    'Secure opportunities in AI Engineering, Machine Learning Engineering, Generative AI Engineering, LLM Engineering and Agentic AI Development.',
  location: 'Navi Mumbai, India',
  domains: ['GENERATIVE AI', 'RAG SYSTEMS', 'LLM FINE-TUNING', 'AGENTIC SYSTEMS', 'MODEL EVALUATION'],
  about: {
    headline: 'Engineering is about understanding systems.',
    body: [
      'Gaurav Shinde is an AI Engineer at Tata Consultancy Services with hands-on experience in Generative AI, RAG, LLM fine-tuning and agentic systems.',
      'The work spans the full lifecycle of an AI product: designing retrieval architectures, fine-tuning small language models, wiring agentic state machines, and — most importantly — measuring whether the system actually works before anyone else has to find out.',
      'This portfolio documents real systems with real numbers, including the evaluations that did not improve the product. Honest baselines beat inflated demos.',
    ],
  },
  experience: [
    {
      role: 'AI Engineer',
      org: 'Tata Consultancy Services',
      period: '2024 — Present',
      location: 'Navi Mumbai, India',
      highlights: [
        'Built and deployed a client-facing RAG chatbot for branch staff of a public-sector bank.',
        'Stack: LangChain, Llama 3.1 8B (Ollama), BAAI/bge-small-en-v1.5, Oracle Database as the vector store.',
        'Enabled 75% of identified service-desk requests to be resolved without backend analyst escalation.',
      ],
    },
  ],
  education: {
    degree: 'B.Tech, Mechanical Engineering',
    school: 'Annasaheb Dange College of Engineering and Technology, Ashta',
    period: '2019 — 2023',
  },
  contact: {
    headline: "Let's build something intelligent.",
    copy: 'Interested in building reliable AI products, intelligent agent systems and practical applications of modern language models.',
    email: 'shindegaurav2201@gmail.com',
    linkedin: 'https://linkedin.com/in/gaurav-shinde-2182b51a1',
    github: 'https://github.com/Gaurav-shinde2207',
    resume: '/Gaurav-Shinde-Resume.pdf',
  },
} as const;

export const heroAnnotations = [
  { label: 'LOCATION', value: 'NAVI MUMBAI, INDIA' },
  { label: 'DOMAIN', value: 'ARTIFICIAL INTELLIGENCE' },
  { label: 'FOCUS', value: 'GENERATIVE AI / AGENTIC SYSTEMS' },
] as const;
