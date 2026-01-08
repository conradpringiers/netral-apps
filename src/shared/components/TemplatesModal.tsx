/**
 * Templates Modal
 * Gallery of pre-made templates for Block and Deck
 */

import { useState } from 'react';
import { LayoutTemplate, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  content: string;
}

interface TemplatesModalProps {
  mode: 'block' | 'deck';
  onSelect: (content: string) => void;
}

// Block templates
const blockTemplates: Template[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Modern landing page with hero, features and CTA',
    preview: '🚀',
    content: `--- My Product
Theme[Modern]
Logo[MyBrand]
Navbar[
{Home;#home}
{Features;#features}
{Pricing;#pricing}
{Contact;#contact}
]
Header[BigText;Build Something Amazing;Transform your ideas into reality with our powerful platform.;https://picsum.photos/1200/600;#features]

-- Features
Bigtitle[Why Choose Us]

Feature[
{⚡;Lightning Fast;Built for speed and performance}
{🔒;Secure;Enterprise-grade security}
{🎨;Beautiful;Stunning designs out of the box}
]

-- Pricing
Pricing[
{Starter;$0/mo;For individuals, 1 project, Community support}
{Pro;$29/mo;For teams, Unlimited projects, Priority support}
{Enterprise;$99/mo;For organizations, Custom solutions, Dedicated support}
]

CTA[Ready to get started?;Join thousands of happy customers;Start Free Trial;#signup]
`,
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Personal portfolio with bio and projects',
    preview: '👤',
    content: `--- John Doe - Designer
Theme[Minimal]
Logo[JD]
Navbar[
{About;#about}
{Work;#work}
{Contact;#contact}
]
Header[BigText;Creative Designer;I craft beautiful digital experiences that make a difference.;https://picsum.photos/1200/600;#work]

-- About Me
Column[
{I'm a passionate designer with 10+ years of experience in creating stunning digital products. I believe in the power of simple, elegant solutions.}
{My expertise includes UI/UX design, branding, and front-end development. I've worked with startups and Fortune 500 companies alike.}
]

-- My Work
Feature[
{🎯;Branding;Complete identity systems}
{💻;Web Design;Modern, responsive websites}
{📱;Mobile Apps;Intuitive app experiences}
]

quote[Design is not just what it looks like, design is how it works. - Steve Jobs]

CTA[Let's work together;Have a project in mind? Let's chat.;Get in Touch;mailto:hello@example.com]
`,
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Clean documentation page with FAQ',
    preview: '📚',
    content: `--- Product Documentation
Theme[Clean]
Logo[Docs]
Navbar[
{Getting Started;#start}
{Features;#features}
{FAQ;#faq}
]

-- Getting Started

## Installation

You can install our package using npm:

\`\`\`
npm install my-package
\`\`\`

## Quick Start

1. Import the library
2. Initialize with your API key
3. Start building!

Def[All API calls are rate-limited to 1000 requests per minute.]

-- Features

Feature[
{📦;Easy Setup;Get started in minutes}
{🔄;Auto Updates;Always up to date}
{🛠;Customizable;Adapt to your needs}
]

-- FAQ

FAQ[
{How do I get an API key?;Sign up for a free account and visit your dashboard.}
{Is there a free tier?;Yes! Our free tier includes 10,000 API calls per month.}
{Can I use this in production?;Absolutely! We're production-ready with 99.9% uptime.}
]

Warn[This documentation is for version 2.0. For older versions, see the archive.]
`,
  },
  {
    id: 'blog',
    name: 'Blog Post',
    description: 'Article layout with rich content',
    preview: '✍️',
    content: `--- The Future of Web Development
Theme[Editorial]
Logo[TechBlog]
Navbar[
{Home;/}
{Articles;#articles}
{About;#about}
]

-- Introduction

The web is constantly evolving. In this article, we'll explore the trends that will shape the future of web development.

Image[https://picsum.photos/800/400]

## Key Trends

**1. AI-Powered Development**

Artificial intelligence is revolutionizing how we build websites. From code completion to automated testing, AI is becoming an indispensable tool.

**2. Edge Computing**

Bringing computation closer to users means faster, more responsive applications.

**3. Web Components**

Reusable, framework-agnostic components are the future of modular development.

quote[The best way to predict the future is to create it. - Peter Drucker]

-- Conclusion

The future is exciting for web developers. By staying curious and adaptable, we can build amazing things.

Stats[
{3B+;Internet Users}
{95%;Sites Use JS}
{100ms;Target Load Time}
]
`,
  },
];

