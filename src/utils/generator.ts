import {
  bodyTemplates,
  closingTemplates,
  commentPromptTemplates,
  descriptionTemplates,
  hashtagSets,
  hookTemplates,
  thumbnailTemplates,
  titleTemplates,
} from "../data/templateData";
import type { GeneratedResult, LengthOption, PlatformOption, Script, ToneOption } from "../types";

interface GenerateInput {
  topic: string;
  tone: ToneOption;
  platform: PlatformOption;
  length: LengthOption;
}

interface TemplateContext extends GenerateInput {}

const SCRIPT_COUNT = 2;

const lengthSentenceRange: Record<LengthOption, [number, number]> = {
  "15초": [3, 5],
  "30초": [5, 8],
  "45초": [8, 11],
  "60초": [10, 14],
};

const toneOpeners: Record<ToneOption, string[]> = {
  웃긴: ["솔직히 말해서,", "이거 은근 웃긴데 진짜,", "가볍게 보면 되는데도,"],
  공감: ["이 상황, 진짜 흔하죠.", "생각보다 많은 사람이 겪는 일인데요.", "이건 한 번쯤 다들 겪어봤을 거예요."],
  감성적인: ["조금 천천히 보면,", "마음이 흔들릴 때 떠오르는 장면이 있죠.", "이런 순간은 오래 남습니다."],
  자극적인: ["처음부터 강하게 말하면,", "이 부분은 그냥 넘기면 안 됩니다.", "지금부터가 핵심입니다."],
  진지한: ["차분하게 정리해보면,", "핵심만 분명하게 말하면,", "천천히 보면 포인트가 보입니다."],
  팩폭: ["불편할 수 있지만,", "돌려 말하지 않으면,", "현실적으로 보면,"],
  설레는: ["괜히 심장이 먼저 반응하는 순간이 있죠.", "좋아하는 마음은 작은 신호에서 드러납니다.", "이 분위기, 은근 설레는 이유가 있어요."],
  정보성: ["바로 써먹기 쉽게 말하면,", "핵심만 체크해보면,", "실제로 도움 되는 포인트만 뽑아보면,"],
  힐링: ["너무 조급해하지 않아도 됩니다.", "이럴 때일수록 조금 쉬어가도 괜찮아요.", "천천히 숨 고르듯 보면 좋겠습니다."],
  반전있는: ["처음엔 다들 이렇게 생각하는데,", "보통은 여기서 결론을 내리지만,", "겉으로 보면 당연해 보여도,"],
};

const platformOpeners: Record<PlatformOption, string[]> = {
  "유튜브 쇼츠": ["핵심부터 담백하게 꺼내보면,", "말을 짧게 아껴도 충분하니까,"],
  "인스타 릴스": ["잔잔하게 오래 남는 분위기로 풀어보면,", "감정선이 부드럽게 이어지게 가면,"],
  틱톡: ["호흡을 빠르게 가져가면,", "군더더기 없이 바로 들어가면,"],
  "블로그 숏폼": ["설명을 조금 더 또렷하게 풀어보면,", "맥락을 차분하게 이어가면,"],
  "카카오톡 공유용": ["친구랑 편하게 얘기하듯 풀면,", "가볍게 공유하기 좋은 말투로 가면,"],
  "광고 영상": ["부담 없이 장점이 보이게 풀면,", "관심이 자연스럽게 이어지게 가면,"],
  "뉴스형 숏폼": ["핵심부터 차분하게 짚어보면,", "정보를 또렷하게 정리해보면,"],
};

