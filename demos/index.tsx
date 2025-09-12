/**
 * @fileoverview Main demos landing page - showcases all available demo applications
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChefHat, Camera, MessageSquare, FileImage, Mic, Volume2 } from 'lucide-react';

/**
 * Demo application data
 */
const demos = [
  {
    id: 'recipe-analyzer',
    title: 'Smart Recipe Analyzer & Meal Planner',
    description: 'Upload food images and get AI-powered meal planning with nutritional insights',
    path: '/demos/recipe-analyzer',
    status: 'available',
    features: ['Image Analysis', 'Meal Planning', 'Nutritional Insights', 'Shopping Lists'],
    difyFeatures: ['File Upload', 'Chat', 'Conversation Management', 'Suggestions'],
    icon: ChefHat,
    color: 'bg-green-500',
  },
  // Future demos will be added here
] as const;

/**
 * Dify features with icons for visual representation
 */
const difyFeatureIcons = {
  'File Upload': FileImage,
  Chat: MessageSquare,
  'Conversation Management': MessageSquare,
  Suggestions: MessageSquare,
  'Speech to Text': Mic,
  'Text to Audio': Volume2,
  'Image Analysis': Camera,
} as const;

/**
 * Main demos landing page component
 *
 * Displays all available demo applications with their features and Dify capabilities
 *
 * @returns JSX element for the demos landing page
 */
export default function DemosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Dify Demo Applications</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
          Creative, minimal, and elegant demo applications showcasing different Dify AI features.
          Each demo serves as both an integration test and a developer starting point.
        </p>
      </div>

      {/* Demo Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => {
          const IconComponent = demo.icon;
          return (
            <Card
              key={demo.id}
              className="relative overflow-hidden transition-shadow hover:shadow-lg"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge
                  variant={demo.status === 'available' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {demo.status === 'available' ? 'Available' : 'Coming Soon'}
                </Badge>
              </div>

              <CardHeader className="pb-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${demo.color} text-white`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{demo.title}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {demo.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <h4 className="text-muted-foreground mb-2 text-sm font-medium">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {demo.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Dify Features */}
                <div>
                  <h4 className="text-muted-foreground mb-2 text-sm font-medium">Dify Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {demo.difyFeatures.map((feature) => {
                      const FeatureIcon =
                        difyFeatureIcons[feature as keyof typeof difyFeatureIcons];
                      return (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="flex items-center gap-1 text-xs"
                        >
                          {FeatureIcon && <FeatureIcon className="h-3 w-3" />}
                          {feature}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {demo.status === 'available' ? (
                    <Button asChild className="w-full">
                      <Link href={demo.path}>Try Demo</Link>
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      Coming Soon
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Getting Started Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to set up and run the demo applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <div className="mb-2 text-2xl font-bold text-blue-600">1</div>
              <h3 className="mb-2 font-medium">Choose a Demo</h3>
              <p className="text-muted-foreground text-sm">
                Browse available demos and select one that interests you
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="mb-2 text-2xl font-bold text-blue-600">2</div>
              <h3 className="mb-2 font-medium">Setup Dify App</h3>
              <p className="text-muted-foreground text-sm">
                Follow the setup instructions to configure your Dify application
              </p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="mb-2 text-2xl font-bold text-blue-600">3</div>
              <h3 className="mb-2 font-medium">Run & Explore</h3>
              <p className="text-muted-foreground text-sm">
                Launch the demo and explore the AI-powered features
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-muted-foreground text-center text-sm">
        <p>
          Each demo is designed to showcase specific Dify capabilities while solving real-world
          problems. Use them as starting points for your own AI-powered applications.
        </p>
      </div>
    </div>
  );
}
