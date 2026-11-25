// Uso: GEMINI_API_KEY no ambiente e node tools/piloto-trie.mjs
import { readFile, writeFile, access } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const lessonPath = new URL('content/aeds-ii/topicos/arvore-trie/aula-narrada.md', root);
const markdown = await readFile(lessonPath, 'utf8');
const lesson = JSON.parse(markdown.match(/^```aula-narrada\s*\n([\s\S]*?)\n```/m)[1]);
const clip = lesson.slides[0].clips[0];
const flow = lesson.config.flow;
const portrait = await readFile(new URL('assets/illustrations/avatar-aula.png', root));
const prompt = `Use the character in the reference image as the professor. ${flow.cena}. ${clip.direction}. Speak exactly this dialogue in Brazilian Portuguese: "${clip.speech}" No music or on-screen text.`;
const format = { type: 'video', aspect_ratio: flow.aspecto, duration: clip.durationSeconds + 's', resolution: flow.resolucaoTeste };
if (process.argv.includes('--preview')) {
  console.log(format, prompt);
  process.exit(0);
}
const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) throw new Error('Configure GEMINI_API_KEY no ambiente local para gerar o piloto.');
const output = 'piloto-trie-s01-c1.mp4';
if (await access(output).then(() => true, () => false)) throw new Error('O arquivo de saída já existe: ' + output);
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
  body: JSON.stringify({
    model: 'gemini-omni-1.2-flash',
    input: [{ type: 'image', mime_type: 'image/png', data: portrait.toString('base64') }, { type: 'text', text: prompt }],
    response_format: { ...format, delivery: 'inline' }
  })
});
if (!response.ok) throw new Error('A API retornou HTTP ' + response.status);
const result = await response.json();
const media = result.steps?.filter(s => s.type === 'model_output').flatMap(s => s.content).find(c => c.type === 'video' && c.data);
if (!media) throw new Error('Resposta sem vídeo. Interação: ' + result.id);
await writeFile(output, Buffer.from(media.data, 'base64'), { flag: 'wx' });
console.log(output);
