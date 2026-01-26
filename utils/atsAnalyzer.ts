import { ResumeData } from '@/types/resume';

/**
 * ATS (Applicant Tracking System) Score Analyzer
 * 
 * Improved ATS compatibility analyzer based on industry best practices:
 * - Keyword matching with frequency weighting
 * - Experience relevance and career progression
 * - Quantifiable achievements detection
 * - Formatting and structure validation
 * - Comprehensive keyword database
 */

export interface ATSCategory {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string[];
  status: 'good' | 'warning' | 'poor';
}

export interface ATSResult {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  categories: ATSCategory[];
  suggestions: string[];
  strengths: string[];
}

// Expanded ATS keywords based on industry standards
const ATS_KEYWORDS = {
  technical: [
    // Programming Languages
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
    'sql', 'html', 'css', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash',
    // Frameworks & Libraries
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
    'next.js', 'nuxt', 'svelte', 'ember', 'backbone',
    // Databases
    'mongodb', 'postgresql', 'mysql', 'oracle', 'sqlite', 'redis', 'cassandra', 'elasticsearch',
    'dynamodb', 'firebase', 'supabase',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'gitlab',
    'github actions', 'ci/cd', 'microservices', 'serverless', 'lambda',
    // Tools & Platforms
    'git', 'jira', 'confluence', 'slack', 'agile', 'scrum', 'kanban', 'devops',
    // APIs & Protocols
    'rest', 'graphql', 'grpc', 'soap', 'api', 'webhook', 'oauth', 'jwt',
    // Data & Analytics
    'machine learning', 'ml', 'ai', 'data science', 'big data', 'hadoop', 'spark', 'kafka',
    'tableau', 'power bi', 'analytics', 'etl', 'data pipeline',
    // Security
    'security', 'cybersecurity', 'encryption', 'ssl', 'tls', 'authentication', 'authorization',
  ],
  action: [
    // Leadership & Management
    'led', 'managed', 'directed', 'oversaw', 'supervised', 'coordinated', 'orchestrated',
    // Development & Creation
    'developed', 'created', 'built', 'designed', 'architected', 'engineered', 'implemented',
    'constructed', 'established', 'founded', 'launched', 'initiated',
    // Improvement & Optimization
    'improved', 'enhanced', 'optimized', 'streamlined', 'refined', 'upgraded', 'modernized',
    'increased', 'boosted', 'accelerated', 'expanded', 'scaled',
    // Problem Solving
    'solved', 'resolved', 'fixed', 'debugged', 'troubleshot', 'analyzed', 'investigated',
    'diagnosed', 'identified', 'addressed',
    // Delivery & Achievement
    'delivered', 'achieved', 'accomplished', 'completed', 'executed', 'deployed', 'shipped',
    'produced', 'generated', 'yielded',
    // Collaboration
    'collaborated', 'partnered', 'worked with', 'teamed', 'cooperated', 'facilitated',
    // Communication & Influence
    'presented', 'communicated', 'influenced', 'persuaded', 'negotiated', 'mentored', 'trained',
    // Reduction & Efficiency
    'reduced', 'decreased', 'minimized', 'cut', 'lowered', 'saved', 'eliminated',
    'automated', 'simplified',
  ],
  softSkills: [
    'leadership', 'communication', 'teamwork', 'collaboration', 'problem-solving', 'analytical',
    'strategic thinking', 'critical thinking', 'adaptability', 'flexibility', 'initiative',
    'time management', 'project management', 'stakeholder management', 'cross-functional',
    'interpersonal', 'negotiation', 'presentation', 'mentoring', 'coaching', 'training',
    'customer service', 'client relations', 'relationship building',
  ],
  metrics: [
    '%', 'percent', 'percentage', 'increased', 'decreased', 'reduced', 'improved', 'saved',
    'revenue', 'cost', 'efficiency', 'productivity', 'performance', 'growth', 'uptime',
    'users', 'customers', 'transactions', 'throughput', 'latency', 'response time',
  ],
  achievements: [
    'award', 'recognition', 'certification', 'certified', 'achievement', 'accomplishment',
    'milestone', 'success', 'result', 'impact', 'outcome',
  ],
};

