/**
 * @fileoverview Demo card component for showcasing demo applications
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DemoCardProps {
  title: string;
  description: string;
  href: string;
  status?: 'available' | 'coming-soon' | 'beta';
}

export function DemoCard({ title, description, href, status = 'available' }: DemoCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'coming-soon':
        return <Badge variant="secondary">Coming Soon</Badge>;
      case 'beta':
        return <Badge variant="outline">Beta</Badge>;
      default:
        return <Badge variant="default">Available</Badge>;
    }
  };

  return (
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={href}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View Demo →
        </Link>
      </CardContent>
    </Card>
  );
}
