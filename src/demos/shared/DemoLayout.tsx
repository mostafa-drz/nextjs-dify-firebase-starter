/**
 * @fileoverview Demo layout component for demo pages
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DemoLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DemoLayout({ title, description, children }: DemoLayoutProps) {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demo Application</CardTitle>
          <CardDescription>Interactive demo showcasing AI capabilities</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
