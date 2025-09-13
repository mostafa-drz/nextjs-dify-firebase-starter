# Dify Demo Applications

This folder contains creative, minimal, and elegant demo applications showcasing different Dify AI features. Each demo serves as both an integration test and a developer starting point.

> **Process Guide**: See [PROCESS.md](./PROCESS.md) for the complete demo builder methodology and workflow.

## Demo Structure

```
demos/
├── README.md                           # This file
├── PROCESS.md                         # Demo builder methodology
├── index.tsx                          # Main demos landing page
├── recipe-analyzer/                   # Smart Recipe Analyzer & Meal Planner
│   ├── README.md                      # Demo documentation
│   ├── dify-setup.md                  # Dify dashboard setup instructions
│   ├── page.tsx                       # Demo page component
│   ├── components/                    # Demo-specific components
│   └── types.ts                       # Demo-specific types
├── [future-demo]/                     # Additional demos...
└── shared/                           # Shared demo components
    ├── DemoLayout.tsx                 # Common demo layout
    ├── DemoHeader.tsx                 # Demo page header
    └── DemoCard.tsx                   # Demo showcase card
```

## Available Demos

### 🍳 Smart Recipe Analyzer & Meal Planner

**Path**: `/demos/recipe-analyzer`  
**Features**: Image analysis, meal planning, nutritional insights  
**Dify Features**: File upload, chat, conversation management, suggestions

_More demos coming soon..._

## Demo Principles

- **Creative & Useful**: Focus on daily tools that solve real problems
- **Minimal & Elegant**: Keep it simple but polished
- **Code Sharing**: Reuse existing components while maintaining isolation
- **High Quality**: Suitable for client demonstrations
- **Purpose-Driven**: Each demo has clear value and framework

## Getting Started

1. Browse available demos on the main demos page
2. Follow the Dify setup instructions for each demo
3. Configure your Dify app according to the setup guide
4. Run the demo and explore the features
5. Use as a starting point for your own applications

## Contributing

When adding new demos:

1. Create a new folder with the demo name
2. Include README.md with demo description
3. Include dify-setup.md with complete setup instructions
4. Implement the demo following the established patterns
5. Update this main README with the new demo information