const topicKeywordSets = [
  { keywords: ["연애", "썸", "이별", "연락", "재회", "고백", "커플"], tags: ["#연애", "#연애공감", "#썸", "#커플", "#이별", "#관계"] },
  { keywords: ["직장", "회사", "출근", "퇴근", "상사", "이직", "면접"], tags: ["#직장생활", "#회사원", "#퇴근", "#직장인공감", "#이직", "#커리어"] },
  { keywords: ["자취", "원룸", "청소", "집꾸미기", "살림"], tags: ["#자취", "#원룸생활", "#살림팁", "#자취생", "#생활꿀팁", "#집꾸미기"] },
  { keywords: ["돈", "월급", "재테크", "저축", "가계부", "투자", "소비"], tags: ["#돈관리", "#월급관리", "#재테크", "#저축습관", "#소비관리", "#가계부"] },
  { keywords: ["다이어트", "헬스", "운동", "식단", "체형"], tags: ["#다이어트", "#헬스", "#운동루틴", "#식단관리", "#몸관리", "#건강습관"] },
  { keywords: ["피부", "뷰티", "메이크업", "화장", "향수", "패션"], tags: ["#뷰티", "#피부관리", "#메이크업", "#패션", "#자기관리", "#데일리룩"] },
  { keywords: ["여행", "카페", "맛집", "휴가", "국내여행", "해외여행"], tags: ["#여행", "#맛집", "#카페투어", "#여행기록", "#주말여행", "#핫플"] },
  { keywords: ["공부", "시험", "대학생", "취업", "자격증", "면접"], tags: ["#공부", "#시험준비", "#대학생활", "#취업준비", "#자기계발", "#루틴"] },
  { keywords: ["게임", "롤", "발로란트", "닌텐도", "스팀"], tags: ["#게임", "#게이머", "#게임공감", "#플레이팁", "#게임이야기", "#취미생활"] },
  { keywords: ["강아지", "고양이", "반려동물", "산책", "간식"], tags: ["#반려동물", "#강아지", "#고양이", "#집사", "#산책", "#반려생활"] },
  { keywords: ["mbti", "MBTI", "성격", "심리", "인간관계"], tags: ["#MBTI", "#심리", "#인간관계", "#성격유형", "#공감", "#관계팁"] },
];

