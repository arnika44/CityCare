
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

export async function analyzeComplaint(
  description: string,
  imageUrl: string,
  reportedCategory: string
): Promise<ComplaintAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(
      `Image fetch failed: ${imageResponse.status}`
    );
  }

  const contentType =
    imageResponse.headers.get("content-type") || "";

  if (!contentType.startsWith("image/")) {
    throw new Error("Invalid complaint image.");
  }

  const imageBuffer = Buffer.from(
    await imageResponse.arrayBuffer()
  );

  if (imageBuffer.length > 10 * 1024 * 1024) {
    throw new Error("Complaint image exceeds 10 MB.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        text: `
You are an AI complaint verification assistant for CityCare.

Analyze the attached photograph and complaint description together.

Citizen-selected category: ${reportedCategory}

Complaint description: ${description}

Choose exactly one category from:
${allowedCategories.join(", ")}

Instructions:
1. Check whether the selected category matches the actual issue.
2. Use both the photograph and description.
3. Do not invent details.
4. If evidence is unclear or contradictory, select Other.
5. Confidence must be between 0 and 1.
6. If confidence is below 0.75, require manual review.
7. If the image does not provide enough evidence, require manual review.
8. Return only valid JSON in this format:

{
  "verifiedCategory": "Pothole",
  "confidence": 0.95,
  "reason": "The photograph shows a damaged road surface.",
  "needsManualReview": false
}
`,
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

  const result = JSON.parse(responseText) as ComplaintAnalysis;

  if (!allowedCategories.includes(result.verifiedCategory)) {
    throw new Error("Gemini returned an invalid category.");
  }

  if (
    typeof result.confidence !== "number" ||
    result.confidence < 0 ||
    result.confidence > 1 ||
    typeof result.reason !== "string"
  ) {
    throw new Error("Gemini returned invalid analysis data.");
  }

  return {
    verifiedCategory: result.verifiedCategory,
    confidence: result.confidence,
    reason: result.reason,
    needsManualReview:
      result.needsManualReview === true ||
      result.confidence < 0.75,
  };
}
