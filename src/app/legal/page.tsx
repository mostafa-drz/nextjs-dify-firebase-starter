import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, FileText, Calendar, Mail, ExternalLink } from 'lucide-react';

/**
 * Legal Page - Server Component
 * Static legal documents with tabs (no client-side state needed)
 */
export default function LegalPage() {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Shield className="text-primary h-8 w-8" />
              <h1 className="text-3xl font-bold">Legal Information</h1>
            </div>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Important information about your use of our AI-powered platform. Please review these
              documents carefully.
            </p>
            <Badge variant="outline" className="mx-auto flex w-fit items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>

          {/* Legal Documents */}
          <Tabs defaultValue="terms" className="w-full">
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
                      <h3 className="mb-2 text-lg font-semibold">1. Service Description</h3>
                      <p className="text-muted-foreground">
                        This platform provides AI-powered chat services through Dify.ai integration.
                        Users can interact with AI assistants using a credit-based system.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">2. User Responsibilities</h3>
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Use the service responsibly and in accordance with applicable laws</li>
                        <li>
                          Do not attempt to circumvent credit limitations or security measures
                        </li>
                        <li>Respect the AI assistant and maintain appropriate communication</li>
                        <li>Keep your account credentials secure and confidential</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">3. Credit System</h3>
                      <p className="text-muted-foreground">
                        Credits are consumed based on token usage. Each credit equals 1000 tokens.
                        Credits are non-refundable and expire according to your subscription plan.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">4. Service Availability</h3>
                      <p className="text-muted-foreground">
                        We strive to maintain high service availability but cannot guarantee 100%
                        uptime. Service may be temporarily unavailable for maintenance or updates.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">5. Limitation of Liability</h3>
                      <p className="text-muted-foreground">
                        Our service is provided &quot;as is&quot; without warranties. We are not
                        liable for any indirect, incidental, or consequential damages arising from
                        your use of the service.
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
                      <h3 className="mb-2 text-lg font-semibold">1. Information We Collect</h3>
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>
                          <strong>Account Information:</strong> Email address, display name,
                          authentication data
                        </li>
                        <li>
                          <strong>Usage Data:</strong> Chat messages, conversation history, credit
                          transactions
                        </li>
                        <li>
                          <strong>Technical Data:</strong> IP address, browser type, device
                          information
                        </li>
                        <li>
                          <strong>Analytics:</strong> Usage patterns, performance metrics, error
                          logs
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">2. How We Use Your Information</h3>
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Provide and maintain the AI chat service</li>
                        <li>Process credit transactions and manage your account</li>
                        <li>Improve service quality and user experience</li>
                        <li>Ensure security and prevent abuse</li>
                        <li>Comply with legal obligations</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">3. Data Protection</h3>
                      <p className="text-muted-foreground mb-2">
                        We implement industry-standard security measures to protect your data:
                      </p>
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Encryption in transit and at rest</li>
                        <li>Secure authentication via Firebase</li>
                        <li>Regular security audits and updates</li>
                        <li>Access controls and monitoring</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">4. Data Sharing</h3>
                      <p className="text-muted-foreground">
                        We do not sell your personal information. We may share data with:
                      </p>
                      <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                        <li>
                          <strong>Dify.ai:</strong> To process your chat requests
                        </li>
                        <li>
                          <strong>Firebase:</strong> For authentication and data storage
                        </li>
                        <li>
                          <strong>Service Providers:</strong> For analytics and error tracking
                        </li>
                        <li>
                          <strong>Legal Requirements:</strong> When required by law
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">5. Your Rights</h3>
                      <p className="text-muted-foreground mb-2">You have the right to:</p>
                      <ul className="text-muted-foreground list-inside list-disc space-y-1">
                        <li>Access and download your data</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your account and data (contact support)</li>
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
              <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold">Questions or Concerns?</h3>
                <p className="text-muted-foreground">
                  If you have any questions about these legal documents or need to exercise your
                  rights, please contact us.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <a
                    href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'}`}
                    className="text-primary flex items-center gap-1 hover:underline"
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