// Deck templates
const deckTemplates: Template[] = [
  {
    id: 'pitch',
    name: 'Startup Pitch',
    description: 'Investor pitch deck with key metrics',
    preview: '💼',
    content: `--- Startup Pitch Deck
Theme[Corporate]
Logo[StartupCo]

-- The Problem

Bigtitle[A $50B Problem]

Businesses waste countless hours on manual processes that could be automated.

Stats[
{72%;Time Wasted}
{$50B;Market Size}
{10x;Growth Potential}
]

-- Our Solution

Bigtitle[Introducing StartupCo]

We automate your workflow so you can focus on what matters.

Feature[
{🤖;AI-Powered;Smart automation}
{⚡;Fast;10x faster workflows}
{💰;Cost-Effective;50% cost reduction}
]

-- Traction

Timeline[
{2023;Launch;Product launched with 100 beta users}
{2024;Growth;Reached 10,000 paying customers}
{2025;Scale;Expanding to 5 new markets}
]

-- The Ask

Bigtitle[Join Our Journey]

We're raising $5M to accelerate growth.

Gallery[
{https://picsum.photos/400/300?1;Team}
{https://picsum.photos/400/300?2;Product}
{https://picsum.photos/400/300?3;Office}
]
`,
  },
  {
    id: 'lecture',
    name: 'Educational Lecture',
    description: 'Clean lecture slides with examples',
    preview: '🎓',
    content: `--- Introduction to Programming
Theme[Minimal]
Logo[CS101]

-- What is Programming?

Bigtitle[Talking to Computers]

Programming is the art of giving instructions to computers.

Def[A program is a set of instructions that tells a computer what to do.]

-- Core Concepts

List[
{📝;Variables - Store data}
{🔄;Loops - Repeat actions}
{❓;Conditions - Make decisions}
{📦;Functions - Reusable code}
]

-- Example Code

Code[javascript;
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));
]

-- Key Takeaways

Feature[
{💡;Practice;Code every day}
{📚;Learn;Read documentation}
{🤝;Collaborate;Work with others}
]

quote[Everyone should learn to program, because it teaches you how to think. - Steve Jobs]
`,
  },
  {
    id: 'report',
    name: 'Business Report',
    description: 'Quarterly report with stats and charts',
    preview: '📊',
    content: `--- Q4 2024 Report
Theme[Corporate]
Logo[CorpInc]

-- Executive Summary

Bigtitle[Record Breaking Quarter]

We achieved our best quarter yet with 45% YoY growth.

Stats[
{$12M;Revenue}
{45%;YoY Growth}
{98%;Customer Satisfaction}
]

-- Key Achievements

Timeline[
{Oct;Product Launch;Released v3.0 with AI features}
{Nov;Partnership;Signed deal with Fortune 500 company}
{Dec;Expansion;Opened offices in 3 new cities}
]

-- Challenges & Solutions

Column[
{**Challenges**

- Supply chain delays
- Talent acquisition
- Market competition}
{**Solutions**

- Diversified suppliers
- Improved employer brand
- Focused on innovation}
]

-- 2025 Outlook

Feature[
{🎯;$20M;Revenue Target}
{👥;100+;New Hires}
{🌍;5;New Markets}
]

Badge[CONFIDENTIAL]
`,
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Interactive workshop with exercises',
    preview: '🛠',
    content: `--- Design Thinking Workshop
Theme[Creative]
Logo[Workshop]

-- Welcome!

Bigtitle[Let's Create Together]

This workshop will teach you the fundamentals of design thinking.

Warn[Please have pen and paper ready!]

-- The 5 Steps

List[
{1️⃣;Empathize - Understand users}
{2️⃣;Define - Frame the problem}
{3️⃣;Ideate - Generate ideas}
{4️⃣;Prototype - Build solutions}
{5️⃣;Test - Validate with users}
]

-- Exercise 1: Empathy Map

Column[
{**What they SAY**

Listen to user interviews

**What they THINK**

Understand motivations}
{**What they DO**

Observe behaviors

**What they FEEL**

Identify emotions}
]

-- Group Activity

Bigtitle[Brainstorm Time!]

Take 10 minutes to generate as many ideas as possible.

Def[There are no bad ideas in brainstorming. Quantity over quality!]

-- Wrap Up

Feature[
{📧;Follow Up;Check your email for resources}
{💬;Feedback;Share your thoughts}
{🎓;Certificate;Complete the survey}
]

quote[Design is not just what it looks like, design is how it works.]
`,
  },
];

export function TemplatesModal({ mode, onSelect }: TemplatesModalProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  
  const templates = mode === 'block' ? blockTemplates : deckTemplates;

  const handleSelect = (template: Template) => {
    setSelected(template.id);
    setTimeout(() => {
      onSelect(template.content);
      setOpen(false);
      setSelected(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`group relative p-4 text-left rounded-lg border-2 transition-all duration-200 hover:border-primary hover:shadow-md ${
                  selected === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                {/* Selected indicator */}
                {selected === template.id && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                
                {/* Preview icon */}
                <div className="text-3xl mb-2">{template.preview}</div>
                
                {/* Content */}
                <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default TemplatesModal;