/**
 * Count keyword occurrences (frequency matters for ATS)
 */
function countKeywordOccurrences(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  let count = 0;
  keywords.forEach(keyword => {
    // Count all occurrences, not just presence
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      count += matches.length;
    }
  });
  return count;
}

/**
 * Extract years of experience from resume
 */
function extractYearsOfExperience(data: ResumeData): number {
  if (data.experience.length === 0) return 0;
  
  // Try to parse dates and calculate total years
  const datePattern = /(\d{4})/g;
  const years: number[] = [];
  
  data.experience.forEach(exp => {
    const matches = exp.period.match(datePattern);
    if (matches && matches.length >= 1) {
      const startYear = parseInt(matches[0]);
      const endYear = matches.length > 1 ? parseInt(matches[1]) : new Date().getFullYear();
      if (!isNaN(startYear) && !isNaN(endYear)) {
        years.push(endYear - startYear);
      }
    }
  });
  
  return years.reduce((sum, y) => sum + Math.max(0, y), 0);
}

/**
 * Main ATS analysis function
 */
export function analyzeResume(resumeData: ResumeData): ATSResult {
  const categories: ATSCategory[] = [];
  const suggestions: string[] = [];
  const strengths: string[] = [];

  // 1. Contact Information (15 points)
  const contactScore = analyzeContactInfo(resumeData, suggestions, strengths);
  categories.push(contactScore);

  // 2. Professional Summary (20 points) - Increased importance
  const summaryScore = analyzeSummary(resumeData, suggestions, strengths);
  categories.push(summaryScore);

  // 3. Work Experience (30 points) - Most important
  const experienceScore = analyzeExperience(resumeData, suggestions, strengths);
  categories.push(experienceScore);

  // 4. Skills Section (15 points)
  const skillsScore = analyzeSkills(resumeData, suggestions, strengths);
  categories.push(skillsScore);

  // 5. Keywords & ATS Optimization (20 points) - Increased importance
  const keywordsScore = analyzeKeywords(resumeData, suggestions, strengths);
  categories.push(keywordsScore);

  // 6. Education (10 points)
  const educationScore = analyzeEducation(resumeData, suggestions, strengths);
  categories.push(educationScore);

  // 7. Formatting & Structure (10 points) - Increased importance
  const formattingScore = analyzeFormatting(resumeData, suggestions, strengths);
  categories.push(formattingScore);

  // Calculate totals
  const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
  const maxPossibleScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
  const percentage = Math.round((totalScore / maxPossibleScore) * 100);

  // Determine grade
  const grade = getGrade(percentage);

  return {
    totalScore,
    maxPossibleScore,
    percentage,
    grade,
    categories,
    suggestions: suggestions.slice(0, 6), // Top 6 suggestions
    strengths: strengths.slice(0, 6), // Top 6 strengths
  };
}

function analyzeContactInfo(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 15;

  const { contact } = data.header;

  // Check email (3 points)
  if (contact.email && contact.email.includes('@')) {
    score += 3;
    const emailDomain = contact.email.split('@')[1]?.toLowerCase();
    if (emailDomain && !['gmail.com', 'yahoo.com', 'hotmail.com'].includes(emailDomain)) {
      feedback.push('✓ Professional email domain');
      strengths.push('Professional email address improves credibility');
    } else {
      feedback.push('✓ Email present (consider using professional domain)');
    }
  } else {
    feedback.push('✗ Missing or invalid email');
    suggestions.push('Add a professional email address');
  }

  // Check phone (3 points)
  if (contact.phone && contact.phone.replace(/\D/g, '').length >= 10) {
    score += 3;
    feedback.push('✓ Phone number present');
  } else {
    feedback.push('✗ Missing phone number');
    suggestions.push('Add a phone number for recruiters to contact you');
  }

  // Check LinkedIn (3 points) - Very important for ATS
  if (contact.linkedin && contact.linkedin.includes('linkedin')) {
    score += 3;
    feedback.push('✓ LinkedIn profile included');
    strengths.push('LinkedIn profile helps recruiters verify your background');
  } else {
    feedback.push('✗ Missing LinkedIn profile');
    suggestions.push('Add your LinkedIn URL - 87% of recruiters use LinkedIn');
  }

  // Check location (3 points) - Important for ATS filtering
  if (contact.location && contact.location.length > 3) {
    score += 3;
    feedback.push('✓ Location specified');
    strengths.push('Location helps ATS match you to local opportunities');
  } else {
    feedback.push('⚠ Location not specified');
    suggestions.push('Add your location - ATS systems filter by location');
  }

  // Check name (2 points)
  if (data.header.name && data.header.name.length > 3) {
    score += 2;
    feedback.push('✓ Full name present');
  } else {
    feedback.push('✗ Missing name');
  }

  // Check title (1 point)
  if (data.header.title && data.header.title.length > 10) {
    score += 1;
    feedback.push('✓ Professional title present');
    strengths.push('Clear professional title helps ATS categorize your profile');
  } else {
    suggestions.push('Add a professional title/headline for better ATS matching');
  }

  return {
    name: 'Contact Information',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 12 ? 'good' : score >= 9 ? 'warning' : 'poor',
  };
}

