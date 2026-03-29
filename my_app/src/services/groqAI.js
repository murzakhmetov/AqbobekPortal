const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function askGroq(systemPrompt, userMessage, options = {}) {
  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq AI Error:', error);
    throw error;
  }
}

export function buildStudentAnalysisPrompt(studentData, lang = 'ru') {
  const langInstruction = lang === 'ru' 
    ? 'Отвечай на русском языке.' 
    : 'Respond in English.';
  
  return `Ты — AI-тьютор в школе Aqbobek Lyceum в Казахстане. ${langInstruction}
Анализируй оценки ученика и давай конкретные рекомендации.
Используй предиктивную аналитику: прогнозируй вероятности и риски.
Формат: конкретные проценты, конкретные темы, конкретные действия.
Не будь общим — будь максимально конкретным.
Данные ученика: ${JSON.stringify(studentData)}`;
}

export function buildTeacherReportPrompt(classData, lang = 'ru') {
  const langInstruction = lang === 'ru'
    ? 'Напиши отчёт на русском языке.'
    : 'Write the report in English.';

  return `Ты — AI-помощник учителя в школе Aqbobek Lyceum. ${langInstruction}
Сгенерируй подробный текстовый отчёт об успеваемости класса для классного руководства.
Включи: общую картину, учеников в зоне риска, лучших, тренды, рекомендации.
Данные класса: ${JSON.stringify(classData)}`;
}

export function buildParentSummaryPrompt(childData, lang = 'ru') {
  const langInstruction = lang === 'ru'
    ? 'Напиши сводку на русском языке.'
    : 'Write the summary in English.';

  return `Ты — AI-помощник для родителей в школе Aqbobek Lyceum. ${langInstruction}
Сделай краткую еженедельную сводку для родителя о прогрессе ребёнка.
Будь дружелюбным, конкретным. Упомяни успехи и зоны внимания. Дай 1-2 рекомендации.
Данные ребёнка: ${JSON.stringify(childData)}`;
}
