/**
 * Help Modal Component
 * Complete guide with concept explanation and syntax reference
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Zap, Palette, Code, Layout, FileText, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const syntaxReference = [
  {
    category: 'Document Setup',
    icon: '📄',
    items: [
      { name: 'Title', syntax: '--- My Site Title', description: 'Sets the document/site title' },
      { name: 'Theme', syntax: 'Theme[Modern]', description: 'Available: Modern, Natural, Latte, Dark Mode, Terminal, Ocean, Solarized, Midnight, Minimal' },
      { name: 'Logo', syntax: 'Logo[https://... OR Text]', description: 'Image URL or text for site logo' },
      { name: 'Navbar', syntax: 'Navbar[\n{Home;#home}\n{About;#about}\n]', description: 'Navigation with {Label;URL} format' },
      { name: 'Header', syntax: 'Header[Type;Title;Desc;ImageURL;LinkURL]', description: 'Types: Classic (banner), BigText, SplitImage' },
      { name: 'Section', syntax: '-- Section Title', description: 'Creates a new content section' },
    ],
  },
  {
    category: 'Media & Content',
    icon: '🖼️',
    items: [
      { name: 'Image', syntax: 'Image[https://example.com/image.jpg]', description: 'Display a full-width image' },
      { name: 'Video', syntax: 'Video[https://example.com/video.mp4]', description: 'Embed a video player' },
      { name: 'Embed', syntax: 'Embed[https://example.com]', description: 'Embed external website/iframe' },
      { name: 'Gallery', syntax: 'Gallery[\n{ImageURL;Caption}\n]', description: 'Image gallery with hover captions' },
      { name: 'Bigtitle', syntax: 'Bigtitle[Your Big Title]', description: 'Large centered display title' },
      { name: 'Column', syntax: 'Column[\n{Left content}\n{Right content}\n]', description: 'Two-column text layout' },
    ],
  },
  {
    category: 'Components',
    icon: '🧩',
    items: [
      { name: 'Feature', syntax: 'Feature[\n{🚀;Title;Description}\n]', description: 'Feature cards with emoji/icon' },
      { name: 'Element', syntax: 'Element[\n{Title;Desc;ImageURL}\n]', description: 'Cards with image and text' },
      { name: 'Testimonial', syntax: 'Testimonial[\n{Name;Role;Quote;PhotoURL}\n]', description: 'Customer testimonials with photo' },
      { name: 'Pricing', syntax: 'Pricing[\n{Plan;$9/mo;Feature 1, Feature 2}\n]', description: 'Pricing comparison cards' },
      { name: 'Stats', syntax: 'Stats[\n{100+;Clients}\n{50K;Downloads}\n]', description: 'Key statistics display' },
      { name: 'Team', syntax: 'Team[\n{Name;Role;PhotoURL;Bio}\n]', description: 'Team member profiles' },
    ],
  },
  {
    category: 'Interactive',
    icon: '✨',
    items: [
      { name: 'FAQ', syntax: 'FAQ[\n{Question?;Answer here.}\n]', description: 'Expandable FAQ accordion' },
      { name: 'CTA', syntax: 'CTA[Title;Desc;Button Text;URL]', description: 'Call-to-action block with button' },
      { name: 'Timeline', syntax: 'Timeline[\n{2024;Event;Description}\n]', description: 'Chronological event display' },
      { name: 'Countdown', syntax: 'Countdown[Label;Date;Description]', description: 'Event countdown/announcement' },
    ],
  },
  {
    category: 'Callouts & Dividers',
    icon: '📌',
    items: [
      { name: 'Warn', syntax: 'Warn[Warning message]', description: 'Warning/alert callout' },
      { name: 'Def', syntax: 'Def[Info message]', description: 'Info/definition callout' },
      { name: 'quote', syntax: 'quote[Your quote here]', description: 'Styled quote block' },
      { name: 'Divider', syntax: 'Divider[wave] or Divider[]', description: 'Visual section divider' },
    ],
  },
  {
    category: 'Markdown',
    icon: '📝',
    items: [
      { name: 'Bold', syntax: '**bold text**', description: 'Bold formatting' },
      { name: 'Italic', syntax: '*italic text*', description: 'Italic formatting' },
      { name: 'Link', syntax: '[text](url)', description: 'Hyperlink' },
      { name: 'List', syntax: '- Item 1\n- Item 2', description: 'Bullet list' },
      { name: 'Numbered', syntax: '1. First\n2. Second', description: 'Numbered list' },
      { name: 'Code', syntax: '`inline code`', description: 'Inline code' },
      { name: 'Heading', syntax: '# H1 / ## H2 / ### H3', description: 'Section headings' },
    ],
  },
];

export function HelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Netral Block Guide
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mx-6 mb-2">
            <TabsTrigger value="overview" className="gap-2">
              <Zap className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="syntax" className="gap-2">
              <Code className="h-3.5 w-3.5" />
              Syntax
            </TabsTrigger>
            <TabsTrigger value="themes" className="gap-2">
              <Palette className="h-3.5 w-3.5" />
              Themes
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[60vh]">
            <div className="px-6 pb-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Hero */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                  <h3 className="text-lg font-semibold mb-2">What is Netral?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Netral is a simple markup language that lets you create beautiful, responsive websites 
                    without writing HTML or CSS. Just write your content using intuitive syntax, and Netral 
                    transforms it into a polished, professional page.
                  </p>
                </div>
                
                {/* Key Features */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Layout className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium">Live Preview</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      See your changes instantly as you type. The preview updates in real-time.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Palette className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium">9 Themes</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose from Modern, Natural, Latte, Dark Mode, Terminal, Ocean, and more.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium">Export HTML</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Export your site as a standalone HTML file ready to host anywhere.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium">Type & Tab</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Type an element name and press Tab to auto-insert a template snippet.
                    </p>
                  </div>
                </div>
                
                {/* Quick Start */}
                <div>
                  <h3 className="font-semibold mb-3">Quick Start</h3>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-1">
                    <p className="text-muted-foreground">--- My Website</p>
                    <p className="text-muted-foreground">Theme[Modern]</p>
                    <p className="text-muted-foreground">Logo[My Brand]</p>
                    <p className="text-muted-foreground">Header[BigText;Welcome;Your tagline here;;#]</p>
                    <p className="text-muted-foreground">-- Features</p>
                    <p className="text-muted-foreground">Feature[</p>
                    <p className="text-muted-foreground pl-4">{'{'}🚀;Fast;Lightning quick{'}'}</p>
                    <p className="text-muted-foreground pl-4">{'{'}💎;Beautiful;Stunning design{'}'}</p>
                    <p className="text-muted-foreground">]</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="syntax" className="mt-0 space-y-6">
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Pro tip: Type an element name and press <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">Tab</kbd> to insert a template!</span>
                </div>
                
                {syntaxReference.map((section) => (
                  <div key={section.category}>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <span>{section.icon}</span>
                      {section.category}
                    </h3>
                    <div className="grid gap-2">
                      {section.items.map((item) => (
                        <div key={item.name} className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          </div>
                          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                            <code>{item.syntax}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="themes" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Change your site's appearance instantly with the Theme element. Each theme includes 
                  carefully chosen colors, fonts, and styling.
                </p>
                
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Modern', colors: ['#6366f1', '#f8fafc', '#1e293b'], desc: 'Clean & professional' },
                    { name: 'Natural', colors: ['#059669', '#f0fdf4', '#064e3b'], desc: 'Organic & fresh' },
                    { name: 'Latte', colors: ['#ca8a04', '#fefce8', '#422006'], desc: 'Warm & inviting' },
                    { name: 'Dark Mode', colors: ['#8b5cf6', '#0a0a0a', '#fafafa'], desc: 'Sleek & modern' },
                    { name: 'Terminal', colors: ['#22c55e', '#0c0c0c', '#22c55e'], desc: 'Hacker aesthetic' },
                    { name: 'Ocean', colors: ['#0ea5e9', '#0c4a6e', '#f0f9ff'], desc: 'Cool & calming' },
                    { name: 'Solarized', colors: ['#b58900', '#fdf6e3', '#002b36'], desc: 'Easy on eyes' },
                    { name: 'Midnight', colors: ['#f472b6', '#0f0f23', '#e2e8f0'], desc: 'Bold & dramatic' },
                    { name: 'Minimal', colors: ['#171717', '#ffffff', '#171717'], desc: 'Pure & simple' },
                  ].map((theme) => (
                    <div key={theme.name} className="border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex gap-1 mb-2">
                        {theme.colors.map((color, i) => (
                          <div 
                            key={i} 
                            className="w-6 h-6 rounded-full border border-border" 
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <h4 className="font-medium text-sm">{theme.name}</h4>
                      <p className="text-xs text-muted-foreground">{theme.desc}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Usage</h4>
                  <code className="text-xs bg-background px-2 py-1 rounded">Theme[Dark Mode]</code>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default HelpModal;