function analyzeSummary(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 20; // Increased from 15

  const summary = data.summary.toLowerCase();
  const wordCount = summary.split(/\s+/).filter(w => w.length > 0).length;

  // Check length (6 points) - ideal is 50-150 words
  if (wordCount >= 50 && wordCount <= 150) {
    score += 6;
    feedback.push(`✓ Optimal length (${wordCount} words)`);
    strengths.push('Professional summary has optimal length for ATS');
  } else if (wordCount >= 30 && wordCount <= 200) {
    score += 4;
    feedback.push(`⚠ Acceptable length (${wordCount} words), ideal is 50-150`);
  } else if (wordCount < 30) {
    feedback.push(`✗ Too short (${wordCount} words) - ATS may flag as incomplete`);
    suggestions.push('Expand your professional summary to 50-150 words for better ATS parsing');
  } else {
    score += 2;
    feedback.push(`⚠ Too long (${wordCount} words), consider trimming to 150 words`);
  }

  // Check for keywords with frequency (7 points)
  const techKeywordCount = countKeywordOccurrences(summary, ATS_KEYWORDS.technical);
  if (techKeywordCount >= 8) {
    score += 7;
    feedback.push(`✓ Rich in technical keywords (${techKeywordCount} occurrences)`);
    strengths.push('Summary is keyword-rich for ATS scanning');
  } else if (techKeywordCount >= 5) {
    score += 4;
    feedback.push(`⚠ ${techKeywordCount} technical keywords (aim for 8+ occurrences)`);
  } else {
    feedback.push(`✗ Low keyword density (${techKeywordCount} keywords)`);
    suggestions.push('Add more relevant technical keywords to your summary - repeat important terms');
  }

  // Check for quantifiable achievements (4 points)
  const hasMetrics = /\d+%|\d+\+|\$\d+|\d+\s*(years?|months?|million|thousand|k|m)\b/i.test(summary);
  if (hasMetrics) {
    score += 4;
    feedback.push('✓ Contains quantifiable achievements');
    strengths.push('Summary includes measurable results - ATS systems prioritize this');
  } else {
    feedback.push('✗ No quantifiable achievements');
    suggestions.push('Add numbers/percentages to your summary (e.g., "5+ years", "reduced costs by 30%")');
  }

  // Check for action verbs (3 points)
  const actionVerbCount = countKeywordOccurrences(summary, ATS_KEYWORDS.action);
  if (actionVerbCount >= 3) {
    score += 3;
    feedback.push(`✓ Uses strong action verbs (${actionVerbCount} occurrences)`);
  } else if (actionVerbCount >= 1) {
    score += 1;
    feedback.push(`⚠ Limited action verbs (${actionVerbCount})`);
  } else {
    feedback.push('✗ No action verbs in summary');
    suggestions.push('Start summary with action verbs (e.g., "Led", "Developed", "Achieved")');
  }

  return {
    name: 'Professional Summary',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 16 ? 'good' : score >= 12 ? 'warning' : 'poor',
  };
}

