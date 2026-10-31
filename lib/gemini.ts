
import { GoogleGenAI } from "@google/genai";

export type VerifiedCategory =
  | "Pothole"
  | "Road Damage"
  | "Open Drain"
  | "Waterlogging"
  | "Water Leakage"
  | "Water Supply"
  | "Streetlight"
  | "Electricity"
  | "Garbage"
  | "Sewage"
  | "Illegal Dumping"
  | "Waste"
  | "Traffic"
  | "Stray Animals"
  | "Other";

export interface ComplaintAnalysis {
  verifiedCategory: VerifiedCategory;
  confidence: number;
  reason: string;
  needsManualReview: boolean;
}

const allowedCategories: VerifiedCategory[] = [
  "Pothole",
  "Road Damage",
  "Open Drain",
  "Waterlogging",
  "Water Leakage",
  "Water Supply",
  "Streetlight",
  "Electricity",
  "Garbage",
  "Sewage",
  "Illegal Dumping",
  "Waste",
  "Traffic",
  "Stray Animals",
  "Other",
];

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
];

const MAX_ATTEMPTS_PER_MODEL = 2;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorDetails(error: unknown): {
  status: number | null;
  message: string;
} {
  const err = error as {
    status?: number | string;
    code?: number | string;
    message?: string;
    error?: {
      status?: number | string;
      code?: number | string;
      message?: string;
    };
  };

  const message =
    err?.message ||
    err?.error?.message ||
    String(error);

  const rawStatus =
    err?.status ??
    err?.error?.code ??
    err?.error?.status ??
    err?.code;

  let status =
    typeof rawStatus === "number"
      ? rawStatus
      : typeof rawStatus === "string" &&
          /^\d{3}$/.test(rawStatus)
        ? Number(rawStatus)
        : null;

  if (!status) {
    const match = message.match(/\b(408|429|500|502|503|504)\b/);
    if (match) status = Number(match[1]);
  }

  if (!status && message.includes("UNAVAILABLE")) {
    status = 503;
  }

  return { status, message };
}

function isTemporaryError(error: unknown): boolean {
  const { status } = getErrorDetails(error);

  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

function validateAIResponse(text: string): ComplaintAnalysis {
  let result: ComplaintAnalysis;

  try {
    result = JSON.parse(text) as ComplaintAnalysis;
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  if (!allowedCategories.includes(result.verifiedCategory)) {
    throw new Error("Gemini returned an invalid category.");
  }

  if (
    typeof result.confidence !== "number" ||
    !Number.isFinite(result.confidence) ||
    result.confidence < 0 ||
    result.confidence > 1
  ) {
    throw new Error("Gemini returned invalid confidence.");
  }

  if (
    typeof result.reason !== "string" ||
    result.reason.trim().length === 0
  ) {
    throw new Error("Gemini returned an invalid reason.");
  }

  if (typeof result.needsManualReview !== "boolean") {
    throw new Error("Gemini returned an invalid review status.");
  }

  return {
    verifiedCategory: result.verifiedCategory,
    confidence: result.confidence,
    reason: result.reason,
    needsManualReview:
      result.needsManualReview || result.confidence < 0.75,
  };
}

export async function analyzeComplaint(
  description: string,
  imageUrl: string,
  reportedCategory: string
): Promise<ComplaintAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  if (!description.trim()) {
    throw new Error("Complaint description is missing.");
  }

  if (!imageUrl.trim()) {
    throw new Error("Complaint image URL is missing.");
  }

  // Download the complaint image once.
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(
      `Complaint image fetch failed: ${imageResponse.status}`
    );
  }

  const contentType =
    imageResponse.headers.get("content-type") || "";

  if (!contentType.startsWith("image/")) {
    throw new Error("The complaint URL did not return an image.");
  }

  const imageBuffer = Buffer.from(
    await imageResponse.arrayBuffer()
  );

  if (imageBuffer.length === 0) {
    throw new Error("The complaint image is empty.");
  }

  if (imageBuffer.length > 10 * 1024 * 1024) {
    throw new Error("Complaint image exceeds 10 MB.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an AI complaint verification assistant for CityCare, an Indian civic complaint platform.

Analyze the uploaded photograph and complaint description together.

Citizen-selected category: ${reportedCategory}

Complaint description: ${description}

Choose exactly one category from this list:
${allowedCategories.join(", ")}

Rules:
1. Verify whether the citizen-selected category matches the actual issue.
2. Analyze both the photograph and the written description.
3. Do not invent facts that are not supported by the evidence.
4. If the photograph and description conflict, carefully explain the conflict.
5. If the issue is unclear, select "Other" and require manual review.
6. Confidence must be a number between 0 and 1.
7. If confidence is below 0.75, set needsManualReview to true.
8. If the image is unclear or insufficient, set needsManualReview to true.
9. Do not automatically approve an uncertain classification.
10. Return only valid JSON in exactly this structure:

{
  "verifiedCategory": "Pothole",
  "confidence": 0.95,
  "reason": "The photograph shows potholes and damage on the road surface.",
  "needsManualReview": false
}
`;

  let lastError: unknown;

  // Try the primary model, then the fallback model.
  for (const model of MODELS) {
    for (
      let attempt = 1;
      attempt <= MAX_ATTEMPTS_PER_MODEL;
      attempt++
    ) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: contentType.split(";")[0],
                data: imageBuffer.toString("base64"),
              },
            },
          ],
          config: {
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text;

        if (!responseText) {
          throw new Error("Gemini returned an empty response.");
        }

        return validateAIResponse(responseText);
      } catch (error) {
        lastError = error;

        const details = getErrorDetails(error);

        console.error(
          `Gemini model ${model}, attempt ${attempt} failed:`,
          details.status,
          details.message
        );

        // Do not retry invalid keys, permissions, bad requests,
        // or invalid model configuration.
        if (!isTemporaryError(error)) {
          throw new Error(
            `Gemini request failed (${details.status ?? "unknown"}): ${details.message}`
          );
        }

        // Wait before retrying temporary service errors.
        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          await wait(1500 * Math.pow(2, attempt - 1));
        }
      }
    }

    console.warn(
      `Gemini model ${model} failed. Trying the next model if available.`
    );
  }

  const finalError = getErrorDetails(lastError);

  throw new Error(
    `All Gemini models failed. Last error (${finalError.status ?? "unknown"}): ${finalError.message}`
  );
}