const scriptSanitizers: Array<[RegExp, string]> = [
  [/유튜브 쇼츠에서도/g, "짧은 영상에서도"],
  [/유튜브 쇼츠에서/g, "짧은 영상에서"],
  [/유튜브 쇼츠에선/g, "짧은 영상에선"],
  [/유튜브 쇼츠에/g, "짧은 영상에"],
  [/인스타 릴스에서도/g, "짧은 영상에서도"],
  [/인스타 릴스에서/g, "짧은 영상에서"],
  [/인스타 릴스에선/g, "짧은 영상에선"],
  [/인스타 릴스에/g, "짧은 영상에"],
  [/틱톡에서도/g, "짧은 영상에서도"],
  [/틱톡에서/g, "짧은 영상에서"],
  [/틱톡에선/g, "짧은 영상에선"],
  [/틱톡에/g, "짧은 영상에"],
  [/틱톡처럼/g, "호흡을 빠르게 가져가면"],
  [/블로그 숏폼에서도/g, "설명형 콘텐츠에서도"],
  [/블로그 숏폼에서/g, "설명형 콘텐츠에서"],
  [/카카오톡 공유용에서도/g, "공유하기 좋은 흐름에서도"],
  [/카카오톡 공유용에서/g, "공유하기 좋은 흐름에서"],
  [/광고 영상에서도/g, "짧은 광고 흐름에서도"],
  [/광고 영상에서/g, "짧은 광고 흐름에서"],
  [/뉴스형 숏폼에서도/g, "정리형 콘텐츠에서도"],
  [/뉴스형 숏폼에서/g, "정리형 콘텐츠에서"],
  [/첫 문장이 세야 더 오래 남으니까,/g, "핵심부터 또렷하게 꺼내보면,"],
  [/짧게 꽂히는 흐름으로 가보면,/g, "부담 없이 바로 이해되는 흐름으로 가보면,"],
  [/저장하고 싶어지는 분위기로 풀어보면,/g, "잔잔하게 오래 남는 분위기로 풀어보면,"],
  [/이 부분은 꼭 기억해두세요\./g, "이 부분을 먼저 떠올려보세요."],
  [/생각보다 이 한 줄이 중요합니다\./g, "생각보다 이 차이가 꽤 큽니다."],
  [/여기서부터 분위기가 달라집니다\./g, "이 지점부터 느낌이 확 달라집니다."],
  [/처음 3초에 이 말이 들어가면 훨씬 세집니다\./g, "이 말을 떠올리는 순간 분위기가 확 달라집니다."],
  [/괜히 사람들이 멈춰보는 이유가 있습니다\./g, "괜히 마음이 걸리는 이유가 있습니다."],
  [/실제로 반응이 오는 대본은 대체로 여기서 갈립니다\./g, "사람 마음이 움직이는 지점은 대체로 여기서 갈립니다."],
  [/짧은 대본일수록/g, "짧게 말해야 할수록"],
  [/이 포인트만 챙겨도 .*? 대본은 훨씬 덜 뻔하고 더 현실적으로 들립니다\./g, "이 포인트만 챙겨도 훨씬 덜 흔하고 더 현실적으로 느껴집니다."],
  [/그래서 .*?을 말할 때는 센 결론보다 이해되는 흐름이 더 강하게 남습니다\./g, "그래서 센 결론보다 이해되는 태도가 더 오래 남습니다."],
  [/이런 식으로 정리하면 어디에 올려도 부담 없이 공감이 살아나는 흐름이 만들어집니다\./g, "이렇게 정리해두면 복잡했던 마음도 조금은 또렷해집니다."],
  [/특히 .*? 안에서는 이 문장 하나가 전체 분위기를 거의 결정해줍니다\./g, "특히 짧게 이야기할수록 한마디의 온도가 전체 분위기를 크게 바꿉니다."],
  [/정보를 주는 콘텐츠라도 결국 사람을 붙잡는 건 내 일처럼 느껴지는 장면입니다\./g, "결국 마음이 머무는 건 남의 얘기가 아니라 내 일처럼 느껴지는 장면입니다."],
  [/필요한 건 정리할 문장 하나뿐입니다\./g, "필요한 건 내 마음을 제대로 들여다보는 시간일지도 모릅니다."],
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sampleUnique<T>(items: readonly T[], count: number) {
  const copy = [...items];
  const selected: T[] = [];

  while (copy.length > 0 && selected.length < count) {
    const index = randomInt(0, copy.length - 1);
    selected.push(copy.splice(index, 1)[0]);
  }

  return selected;
}

function replaceVariables(template: string, context: TemplateContext) {
  return template
    .replaceAll("{topic}", context.topic)
    .replaceAll("{tone}", context.tone)
    .replaceAll("{platform}", context.platform)
    .replaceAll("{length}", context.length);
}

function normalizeSpacing(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function sanitizeScriptText(text: string) {
  return scriptSanitizers.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text);
}

function formatTemplate(template: string, context: TemplateContext, options?: { sanitizeScript?: boolean }) {
  const replaced = normalizeSpacing(replaceVariables(template, context));
  return options?.sanitizeScript ? sanitizeScriptText(replaced) : replaced;
}

function decorateSentence(sentence: string, context: TemplateContext) {
  const toneLead = sampleUnique(toneOpeners[context.tone], 1)[0];
  const platformLead = sampleUnique(platformOpeners[context.platform], 1)[0];
  return normalizeSpacing(`${toneLead} ${platformLead} ${sentence}`);
}

function splitTemplateIntoSentences(template: string) {
  return template
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function sentenceSignature(text: string) {
  return text
    .replaceAll("{topic}", "")
    .replaceAll("{tone}", "")
    .replaceAll("{platform}", "")
    .replaceAll("{length}", "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .slice(0, 40);
}

function dedupeBySignature(items: readonly string[]) {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const item of items) {
    const signature = sentenceSignature(item);
    if (seen.has(signature)) {
      continue;
    }
    seen.add(signature);
    deduped.push(item);
  }

  return deduped;
}

const bodySentencePools = (() => {
  const openings: string[] = [];
  const details: string[] = [];
  const closings: string[] = [];

  for (const template of bodyTemplates) {
    const sentences = splitTemplateIntoSentences(template);
    if (sentences.length === 0) {
      continue;
    }

    openings.push(sentences[0]);

    if (sentences.length === 1) {
      continue;
    }

    if (sentences.length === 2) {
      closings.push(sentences[1]);
      continue;
    }

    details.push(...sentences.slice(1, -1));
    closings.push(sentences[sentences.length - 1]);
  }

  return {
    openings: dedupeBySignature(openings),
    details: dedupeBySignature(details),
    closings: dedupeBySignature(closings),
  };
})();

function pickUniqueFormattedSentences(
  pool: readonly string[],
  count: number,
  context: TemplateContext,
  usedSignatures: Set<string>,
) {
  const picked: string[] = [];

  for (const template of sampleUnique(pool, pool.length)) {
    const formatted = formatTemplate(template, context, { sanitizeScript: true });
    const signature = sentenceSignature(formatted);

    if (usedSignatures.has(signature)) {
      continue;
    }

    usedSignatures.add(signature);
    picked.push(formatted);

    if (picked.length >= count) {
      break;
    }
  }

  return picked;
}

function buildHashtags(topic: string) {
  const baseTags = new Set<string>(["#쇼츠", "#릴스", "#틱톡", "#숏폼", "#콘텐츠아이디어"]);

  topicKeywordSets.forEach((rule) => {
    if (rule.keywords.some((keyword) => topic.toLowerCase().includes(keyword.toLowerCase()))) {
      rule.tags.forEach((tag) => baseTags.add(tag));
    }
  });

  for (const set of sampleUnique(hashtagSets, 3)) {
    for (const tag of set) {
      baseTags.add(tag);
      if (baseTags.size >= 15) {
        return Array.from(baseTags).slice(0, 15);
      }
    }
  }

  return Array.from(baseTags).slice(0, 15);
}

function buildBody(context: TemplateContext) {
  const [minCount, maxCount] = lengthSentenceRange[context.length];
  const sentenceCount = randomInt(minCount, maxCount);
  const usedSignatures = new Set<string>();
  const opening = pickUniqueFormattedSentences(bodySentencePools.openings, 1, context, usedSignatures);
  const closing = pickUniqueFormattedSentences(bodySentencePools.closings, 1, context, usedSignatures);
  const detailCount = Math.max(sentenceCount - opening.length - closing.length, 1);

  let details = pickUniqueFormattedSentences(bodySentencePools.details, detailCount, context, usedSignatures);

  if (details.length < detailCount) {
    const fallbackPool = [...bodySentencePools.openings, ...bodySentencePools.details, ...bodySentencePools.closings];
    details = [
      ...details,
      ...pickUniqueFormattedSentences(
        fallbackPool,
        detailCount - details.length,
        context,
        usedSignatures,
      ),
    ];
  }

  const assembled = [...opening, ...details, ...closing].slice(0, sentenceCount);

  return assembled
    .map((sentence, index) => (index === 0 ? decorateSentence(sentence, context) : sentence))
    .join("\n");
}

export function generateScripts(input: GenerateInput): GeneratedResult {
  const context: TemplateContext = {
    topic: input.topic.trim(),
    tone: input.tone,
    platform: input.platform,
    length: input.length,
  };

  const titles = sampleUnique(titleTemplates, 5).map((template) => formatTemplate(template, context));
  const thumbnails = sampleUnique(thumbnailTemplates, 5).map((template) => formatTemplate(template, context));
  const description = formatTemplate(sampleUnique(descriptionTemplates, 1)[0], context);
  const commentPrompts = sampleUnique(commentPromptTemplates, 3).map((template) =>
    formatTemplate(template, context),
  );

  const scripts: Script[] = sampleUnique(titles, SCRIPT_COUNT).map((title) => ({
    title: sanitizeScriptText(title),
    hook: formatTemplate(sampleUnique(hookTemplates, 1)[0], context, { sanitizeScript: true }),
    body: buildBody(context),
    closing: formatTemplate(sampleUnique(closingTemplates, 1)[0], context, { sanitizeScript: true }),
    hashtags: buildHashtags(context.topic).slice(0, 6),
  }));

  return {
    titles,
    thumbnails,
    scripts,
    hashtags: buildHashtags(context.topic),
    description,
    commentPrompts,
  };
}
