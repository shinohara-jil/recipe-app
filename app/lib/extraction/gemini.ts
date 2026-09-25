import { GoogleGenAI } from '@google/genai';
import type { ImagePart } from './sources';

export const GEMINI_MODEL = 'gemini-3.8-flash';

export interface RecipeFeatures {
  taste: string[];
  main_ingredients: string[];
  genre: string;
  effort: string;
  cooking_time_minutes: number;
  scenes: string[];
  summary: string;
}

export interface ExtractedIngredient {
  name: string;
  amount: string;
  standard_name: string;
  is_guess: boolean;
}

export interface ExtractionResult {
  found: boolean;
  servings: string;
  ingredients: ExtractedIngredient[];
  features: RecipeFeatures;
  note: string;
}

const SCHEMA = {
  type: 'object',
  required: ['found', 'servings', 'ingredients', 'features', 'note'],
  properties: {
    found: { type: 'boolean', description: 'このレシピの材料を1つ以上特定できたらtrue' },
    servings: { type: 'string', description: '何人分か（不明なら空文字）' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'amount', 'standard_name', 'is_guess'],
        properties: {
          name: { type: 'string', description: '原文どおりの材料名' },
          amount: { type: 'string', description: '分量。原文の表記のまま。不明なら空文字' },
          standard_name: { type: 'string', description: '買い物で使う一般的な名前。家にある物リストに該当すればその名前と完全に同じ表記' },
          is_guess: { type: 'boolean' },
        },
      },
    },
    features: {
      type: 'object',
      required: ['taste', 'main_ingredients', 'genre', 'effort', 'cooking_time_minutes', 'scenes', 'summary'],
      properties: {
        taste: { type: 'array', items: { type: 'string' }, description: '味の方向性（さっぱり、こってり、甘辛、ピリ辛 など）' },
        main_ingredients: { type: 'array', items: { type: 'string' } },
        genre: { type: 'string', enum: ['和食', '洋食', '中華', '韓国', 'エスニック', 'その他'] },
        effort: { type: 'string', enum: ['簡単', 'ふつう', '手間がかかる'] },
        cooking_time_minutes: { type: 'integer', description: '調理時間の目安（分）。わからなければ推定' },
        scenes: { type: 'array', items: { type: 'string' }, description: '向いている場面・季節（夏向け、お弁当、作り置き、おつまみ など）' },
        summary: { type: 'string', description: 'どんな料理か1文で' },
      },
    },
    note: { type: 'string', description: '読み取りについての補足（推測した理由、読めなかった部分など）' },
  },
};

const SYSTEM = `あなたは家庭料理レシピの材料を整理するアシスタントです。
与えられた情報（Webページの本文、SNSの投稿、画像）から、指定されたレシピの材料・分量と、レシピの特徴を取り出してください。

ルール:
- 材料と分量が書かれていれば、書かれているとおりに取り出す（is_guess=false）。分量の表記は原文のまま。
- 指定されたレシピ名は、利用者が自分でつけた呼び名のことがある（例：ページでは「簡単チーズリゾット」、登録名は「櫂君リゾット」）。ページにレシピが1つだけなら、名前が違ってもそのレシピを対象にする。
- ページに複数のレシピがある場合は、指定されたレシピ名に最も近いものだけを対象にする。
- 材料が書かれておらず、完成写真や料理名・説明文から推測するしかない場合は、推測した材料に is_guess=true をつける。分量がわからなければ空文字。
- 材料がまったく判断できない場合（関係ないページ、ログイン画面など）は found=false、ingredients は空にする。
- standard_name は、ブランド名・切り方・下ごしらえ・種類の細かい違いを外した一般的な名前にする（例：「豚ロース薄切り肉（しゃぶしゃぶ用）」→「豚ロース薄切り肉」、「あらびき黒胡椒」→「こしょう」、「濃口しょうゆ」→「しょうゆ」、「料理酒」→「酒」）。
- 「家にある物リスト」に同じ物があれば、standard_name はリストの表記と完全に同じにする。ただし塩麹・めんつゆ以外の加工調味料や、別の食材が混ざったものを無理に当てはめない。
- 「A」「B」などの合わせ調味料のグループ記号は材料名に含めず、中身をそれぞれ1つの材料として出す。
- 水（お湯・氷水を含む）は買う必要がないので材料に含めない。
- features は材料と作り方から判断する。`;

let client: GoogleGenAI | null = null;
export function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY が設定されていません');
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export async function askGemini(title: string, pantry: string[], text: string | null, images: ImagePart[]): Promise<ExtractionResult> {
  const interaction = await getGeminiClient().interactions.create({
    model: GEMINI_MODEL,
    store: false,
    system_instruction: SYSTEM,
    input: [
      ...images.map((i) => ({ type: 'image' as const, data: i.data, mime_type: i.mimeType })),
      ...(text ? [{ type: 'text' as const, text }] : []),
      { type: 'text' as const, text: `対象のレシピ名: ${title}\n家にある物リスト: ${pantry.join('、')}` },
    ],
    response_format: { type: 'text', mime_type: 'application/json', schema: SCHEMA },
  });
  if (interaction.status !== 'completed' || !interaction.output_text) {
    throw new Error(`AIの応答が不完全です（${interaction.status}）`);
  }
  return JSON.parse(interaction.output_text) as ExtractionResult;
}