function analyzeExperience(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 30; // Increased from 25

  const { experience } = data;

  // Check number of experiences (6 points)
  if (experience.length >= 3) {
    score += 6;
    feedback.push(`✓ ${experience.length} work experiences listed`);
    strengths.push('Multiple experiences show career progression');
  } else if (experience.length >= 2) {
    score += 4;
    feedback.push(`⚠ ${experience.length} experiences (aim for 3+ for better ATS ranking)`);
  } else if (experience.length === 1) {
    score += 2;
    feedback.push('⚠ Only 1 experience listed');
    suggestions.push('Add more relevant work experiences - ATS systems prefer 2-3+ positions');
  } else {
    feedback.push('✗ No work experience listed');
    suggestions.push('Add your work experience - this is critical for ATS scoring');
  }

  // Calculate years of experience (4 points)
  const totalYears = extractYearsOfExperience(data);
  if (totalYears >= 5) {
    score += 4;
    feedback.push(`✓ ${totalYears}+ years of experience`);
    strengths.push('Strong experience level matches senior roles');
  } else if (totalYears >= 2) {
    score += 3;
    feedback.push(`✓ ${totalYears} years of experience`);
  } else if (totalYears >= 1) {
    score += 2;
    feedback.push(`⚠ ${totalYears} year of experience`);
  } else {
    feedback.push('⚠ Experience duration unclear');
  }

  // Analyze bullet points (12 points)
  let totalBullets = 0;
  let bulletsWithMetrics = 0;
  let bulletsWithActionVerbs = 0;
  let bulletsStartingWithAction = 0;

  experience.forEach((exp) => {
    exp.bullets.forEach((bullet) => {
      totalBullets++;
      const bulletLower = bullet.toLowerCase().trim();
      
      // Check for metrics (more comprehensive)
      if (/\d+%|\d+x|\d+\+|\$\d+|\d+\s*(million|thousand|k|m|users|customers|transactions|hours|days|weeks|months|years)\b/i.test(bullet)) {
        bulletsWithMetrics++;
      }
      
      // Check if bullet starts with action verb (most important)
      const startsWithAction = ATS_KEYWORDS.action.some(verb => 
        bulletLower.startsWith(verb) || bulletLower.startsWith(verb + ' ')
      );
      if (startsWithAction) {
        bulletsStartingWithAction++;
        bulletsWithActionVerbs++;
      } else if (ATS_KEYWORDS.action.some(verb => bulletLower.includes(` ${verb} `) || bulletLower.includes(` ${verb},`))) {
        bulletsWithActionVerbs++;
      }
    });
  });

  // Metrics in bullets (6 points) - Most important for ATS
  const metricsPercentage = totalBullets > 0 ? (bulletsWithMetrics / totalBullets) * 100 : 0;
  if (metricsPercentage >= 50) {
    score += 6;
    feedback.push(`✓ ${Math.round(metricsPercentage)}% of bullets have quantifiable metrics`);
    strengths.push('Experience section is rich with quantifiable achievements - ATS systems prioritize this');
  } else if (metricsPercentage >= 30) {
    score += 4;
    feedback.push(`⚠ ${Math.round(metricsPercentage)}% of bullets have metrics (aim for 50%+)`);
  } else if (metricsPercentage >= 15) {
    score += 2;
    feedback.push(`⚠ Only ${Math.round(metricsPercentage)}% of bullets have metrics`);
    suggestions.push('Add more numbers and percentages to your bullet points - ATS systems score higher with metrics');
  } else {
    feedback.push(`✗ Only ${Math.round(metricsPercentage)}% of bullets have metrics`);
    suggestions.push('Add quantifiable results to bullet points (e.g., "increased revenue by 30%", "managed team of 5")');
  }

  // Action verbs at start of bullets (4 points) - Critical for ATS
  const actionStartPercentage = totalBullets > 0 ? (bulletsStartingWithAction / totalBullets) * 100 : 0;
  if (actionStartPercentage >= 70) {
    score += 4;
    feedback.push(`✓ ${Math.round(actionStartPercentage)}% of bullets start with action verbs`);
    strengths.push('Strong use of action verbs - ATS systems recognize this pattern');
  } else if (actionStartPercentage >= 50) {
    score += 3;
    feedback.push(`⚠ ${Math.round(actionStartPercentage)}% start with action verbs (aim for 70%+)`);
  } else if (actionStartPercentage >= 30) {
    score += 2;
    feedback.push(`⚠ ${Math.round(actionStartPercentage)}% start with action verbs`);
    suggestions.push('Start bullet points with strong action verbs (Led, Developed, Implemented) - ATS systems prefer this format');
  } else {
    score += 1;
    feedback.push(`✗ Only ${Math.round(actionStartPercentage)}% start with action verbs`);
    suggestions.push('Restructure bullets to start with action verbs for better ATS parsing');
  }

  // General action verb usage (2 points)
  const actionVerbPercentage = totalBullets > 0 ? (bulletsWithActionVerbs / totalBullets) * 100 : 0;
  if (actionVerbPercentage >= 80) {
    score += 2;
  } else if (actionVerbPercentage < 50) {
    suggestions.push('Use more action verbs throughout your experience descriptions');
  }

  // Job titles and companies completeness (6 points)
  const hasCompleteTitles = experience.every(exp => exp.role && exp.company && exp.period);
  if (hasCompleteTitles && experience.length >= 2) {
    score += 6;
    feedback.push('✓ All positions have complete information');
    strengths.push('Complete experience entries improve ATS parsing accuracy');
  } else if (hasCompleteTitles) {
    score += 4;
    feedback.push('✓ Complete information for all positions');
  } else {
    score += 2;
    feedback.push('⚠ Some positions missing title, company, or dates');
    suggestions.push('Ensure all positions have role, company, and date range');
  }

  return {
    name: 'Work Experience',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 24 ? 'good' : score >= 18 ? 'warning' : 'poor',
  };
}

