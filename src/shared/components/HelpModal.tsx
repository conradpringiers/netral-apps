/**
 * Help Modal Component
 * Shows syntax reference for all Netral elements
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const syntaxReference = [
  {
    category: 'Document',
    items: [
      { name: 'Title', syntax: '--- My Site Title', description: 'Sets the document title' },
      { name: 'Theme', syntax: 'Theme[Modern]', description: 'Modern | Natural | Latte | Dark Mode | Terminal | Ocean | Solarized | Midnight | Minimal' },
      { name: 'Logo', syntax: 'Logo[https://... OR Text]', description: 'URL for image or text for text logo' },
      { name: 'Navbar', syntax: 'Navbar[\n{Home;#home}\n{About;#about}\n]', description: 'Navigation links with {Label;URL}' },
      { name: 'Header', syntax: 'Header[Type;Title;Description;ImageURL;LinkURL]', description: 'Types: Classic, BigText, SplitImage' },
      { name: 'Section', syntax: '-- Section Title', description: 'Creates a new section' },
    ],
  },
  {
    category: 'Content',
    items: [
      { name: 'Image', syntax: 'Image[https://example.com/image.jpg]', description: 'Displays an image' },
      { name: 'Video', syntax: 'Video[https://example.com/video.mp4]', description: 'Embeds a video player' },
      { name: 'Embed', syntax: 'Embed[https://example.com]', description: 'Embeds an external website' },
      { name: 'Bigtitle', syntax: 'Bigtitle[Your Big Title]', description: 'Large centered title' },
      { name: 'Column', syntax: 'Column[\n{Left content}\n{Right content}\n]', description: 'Two-column layout (text only)' },
    ],
  },
  {
    category: 'Components',
    items: [
      { name: 'Feature', syntax: 'Feature[\n{🚀;Title;Description}\n{⚡;Title;Description}\n]', description: 'Feature cards with icon' },
      { name: 'Element', syntax: 'Element[\n{Title;Description;ImageURL}\n]', description: 'Cards with image' },
      { name: 'Testimonial', syntax: 'Testimonial[\n{Name;Role;Quote;PhotoURL}\n]', description: 'Testimonial cards' },
      { name: 'Pricing', syntax: 'Pricing[\n{Plan;$9/mo;Feature 1, Feature 2}\n]', description: 'Pricing tables' },
      { name: 'Stats', syntax: 'Stats[\n{100+;Clients}\n{50K;Downloads}\n]', description: 'Statistics display' },
      { name: 'FAQ', syntax: 'FAQ[\n{Question?;Answer here.}\n]', description: 'Accordion FAQ section' },
      { name: 'Gallery', syntax: 'Gallery[\n{ImageURL;Caption}\n]', description: 'Image gallery grid' },
      { name: 'CTA', syntax: 'CTA[Title;Description;Button Text;URL]', description: 'Call-to-action block' },
    ],
  },
  {
    category: 'Callouts',
    items: [
      { name: 'Warn', syntax: 'Warn[Warning message]', description: 'Warning callout' },
      { name: 'Def', syntax: 'Def[Info message]', description: 'Info/definition callout' },
      { name: 'quote', syntax: 'quote[Your quote here]', description: 'Quote block' },
      { name: 'Divider', syntax: 'Divider[wave]', description: 'Visual divider (wave or line)' },
    ],
  },
  {
    category: 'Markdown',
    items: [
      { name: 'Bold', syntax: '**bold text**', description: 'Bold text' },
      { name: 'Italic', syntax: '*italic text*', description: 'Italic text' },
      { name: 'Link', syntax: '[text](url)', description: 'Hyperlink' },
      { name: 'List', syntax: '- Item 1\n- Item 2', description: 'Bullet list' },
      { name: 'Numbered', syntax: '1. First\n2. Second', description: 'Numbered list' },
      { name: 'Code', syntax: '`code`', description: 'Inline code' },
      { name: 'Heading', syntax: '# H1 / ## H2 / ### H3', description: 'Headings' },
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
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Netral Syntax Reference</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Type an element name and press <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd> to insert a template.
            </p>
            
            {syntaxReference.map((section) => (
              <div key={section.category}>
                <h3 className="font-semibold text-lg mb-3 text-foreground">{section.category}</h3>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.name} className="border border-border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-foreground">{item.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </div>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        <code>{item.syntax}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default HelpModal;
