/**
 * Microservice: Demo Script Service
 * Responsibility: Generate and manage demo scripts
 * Single File: Creates documentation only
 */

import * as fs from 'fs';

interface DemoStep {
  step: number;
  action: string;
  duration: number; // seconds
  talkingPoints: string[];
  expectedResult: string;
}

interface DemoScript {
  title: string;
  totalDuration: number;
  steps: DemoStep[];
  backupPlan: string[];
}

/**
 * Task 1: Generate 2-minute demo script
 * Files affected: exhibition/demo-script.md
 * Action: Create step-by-step demo guide
 */
export function generateDemoScript(): DemoScript {
  const script: DemoScript = {
    title: "Ethio Herd Connect - 2 Minute Demo",
    totalDuration: 120,
    steps: [
      {
        step: 1,
        action: "Login",
        duration: 15,
        talkingPoints: [
          "Simple phone authentication with OTP",
          "Works on any basic smartphone",
          "No email required - designed for farmers"
        ],
        expectedResult: "User sees home dashboard"
      },
      {
        step: 2,
        action: "Register Animal",
        duration: 30,
        talkingPoints: [
          "3-click registration process",
          "Visual selectors for animal type",
          "Works offline - syncs when connected",
          "Optional photo upload with compression"
        ],
        expectedResult: "Animal appears in My Animals list"
      },
      {
        step: 3,
        action: "Record Milk",
        duration: 20,
        talkingPoints: [
          "2-click milk recording",
          "Quick amount buttons (2L, 5L, 10L)",
          "Session auto-detection",
          "Shows daily totals instantly"
        ],
        expectedResult: "Milk record saved with success message"
      },
      {
        step: 4,
        action: "Create Marketplace Listing",
        duration: 30,
        talkingPoints: [
          "4-step wizard for listing creation",
          "Select from registered animals",
          "Set price in Ethiopian Birr",
          "Upload photos and videos",
          "Health disclaimer for transparency"
        ],
        expectedResult: "Listing appears in marketplace"
      },
      {
        step: 5,
        action: "Show Offline Mode",
        duration: 15,
        talkingPoints: [
          "Turn on airplane mode",
          "Register animal offline",
          "Data saved locally",
          "Auto-syncs when online",
          "Perfect for rural areas with poor connectivity"
        ],
        expectedResult: "Data queued for sync, works offline"
      }
    ],
    backupPlan: [
      "Pre-install PWA on demo device",
      "Record demo video as backup",
      "Take screenshots of each step",
      "Prepare printed screenshots",
      "Have 2 devices ready (primary + backup)"
    ]
  };
  
  return script;
}

/**
 * Task 2: Save demo script to file
 * Files affected: exhibition/demo-script.md
 * Action: Write formatted markdown
 */
export function saveDemoScript(script: DemoScript): string {
  let markdown = `# ${script.title}\n\n`;
  markdown += `**Total Duration:** ${script.totalDuration} seconds (2 minutes)\n\n`;
  markdown += `---\n\n`;
  
  script.steps.forEach(step => {
    markdown += `## Step ${step.step}: ${step.action}\n`;
    markdown += `**Duration:** ${step.duration}s\n\n`;
    markdown += `### Talking Points:\n`;
    step.talkingPoints.forEach(point => {
      markdown += `- ${point}\n`;
    });
    markdown += `\n**Expected Result:** ${step.expectedResult}\n\n`;
    markdown += `---\n\n`;
  });
  
  markdown += `## Backup Plan\n\n`;
  markdown += `If technical issues occur:\n\n`;
  script.backupPlan.forEach(item => {
    markdown += `- [ ] ${item}\n`;
  });
  
  markdown += `\n## FAQ Preparation\n\n`;
  markdown += `### Q: Does it work without internet?\n`;
  markdown += `A: Yes! Works offline and syncs when connected.\n\n`;
  markdown += `### Q: Is it free?\n`;
  markdown += `A: Yes, completely free for Ethiopian farmers.\n\n`;
  markdown += `### Q: What animals are supported?\n`;
  markdown += `A: Cattle, goats, sheep, camels, and more.\n\n`;
  markdown += `### Q: Can I sell my animals?\n`;
  markdown += `A: Yes! Built-in marketplace connects you with buyers.\n\n`;
  
  fs.mkdirSync('exhibition', { recursive: true });
  const filePath = 'exhibition/demo-script.md';
  fs.writeFileSync(filePath, markdown);
  
  console.log('✅ Demo script created:', filePath);
  return filePath;
}

/**
 * Task 3: Generate FAQ document
 * Files affected: exhibition/faq.md
 * Action: Create frequently asked questions
 */
export function generateFAQ(): string {
  const faq = `# Frequently Asked Questions - Exhibition\n\n`;
  
  const questions = [
    {
      q: "Is the app free to use?",
      a: "Yes! Ethio Herd Connect is completely free for all Ethiopian farmers."
    },
    {
      q: "Does it work without internet?",
      a: "Yes! The app works offline and automatically syncs when you have connectivity. Perfect for rural areas."
    },
    {
      q: "What animals can I register?",
      a: "Cattle, goats, sheep, camels, chickens, horses, donkeys, and more. We support all common Ethiopian livestock."
    },
    {
      q: "Can I sell my animals through the app?",
      a: "Yes! Our marketplace connects you directly with buyers. You can list animals, set prices, and communicate via phone/WhatsApp."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We use enterprise-grade security with Row-Level Security (RLS) policies. Your data is private and encrypted."
    },
    {
      q: "Do I need a smartphone?",
      a: "Yes, any basic Android smartphone works. The app is optimized for low-end devices and slow internet."
    },
    {
      q: "Is it available in Amharic?",
      a: "Yes! The app supports both Amharic and English. You can switch languages anytime."
    },
    {
      q: "How do I get started?",
      a: "Just scan the QR code or visit the URL. Enter your Ethiopian phone number (+251), verify with OTP, and you're in!"
    }
  ];
  
  questions.forEach((item, index) => {
    faq += `## Q${index + 1}: ${item.q}\n\n${item.a}\n\n`;
  });
  
  fs.mkdirSync('exhibition', { recursive: true });
  const filePath = 'exhibition/faq.md';
  fs.writeFileSync(filePath, faq);
  
  console.log('✅ FAQ created:', filePath);
  return filePath;
}

// Single action export
export function executeDemoScriptGeneration(): void {
  console.log('🎬 Generating demo materials...\n');
  
  const script = generateDemoScript();
  saveDemoScript(script);
  generateFAQ();
  
  console.log('\n✅ All demo materials generated');
}
