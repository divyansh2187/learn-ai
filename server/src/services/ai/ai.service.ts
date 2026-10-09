const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

interface GenerateOutlineInput {
  topic: string;
  goal: string;
  level: string;
  style: string;
  duration: number;
}

interface CourseLesson {
  title: string;
  estimatedMinutes: number;
}

interface CourseModule {
  title: string;
  description: string;
  lessons: CourseLesson[];
}

interface CourseOutline {
  title: string;
  subtitle: string;
  description: string;
  modules: CourseModule[];
}

export const generateCourseOutline = async (
  input: GenerateOutlineInput,
): Promise<CourseOutline> => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const prompt = `
You are an expert course designer.

Create a practical learning course based on:

Topic: ${input.topic}
Goal: ${input.goal}
Level: ${input.level}
Learning Style: ${input.style}
Duration: ${input.duration} days

The course should help the learner achieve the specified goal.

Return ONLY valid JSON.

DO NOT use:
- Markdown
- Code fences
- \`\`\`json
- Explanations before or after the JSON
- Comments

Use EXACTLY this structure:

{
  "title": "Course title",
  "subtitle": "Short subtitle",
  "description": "Course description",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "lessons": [
        {
          "title": "Lesson title",
          "estimatedMinutes": 30
        }
      ]
    }
  ]
}

Rules:

1. Create a logical progression from beginner to advanced where appropriate.
2. Match the course to the learner's goal.
3. Match the difficulty level.
4. Make the learning style relevant.
5. Create practical lessons.
6. Use specific lesson titles.
7. Include projects or practical exercises where appropriate.
8. Keep the course realistic for ${input.duration} days.
9. estimatedMinutes must always be a number.
10. Every module must contain at least one lesson.
11. Return valid JSON only.
`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "LearnAI",
    },

    body: JSON.stringify({
      model: "openrouter/free",

      messages: [
        {
          role: "system",
          content:
            "You generate structured educational course data. Always return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,

      // Ask the model/provider for JSON when supported.
      response_format: {
        type: "json_object",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("OpenRouter error:", errorText);

    throw new Error(`OpenRouter error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    console.error("OpenRouter response:", JSON.stringify(data, null, 2));

    throw new Error("OpenRouter returned an empty response");
  }

  console.log("AI raw response:");
  console.log(content);

  // ---------------------------------------
  // Clean possible Markdown code fences
  // ---------------------------------------

  let cleanedContent = content.trim();

  cleanedContent = cleanedContent
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // ---------------------------------------
  // Extract JSON if model added extra text
  // ---------------------------------------

  const firstBrace = cleanedContent.indexOf("{");
  const lastBrace = cleanedContent.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanedContent = cleanedContent.slice(firstBrace, lastBrace + 1);
  }

  // ---------------------------------------
  // Parse JSON
  // ---------------------------------------

  let parsed: CourseOutline;

  try {
    parsed = JSON.parse(cleanedContent);
  } catch (error) {
    console.error("Invalid AI JSON:");
    console.error(content);

    throw new Error("AI returned invalid JSON");
  }

  // ---------------------------------------
  // Validate basic structure
  // ---------------------------------------

  if (
    !parsed ||
    typeof parsed.title !== "string" ||
    typeof parsed.subtitle !== "string" ||
    typeof parsed.description !== "string" ||
    !Array.isArray(parsed.modules)
  ) {
    console.error("Invalid course structure:", JSON.stringify(parsed, null, 2));

    throw new Error("AI returned an invalid course structure");
  }

  for (const module of parsed.modules) {
    if (
      typeof module.title !== "string" ||
      typeof module.description !== "string" ||
      !Array.isArray(module.lessons)
    ) {
      throw new Error("AI returned an invalid module structure");
    }

    for (const lesson of module.lessons) {
      if (
        typeof lesson.title !== "string" ||
        typeof lesson.estimatedMinutes !== "number"
      ) {
        throw new Error("AI returned an invalid lesson structure");
      }
    }
  }

  return parsed;
};


const callOpenRouter = async (prompt: string): Promise<string> => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
      "X-Title": "LearnAI",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content: "You are an expert educational AI. Return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens:  5000,
      response_format: {
        type: "json_object",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`OpenRouter error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned an empty response");
  }

  return content;
};

export const generateLessonContent = async (
  input: GenerateLessonContentInput,
): Promise<LessonContent> => {
  const prompt = `
Create detailed educational content for this lesson.

Course: ${input.courseTitle}
Goal: ${input.courseGoal}
Level: ${input.courseLevel}
Learning Style: ${input.learningStyle}

Module: ${input.moduleTitle}
Module Description: ${input.moduleDescription}

Lesson: ${input.lessonTitle}
Estimated Minutes: ${input.estimatedMinutes}

Return ONLY valid JSON.

Use this structure:

{
  "slug": "url-friendly-slug",

  "explanation": "Detailed explanation of the lesson.",

  "keyConcepts": [
    "concept 1",
    "concept 2",
    "concept 3"
  ],

  "examples": [
    {
      "title": "Example title",
      "description": "What this demonstrates",
      "example": "Example content"
    }
  ],

  "codeExamples": [
    {
      "title": "Example title",
      "language": "html",
      "code": "code here",
      "explanation": "Explanation"
    }
  ],

  "commonMistakes": [
    "Mistake 1",
    "Mistake 2"
  ],

  "exercises": [
    {
      "title": "Exercise title",
      "description": "Exercise instructions",
      "difficulty": "BEGINNER",
      "hints": ["hint 1", "hint 2"]
    }
  ],

  "quiz": {
    "title": "Lesson Quiz",
    "description": "Quiz description",
    "questions": [
      {
        "question": "Question?",
        "type": "MULTIPLE_CHOICE",
        "options": ["A", "B", "C", "D"],
        "answer": "A",
        "explanation": "Why A is correct",
        "difficulty": "BEGINNER",
        "points": 1
      }
    ]
  },

  "youtubeSearchQueries": [
    "search query 1",
    "search query 2"
  ]
}

Rules:

1. Explain the actual lesson.
2. Match the learner's level.
3. Give practical examples.
4. For programming lessons, provide real code.
5. Create 3-5 key concepts.
6. Create 2-3 examples.
7. Create 1-2 code examples when relevant.
8. Create 2-3 common mistakes.
9. Create 2 exercises.
10. Create exactly 3 quiz questions.
11. Multiple choice questions must have 4 options.
12. Do not invent YouTube URLs or video IDs.
13. Return YouTube search queries only.
14. Return valid JSON only.
`;



const content = await callOpenRouter(prompt);

console.log("=================================");
console.log("RAW AI RESPONSE:");
console.log(content);
console.log("=================================");

let parsed: LessonContent;

try {
  // First attempt: response is already valid JSON
  parsed = JSON.parse(content.trim());
} catch (firstError) {
  console.log(
    "Direct JSON parsing failed. Trying to extract JSON..."
  );

  try {
    const cleaned = content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1 ||
      lastBrace <= firstBrace
    ) {
      throw new Error(
        "No JSON object found in AI response"
      );
    }

    const jsonString = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );

    console.log("EXTRACTED JSON:");
    console.log(jsonString);

    parsed = JSON.parse(jsonString);
  } catch (secondError) {
    console.error(
      "================================="
    );
    console.error("AI JSON PARSE FAILED");
    console.error(
      "================================="
    );

    console.error("Raw response:");
    console.error(content);

    console.error("First parse error:");
    console.error(firstError);

    console.error("Second parse error:");
    console.error(secondError);

    throw new Error(
      "AI returned invalid JSON. Please try generating the lesson again."
    );
  }
}

  if (
    !parsed ||
    typeof parsed.slug !== "string" ||
    typeof parsed.explanation !== "string" ||
    !Array.isArray(parsed.keyConcepts) ||
    !Array.isArray(parsed.examples) ||
    !Array.isArray(parsed.codeExamples) ||
    !Array.isArray(parsed.commonMistakes) ||
    !Array.isArray(parsed.exercises) ||
    !parsed.quiz ||
    !Array.isArray(parsed.quiz.questions) ||
    !Array.isArray(parsed.youtubeSearchQueries)
  ) {
    throw new Error("AI returned invalid lesson content");
  }

  return parsed;
};

interface GenerateLessonContentInput {
  courseTitle: string;
  courseGoal: string;
  courseLevel: string;
  learningStyle: string;
  moduleTitle: string;
  moduleDescription: string;
  lessonTitle: string;
  estimatedMinutes: number;
}

export interface LessonContent {
  slug: string;
  explanation: string;
  keyConcepts: string[];
  examples: any[];
  codeExamples: any[];
  commonMistakes: string[];
  exercises: any[];
  quiz: {
    title: string;
    description: string;
    questions: any[];
  };
  youtubeSearchQueries: string[];
}
