/**
 * @fileoverview Main demos landing page component
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { DemoCard } from './shared/DemoCard';

export default function DemosPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-4 text-2xl font-bold">Demo Applications</h1>
      <p className="mb-8 text-gray-600">
        Explore our collection of AI-powered demo applications built with Dify and Firebase.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DemoCard
          title="What Can I Cook?"
          description="Snap a photo of your ingredients and get instant recipe suggestions"
          href="/demos/recipe-analyzer"
          status="available"
        />
      </div>
    </div>
  );
}
