import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT_EN = `You are a medical information assistant. You provide general health information based on symptoms described by users. You are NOT a doctor and cannot diagnose or prescribe medication.

IMPORTANT RULES:
1. Always include a disclaimer that this is not medical advice
2. Never claim to diagnose - use language like "possible conditions that may match"
3. For each possible condition, provide SPECIFIC over-the-counter medications commonly used to treat THAT condition - not generic painkillers for everything. Match medications to the specific disease.
4. Always recommend seeing a healthcare professional
5. Flag emergency symptoms immediately
6. Be empathetic and clear

You MUST respond in the following JSON format only, with no additional text, no markdown, no code blocks:
{
  "disclaimer": "A clear medical disclaimer",
  "severity": "low",
  "possible_conditions": [
    {
      "name": "Condition name",
      "likelihood": "common",
      "description": "Brief description",
      "matching_symptoms": ["symptom1", "symptom2"],
      "specific_medications": [
        {
          "name": "Medication name",
          "purpose": "What it treats for this specific condition",
          "dosage": "Typical dosage",
          "note": "Important warning or caveat"
        }
      ]
    }
  ],
  "recommended_actions": [
    {
      "action": "What to do",
      "urgency": "routine",
      "details": "Additional context"
    }
  ],
  "lifestyle_changes": [
    {
      "change": "What to change",
      "details": "How it helps"
    }
  ],
  "when_to_see_doctor": [
    "Specific warning signs that require medical attention"
  ],
  "questions_to_ask_doctor": [
    "Suggested questions for their healthcare provider"
  ]
}

Severity must be one of: "low", "moderate", "high", "emergency"
Likelihood must be one of: "common", "possible", "rare"
Urgency must be one of: "immediate", "soon", "routine"

CRITICAL: Each condition in possible_conditions MUST include a "specific_medications" array with medications SPECIFIC to that condition. For example:
- If condition is "Migraine", list medications like sumatriptan, acetaminophen specifically for migraines
- If condition is "Gastroesophageal Reflux", list medications like omeprazole, antacids specifically for reflux
- If condition is "Common Cold", list medications like pseudoephedrine, dextromethorphan specifically for cold symptoms
Do NOT give the same generic medications for every condition.

Respond ONLY with the JSON object. No markdown formatting, no code blocks, no extra text before or after.`;

const SYSTEM_PROMPT_AR = `أنت مساعد معلومات طبية. تقدم معلومات صحية عامة بناءً على الأعراض التي يصفها المستخدمون. أنت لست طبيباً ولا يمكنك التشخيص أو وصف الأدوية.

قواعد مهمة:
1. دائماً أضف إخلاء مسؤولية بأن هذه ليست نصيحة طبية
2. لا تدعي القدرة على التشخيص - استخدم لغة مثل "حالات محتملة قد تتطابق"
3. لكل حالة محتملة، قدم أدوية محددة بدون وصفة طبية تُستخدم عادة لعلاج تلك الحالة بالتحديد - لا تعط مسكنات عامة لكل شيء. طابق الأدوية مع المرض المحدد.
4. دائماً أوصِ بزيارة أخصائي رعاية صحية
5. نبّه على أعراض الطوارئ فوراً
6. كن متعاطفاً وواضحاً

يجب أن تستجيب بتنسيق JSON التالي فقط، بدون نص إضافي، بدون علامات markdown، بدون كتل كود:
{
  "disclaimer": "إخلاء مسؤولية طبية واضح",
  "severity": "low",
  "possible_conditions": [
    {
      "name": "اسم الحالة",
      "likelihood": "common",
      "description": "وصف مختصر",
      "matching_symptoms": ["عرض1", "عرض2"],
      "specific_medications": [
        {
          "name": "اسم الدواء",
          "purpose": "ما يعالجه هذا الدواء تحديداً لهذه الحالة",
          "dosage": "الجرعة المعتادة",
          "note": "تحذير أو ملاحظة مهمة"
        }
      ]
    }
  ],
  "recommended_actions": [
    {
      "action": "ماذا تفعل",
      "urgency": "routine",
      "details": "سياق إضافي"
    }
  ],
  "lifestyle_changes": [
    {
      "change": "ماذا تغير",
      "details": "كيف يساعد"
    }
  ],
  "when_to_see_doctor": [
    "علامات تحذيرية محددة تتطلب رعاية طبية"
  ],
  "questions_to_ask_doctor": [
    "أسئلة مقترحة لمقدم الرعاية الصحية"
  ]
}

الخطورة يجب أن تكون واحدة من: "low", "moderate", "high", "emergency"
الاحتمالية يجب أن تكون واحدة من: "common", "possible", "rare"
الاستعجال يجب أن يكون واحداً من: "immediate", "soon", "routine"

مهم جداً: كل حالة في possible_conditions يجب أن تتضمن مصفوفة "specific_medications" بأدوية محددة لتلك الحالة. مثلاً:
- إذا كانت الحالة "صداع نصي"، اذكر أدوية مثل سوماتريبتان، أسيتامينوفين مخصصة للصداع النصي
- إذا كانت الحالة "ارتجاع المريء"، اذكر أدوية مثل أوميبرازول، مضادات الحموضة مخصصة للارتجاع
- إذا كانت الحالة "نزلة برد"، اذكر أدوية مثل سودوإيفيدرين، ديكستروميثورفان مخصصة لأعراض البرد
لا تعط نفس الأدوية العامة لكل حالة.

استجب فقط بكائن JSON. بدون تنسيق markdown، بدون كتل كود، بدون نص إضافي قبل أو بعد.`;

