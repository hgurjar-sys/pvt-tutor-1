import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60; // Allow 60 seconds for the AI generation

// Initialize Supabase admin client to bypass RLS for server-side insertion if needed, 
// though we currently set RLS to true for all.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { materialId, studentId, instructions, questionTypes, assessmentTitle } = body;

    if (!materialId || !assessmentTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch the material from Supabase to get the file_path
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)
      .single();

    if (materialError || !material) throw new Error("Material not found");

    // 2. Download the PDF file from the URL
    console.log("Downloading PDF from:", material.file_path);
    const pdfResponse = await fetch(material.file_path);
    if (!pdfResponse.ok) throw new Error("Failed to download PDF");
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. We use Gemini's built-in PDF vision/reading capability instead of pdf-parse!
    // This avoids all the Node.js DOMMatrix and Turbopack build errors.
    const base64Data = buffer.toString("base64");

    const dynamicTypesPrompt = questionTypes && questionTypes.length > 0 
      ? `Types of questions requested: ${questionTypes.join(', ')}.`
      : `Types of questions: Analyze the textbook chapter in the PDF and generate questions using the EXACT same formats, styles, and types that are inherently used by the author in the text.`;

    // 4. Prompt Gemini
    const systemPrompt = `
You are an expert private educator creating customized assessments for a Gujarati-medium student learning English.
Generate a highly structured assessment based on the attached PDF textbook material.

${dynamicTypesPrompt}
CRITICAL INSTRUCTION: Please prioritize extracting and adapting the ACTUAL questions provided at the end of the chapter or within the text exercises itself if applicable. 

Additional instructions from the tutor: ${instructions || "None."}

Ensure the questions test comprehension and are clear for a Gujarati-medium student (you may include slight Gujarati instructional hints if deemed helpful, but keep the core questions in English).

Format the output strictly as a JSON object with this shape:
{
  "questions": [
    {
      "type": "multiple_choice | fill_in_blank | short_answer | true_false | match_following",
      "question": "The question text (for match_following, clearly structure the items to be matched).",
      "options": ["Option A", "Option B", "Option C"], // Include ONLY if multiple choice OR match_following
      "points": 2 // Assess difficulty and assign an integer value (1-5 points)
    }
  ],
  "answer_key": [
    {
      "question": "The question text",
      "answer": "The correct answer or explanation (or correct matches)",
      "rubric": "Clear instructions for the tutor on how to award partial or full points (e.g. 1 point for mentioning X, 1 point for Y format)."
    }
  ],
  "total_points": 20 // MUST BE EXACTLY the sum of all points across all questions.
}`;

    console.log("Sending PDF & prompt to Gemini...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data
              }
            },
            { text: systemPrompt }
          ]
        }
      ]
    });

    const aiText = response.text || "";
    
    // 5. Parse JSON from AI response
    // Sometimes the AI wraps it in ```json ... ```
    let parsedData = null;
    try {
      const jsonStr = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", aiText);
      throw new Error("AI returned an invalid format.");
    }

    // 6. Save Assessment to Supabase
    const { data: assessmentData, error: insertError } = await supabase
      .from('assessments')
      .insert([{
        title: assessmentTitle,
        material_id: materialId,
        student_id: studentId || null,
        questions: parsedData.questions,
        answer_key: parsedData.answer_key,
        total_points: parsedData.total_points || 100,
        score: null
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, assessmentId: assessmentData.id });

  } catch (error: any) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate assessment" }, { status: 500 });
  }
}
