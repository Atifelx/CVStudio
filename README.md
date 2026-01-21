# CV Studio

A professional resume editor with real-time ATS (Applicant Tracking System) scoring, built with Next.js 14.

![CV Studio](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## Features

### 📝 Resume Editing
- **Inline editing** - Click any section to edit
- **Deletable sections** - Remove sections not needed for specific roles
- **Live preview** - See changes instantly

### 📊 ATS Score Analysis
- Real-time ATS compatibility scoring
- Keyword detection
- Action verb analysis
- Metrics & achievements tracking
- Improvement suggestions

### 🎨 Layout Controls
- **Font size** (8-14pt, matches MS Word)
- **Line height** adjustment
- **Section spacing** controls
- **Margin presets** (Narrow, Normal, Wide)
- **Page size** (A4, Letter)

### 📄 Export Options
- **PDF Export** - Optimized for email (<5MB)
- **DOCX Export** - Microsoft Word compatible
- Exports respect all layout settings

### ⚡ Smart Presets
- **Reset** - Default professional formatting
- **Compact** - Fit more content
- **Ultra** - Maximum density for 1-page resumes
- **Auto-Balance** - Standardize all text proportionally

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/CVStudio.git
cd CVStudio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Export**: html2canvas + jsPDF
- **DOCX Export**: docx.js
- **Icons**: Lucide React

## Project Structure

```
CVStudio/
├── app/                    # Next.js app router
│   ├── globals.css         # Global styles & CSS variables
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main resume editor page
├── components/
│   ├── sections/           # Resume section components
│   │   ├── HeaderSection.tsx
│   │   ├── SummarySection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── EducationSection.tsx
│   │   └── ExpertiseSection.tsx
│   ├── ATSScorePanel.tsx   # ATS scoring display
│   ├── ResumeContainer.tsx # Resume wrapper with page breaks
│   ├── ResumeSection.tsx   # Reusable section wrapper
│   ├── EditSection.tsx     # Edit mode components
│   └── Toolbar.tsx         # Top toolbar with controls
├── context/
│   ├── ResumeContext.tsx   # Resume data state
│   └── LayoutContext.tsx   # Layout settings state
├── types/
│   ├── resume.ts           # Resume data types
│   └── layout.ts           # Layout settings types
└── utils/
    ├── atsAnalyzer.ts      # ATS scoring logic
    ├── exportPdf.ts        # PDF export
    ├── exportDocx.ts       # DOCX export
    └── pageCalculator.ts   # Page count calculation
```

## Usage Tips

### Fitting Resume to Pages
1. Use the **spacing sliders** to reduce vertical gaps
2. Click **Compact** or **Ultra** presets for quick adjustment
3. Watch the **page count indicator** in the toolbar
4. Margins auto-shrink when using compact settings

### Improving ATS Score
- Add quantifiable achievements (numbers, percentages)
- Use action verbs (Led, Developed, Implemented)
- Include relevant technical keywords
- Complete all contact information

### Deleting Sections
1. Click the **Edit** icon on any section
2. Click the red **Delete Section** button
3. Section is removed from resume and exports
4. Click **Add [Section]** button to restore

## License

MIT License - feel free to use for personal or commercial projects.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
