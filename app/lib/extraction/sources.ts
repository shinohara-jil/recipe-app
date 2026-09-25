// レシピのURL・画像から、AIに渡す材料の手がかり（本文・画像）を集める

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
// Instagram はリンクプレビュー用の情報（説明文）に投稿文が入っている
const PREVIEW_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const TIMEOUT_MS = 15000;
// AIに送る画像の合計サイズの上限（Gemini の1リクエストの上限より小さめ）
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export interface ImagePart {
  data: string; // base64
  mimeType: string;
}

export interface SourceContent {
  text: string;
  images: ImagePart[];
  label: string; // 画面に出す「何から読み取ったか」
}

async function fetchWithTimeout(url: string, userAgent: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent, 'Accept-Language': 'ja' },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

const fetchText = async (url: string, userAgent = BROWSER_UA) =>
  (await fetchWithTimeout(url, userAgent)).text();

export async function fetchImages(urls: string[]): Promise<ImagePart[]> {
  const images: ImagePart[] = [];
  let total = 0;
  for (const url of urls) {
    const res = await fetchWithTimeout(url, BROWSER_UA);
    let mimeType = (res.headers.get('content-type') || '').split(';')[0];
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) mimeType = 'image/jpeg';
    const buf = Buffer.from(await res.arrayBuffer());
    total += buf.length;
    if (total > MAX_IMAGE_BYTES) break;
    images.push({ data: buf.toString('base64'), mimeType });
  }
  return images;
}

function decodeEntities(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, x) => String.fromCodePoint(parseInt(x, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

// 多くのレシピサイトは、材料一覧を整理したデータ（構造化データ）をページに持っている
function findRecipeJsonLd(html: string) {
  for (const [, raw] of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(raw.trim());
      const items = [data, ...(Array.isArray(data) ? data : []), ...(data['@graph'] || [])].flat();
      const recipe = items.find((i) => i && [].concat(i['@type']).includes('Recipe' as never));
      if (recipe?.recipeIngredient?.length) return recipe;
    } catch {
      // 壊れた構造化データは無視する
    }
  }
  return null;
}

async function readWebPage(url: string): Promise<SourceContent> {
  let html = await fetchText(url);
  // t.co（Xの短縮リンク）は転送先URLがページ内に書かれているので、それをたどる
  const refresh = html.match(/URL=([^"'>\s]+)/i)?.[1];
  if (/^https?:\/\/t\.co\//.test(url) && refresh) html = await fetchText(decodeEntities(refresh));

  const recipe = findRecipeJsonLd(html);
  if (recipe) {
    return {
      text: [
        '【ページ内のレシピ情報（構造化データ）】',
        `料理名: ${recipe.name ?? ''}`,
        `分量: ${[].concat(recipe.recipeYield ?? '').join(' ')}`,
        `材料:\n${recipe.recipeIngredient.join('\n')}`,
        `説明: ${recipe.description ?? ''}`,
        `調理時間: ${recipe.totalTime ?? recipe.cookTime ?? ''}`,
      ].join('\n'),
      images: [],
      label: 'レシピサイトのページ',
    };
  }
  const text = htmlToText(html);
  if (text.length < 200) throw new Error('ページの本文がほぼ空');
  return { text: `【Webページ本文】\n${text.slice(0, 60000)}`, images: [], label: 'レシピサイトのページ' };
}

// X は埋め込み表示用の入口から、投稿本文・画像・引用元・リンク先を取る
async function readX(url: string): Promise<SourceContent> {
  const id = url.match(/status\/(\d+)/)?.[1];
  if (!id) throw new Error('投稿IDが見つからない');
  const token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
  const json = JSON.parse(await fetchText(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token}`));

  const parts: string[] = [];
  const photoUrls: string[] = [];
  let hasVideo = false;
  let linked = false;
  for (const [label, t] of [['投稿', json], ['引用元の投稿', json.quoted_tweet]] as const) {
    if (!t) continue;
    parts.push(`【Xの${label}】\n${t.note_tweet?.note_tweet_results?.result?.text || t.text || ''}`);
    for (const m of t.mediaDetails || []) {
      if (m.type === 'photo') photoUrls.push(m.media_url_https);
      if (m.type === 'video') hasVideo = true;
    }
  }
  const cardUrl = json.card?.binding_values?.card_url?.string_value;
  if (cardUrl) {
    try {
      parts.push((await readWebPage(cardUrl)).text);
      linked = true;
    } catch {
      // リンク先が読めなくても投稿本文だけで続ける
    }
  }
  return {
    text: parts.join('\n\n'),
    images: await fetchImages(photoUrls),
    label: linked ? 'Xの投稿とリンク先のページ' : photoUrls.length ? 'Xの投稿と画像' : hasVideo ? 'Xの投稿（動画）' : 'Xの投稿',
  };
}

async function readInstagram(url: string): Promise<SourceContent> {
  const html = await fetchText(url.split('?')[0], PREVIEW_UA);
  const raw = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/)?.[1];
  if (!raw) throw new Error('投稿文が見つからない');
  return { text: `【Instagramの投稿文】\n${decodeEntities(raw)}`, images: [], label: 'Instagramの投稿文' };
}

export async function readUrl(url: string): Promise<SourceContent> {
  const host = new URL(url).hostname;
  if (/(^|\.)(x|twitter)\.com$/.test(host)) return readX(url);
  if (/(^|\.)instagram\.com$/.test(host)) return readInstagram(url);
  return readWebPage(url);
}
