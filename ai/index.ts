import { google } from "@ai-sdk/google";
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";

export const geminiProModel = wrapLanguageModel({
  model: google("gemini-2.0-flash"),
  middleware: customMiddleware,
});

export const geminiFlashModel = wrapLanguageModel({
  model: google("gemini-2.0-flash"),
  middleware: customMiddleware,
});

export const bedrockClaude = wrapLanguageModel({
  model: bedrock('us.anthropic.claude-3-5-sonnet-20241022-v2:0'),
  middleware: customMiddleware,
})
