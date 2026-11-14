// Dummy provider credentials: the SDK clients are only constructed, never called, by the tests.
process.env.ANTHROPIC_API_KEY ??= "test"
process.env.OPENAI_API_KEY ??= "test"
process.env.GEMINI_API_KEY ??= "test"