function analyzeSkills(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 15;

  const { skills } = data;
  const allSkillsText = skills.map(s => s.skills.toLowerCase()).join(' ');
  const skillCount = allSkillsText.split(/[|,]/).filter(s => s.trim().length > 0).length;

  // Check skill categories (5 points)
  if (skills.length >= 5) {
    score += 5;
    feedback.push(`✓ ${skills.length} skill categories organized`);
    strengths.push('Well-organized skills section with clear categories');
  } else if (skills.length >= 3) {
    score += 3;
    feedback.push(`⚠ ${skills.length} skill categories (aim for 5+ for better ATS matching)`);
  } else {
    feedback.push('✗ Limited skill categories');
    suggestions.push('Organize skills into more categories (Technical, Tools, Soft Skills, Certifications)');
  }

  // Check technical skills with frequency (6 points)
  const techSkillsCount = countKeywordOccurrences(allSkillsText, ATS_KEYWORDS.technical);
  if (techSkillsCount >= 15) {
    score += 6;
    feedback.push(`✓ ${techSkillsCount} recognized technical skills`);
    strengths.push('Strong technical skills that match ATS keyword databases');
  } else if (techSkillsCount >= 8) {
    score += 4;
    feedback.push(`⚠ ${techSkillsCount} recognized skills (aim for 15+ for better matching)`);
  } else if (techSkillsCount >= 4) {
    score += 2;
    feedback.push(`⚠ ${techSkillsCount} recognized skills`);
    suggestions.push('Add more industry-standard technical skills to improve ATS matching');
  } else {
    feedback.push(`✗ Low technical skill count (${techSkillsCount})`);
    suggestions.push('Include more relevant technical skills from job descriptions');
  }

  // Total skill density (4 points)
  if (skillCount >= 25) {
    score += 4;
    feedback.push(`✓ ${skillCount} skills listed`);
    strengths.push('Comprehensive skills list improves ATS keyword matching');
  } else if (skillCount >= 15) {
    score += 3;
    feedback.push(`⚠ ${skillCount} skills listed (aim for 25+ for better coverage)`);
  } else if (skillCount >= 8) {
    score += 2;
    feedback.push(`⚠ ${skillCount} skills listed`);
  } else {
    feedback.push(`✗ Only ${skillCount} skills listed`);
    suggestions.push('Add more skills to increase keyword density for ATS');
  }

  return {
    name: 'Skills Section',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 12 ? 'good' : score >= 9 ? 'warning' : 'poor',
  };
}

