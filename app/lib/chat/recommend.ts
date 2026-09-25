import { getGeminiClient, type RecipeFeatures } from '@/app/lib/extraction/gemini';

// 相談は回数が多いので、安いモデルを使う
export const CHAT_MODEL = 'gemini-3.5-flash-lite';
const MAX_RECOMMENDATIONS = 3;

export interface CatalogRecipe {
  id: string;
  title: string;
  features: RecipeFeatures | null;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
  recipeIds?: string[]; // AIが提案したレシピ（「他のは？」に答えるため）
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
}

export interface ChatAnswer {
  reply: string;
  recommendations: Recommendation[];
  usage: { input: number; output: number };
}

const SCHEMA = {
  type: 'object',
  required: ['reply', 'recommendations'],
  properties: {
    reply: { type: 'string', description: '利用者への返事。1〜2文' },
    recommendations: {
      type: 'array',
      description: `おすすめのレシピ（最大${MAX_RECOMMENDATIONS}件）。合うものがなければ空`,
      items: {
        type: 'object',
        required: ['no', 'reason'],
        properties: {
          no: { type: 'integer', description: 'レシピ帳の番号' },
          reason: { type: 'string', description: 'おすすめの理由。20文字以内' },
        },
      },
    },
  },
};

const SYSTEM = `あなたは家庭のレシピ帳から今日の献立を一緒に選ぶアシスタントです。
利用者の気分・食べたいもの・状況（冷蔵庫にある食材、時間、疲れ具合など）を読み取り、レシピ帳の中から合うレシピを選んでください。

ルール:
- 提案してよいのはレシピ帳にあるレシピだけ。番号で指定する。新しい料理を考えて提案しない。
- 提案は最大${MAX_RECOMMENDATIONS}件。合う順に並べる。
- 合うものがなければ recommendations は空にして、条件をゆるめる案を返事で伝える。
- それまでの会話も踏まえる。「他のは？」と言われたら、すでに提案したものは避ける。
- レシピ帳の情報にないこと（カロリー、正確な辛さなど）は、料理名と食材から一般的な知識で判断してよい。
- 返事は親しみやすい日本語で1〜2文。レシピ名の羅列は返事に書かない（カードで表示されるため）。`;

// レシピ帳を1件1行の短い要約にする（毎回送るので短いほど安い）
// 例: 12. 豚しゃぶレタス｜和食・簡単・10分｜さっぱり・時短・夏向け｜豚肉,レタス
function catalogText(recipes: CatalogRecipe[]) {
  return recipes
    .map((r, i) => {
      const f = r.features;
      if (!f) return `${i + 1}. ${r.title}`;
      const tags = [...f.taste, ...f.scenes].slice(0, 5).join('・');
      return `${i + 1}. ${r.title}｜${f.genre}・${f.effort}・${f.cooking_time_minutes}分｜${tags}｜${f.main_ingredients.slice(0, 4).join(',')}`;
    })
    .join('\n');
}

function historyText(history: ChatTurn[], recipes: CatalogRecipe[]) {
  const titleOf = (id: string) => recipes.find((r) => r.id === id)?.title;
  return history
    .map((t) =>
      t.role === 'user'
        ? `利用者: ${t.text}`
        : `あなた: ${t.text}${t.recipeIds?.length ? `（提案: ${t.recipeIds.map(titleOf).filter(Boolean).join('、')}）` : ''}`
    )
    .join('\n');
}

export async function recommend(recipes: CatalogRecipe[], history: ChatTurn[], message: string): Promise<ChatAnswer> {
  // この会話ですでに提案したレシピ。「他のは？」で同じものを出さないよう、番号でも伝えてプログラムでも除く
  const suggested = new Set(history.flatMap((t) => t.recipeIds ?? []));
  const suggestedNos = recipes.map((r, i) => (suggested.has(r.id) ? i + 1 : 0)).filter(Boolean);

  const input = [
    `【レシピ帳】\n${catalogText(recipes)}`,
    history.length ? `【これまでの会話】\n${historyText(history, recipes)}` : '',
    suggestedNos.length ? `【すでに提案した番号（今回は選ばない）】\n${suggestedNos.join(', ')}` : '',
    `【利用者の新しい発言】\n${message}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const interaction = await getGeminiClient().interactions.create({
    model: CHAT_MODEL,
    store: false,
    system_instruction: SYSTEM,
    input,
    response_format: { type: 'text', mime_type: 'application/json', schema: SCHEMA },
  });
  if (interaction.status !== 'completed' || !interaction.output_text) {
    throw new Error(`AIの応答が不完全です（${interaction.status}）`);
  }

  const raw = JSON.parse(interaction.output_text) as { reply: string; recommendations: { no: number; reason: string }[] };
  // 番号がレシピ帳に実在するもので、まだ提案していないものだけを使う
  const seen = new Set<string>(suggested);
  const recommendations = raw.recommendations
    .map((r) => ({ recipe: recipes[r.no - 1], reason: r.reason }))
    .filter(({ recipe }) => recipe && !seen.has(recipe.id) && seen.add(recipe.id))
    .slice(0, MAX_RECOMMENDATIONS)
    .map(({ recipe, reason }) => ({ id: recipe.id, title: recipe.title, reason }));

  const u = interaction.usage;
  return {
    reply: raw.reply,
    recommendations,
    usage: { input: u?.total_input_tokens ?? 0, output: (u?.total_output_tokens ?? 0) + (u?.total_thought_tokens ?? 0) },
  };
}
