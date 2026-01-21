'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ResumeData, SectionType } from '@/types/resume';

// Initial resume data from the original React component
const initialResumeData: ResumeData = {
  header: {
    name: 'ATIF SHAIKH',
    title: 'Forward Deployed Software Engineer | Solutions Architect | Enterprise AI Integration',
    contact: {
      email: 'atif.skelx@gmail.com',
      phone: '+91-9769550173',
      linkedin: 'linkedin.com/in/atif-shaikh',
      github: 'github.com/atif-shaikh',
      location: 'Mumbai, India',
      workAuthorization: 'UK Tier 2 Visa Sponsorship Required | EU Blue Card Eligible',
      relocation: 'Open to London, Berlin, Amsterdam, Paris',
      travel: 'Available for up to 50% customer site visits',
    },
  },
  summary: `Forward Deployed Software Engineer with 5+ years embedding on-site with enterprise clients across telecom, AI/ML, and cloud infrastructure, backed by 5 years of telecom operations in regulated environments. Specialize in stakeholder-driven discovery, solution architecture, and end-to-end deployment of production systems—from AI-powered Microsoft 365 automation to IoT sensor networks. Track record delivering customer-facing solutions for Fortune 500 and European enterprise clients, reducing operational overhead by 60%+ through intelligent automation and workflow optimization. Experienced in cross-functional collaboration from C-suite to engineering teams, rapid prototyping under SLA pressure, and architecting scalable solutions in GDPR-compliant environments. Available for up to 50% travel to customer sites across Europe and globally.`,
  skills: [
    {
      id: 'skill-1',
      category: 'Core Engineering',
      skills: 'Python | JavaScript/TypeScript | SQL | System Design | RESTful APIs | Production Debugging | Rapid Prototyping | Technical Consulting | Solution Architecture',
    },
    {
      id: 'skill-2',
      category: 'AI & Machine Learning',
      skills: 'Azure OpenAI | OpenAI GPT-4 | Anthropic Claude | Google Gemini | LangChain | Hugging Face | Prompt Engineering | LLM Cost Optimization | Model Selection | Agentic Workflows',
    },
    {
      id: 'skill-3',
      category: 'Full-Stack Development',
      skills: 'React.js | Next.js | Node.js | Express.js | MongoDB | PostgreSQL | Firebase | REST APIs | Microservices Architecture | API Integration',
    },
    {
      id: 'skill-4',
      category: 'Cloud & Infrastructure',
      skills: 'Docker | Kubernetes | CI/CD Pipelines | Azure (Azure AD, Microsoft Graph API, Azure Functions, Azure OpenAI) | AWS (EC2, S3, Lambda) | Cloud Deployment | Infrastructure as Code',
    },
    {
      id: 'skill-5',
      category: 'Enterprise Integration',
      skills: 'Microsoft 365 | Microsoft Graph API | SharePoint | Teams API | Exchange API | Azure Active Directory | PowerShell Automation | OAuth2/JWT | SSO Integration | GDPR Compliance',
    },
    {
      id: 'skill-6',
      category: 'IoT & Hardware',
      skills: 'Raspberry Pi | ESP8266 | Arduino | Sensor Networks | MQTT | Real-time Data Streaming | Edge Computing',
    },
    {
      id: 'skill-7',
      category: 'Methodologies & Tools',
      skills: 'Agile/Scrum | Git/GitHub | VS Code | Postman | API Testing | Technical Documentation | Stakeholder Communication | Customer Success | Technical Enablement',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Software Engineer – Forward Deployed Engineering',
      company: 'LTIMindtree',
      period: 'Dec 2024 – Present',
      clientNote: 'Client-facing role with US & European Fortune 500 clients',
      description: 'Embedded on-site and remotely with Microsoft partner clients across US and Europe, leading technical discovery, stakeholder management, solution architecture, and production deployment of AI-powered enterprise automation systems. Collaborate cross-functionally with client IT, security, and business teams.',
      bullets: [
        'M365 AI Automation (US Fortune 500): Led stakeholder discovery sessions to identify automation opportunities across SharePoint, Teams, and Exchange workflows. Architected and deployed GDPR-compliant Azure OpenAI + Microsoft Graph API integration automating document processing, intelligent email routing, and Teams notifications. Reduced manual processing time by 60%+ while ensuring enterprise compliance and security requirements. Conducted technical enablement workshops with IT teams for system adoption.',
        'SLA Monitoring & Alerting (European Microsoft Partner): Scoped technical requirements with customer stakeholders to prevent SLA breaches through proactive alerting. Built AI-powered CRM automation using Azure OpenAI detecting expiry patterns and triggering instant Teams notifications + admin alerts. Integrated with legacy CRM via REST APIs, improved client retention by 25% through early issue detection. Led technical workshops with customer engineering teams.',
        'Intelligent Support Ticket Routing (Microsoft Partner): Collaborated with support operations leadership to analyze ticket workflow bottlenecks and design solution architecture. Implemented AI classifier analyzing incoming Microsoft support tickets, auto-routing to correct queues via API integration. Achieved 40% routing accuracy improvement and 30% reduction in resolution time through elimination of manual triage. Conducted technical training sessions with support staff.',
        'Inventory Optimization AI Agent (Retail Client): Led discovery phase with retail operations team to understand buy/sell decision processes and data requirements. Built conversational AI chatbot analyzing monthly transaction data and recommending inventory decisions. Implemented intelligent model routing (Azure OpenAI → cost-optimized alternatives) based on query complexity, reducing API costs by 70% while maintaining decision quality. Delivered technical training to retail managers.',
      ],
      achievements: [
        'Successfully deployed 4 production AI systems across 3 Fortune 500 clients',
        'Managed stakeholder relationships from technical teams to C-suite executives',
        'Maintained 100% on-time delivery across all customer deployments under SLA pressure',
        'Conducted 15+ technical workshops and enablement sessions for customer teams',
      ],
    },
    {
      id: 'exp-2',
      role: 'Product Engineer',
      company: 'WriteBookAI (AI SaaS for Authors) | writebookai.com',
      period: '2023 – Dec 2024',
      description: 'Built and shipped AI-powered writing platform helping authors accelerate book production from 6+ months to 8-12 weeks. Owned end-to-end product development, customer feedback loops, deployment strategy, and cost optimization across 200+ beta users.',
      bullets: [
        'AI-Powered Content Generation: Designed and implemented AI drafting system using Google Gemini API with customizable tone adjustment, achieving 4.2/5 user quality rating. Solved writer productivity challenge by generating structured chapter drafts as starting points, enabling faster iteration cycles.',
        'End-to-End Publishing Pipeline: Built complete manuscript workflow from chapter generation → formatting → Amazon KDP-ready export. Eliminated need for external tools, reducing time-to-publish by 70% for independent authors through automated workflow orchestration.',
        'LLM Cost Optimization: Implemented intelligent model routing system selecting optimal AI model (GPT-4, Claude, Gemini) based on query complexity analysis. Reduced monthly API costs from $1.6K to $0.7K (56% reduction) while maintaining output quality through A/B testing and user feedback loops.',
        'Full-Stack Product Development: Architected and deployed complete SaaS platform: React frontend, Node.js backend, PostgreSQL database, Stripe payment integration, Docker containerization. Achieved 50% monthly user retention through iterative development cycles and continuous user feedback incorporation.',
      ],
    },
    {
      id: 'exp-3',
      role: 'Software Engineer – Platform Automation',
      company: 'Sherweb',
      period: 'Nov 2021 – Nov 2023',
      description: 'Built internal tools and automation for Microsoft 365 operations, collaborating cross-functionally with operations teams managing thousands of customer tenants. Reduced manual work and improved service delivery efficiency.',
      bullets: [
        'Ticketing System Platform: Architected and deployed web application with auto-assignment logic to engineers and email notification system, integrated with existing CRM via REST APIs. Replaced email-based workflow; reduced ticket creation time from 5+ minutes to under 30 seconds, improving team productivity by 90%.',
        'M365 Tenant Provisioning Automation: Built automated provisioning system using PowerShell + Microsoft Graph API for rapid tenant deployment. Reduced setup time from 45 minutes to 2 minutes and eliminated 90% of configuration errors through standardized workflow automation.',
        'Production Incident Management: Handled production incidents under tight SLAs, debugging API failures, authentication issues, and service outages while coordinating across technical teams. Maintained 99.5%+ SLA compliance through rapid troubleshooting and stakeholder communication.',
      ],
    },
    {
      id: 'exp-4',
      role: 'Software Engineer – Custom Solutions & Integrations',
      company: 'Upwork (Freelance)',
      period: 'Jan 2020 – Sep 2021',
      description: '',
      bullets: [
        'IoT Sensor Network (Manufacturing Client): Built ESP8266-based sensor network with real-time Firebase → React streaming dashboard. Resolved factory network visibility issues, enabling continuous production monitoring and reducing downtime by 35%.',
        'Farm Monitoring System (Agriculture Client): Developed WiFi-based remote monitoring and control system using AT commands with two-way Firebase communication. Enabled mobile irrigation management, reducing manual site visits by 80% and improving crop yield through timely interventions.',
        'Cloud Ticketing Platform: Created full-stack ticketing system deployed on cloud infrastructure, replacing email-driven workflow with automated routing and status tracking. Improved support team efficiency by 60% through streamlined workflow.',
      ],
    },
    {
      id: 'exp-5',
      role: 'Software Developer',
      company: 'Crio.Do (Engineering Bootcamp)',
      period: 'Dec 2019 – Aug 2020',
      description: 'Intensive full-stack development bootcamp focused on production-ready engineering practices. Built applications using MongoDB, Express.js, React, Node.js with focus on API design, authentication, database modeling, and deployment. Foundation for system design, debugging methodology, and engineering best practices applied in subsequent roles.',
      bullets: [],
    },
    {
      id: 'exp-6',
      role: 'Technical Operations Coordinator',
      company: 'Etisalat',
      period: '2013 – 2019',
      description: 'Managed incident response and service delivery for large-scale telecom infrastructure in regulated environment serving millions of users across voice, data, and IoT services.',
      bullets: [
        'Coordinated technical escalations across voice, data, and IoT services; gained exposure to networking, distributed systems, and cybersecurity in regulated telecom environment',
        'Built operational discipline: SLA management, cross-team coordination, communicating technical issues to non-technical stakeholders, working under pressure with 99.9% uptime requirements',
        'Debugged multi-system failures spanning network, application, and data layers—foundation for production troubleshooting skills and systematic incident resolution',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.E. Electronics & Communication Engineering',
      institution: 'Visvesvaraya Technological University (VTU)',
      location: 'Karnataka, India',
    },
  ],
  forwardDeployedExpertise: `I solve customer problems by embedding on-site, architecting solutions beyond stated requirements, and owning delivery from discovery to production. My technical breadth spans AI-powered automation, full-stack systems, and IoT integration—selecting the right technology stack for each customer's unique context and constraints. Comfortable presenting solution architectures to C-suite stakeholders and debugging production failures alongside engineering teams under SLA pressure. I thrive in the ambiguity of forward deployed work: translating unclear business problems into concrete technical solutions, navigating organizational complexity, and driving adoption through technical enablement. My background in regulated telecom operations (Etisalat) and experience with GDPR-compliant deployments positions me well for European enterprise environments requiring compliance awareness and operational rigor.`,
  sectionVisibility: {
    expertise: true,   // Forward Deployed Expertise
    summary: true,     // Professional Summary
    skills: true,      // Technical Skills
    education: true,   // Education
  },
};

// Context type
interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  editingSection: SectionType | null;
  setEditingSection: React.Dispatch<React.SetStateAction<SectionType | null>>;
  editingItemId: string | null;
  setEditingItemId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create context
const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Provider component
export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [editingSection, setEditingSection] = useState<SectionType | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        editingSection,
        setEditingSection,
        editingItemId,
        setEditingItemId,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

// Custom hook for using the context
export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
