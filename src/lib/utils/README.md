# Input Builder Utility

This utility provides flexible ways to build inputs for Dify API calls. Since this is a boilerplate, we don't make assumptions about what inputs you need - you can customize them based on your specific use case.

## Basic Usage

### 1. Simple Inputs

```typescript
import { buildBasicInputs } from '@/lib/utils/input-builder';

const inputs = buildBasicInputs({
  user_preference: 'detailed_explanations',
  current_topic: 'react',
});
```

### 2. Common Inputs (Most Use Cases)

```typescript
import { buildCommonInputs } from '@/lib/utils/input-builder';

const inputs = buildCommonInputs(
  user, // Your user object
  'en', // User's locale
  {
    // Additional inputs specific to your app
    feature_flags: ['new_ui', 'beta_features'],
    session_id: 'abc123',
  }
);
```

### 3. Fully Custom Inputs

```typescript
import { buildCustomInputs } from '@/lib/utils/input-builder';

const inputs = buildCustomInputs({
  user_id: user.uid,
  user_role: 'admin',
  current_page: 'dashboard',
  user_preferences: {
    theme: 'dark',
    language: 'en',
  },
});
```

## Example Use Cases

### E-commerce Chatbot

```typescript
import { buildEcommerceInputs } from '@/lib/utils/input-builder';

const inputs = buildEcommerceInputs({
  id: user.uid,
  cartItems: 3,
  lastPurchase: '2024-01-15',
});
```

### Customer Support

```typescript
import { buildSupportInputs } from '@/lib/utils/input-builder';

const inputs = buildSupportInputs({
  uid: user.uid,
  previousTickets: 2,
});
```

### Educational Platform

```typescript
import { buildEducationInputs } from '@/lib/utils/input-builder';

const inputs = buildEducationInputs({
  id: user.uid,
  courseProgress: { 'react-basics': 75, 'advanced-react': 25 },
  level: 'intermediate',
});
```

## Configuring in Dify

1. Go to your Dify app settings
2. Define the input variables you want to use
3. Reference them in your prompts using `{{#inputs.variable_name#}}`

Example prompt:

```
You are an AI assistant for user {{#inputs.user_id#}}.
User prefers {{#inputs.language#}} responses.
Current context: {{#inputs.current_topic#}}
```

## Best Practices

1. **Keep inputs minimal** - Only include what your Dify app actually needs
2. **Use descriptive names** - Make variable names clear and consistent
3. **Include timestamp** - Always include timestamp for debugging
4. **Validate in Dify** - Make sure your Dify app defines the variables you're sending
5. **Handle missing data** - Provide fallback values for optional inputs

## Migration from Context

If you were using the old `context` parameter, simply replace:

```typescript
// Old way
const context = await buildMessageContext(locale);
await sendMessage({ context });

// New way
const inputs = buildCommonInputs(user, locale);
await sendMessage({ inputs });
```
