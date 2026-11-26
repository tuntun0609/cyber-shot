// 一次性导入脚本：把 content/*.json 转成 INSERT 语句，写到 outputs/catalog-import.sql。
// 用法：bun run scripts/import-catalog.ts，再用 wrangler d1 execute --file 执行。
// 导入完成并验证后，连同三份 JSON 一起删除。
import { mkdir, readFile, writeFile } from "node:fs/promises";

const CATEGORIES = [
  { category: "hair", file: "hairstyles" },
  { category: "body", file: "bodies" },
  { category: "pose", file: "poses" },
] as const;

const GENDERS = new Set(["female", "male", "any"]);
const OUTPUT_DIR = "outputs";

interface Entry {
  gender: string;
  id: string;
  image: string;
  imageAspectRatio?: number;
  name: string;
  promptEn: string;
  promptZh: string;
  tags: string[];
  thumb: string;
  thumbAspectRatio?: number;
}

function text(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function num(value: number | undefined): string {
  return value === undefined ? "NULL" : String(value);
}

function assertEntry(entry: Entry, file: string) {
  if (!(Array.isArray(entry.tags) && GENDERS.has(entry.gender))) {
    throw new Error(`${file} 中的 ${entry.id} 字段不合法`);
  }
}

const statements: string[] = [];
const mapping: string[] = [];
const seen = new Set<string>();
let nextId = 1;

const loaded: Entry[][] = await Promise.all(
  CATEGORIES.map(async ({ file }) =>
    JSON.parse(await readFile(`content/${file}.json`, "utf8"))
  )
);

for (const [index, { category, file }] of CATEGORIES.entries()) {
  const entries = loaded[index] ?? [];
  console.log(`${category}: ${entries.length} 条`);
  for (const entry of entries) {
    assertEntry(entry, file);
    if (seen.has(entry.id)) {
      throw new Error(`素材 id 重复：${entry.id}`);
    }
    seen.add(entry.id);
    // 显式写入 id，保证新编号与对照表一致；AUTOINCREMENT 会据此推进序列
    statements.push(
      `INSERT INTO catalog_items (id, category, name, prompt_en, prompt_zh, tags, gender, image, thumb, image_aspect_ratio, thumb_aspect_ratio) VALUES (${nextId}, ${text(category)}, ${text(entry.name)}, ${text(entry.promptEn)}, ${text(entry.promptZh)}, ${text(JSON.stringify(entry.tags))}, ${text(entry.gender)}, ${text(entry.image)}, ${text(entry.thumb)}, ${num(entry.imageAspectRatio)}, ${num(entry.thumbAspectRatio)});`
    );
    mapping.push(`${entry.id}\t${nextId}\t${category}\t${entry.name}`);
    nextId += 1;
  }
}

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(
  `${OUTPUT_DIR}/catalog-import.sql`,
  `${statements.join("\n")}\n`
);
await writeFile(
  `${OUTPUT_DIR}/catalog-id-mapping.tsv`,
  `${mapping.join("\n")}\n`
);
console.log(
  `共 ${statements.length} 条，已写入 ${OUTPUT_DIR}/catalog-import.sql`
);
console.log(`旧编号对照表：${OUTPUT_DIR}/catalog-id-mapping.tsv`);
