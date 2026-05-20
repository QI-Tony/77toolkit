// All resume content for Qi Zhang — translated and structured from Chinese résumé

export const resumeData = {
  personal: {
    name: 'Qi Zhang',
    nameZh: '张琪',
    title: 'MIS Graduate · AI Researcher · Data Engineer',
    subtitle: 'M.S. Information Management Systems — University of Arizona',
    tagline:
      'Fresh M.S. graduate with 6+ years of international study, specializing in AI/NLP research, large-scale data engineering, and full-stack development.',
    email: 'zhangqi@arizona.edu',
    phone: '+86 131-8006-6316',
    linkedin: 'https://www.linkedin.com/in/qi-zhang-a71b371b5/',
    location: 'University of Arizona, Tucson, AZ',
    status: 'Available for Full-Time Roles'
  },

  summary: [
    'I am a fresh M.S. graduate from the University of Arizona (Eller College of Management, GPA 3.61/4.0) with a strong background in Computer Science and Finance. Six-plus years of overseas study have sharpened my analytical thinking and cross-cultural communication skills.',
    'At the UA Artificial Intelligence Lab (advised by Prof. Hsinchun Chen — Regents\' Professor, Fellow of ACM/IEEE/AAAS/AIS), I led cutting-edge research in LLM-based PII detection on social media and spatial time-series electricity demand forecasting. I also built industrial-scale web crawlers that collected data across 700+ companies and 500K+ users.',
    'I am passionate about bridging AI research and engineering practice — from designing ML pipelines and fine-tuning large language models to architecting databases and deploying full-stack applications on AWS.'
  ],

  stats: [
    { value: '3.61', label: 'M.S. GPA' },
    { value: '3.56', label: 'B.S. GPA' },
    { value: '4+', label: 'Years of Research' },
    { value: '500K+', label: 'User Profiles Collected' }
  ],

  education: [
    {
      id: 'ms',
      school: 'University of Arizona',
      degree: 'Master of Science — Information Management Systems',
      college: 'Eller College of Management',
      period: 'Aug 2023 – May 2025',
      gpa: '3.61 / 4.00',
      location: 'Tucson, AZ',
      highlights: [
        'Focus areas: Data Analytics, AI/ML, Database Systems, Business Intelligence',
        'Graduate Research Assistant at the Artificial Intelligence Lab under Prof. Hsinchun Chen'
      ]
    },
    {
      id: 'bs',
      school: 'University of Arizona',
      degree: 'Bachelor of Science — Computer Science',
      college: 'College of Science',
      period: 'Aug 2019 – May 2023',
      gpa: '3.56 / 4.00',
      location: 'Tucson, AZ',
      highlights: [
        'Minor in Finance',
        "7th China International Internet+ Innovation & Entrepreneurship Competition — Gold Award",
        "Dean's List With Distinction",
        'Outstanding Graduate'
      ]
    }
  ],

  experience: [
    {
      id: 'grad-ra',
      title: 'Graduate Research Assistant',
      org: 'Artificial Intelligence Lab, Eller College of Management, University of Arizona',
      orgShort: 'UA AI Lab',
      advisor: "Advisor: Prof. Hsinchun Chen — UA Regents' Professor; Fellow of ACM, IEEE, AAAS & AIS",
      period: 'Aug 2023 – Present',
      bullets: [
        'Engineered high-throughput web crawlers (Python, Selenium, Requests, spaCy) to monitor and collect earnings call transcripts from 700+ companies across nearly two decades.',
        'Built a multi-source social media dataset: 5,000+ news articles from Intel & Samsung, 5,000+ social posts from Intel/Samsung/Volkswagen/Tesla, 20K+ Instagram profiles, and 500K+ Reddit user records.',
        'Led research on "Automated Detection of PII Exposure on Social Media" — developed a multimodal LLM pipeline (BERT, RoBERTa, LLaMA-2) to classify PII risk in user-generated content.',
        'Led research on "Electricity Demand and Supply Mismatch Forecasting: A Spatial Time-Series Approach" — integrated foundation models and LLMs for proactive imbalance early-warning.'
      ]
    },
    {
      id: 'undergrad-ra',
      title: 'Undergraduate Research Assistant',
      org: 'Artificial Intelligence Lab, Eller College of Management, University of Arizona',
      orgShort: 'UA AI Lab',
      advisor: '',
      period: 'Aug 2021 – May 2023',
      bullets: [
        'Developed social media crawlers (Python, Selenium, spaCy) aggregating 50,000+ user profiles from TikTok, Instagram, and Reddit.',
        'Administered a MongoDB database with 1 billion+ records; improved ingestion and query throughput via sharding optimization.',
        'Maintained and enhanced a PII portal website using Django, ensuring secure data access and efficient user management.'
      ]
    }
  ],

  research: [
    {
      title: 'Automated Detection of Personally Identifiable Information Exposure on Social Media',
      role: 'Lead Researcher',
      period: '2024 – Present',
      description:
        'Designed a multimodal pipeline combining text and image analysis with LLMs (BERT, RoBERTa, LLaMA-2) to detect and classify PII risk in social media content at scale.',
      tags: ['LLM', 'BERT', 'RoBERTa', 'LLaMA-2', 'Multimodal AI', 'NLP', 'Privacy']
    },
    {
      title: 'Electricity Demand and Supply Mismatch Forecasting: A Spatial Time-Series Approach',
      role: 'Lead Researcher',
      period: '2024 – Present',
      description:
        'Applied spatial time-series foundation models and large language models to forecast electricity distribution imbalances, enabling proactive early-warning for grid management.',
      tags: ['Time-Series', 'LLM', 'Spatial Modeling', 'Forecasting', 'Energy AI']
    }
  ],

  projects: [
    {
      id: 'elder-ease',
      name: 'ElderEase — AI Voice Assistant for Seniors',
      role: 'Project Leader',
      period: 'Aug – Dec 2024',
      description:
        'Led UX research and product design for an AI-powered voice assistant tailored to elderly users, focusing on accessibility, task guidance, and safety.',
      tags: ['Figma', 'UX Research', 'Product Design', 'AI', 'Accessibility'],
      bullets: [
        'Conducted user research with elderly participants; identified key pain points and defined core AI voice assistant features.',
        'Designed Level-0/1 data flow diagrams to standardize system architecture and scalability.',
        'Produced high-fidelity Figma prototypes with voice navigation, task guidance, and emergency alert flows.'
      ],
      featured: true
    },
    {
      id: 'pii-ner',
      name: 'PII Entity Recognition (NER)',
      role: 'Project Leader',
      period: 'Jan – May 2024',
      description:
        'Built and fine-tuned deep learning NER models to automatically extract personally identifiable information from social media text.',
      tags: ['PyTorch', 'BERT', 'BERTweet', 'Hugging Face', 'NLP', 'NER'],
      bullets: [
        'Designed CNN and LSTM architectures in PyTorch for token-level PII classification.',
        'Fine-tuned BERT and BERTweet via Hugging Face Transformers on a custom PII-annotated corpus.',
        'Implemented both word-level and character-level NER; evaluated on F1, precision, and recall.'
      ],
      featured: true
    },
    {
      id: 'gas-db',
      name: 'Growth Ability Services — Database System',
      role: 'Project Leader',
      period: 'Aug – Dec 2023',
      description:
        'Designed and implemented a full-stack database solution for a business services company, deployed to AWS.',
      tags: ['SQL', 'AWS', 'Database Design', 'Full-Stack'],
      bullets: [
        'Architected a relational database with 30+ tables supporting business operations and analytical reporting.',
        'Authored 20+ complex SQL queries, triggers, and stored procedures; tuned for large-scale performance.',
        'Developed a user-friendly frontend interface and deployed the full system to AWS (EC2 + RDS).'
      ],
      featured: true
    },
    {
      id: 'ghbci',
      name: 'GHBCI Business Consulting',
      role: 'Project Leader',
      period: 'Jan – May 2024',
      description:
        'Delivered strategic marketing consulting to the Global Health and Body Composition Institute, driving social media growth and brand visibility.',
      tags: ['Marketing Strategy', 'Social Media', 'Branding', 'Content Design'],
      bullets: [
        'Analyzed marketing performance across YouTube, Instagram, and LinkedIn; identified top-performing content formats.',
        'Designed posters, newsletters, and web templates; delivered a comprehensive marketing roadmap.'
      ],
      featured: false
    },
    {
      id: 'retinopathy',
      name: 'Diabetic Retinopathy Image Classification',
      role: 'Researcher',
      period: 'Aug – Dec 2023',
      description:
        'Built an attention-based CNN in PyTorch for automated severity grading of diabetic retinopathy from fundus images.',
      tags: ['PyTorch', 'CNN', 'Attention Mechanism', 'Medical AI', 'Computer Vision'],
      bullets: [
        'Implemented attention mechanism-augmented CNN; trained and evaluated on retinal image dataset.',
        'Achieved competitive multi-class classification accuracy for retinopathy severity grading.'
      ],
      featured: false
    },
    {
      id: 'fake-news',
      name: 'COVID-19 Fake News Detection',
      role: 'Project Leader',
      period: 'Jan – May 2023',
      description:
        'Built a multi-model misinformation detection system, from classical ML to deep learning, augmented with ChatGPT API.',
      tags: ['Scikit-Learn', 'TensorFlow', 'RNN', 'CNN', 'ChatGPT API', 'NLP'],
      bullets: [
        'Implemented SVM and Logistic Regression baselines using Scikit-Learn.',
        'Developed RNN and CNN models with TensorFlow for improved detection accuracy.',
        'Integrated ChatGPT API for nuanced, explainable misinformation classification.'
      ],
      featured: false
    },
    {
      id: 'compiler',
      name: 'Compiler Simulation',
      role: 'Project Leader',
      period: 'Jan – May 2023',
      description:
        'Implemented a complete compiler pipeline in Python from scratch, covering all major compilation stages.',
      tags: ['Python', 'Compiler Design', 'Parsing', 'Code Generation'],
      bullets: [
        'Built 10+ components: Lexical Analyzer, Parser, Semantic Analyzer, Code Generator, and Error Handler.',
        'Implemented both top-down and bottom-up parsing strategies with comprehensive error recovery.'
      ],
      featured: false
    }
  ],

  skills: [
    {
      category: 'Programming Languages',
      icon: '💻',
      items: ['Python', 'Java', 'JavaScript', 'SQL', 'C / C++', 'C#', 'R', 'MATLAB', 'PHP', 'Shell', 'HTML / CSS']
    },
    {
      category: 'AI / Machine Learning',
      icon: '🤖',
      items: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'spaCy', 'Hugging Face', 'BERT', 'LLaMA', 'CNN', 'LSTM', 'NER']
    },
    {
      category: 'Data Engineering',
      icon: '📊',
      items: ['Pandas', 'NumPy', 'Spark', 'Hadoop', 'MongoDB', 'SQL Databases', 'Tableau', 'ETL Pipelines']
    },
    {
      category: 'Cloud & DevOps',
      icon: '☁️',
      items: ['AWS (EC2, RDS, S3, Redshift, DMS)', 'Google Cloud', 'Git / GitHub', 'GitLab', 'Plastic SCM']
    },
    {
      category: 'Web Development',
      icon: '🌐',
      items: ['Vue.js', 'Django', 'REST APIs', 'HTML5', 'CSS3', 'JavaScript', 'Figma']
    },
    {
      category: 'Languages',
      icon: '🌏',
      items: ['Chinese (Native)', 'English (Professional — Working Language)']
    }
  ],

  honors: [
    {
      title: '7th China International Internet+ Innovation & Entrepreneurship Competition',
      award: 'Gold Award',
      year: '2021'
    },
    {
      title: "Dean's List With Distinction",
      award: 'University of Arizona',
      year: '2019 – 2023'
    },
    {
      title: 'Outstanding Graduate',
      award: 'College of Science, University of Arizona',
      year: '2023'
    }
  ]
}
