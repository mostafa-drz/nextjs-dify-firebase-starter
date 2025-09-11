'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Clock,
  CheckCircle,
  CreditCard,
  Shield,
  Zap,
  ExternalLink
} from 'lucide-react';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqItems = [
    {
      category: 'Getting Started',
      icon: <Zap className="h-4 w-4" />,
      questions: [
        {
          question: 'How do I get started with the AI assistant?',
          answer: 'Simply sign up with your email, verify your account, and start chatting! You\'ll receive free credits to begin using the service.'
        },
        {
          question: 'What is Dify AI and how does it work?',
          answer: 'Dify is an AI platform that powers our chat assistant. It processes your messages and provides intelligent responses using advanced language models.'
        }
      ]
    },
    {
      category: 'Credits & Billing',
      icon: <CreditCard className="h-4 w-4" />,
      questions: [
        {
          question: 'How does the credit system work?',
          answer: 'Each credit equals 1000 tokens. Credits are consumed based on the length of your messages and AI responses. Longer conversations use more credits.'
        },
        {
          question: 'How do I get more credits?',
          answer: 'You can purchase additional credits through your account dashboard. We offer various packages to suit different usage needs.'
        },
        {
          question: 'Do credits expire?',
          answer: 'Credits don\'t expire for paid accounts. Free tier credits may have expiration dates as specified in your subscription plan.'
        }
      ]
    },
    {
      category: 'Security & Privacy',
      icon: <Shield className="h-4 w-4" />,
      questions: [
        {
          question: 'Is my data secure?',
          answer: 'Yes, we use industry-standard encryption and security measures. Your conversations are processed securely and we don\'t share your data with third parties.'
        },
        {
          question: 'Can I delete my account and data?',
          answer: 'Absolutely. You can delete your account and all associated data at any time through your profile settings. This action is irreversible.'
        }
      ]
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to your backend
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Support Center</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support team. 
              We're here to help you get the most out of our AI platform.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>Quick Response</span>
              </div>
            </div>
          </div>

          {/* Support Options */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Contact Us
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              <div className="space-y-6">
                {faqItems.map((category, categoryIndex) => (
                  <Card key={categoryIndex}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {category.icon}
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.questions.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{item.question}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                          {itemIndex < category.questions.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Contact Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Form */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Send us a message</h3>
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={contactForm.subject}
                            onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="What can we help you with?"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <textarea
                            id="message"
                            value={contactForm.message}
                            onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Please describe your question or issue..."
                            className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Send Message
                        </Button>
                      </form>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Other ways to reach us</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Email Support</p>
                            <a 
                              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'}`}
                              className="text-primary hover:underline text-sm flex items-center gap-1"
                            >
                              {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">
                              We typically respond within 24 hours
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <p className="font-medium">Response Times</p>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                              <span>General inquiries:</span>
                              <Badge variant="outline" className="text-xs">24 hours</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Technical issues:</span>
                              <Badge variant="outline" className="text-xs">12 hours</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Account problems:</span>
                              <Badge variant="outline" className="text-xs">6 hours</Badge>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <p className="font-medium">Before contacting us</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Check our FAQ above</li>
                            <li>• Try refreshing your browser</li>
                            <li>• Clear your browser cache</li>
                            <li>• Check your internet connection</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