function analyzeKeywords(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 20; // Increased from 15

  // Combine all text for comprehensive keyword analysis
  const allText = [
    data.summary,
    data.header.title,
    ...data.skills.map(s => s.skills),
    ...data.experience.flatMap(e => [e.role, e.company, e.description, ...e.bullets, ...(e.achievements || [])]),
    data.forwardDeployedExpertise,
    ...(data.generalSections || []).flatMap(s => [s.title, s.summary]),
  ].join(' ').toLowerCase();

  // Technical keywords with frequency (8 points) - Most important
  const techKeywordCount = countKeywordOccurrences(allText, ATS_KEYWORDS.technical);
  if (techKeywordCount >= 25) {
    score += 8;
    feedback.push(`✓ Excellent keyword density (${techKeywordCount} technical keyword occurrences)`);
    strengths.push('Excellent keyword optimization - high frequency improves ATS ranking');
  } else if (techKeywordCount >= 15) {
    score += 6;
    feedback.push(`✓ Good keyword density (${techKeywordCount} technical keywords)`);
    strengths.push('Good keyword coverage for ATS scanning');
  } else if (techKeywordCount >= 10) {
    score += 4;
    feedback.push(`⚠ ${techKeywordCount} technical keywords (aim for 15+ occurrences)`);
    suggestions.push('Repeat important technical keywords throughout your resume - frequency matters for ATS');
  } else {
    feedback.push(`✗ Low technical keyword count (${techKeywordCount})`);
    suggestions.push('Include more relevant technical terms from job descriptions - use them multiple times');
  }

  // Action verbs with frequency (6 points)
  const actionVerbCount = countKeywordOccurrences(allText, ATS_KEYWORDS.action);
  if (actionVerbCount >= 20) {
    score += 6;
    feedback.push(`✓ Strong action verb usage (${actionVerbCount} occurrences)`);
    strengths.push('Resume demonstrates strong action-oriented language');
  } else if (actionVerbCount >= 12) {
    score += 4;
    feedback.push(`⚠ ${actionVerbCount} action verbs (aim for 20+ for better impact)`);
  } else if (actionVerbCount >= 6) {
    score += 2;
    feedback.push(`⚠ ${actionVerbCount} action verbs`);
    suggestions.push('Use more action verbs throughout your resume');
  } else {
    feedback.push(`✗ Low action verb usage (${actionVerbCount})`);
    suggestions.push('Incorporate more action verbs (Led, Developed, Implemented, Achieved)');
  }

  // Soft skills (4 points)
  const softSkillCount = countKeywordOccurrences(allText, ATS_KEYWORDS.softSkills);
  if (softSkillCount >= 8) {
    score += 4;
    feedback.push(`✓ ${softSkillCount} soft skills mentioned`);
    strengths.push('Good balance of technical and soft skills');
  } else if (softSkillCount >= 5) {
    score += 3;
    feedback.push(`⚠ ${softSkillCount} soft skills (aim for 8+)`);
  } else if (softSkillCount >= 3) {
    score += 2;
    feedback.push(`⚠ ${softSkillCount} soft skills`);
  } else {
    feedback.push(`✗ Limited soft skills mentioned (${softSkillCount})`);
    suggestions.push('Add soft skills like leadership, communication, collaboration, problem-solving');
  }

  // Achievement keywords (2 points)
  const achievementCount = countKeywordOccurrences(allText, ATS_KEYWORDS.achievements);
  if (achievementCount >= 3) {
    score += 2;
    feedback.push(`✓ Achievement-focused language (${achievementCount} occurrences)`);
  } else if (achievementCount >= 1) {
    score += 1;
  }

  return {
    name: 'Keywords & ATS Optimization',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 16 ? 'good' : score >= 12 ? 'warning' : 'poor',
  };
}

