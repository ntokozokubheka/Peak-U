// Coach AI: calls the Google Gemini API from the server so the key never reaches the browser.
// No API key? Every function returns a clearly labelled sample (demo: true) so a demo never breaks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
// CUSTOMIZE: edit server/prompts/coach.md to change how the coach behaves.
const COACH_PROMPT = fs.readFileSync(path.join(dir, '../../prompts/coach.md'), 'utf8');
export const hasKey = () => Boolean(process.env.GEMINI_API_KEY);

async function callGemini({ contents, maxTokens = 1400 }, retries = 3, delay = 1000) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash'; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: COACH_PROMPT + '\n\nYou are being called by an app. Reply with ONLY one valid JSON object, no markdown code blocks.' }]
        },
        contents: contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json'
        }
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      // If we hit a 503 (Service Unavailable) or 429 (Rate Limit) and have retries left
      if ((res.status === 503 || res.status === 429) && retries > 0) {
        console.warn(`[server] Gemini API ${res.status}. Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return callGemini({ contents, maxTokens }, retries - 1, delay * 2);
      }
      throw new Error(`Gemini API ${res.status}: ${errorBody}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response received from Gemini API');
    
    return JSON.parse(text);
  } catch (error) {
    if (retries > 0 && (error.message.includes('503') || error.message.includes('UNAVAILABLE') || error.message.includes('429'))) {
      console.warn(`[server] Network/API unavailable or rate limited. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGemini({ contents, maxTokens }, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function breakdownProblem({ imageBase64, mediaType, text, taskType, helpMode, attempt }) {
  if (!hasKey()) return DEMO.breakdown;
  
  const parts = [];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: mediaType || 'image/jpeg',
        data: imageBase64
      }
    });
  }
  
  parts.push({
    text: `Task type chosen by student: ${taskType || 'detect it'}.
Help mode: ${helpMode === 'check' ? 'check my working' : 'guide me with hints first'}.
Student text: ${text || '(see image)'}
${attempt ? `Student attempt: ${attempt}` : ''}
Coach the student, do not solve it for them. Never write a final essay, full assignment code or fake lab data. For maths and physics give the method and checks, not the final answer.
Return JSON: {"taskType":"maths|physics|lab|writing|coding|other","topic":"","difficulty":"easy|medium|hard","estimatedMinutes":0,"steps":[{"title":"","guidance":""}],"hints":["",""],"drill":"","coachQuestion":"","celebrate":""}`
  });

  return callGemini({ contents: [{ role: 'user', parts }] });
}

export async function similarProblem({ topic, difficulty, taskType }) {
  if (!hasKey()) return DEMO.similar;
  
  return callGemini({
    maxTokens: 900,
    contents: [{
      role: 'user',
      parts: [{ text: `Write ONE new practice problem on "${topic}" (${taskType || 'any'}), difficulty: ${difficulty || 'same'}. It must be different from any assignment the student may have. Return JSON: {"problem":"","hint":"","answerForSelfCheck":""}` }]
    }]
  });
}

export async function generatePaper({ moduleName, minutes }) {
  if (!hasKey()) return DEMO.paper;
  
  return callGemini({
    maxTokens: 3000,
    contents: [{
      role: 'user',
      parts: [{ text: `Write one practice exam paper for "${moduleName}" that takes ${minutes} minutes, in a typical university exam format with sections and marks. Return JSON: {"title":"","durationMinutes":0,"sections":[{"name":"","marks":0,"questions":[{"n":1,"text":"","marks":0}]}],"markingGuide":[{"n":1,"points":[""]}]}` }]
    }]
  });
}

const DEMO = {
  breakdown: { 
    demo: true, 
    taskType: 'maths', 
    topic: 'Sample topic (demo mode: add GEMINI_API_KEY for real answers)', 
    difficulty: 'medium', 
    estimatedMinutes: 25,
    steps: [
      { title: 'Map what you know', guidance: 'List the given values and the target before touching any formula.' }, 
      { title: 'Pick the method', guidance: 'Which rule from this week\'s lecture connects the givens to the target?' }, 
      { title: 'Work it through, then sense-check', guidance: 'Check units and ask if the size of your answer makes sense.' }
    ],
    hints: ['Start by writing the target in one sentence.', 'Look for a quantity that stays constant.'], 
    drill: 'Solve two easier versions of this problem without hints, then try this one again.', 
    coachQuestion: 'What is the first thing the question is really asking you to find?', 
    celebrate: 'Clean protocol execution!' 
  },
  similar: { 
    demo: true, 
    problem: 'Sample practice problem (demo mode).', 
    hint: 'Break it into known and unknown quantities.', 
    answerForSelfCheck: 'Sample answer (demo mode).' 
  },
  paper: { 
    demo: true, 
    title: 'Sample practice paper (demo mode)', 
    durationMinutes: 120, 
    sections: [
      { name: 'Section A: Short questions', marks: 40, questions: [{ n: 1, text: 'Sample question 1', marks: 10 }, { n: 2, text: 'Sample question 2', marks: 10 }] }, 
      { name: 'Section B: Problems', marks: 60, questions: [{ n: 3, text: 'Sample problem', marks: 30 }] }
    ], 
    markingGuide: [{ n: 1, points: ['Sample marking point'] }] 
  },
};