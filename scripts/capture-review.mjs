import { writeFile } from 'node:fs/promises';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const response = JSON.parse(input);
if (!response.ok || !response.result?.data) throw new Error(JSON.stringify(response.error || response));
await writeFile(process.argv[2], Buffer.from(response.result.data, 'base64'));
console.log(process.argv[2]);
