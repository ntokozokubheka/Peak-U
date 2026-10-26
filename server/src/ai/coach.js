// Coach AI: calls the Claude API from the server so the key never reaches the browser.
// No API key? Every function returns a clearly labelled sample (demo: true) so a demo never breaks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
// CUSTOMIZE: edit server/prompts/coach.md to change how the coach behaves.
const COACH_PROMPT = fs.readFileSync(path.join(dir, '../../prompts/coach.md'), 'utf8');
export const hasKey = () => Boolean(process.env.ANTHROPIC_API_KEY);

async function callClaude({ content, maxTokens = 1400 }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: maxTokens,
      system: COACH_PROMPT + '\n\nYou are being called by an app. Reply with ONLY one JSON object, no markdown fences.',
      messages: [{ role: 'user', content }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
}

export async function breakdownProblem({ imageBase64, mediaType, text, taskType, helpMode, attempt }) {
  if (!hasKey()) return DEMO.breakdown;
  const content = [];
  if (imageBase64) content.push({ type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } });
  content.push({ type: 'text', text: `Task type chosen by student: ${taskType || 'detect it'}.
Help mode: ${helpMode === 'check' ? 'check my working' : 'guide me with hints first'}.
Student text: ${text || '(see image)'}
${attempt ? `Student attempt: ${attempt}` : ''}
Coach the student, do not solve it for them. Never write a final essay, full assignment code or fake lab data. For maths and physics give the method and checks, not the final answer.
Return JSON: {"taskType":"maths|physics|lab|writing|coding|other","topic":"","difficulty":"easy|medium|hard","estimatedMinutes":0,"steps":[{"title":"","guidance":""}],"hints":["",""],"drill":"","coachQuestion":"","celebrate":""}` });
  return callClaude({ content });
}

export async function similarProblem({ topic, difficulty, taskType }) {
  if (!hasKey()) return DEMO.similar;
  return callClaude({ maxTokens: 900, content: `Write ONE new practice problem on "${topic}" (${taskType || 'any'}), difficulty: ${difficulty || 'same'}. It must be different from any assignment the student may have. Return JSON: {"problem":"","hint":"","answerForSelfCheck":""}` });
}

export async function generatePaper({ moduleName, minutes }) {
  if (!hasKey()) return DEMO.paper;
  return callClaude({ maxTokens: 3000, content: `Write one practice exam paper for "${moduleName}" that takes ${minutes} minutes, in a typical university exam format with sections and marks. Return JSON: {"title":"","durationMinutes":0,"sections":[{"name":"","marks":0,"questions":[{"n":1,"text":"","marks":0}]}],"markingGuide":[{"n":1,"points":[""]}]}` });
}

const DEMO = {
  breakdown: { demo: true, taskType: 'maths', topic: 'Sample topic (demo mode: add ANTHROPIC_API_KEY for real answers)', difficulty: 'medium', estimatedMinutes: 25,
    steps: [{ title: 'Map what you know', guidance: 'List the given values and the target before touching any formula.' }, { title: 'Pick the method', guidance: 'Which rule from this week\'s lecture connects the givens to the target?' }, { title: 'Work it through, then sense-check', guidance: 'Check units and ask if the size of your answer makes sense.' }],
    hints: ['Start by writing the target in one sentence.', 'Look for a quantity that stays constant.'], drill: 'Solve two easier versions of this problem without hints, then try this one again.', coachQuestion: 'What is the first thing the question is really asking you to find?', celebrate: 'Clean protocol execution!' },
  similar: { demo: true, problem: 'Sample practice problem (demo mode).', hint: 'Break it into known and unknown quantities.', answerForSelfCheck: 'Sample answer (demo mode).' },
  paper: { demo: true, title: 'Sample practice paper (demo mode)', durationMinutes: 120, sections: [{ name: 'Section A: Short questions', marks: 40, questions: [{ n: 1, text: 'Sample question 1', marks: 10 }, { n: 2, text: 'Sample question 2', marks: 10 }] }, { name: 'Section B: Problems', marks: 60, questions: [{ n: 3, text: 'Sample problem', marks: 30 }] }], markingGuide: [{ n: 1, points: ['Sample marking point'] }] },
};