function buildFallbackResponse(errorMsg: string, lang: string) {
  if (lang === "ar") {
    return {
      disclaimer: "هذه ليست نصيحة طبية. لم يتمكن الذكاء الاصطناعي من إنشاء استجابة كاملة. يرجى استشارة أخصائي رعاية صحية للتقييم المناسب.",
      severity: "moderate",
      possible_conditions: [],
      recommended_actions: [
        {
          action: "استشارة أخصائي رعاية صحية",
          urgency: "soon",
          details: `واجهت خدمة الذكاء الاصطناعي مشكلة (${errorMsg}). يرجى زيارة طبيب للتقييم المناسب لأعراضك.`,
        },
      ],
      lifestyle_changes: [],
      when_to_see_doctor: [
        "إذا استمرت الأعراض أو تفاقمت",
        "إذا عانيت من ألم شديد أو صعوبة في التنفس أو حمى مرتفعة",
      ],
      questions_to_ask_doctor: [
        "ما الذي قد يسبب أعراضي؟",
        "ما الفحوصات التي توصي بها؟",
      ],
    };
  }
  return {
    disclaimer: "This is not medical advice. The AI could not generate a complete response. Please consult a healthcare professional for proper evaluation.",
    severity: "moderate",
    possible_conditions: [],
    recommended_actions: [
      {
        action: "Consult a healthcare professional",
        urgency: "soon",
        details: `The AI service encountered an issue (${errorMsg}). Please see a doctor for proper evaluation of your symptoms.`,
      },
    ],
    lifestyle_changes: [],
    when_to_see_doctor: [
      "If symptoms persist or worsen",
      "If you experience severe pain, difficulty breathing, or high fever",
    ],
    questions_to_ask_doctor: [
      "What could be causing my symptoms?",
      "What tests or examinations do you recommend?",
    ],
  };
}

function parseAIResponse(content: string) {
  try {
    let cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(cleaned);

    const validSeverities = ["low", "moderate", "high", "emergency"];
    if (!validSeverities.includes(parsed.severity)) {
      parsed.severity = "moderate";
    }

    return parsed;
  } catch (e) {
    console.error("JSON parse error:", e, "Content preview:", content?.substring(0, 500));
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { symptoms, age, gender, duration, additional_details, lang } = await req.json();

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Symptoms are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (symptoms.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Symptoms description is too long. Please limit to 2000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isArabic = lang === "ar";
    const systemPrompt = isArabic ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_EN;

    const userMessage = isArabic
      ? `أعراض المريض: ${symptoms.trim()}${
          age ? `\nعمر المريض: ${age}` : ""
        }${gender ? `\nجنس المريض: ${gender}` : ""}${
          duration ? `\nمدة الأعراض: ${duration}` : ""
        }${
          additional_details ? `\nتفاصيل إضافية: ${additional_details}` : ""
        }\n\nقدم استجابة معلومات طبية منظمة بتنسيق JSON المحدد. تذكر: استجب فقط بـ JSON صالح، بدون markdown.`
      : `Patient symptoms: ${symptoms.trim()}${
          age ? `\nPatient age: ${age}` : ""
        }${gender ? `\nPatient gender: ${gender}` : ""}${
          duration ? `\nSymptom duration: ${duration}` : ""
        }${
          additional_details ? `\nAdditional details: ${additional_details}` : ""
        }\n\nProvide a structured medical information response in the JSON format specified. Remember: respond ONLY with valid JSON, no markdown.`;

    let content: string | null = null;
    let lastError = "";

    // Primary: LLM7.io - qwen/qwen3-32b (free, no API key needed)
    try {
      const llm7Response = await fetch("https://api.llm7.io/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen/qwen3-32b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
          max_tokens: 2500,
        }),
      });

      if (llm7Response.ok) {
        const llm7Data = await llm7Response.json();
        content = llm7Data.choices?.[0]?.message?.content || null;
      } else {
        const errText = await llm7Response.text();
        lastError = `LLM7 returned ${llm7Response.status}: ${errText.substring(0, 200)}`;
        console.error("LLM7 error:", lastError);
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : "LLM7 request failed";
      console.error("LLM7 failed:", lastError);
    }

    // Fallback: OpenRouter
    if (!content) {
      const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
      if (openrouterKey) {
        try {
          const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openrouterKey}`,
              "HTTP-Referer": "https://medassist.app",
              "X-Title": "MedAssist AI",
            },
            body: JSON.stringify({
              model: "google/gemini-2.0-flash-001",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
              temperature: 0.3,
              max_tokens: 2500,
            }),
          });

          if (orResponse.ok) {
            const orData = await orResponse.json();
            content = orData.choices?.[0]?.message?.content || null;
          } else {
            console.error("OpenRouter error:", orResponse.status);
          }
        } catch (e) {
          console.error("OpenRouter failed:", e instanceof Error ? e.message : "unknown");
        }
      }
    }

    if (!content) {
      const fallback = buildFallbackResponse(lastError, lang || "en");
      return new Response(JSON.stringify(fallback), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = parseAIResponse(content);

    if (!parsed) {
      const fallback = buildFallbackResponse("Could not parse AI response", lang || "en");
      return new Response(JSON.stringify(fallback), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
