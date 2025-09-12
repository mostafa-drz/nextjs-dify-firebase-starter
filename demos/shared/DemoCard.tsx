/**
 * @fileoverview Reusable card component for demo showcases
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DemoCardProps {
  title: string;
  description: string;
  children: ReactNode;
  badges?: string[];
  className?: string;
}

/**
 * Reusable card component for demo showcases
 *
 * Provides consistent styling for demo information and content
 *
 * @param props - Component props
 * @returns JSX element for the demo card
 */
export function DemoCard({
  title,
  description,
  children,
  badges = [],
  className = '',
}: DemoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
