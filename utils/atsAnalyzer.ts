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
    if (wordCount < 50) {
      suggestions.push(`Expand summary by ${50 - wordCount} words. Add: years of experience, key skills, and main achievements`);
    }
  } else if (wordCount < 30) {
    feedback.push(`✗ Too short (${wordCount} words) - ATS may flag as incomplete`);
    suggestions.push(`Expand summary to 50-150 words. Add: ${50 - wordCount} more words about your experience, skills, and achievements`);
  } else {
    score += 2;
    feedback.push(`⚠ Too long (${wordCount} words), consider trimming to 150 words`);
    suggestions.push(`Trim summary by ${wordCount - 150} words. Keep only most relevant experience and achievements`);
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
    suggestions.push(`Add ${8 - techKeywordCount} more technical keywords to summary. Include: programming languages, frameworks, tools you use`);
  } else {
    feedback.push(`✗ Low keyword density (${techKeywordCount} keywords)`);
    suggestions.push(`Add ${8 - techKeywordCount} technical keywords to summary. Examples: Python, React, AWS, Docker, SQL. Repeat important terms 2-3 times`);
  }

  // Check for quantifiable achievements (4 points)
  const hasMetrics = /\d+%|\d+\+|\$\d+|\d+\s*(years?|months?|million|thousand|k|m)\b/i.test(summary);
  if (hasMetrics) {
    score += 4;
    feedback.push('✓ Contains quantifiable achievements');
    strengths.push('Summary includes measurable results - ATS systems prioritize this');
  } else {
    feedback.push('✗ No quantifiable achievements');
    suggestions.push('Add numbers to summary. Examples: "5+ years experience", "reduced costs by 30%", "managed team of 10", "$1M revenue"');
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
    suggestions.push(`Add ${3 - experience.length} more work experience${3 - experience.length > 1 ? 's' : ''} to improve ATS score`);
  } else if (experience.length === 1) {
    score += 2;
    feedback.push('⚠ Only 1 experience listed');
    suggestions.push('Add 2 more work experiences - ATS systems prefer 2-3+ positions for better matching');
  } else {
    feedback.push('✗ No work experience listed');
    suggestions.push('Add your work experience - this is critical for ATS scoring. Include at least 2-3 positions with job title, company, and dates');
  }

  // Check for missing details in each experience
  experience.forEach((exp, idx) => {
    const issues: string[] = [];
    if (!exp.role || exp.role.trim().length < 3) {
      issues.push('job title');
    }
    if (!exp.company || exp.company.trim().length < 2) {
      issues.push('company name');
    }
    if (!exp.period || !exp.period.match(/\d{4}/)) {
      issues.push('date range');
    }
    if (exp.bullets.length === 0) {
      issues.push('bullet points');
    }
    
    if (issues.length > 0) {
      const expLabel = exp.company || exp.role || `Experience #${idx + 1}`;
      suggestions.push(`Fix ${expLabel}: Missing ${issues.join(', ')}. Add these details to improve ATS parsing`);
    }
  });

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
  const bulletsNeedingMetrics: string[] = [];
  const bulletsNeedingActionVerbs: string[] = [];

  experience.forEach((exp) => {
    exp.bullets.forEach((bullet, bulletIdx) => {
      totalBullets++;
      const bulletLower = bullet.toLowerCase().trim();
      const needsMetric = !/\d+%|\d+x|\d+\+|\$\d+|\d+\s*(million|thousand|k|m|users|customers|transactions|hours|days|weeks|months|years)\b/i.test(bullet);
      const needsActionVerb = !ATS_KEYWORDS.action.some(verb => 
        bulletLower.startsWith(verb) || bulletLower.startsWith(verb + ' ')
      );
      
      // Check for metrics (more comprehensive)
      if (!needsMetric) {
        bulletsWithMetrics++;
      } else if (bulletIdx < 3) { // Only track first 3 bullets per experience
        bulletsNeedingMetrics.push(`${exp.company || exp.role || 'Experience'}: "${bullet.substring(0, 50)}..."`);
      }
      
      // Check if bullet starts with action verb (most important)
      const startsWithAction = ATS_KEYWORDS.action.some(verb => 
        bulletLower.startsWith(verb) || bulletLower.startsWith(verb + ' ')
      );
      if (startsWithAction) {
        bulletsStartingWithAction++;
        bulletsWithActionVerbs++;
      } else {
        if (needsActionVerb && bulletIdx < 3) {
          bulletsNeedingActionVerbs.push(`${exp.company || exp.role || 'Experience'}: "${bullet.substring(0, 50)}..."`);
        }
        if (ATS_KEYWORDS.action.some(verb => bulletLower.includes(` ${verb} `) || bulletLower.includes(` ${verb},`))) {
          bulletsWithActionVerbs++;
        }
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
    if (bulletsNeedingMetrics.length > 0) {
      suggestions.push(`Add numbers/percentages to ${Math.min(3, bulletsNeedingMetrics.length)} bullet point${bulletsNeedingMetrics.length > 1 ? 's' : ''} (e.g., "increased by 30%", "managed team of 5", "saved $50K")`);
    }
  } else if (metricsPercentage >= 15) {
    score += 2;
    feedback.push(`⚠ Only ${Math.round(metricsPercentage)}% of bullets have metrics`);
    suggestions.push(`Add numbers and percentages to ${Math.ceil(totalBullets * 0.5)}+ bullet points - ATS systems score higher with metrics. Example: "increased revenue by 30%" or "managed team of 5"`);
  } else {
    feedback.push(`✗ Only ${Math.round(metricsPercentage)}% of bullets have metrics`);
    suggestions.push(`Add quantifiable results to ${Math.ceil(totalBullets * 0.5)}+ bullet points. Include numbers like: "30% increase", "team of 5", "$50K saved", "2 years"`);
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
    if (bulletsNeedingActionVerbs.length > 0) {
      suggestions.push(`Restructure ${Math.min(3, bulletsNeedingActionVerbs.length)} bullet point${bulletsNeedingActionVerbs.length > 1 ? 's' : ''} to start with action verbs like: "Led", "Developed", "Implemented", "Achieved"`);
    }
  } else if (actionStartPercentage >= 30) {
    score += 2;
    feedback.push(`⚠ ${Math.round(actionStartPercentage)}% start with action verbs`);
    const needToFix = Math.ceil(totalBullets * 0.4);
    suggestions.push(`Start ${needToFix}+ bullet points with action verbs (Led, Developed, Implemented, Built, Created) - ATS systems prefer this format`);
  } else {
    score += 1;
    feedback.push(`✗ Only ${Math.round(actionStartPercentage)}% start with action verbs`);
    const needToFix = Math.ceil(totalBullets * 0.5);
    suggestions.push(`Restructure ${needToFix}+ bullets to start with action verbs. Example: Change "Was responsible for..." to "Led..." or "Developed..."`);
  }

  // General action verb usage (2 points)
  const actionVerbPercentage = totalBullets > 0 ? (bulletsWithActionVerbs / totalBullets) * 100 : 0;
  if (actionVerbPercentage >= 80) {
    score += 2;
  } else if (actionVerbPercentage < 50) {
    suggestions.push('Use more action verbs throughout your experience descriptions');
  }

  // Job titles and companies completeness (6 points)
  const incompleteExperiences: string[] = [];
  experience.forEach((exp, idx) => {
    const missing: string[] = [];
    if (!exp.role || exp.role.trim().length < 3) missing.push('job title');
    if (!exp.company || exp.company.trim().length < 2) missing.push('company name');
    if (!exp.period || !exp.period.match(/\d{4}/)) missing.push('date range');
    if (missing.length > 0) {
      incompleteExperiences.push(`${exp.company || exp.role || `Experience #${idx + 1}`}: Missing ${missing.join(', ')}`);
    }
  });

  const hasCompleteTitles = experience.length > 0 && experience.every(exp => exp.role && exp.company && exp.period);
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
    if (incompleteExperiences.length > 0) {
      incompleteExperiences.slice(0, 2).forEach(issue => {
        suggestions.push(`Fix: ${issue}. Add missing details to improve ATS score`);
      });
    } else {
      suggestions.push('Ensure all positions have: job title, company name, and date range (e.g., "Jan 2020 - Dec 2022")');
    }
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
    suggestions.push(`Add ${5 - skills.length} more skill categories. Suggested: Technical Skills, Tools & Platforms, Soft Skills, Certifications, Languages`);
  } else {
    feedback.push('✗ Limited skill categories');
    suggestions.push(`Add ${5 - skills.length} skill categories. Create sections like: "Programming Languages", "Frameworks", "Tools", "Soft Skills", "Certifications"`);
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
    suggestions.push(`Add ${15 - techSkillsCount} more technical skills. Include: programming languages, frameworks, cloud platforms, databases, tools`);
  } else if (techSkillsCount >= 4) {
    score += 2;
    feedback.push(`⚠ ${techSkillsCount} recognized skills`);
    suggestions.push(`Add ${15 - techSkillsCount} industry-standard technical skills. Examples: Python, JavaScript, React, AWS, Docker, Kubernetes, SQL`);
  } else {
    feedback.push(`✗ Low technical skill count (${techSkillsCount})`);
    suggestions.push(`Add ${15 - techSkillsCount} technical skills from job descriptions. Include: languages, frameworks, tools, platforms you know`);
  }

  // Total skill density (4 points)
  if (skillCount >= 25) {
    score += 4;
    feedback.push(`✓ ${skillCount} skills listed`);
    strengths.push('Comprehensive skills list improves ATS keyword matching');
  } else if (skillCount >= 15) {
    score += 3;
    feedback.push(`⚠ ${skillCount} skills listed (aim for 25+ for better coverage)`);
    suggestions.push(`Add ${25 - skillCount} more skills. Include: specific tools, technologies, methodologies, certifications`);
  } else if (skillCount >= 8) {
    score += 2;
    feedback.push(`⚠ ${skillCount} skills listed`);
    suggestions.push(`Add ${25 - skillCount} more skills across different categories to improve ATS keyword matching`);
  } else {
    feedback.push(`✗ Only ${skillCount} skills listed`);
    suggestions.push(`Add ${25 - skillCount} skills. Break down broad skills into specifics (e.g., "React, Vue, Angular" instead of just "Frontend")`);
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

    const incompleteEducation: string[] = [];
    education.forEach((edu, idx) => {
      const missing: string[] = [];
      if (!edu.degree || edu.degree.trim().length < 3) missing.push('degree');
      if (!edu.institution || edu.institution.trim().length < 3) missing.push('institution');
      if (missing.length > 0) {
        incompleteEducation.push(`Education #${idx + 1}: Missing ${missing.join(', ')}`);
      }
    });

    const hasComplete = education.every(e => e.degree && e.institution);
    if (hasComplete) {
      score += 5;
      feedback.push('✓ Complete education information');
      strengths.push('Education section is complete and ATS-readable');
    } else {
      score += 2;
      feedback.push('⚠ Some education entries incomplete');
      if (incompleteEducation.length > 0) {
        incompleteEducation.forEach(issue => {
          suggestions.push(`Fix: ${issue}. Add missing details`);
        });
      } else {
        suggestions.push('Ensure all education entries have: degree name (e.g., "B.S. Computer Science") and institution name');
      }
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

  const missingSections: string[] = [];
  if (!hasSummary) missingSections.push('Professional Summary');
  if (!hasSkills) missingSections.push('Skills Section (need 3+ categories)');
  if (!hasExperience) missingSections.push('Work Experience (need 2+ positions)');
  if (!hasEducation) missingSections.push('Education');

  const sectionsComplete = [hasSummary, hasSkills, hasExperience, hasEducation].filter(Boolean).length;
  if (sectionsComplete === 4) {
    score += 4;
    feedback.push('✓ All major sections present');
    strengths.push('Resume has complete, ATS-standard structure');
  } else if (sectionsComplete === 3) {
    score += 3;
    feedback.push(`⚠ ${sectionsComplete}/4 major sections complete`);
    suggestions.push(`Add missing section: ${missingSections[0]}. This is required for ATS scoring`);
  } else {
    score += 1;
    feedback.push(`✗ Only ${sectionsComplete}/4 major sections complete`);
    suggestions.push(`Add missing sections: ${missingSections.join(', ')}. All 4 sections are required for optimal ATS score`);
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
