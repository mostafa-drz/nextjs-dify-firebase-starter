'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  FileText, 
  Calendar,
  Mail,
  ExternalLink
} from 'lucide-react';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <PageLayout>
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Legal Information</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Important information about your use of our AI-powered platform. 
              Please review these documents carefully.
            </p>
            <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
              <Calendar className="h-3 w-3" />
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>

          {/* Legal Documents */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="terms" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Terms of Service
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy Policy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="terms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Terms of Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">1. Service Description</h3>
                      <p className="text-muted-foreground">
                        This platform provides AI-powered chat services through Dify.ai integration. 
                        Users can interact with AI assistants using a credit-based system.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">2. User Responsibilities</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Use the service responsibly and in accordance with applicable laws</li>
                        <li>Do not attempt to circumvent credit limitations or security measures</li>
                        <li>Respect the AI assistant and maintain appropriate communication</li>
                        <li>Keep your account credentials secure and confidential</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">3. Credit System</h3>
                      <p className="text-muted-foreground">
                        Credits are consumed based on token usage. Each credit equals 1000 tokens. 
                        Credits are non-refundable and expire according to your subscription plan.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">4. Service Availability</h3>
                      <p className="text-muted-foreground">
                        We strive to maintain high service availability but cannot guarantee 
                        100% uptime. Service may be temporarily unavailable for maintenance or updates.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">5. Limitation of Liability</h3>
                      <p className="text-muted-foreground">
                        Our service is provided "as is" without warranties. We are not liable 
                        for any indirect, incidental, or consequential damages arising from your use of the service.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">1. Information We Collect</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Account Information:</strong> Email address, display name, authentication data</li>
                        <li><strong>Usage Data:</strong> Chat messages, conversation history, credit transactions</li>
                        <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                        <li><strong>Analytics:</strong> Usage patterns, performance metrics, error logs</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">2. How We Use Your Information</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Provide and maintain the AI chat service</li>
                        <li>Process credit transactions and manage your account</li>
                        <li>Improve service quality and user experience</li>
                        <li>Ensure security and prevent abuse</li>
                        <li>Comply with legal obligations</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">3. Data Protection</h3>
                      <p className="text-muted-foreground mb-2">
                        We implement industry-standard security measures to protect your data:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Encryption in transit and at rest</li>
                        <li>Secure authentication via Firebase</li>
                        <li>Regular security audits and updates</li>
                        <li>Access controls and monitoring</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">4. Data Sharing</h3>
                      <p className="text-muted-foreground">
                        We do not sell your personal information. We may share data with:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                        <li><strong>Dify.ai:</strong> To process your chat requests</li>
                        <li><strong>Firebase:</strong> For authentication and data storage</li>
                        <li><strong>Service Providers:</strong> For analytics and error tracking</li>
                        <li><strong>Legal Requirements:</strong> When required by law</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">5. Your Rights</h3>
                      <p className="text-muted-foreground mb-2">
                        You have the right to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Access and download your data</li>
                        <li>Correct inaccurate information</li>
                        <li>Delete your account and data</li>
                        <li>Opt out of non-essential communications</li>
                        <li>Request data portability</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact Information */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Questions or Concerns?</h3>
                <p className="text-muted-foreground">
                  If you have any questions about these legal documents or need to exercise your rights, 
                  please contact us.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'}`}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
