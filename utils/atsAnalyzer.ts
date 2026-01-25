import { ResumeData } from '@/types/resume';

/**
 * ATS (Applicant Tracking System) Score Analyzer
 * 
 * Evaluates resume content for ATS compatibility and provides
 * detailed scoring across multiple categories.
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

// Common ATS keywords by category
const ATS_KEYWORDS = {
  technical: [
    'python', 'javascript', 'typescript', 'java', 'sql', 'react', 'node', 'aws',
    'azure', 'docker', 'kubernetes', 'api', 'database', 'cloud', 'agile', 'scrum',
    'git', 'ci/cd', 'microservices', 'rest', 'graphql', 'mongodb', 'postgresql'
  ],
  action: [
    'led', 'developed', 'implemented', 'designed', 'managed', 'created', 'built',
    'improved', 'increased', 'reduced', 'achieved', 'delivered', 'launched',
    'architected', 'optimized', 'automated', 'collaborated', 'mentored', 'analyzed'
  ],
  metrics: [
    '%', 'percent', 'increased', 'decreased', 'reduced', 'improved', 'saved',
    'revenue', 'cost', 'efficiency', 'productivity', 'performance', 'growth'
  ],
  softSkills: [
    'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical',
    'collaborative', 'strategic', 'cross-functional', 'stakeholder'
  ]
};

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

  // 2. Professional Summary (15 points)
  const summaryScore = analyzeSummary(resumeData, suggestions, strengths);
  categories.push(summaryScore);

  // 3. Work Experience (25 points)
  const experienceScore = analyzeExperience(resumeData, suggestions, strengths);
  categories.push(experienceScore);

  // 4. Skills Section (15 points)
  const skillsScore = analyzeSkills(resumeData, suggestions, strengths);
  categories.push(skillsScore);

  // 5. Keywords & ATS Optimization (15 points)
  const keywordsScore = analyzeKeywords(resumeData, suggestions, strengths);
  categories.push(keywordsScore);

  // 6. Education (10 points)
  const educationScore = analyzeEducation(resumeData, suggestions, strengths);
  categories.push(educationScore);

  // 7. Formatting & Length (5 points)
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
    suggestions: suggestions.slice(0, 5), // Top 5 suggestions
    strengths: strengths.slice(0, 5), // Top 5 strengths
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
    if (contact.email.includes('gmail') || contact.email.includes('outlook')) {
      feedback.push('✓ Professional email present');
    }
  } else {
    feedback.push('✗ Missing or invalid email');
    suggestions.push('Add a professional email address');
  }

  // Check phone (3 points)
  if (contact.phone && contact.phone.length >= 10) {
    score += 3;
    feedback.push('✓ Phone number present');
  } else {
    feedback.push('✗ Missing phone number');
    suggestions.push('Add a phone number for recruiters to contact you');
  }

  // Check LinkedIn (3 points)
  if (contact.linkedin && contact.linkedin.includes('linkedin')) {
    score += 3;
    feedback.push('✓ LinkedIn profile included');
    strengths.push('LinkedIn profile helps recruiters verify your background');
  } else {
    feedback.push('✗ Missing LinkedIn profile');
    suggestions.push('Add your LinkedIn URL - 87% of recruiters use LinkedIn');
  }

  // Check name (3 points)
  if (data.header.name && data.header.name.length > 3) {
    score += 3;
    feedback.push('✓ Full name present');
  }

  // Check title (3 points)
  if (data.header.title && data.header.title.length > 10) {
    score += 3;
    feedback.push('✓ Professional title present');
    strengths.push('Clear professional title helps ATS categorize your profile');
  } else {
    suggestions.push('Add a professional title/headline');
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
  const maxScore = 15;

  const summary = data.summary.toLowerCase();
  const wordCount = summary.split(/\s+/).length;

  // Check length (5 points) - ideal is 50-150 words
  if (wordCount >= 50 && wordCount <= 150) {
    score += 5;
    feedback.push(`✓ Good length (${wordCount} words)`);
    strengths.push('Professional summary has optimal length');
  } else if (wordCount >= 30 && wordCount <= 200) {
    score += 3;
    feedback.push(`⚠ Acceptable length (${wordCount} words), ideal is 50-150`);
  } else if (wordCount < 30) {
    feedback.push(`✗ Too short (${wordCount} words)`);
    suggestions.push('Expand your professional summary to 50-150 words');
  } else {
    score += 2;
    feedback.push(`⚠ Too long (${wordCount} words), consider trimming`);
  }

  // Check for keywords (5 points)
  const techKeywordsFound = ATS_KEYWORDS.technical.filter(kw => summary.includes(kw)).length;
  if (techKeywordsFound >= 5) {
    score += 5;
    feedback.push(`✓ Contains ${techKeywordsFound} technical keywords`);
    strengths.push('Summary is keyword-rich for ATS scanning');
  } else if (techKeywordsFound >= 3) {
    score += 3;
    feedback.push(`⚠ Contains ${techKeywordsFound} technical keywords (aim for 5+)`);
  } else {
    feedback.push(`✗ Low keyword density (${techKeywordsFound} keywords)`);
    suggestions.push('Add more relevant technical keywords to your summary');
  }

  // Check for quantifiable achievements (5 points)
  const hasMetrics = /\d+%|\d+\+|\$\d+|million|thousand/i.test(summary);
  if (hasMetrics) {
    score += 5;
    feedback.push('✓ Contains quantifiable achievements');
    strengths.push('Summary includes measurable results');
  } else {
    feedback.push('✗ No quantifiable achievements');
    suggestions.push('Add numbers/percentages to your summary (e.g., "5+ years", "reduced costs by 30%")');
  }

  return {
    name: 'Professional Summary',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 12 ? 'good' : score >= 8 ? 'warning' : 'poor',
  };
}

function analyzeExperience(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 25;

  const { experience } = data;

  // Check number of experiences (5 points)
  if (experience.length >= 3) {
    score += 5;
    feedback.push(`✓ ${experience.length} work experiences listed`);
  } else if (experience.length >= 2) {
    score += 3;
    feedback.push(`⚠ Only ${experience.length} experiences (aim for 3+)`);
  } else {
    feedback.push('✗ Limited work experience shown');
    suggestions.push('Add more relevant work experiences');
  }

  // Analyze bullet points (10 points)
  let totalBullets = 0;
  let bulletsWithMetrics = 0;
  let bulletsWithActionVerbs = 0;

  experience.forEach((exp) => {
    exp.bullets.forEach((bullet) => {
      totalBullets++;
      const bulletLower = bullet.toLowerCase();
      
      if (/\d+%|\d+x|\$\d+|\d+\+/i.test(bullet)) {
        bulletsWithMetrics++;
      }
      
      if (ATS_KEYWORDS.action.some(verb => bulletLower.startsWith(verb) || bulletLower.includes(` ${verb}`))) {
        bulletsWithActionVerbs++;
      }
    });
  });

  // Metrics in bullets (5 points)
  const metricsPercentage = totalBullets > 0 ? (bulletsWithMetrics / totalBullets) * 100 : 0;
  if (metricsPercentage >= 40) {
    score += 5;
    feedback.push(`✓ ${Math.round(metricsPercentage)}% of bullets have metrics`);
    strengths.push('Experience section is rich with quantifiable achievements');
  } else if (metricsPercentage >= 20) {
    score += 3;
    feedback.push(`⚠ ${Math.round(metricsPercentage)}% of bullets have metrics (aim for 40%+)`);
  } else {
    feedback.push(`✗ Only ${Math.round(metricsPercentage)}% of bullets have metrics`);
    suggestions.push('Add more numbers and percentages to your bullet points');
  }

  // Action verbs (5 points)
  const actionVerbPercentage = totalBullets > 0 ? (bulletsWithActionVerbs / totalBullets) * 100 : 0;
  if (actionVerbPercentage >= 60) {
    score += 5;
    feedback.push(`✓ ${Math.round(actionVerbPercentage)}% of bullets start with action verbs`);
    strengths.push('Strong use of action verbs in experience section');
  } else if (actionVerbPercentage >= 30) {
    score += 3;
    feedback.push(`⚠ ${Math.round(actionVerbPercentage)}% use action verbs (aim for 60%+)`);
  } else {
    feedback.push(`✗ Low use of action verbs`);
    suggestions.push('Start bullet points with strong action verbs (Led, Developed, Implemented)');
  }

  // Job titles and companies (5 points)
  const hasCompleteTitles = experience.every(exp => exp.role && exp.company && exp.period);
  if (hasCompleteTitles) {
    score += 5;
    feedback.push('✓ All positions have complete information');
  } else {
    score += 2;
    feedback.push('⚠ Some positions missing title, company, or dates');
  }

  return {
    name: 'Work Experience',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 20 ? 'good' : score >= 15 ? 'warning' : 'poor',
  };
}

function analyzeSkills(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 15;

  const { skills } = data;
  const allSkillsText = skills.map(s => s.skills.toLowerCase()).join(' ');
  const skillCount = allSkillsText.split(/[|,]/).filter(s => s.trim()).length;

  // Check skill categories (5 points)
  if (skills.length >= 5) {
    score += 5;
    feedback.push(`✓ ${skills.length} skill categories organized`);
    strengths.push('Well-organized skills section with clear categories');
  } else if (skills.length >= 3) {
    score += 3;
    feedback.push(`⚠ ${skills.length} skill categories (aim for 5+)`);
  } else {
    feedback.push('✗ Limited skill categories');
    suggestions.push('Organize skills into more categories (Technical, Tools, Soft Skills)');
  }

  // Check technical skills count (5 points)
  const techSkillsFound = ATS_KEYWORDS.technical.filter(kw => allSkillsText.includes(kw)).length;
  if (techSkillsFound >= 10) {
    score += 5;
    feedback.push(`✓ ${techSkillsFound} recognized technical skills`);
    strengths.push('Strong technical skills that match ATS keyword databases');
  } else if (techSkillsFound >= 5) {
    score += 3;
    feedback.push(`⚠ ${techSkillsFound} recognized skills (aim for 10+)`);
  } else {
    feedback.push(`✗ Low technical skill count (${techSkillsFound})`);
    suggestions.push('Add more industry-standard technical skills');
  }

  // Total skill density (5 points)
  if (skillCount >= 30) {
    score += 5;
    feedback.push(`✓ ${skillCount} skills listed`);
  } else if (skillCount >= 15) {
    score += 3;
    feedback.push(`⚠ ${skillCount} skills listed (aim for 30+)`);
  } else {
    feedback.push(`✗ Only ${skillCount} skills listed`);
  }

  return {
    name: 'Skills Section',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 12 ? 'good' : score >= 8 ? 'warning' : 'poor',
  };
}

function analyzeKeywords(data: ResumeData, suggestions: string[], strengths: string[]): ATSCategory {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 15;

  // Combine all text
  const allText = [
    data.summary,
    data.header.title,
    ...data.skills.map(s => s.skills),
    ...data.experience.flatMap(e => [e.role, e.description, ...e.bullets]),
    data.forwardDeployedExpertise,
    ...(data.generalSections || []).flatMap(s => [s.title, s.summary]),
  ].join(' ').toLowerCase();

  // Technical keywords (5 points)
  const techFound = ATS_KEYWORDS.technical.filter(kw => allText.includes(kw));
  if (techFound.length >= 15) {
    score += 5;
    feedback.push(`✓ ${techFound.length} technical keywords found`);
    strengths.push('Excellent keyword optimization for ATS');
  } else if (techFound.length >= 8) {
    score += 3;
    feedback.push(`⚠ ${techFound.length} technical keywords (aim for 15+)`);
  } else {
    feedback.push(`✗ Low technical keyword count (${techFound.length})`);
    suggestions.push('Include more relevant technical terms from job descriptions');
  }

  // Action verbs (5 points)
  const actionFound = ATS_KEYWORDS.action.filter(kw => allText.includes(kw));
  if (actionFound.length >= 12) {
    score += 5;
    feedback.push(`✓ ${actionFound.length} action verbs used`);
  } else if (actionFound.length >= 6) {
    score += 3;
    feedback.push(`⚠ ${actionFound.length} action verbs (aim for 12+)`);
  } else {
    feedback.push(`✗ Low action verb usage`);
  }

  // Soft skills (5 points)
  const softFound = ATS_KEYWORDS.softSkills.filter(kw => allText.includes(kw));
  if (softFound.length >= 5) {
    score += 5;
    feedback.push(`✓ ${softFound.length} soft skills mentioned`);
  } else if (softFound.length >= 3) {
    score += 3;
    feedback.push(`⚠ ${softFound.length} soft skills (aim for 5+)`);
  } else {
    feedback.push(`✗ Limited soft skills mentioned`);
    suggestions.push('Add soft skills like leadership, communication, collaboration');
  }

  return {
    name: 'Keywords & ATS Optimization',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 12 ? 'good' : score >= 8 ? 'warning' : 'poor',
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

    const hasComplete = education.every(e => e.degree && e.institution && e.location);
    if (hasComplete) {
      score += 5;
      feedback.push('✓ Complete education information');
      strengths.push('Education section is complete and ATS-readable');
    } else {
      score += 2;
      feedback.push('⚠ Some education entries incomplete');
    }
  } else {
    feedback.push('✗ No education listed');
    suggestions.push('Add your educational background');
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
  const maxScore = 5;

  // Calculate total content length
  const allText = [
    data.summary,
    ...data.skills.map(s => s.skills),
    ...data.experience.flatMap(e => [e.description, ...e.bullets]),
    data.forwardDeployedExpertise,
    ...(data.generalSections || []).flatMap(s => [s.title, s.summary]),
  ].join(' ');

  const wordCount = allText.split(/\s+/).length;

  // Ideal resume is 400-800 words for ATS (2 points)
  if (wordCount >= 400 && wordCount <= 1000) {
    score += 2;
    feedback.push(`✓ Good content length (${wordCount} words)`);
  } else if (wordCount < 400) {
    feedback.push(`⚠ Resume may be too short (${wordCount} words)`);
    suggestions.push('Add more detail to reach 400-800 words');
  } else {
    score += 1;
    feedback.push(`⚠ Resume is lengthy (${wordCount} words) - consider trimming`);
  }

  // Check section completeness (3 points)
  const hasSummary = data.summary.length > 50;
  const hasSkills = data.skills.length >= 3;
  const hasExperience = data.experience.length >= 2;
  const hasEducation = data.education.length >= 1;

  const sectionsComplete = [hasSummary, hasSkills, hasExperience, hasEducation].filter(Boolean).length;
  if (sectionsComplete === 4) {
    score += 3;
    feedback.push('✓ All major sections present');
    strengths.push('Resume has complete, ATS-standard structure');
  } else {
    score += sectionsComplete > 2 ? 2 : 1;
    feedback.push(`⚠ ${sectionsComplete}/4 major sections complete`);
  }

  return {
    name: 'Formatting & Structure',
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback,
    status: score >= 4 ? 'good' : score >= 3 ? 'warning' : 'poor',
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