function analyzeEducation(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 10;

  const { education } = data;

  if (education.length > 0) {
    score += 5;
    feedback.push(`✓ ${education.length} education entries`);

    const hasComplete = education.every(e => e.degree && e.institution);
    if (hasComplete) {
      score += 5;
      feedback.push('✓ Complete education information');
      strengths.push('Education section is complete and ATS-readable');
    } else {
      score += 2;
      feedback.push('⚠ Some education entries incomplete');
      suggestions.push('Ensure all education entries have degree and institution');
    }

    // Check for degree keywords
    const hasDegreeKeywords = education.some(e => 
      /bachelor|master|ph\.?d|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|mba|b\.?tech|m\.?tech/i.test(e.degree || '')
    );
    if (hasDegreeKeywords) {
      strengths.push('Education includes recognized degree types');
    }
  } else {
    feedback.push('✗ No education listed');
    suggestions.push('Add your educational background - ATS systems often filter by education');
  }

  return {
    name: 'Education',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 8 ? 'good' : score >= 5 ? 'warning' : 'poor',
  };
}

function analyzeFormatting(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 10; // Increased from 5

  // Calculate total content length
  const allText = [
    data.summary,
    ...data.skills.map(s => s.skills),
    ...data.experience.flatMap(e => [e.description, ...e.bullets, ...(e.achievements || [])]),
    data.forwardDeployedExpertise,
    ...(data.generalSections || []).flatMap(s => [s.title, s.summary]),
  ].join(' ');

  const wordCount = allText.split(/\s+/).filter(w => w.length > 0).length;

  // Ideal resume is 400-800 words for ATS (4 points)
  if (wordCount >= 400 && wordCount <= 800) {
    score += 4;
    feedback.push(`✓ Optimal content length (${wordCount} words)`);
    strengths.push('Resume length is ideal for ATS parsing (400-800 words)');
  } else if (wordCount >= 300 && wordCount <= 1000) {
    score += 3;
    feedback.push(`⚠ ${wordCount} words (ideal is 400-800 for ATS)`);
  } else if (wordCount < 300) {
    score += 1;
    feedback.push(`⚠ Resume may be too short (${wordCount} words) - ATS may flag as incomplete`);
    suggestions.push('Add more detail to reach 400-800 words for better ATS scoring');
  } else {
    score += 2;
    feedback.push(`⚠ Resume is lengthy (${wordCount} words) - consider trimming to 800 words`);
    suggestions.push('Resume exceeds ideal length - ATS systems prefer 1-2 page resumes');
  }

  // Check section completeness (4 points)
  const hasSummary = data.summary.length > 50;
  const hasSkills = data.skills.length >= 3;
  const hasExperience = data.experience.length >= 2;
  const hasEducation = data.education.length >= 1;

  const sectionsComplete = [hasSummary, hasSkills, hasExperience, hasEducation].filter(Boolean).length;
  if (sectionsComplete === 4) {
    score += 4;
    feedback.push('✓ All major sections present');
    strengths.push('Resume has complete, ATS-standard structure');
  } else if (sectionsComplete === 3) {
    score += 3;
    feedback.push(`⚠ ${sectionsComplete}/4 major sections complete`);
  } else {
    score += 1;
    feedback.push(`✗ Only ${sectionsComplete}/4 major sections complete`);
    suggestions.push('Complete all major sections (Summary, Skills, Experience, Education) for better ATS scoring');
  }

  // Check for achievements section (2 points)
  const hasAchievements = data.experience.some(exp => exp.achievements && exp.achievements.length > 0);
  if (hasAchievements) {
    score += 2;
    feedback.push('✓ Achievements section present');
    strengths.push('Achievements section highlights quantifiable results');
  } else {
    feedback.push('⚠ No achievements section');
    suggestions.push('Add achievements sections to highlight quantifiable results');
  }

  return {
    name: 'Formatting & Structure',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 8 ? 'good' : score >= 6 ? 'warning' : 'poor',
  };
}

function getGrade(percentage: number): 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= 95) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 75) return 'B+';
  if (percentage >= 65) return 'B';
  if (percentage >= 55) return 'C';
  if (percentage >= 45) return 'D';
  return 'F';
}

/**
 * Get color for score display
 */
export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getScoreBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100';
  if (percentage >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
}
