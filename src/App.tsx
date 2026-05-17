import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { ScriptResult } from "./components/ScriptResult";
import { TopicAutocomplete } from "./components/TopicAutocomplete";
import type { GeneratedResult, LengthOption, PlatformOption, ToneOption } from "./types";
import { generateScripts } from "./utils/generator";

const STORAGE_KEYS = {
  inputs: "shortform-script-generator-inputs",
  recentTopics: "shortform-script-generator-recent-topics",
};

const toneOptions: ToneOption[] = [
  "웃긴",
  "공감",
  "감성적인",
  "자극적인",
  "진지한",
  "팩폭",
  "설레는",
  "정보성",
  "힐링",
  "반전있는",
];

const platformOptions: PlatformOption[] = [
  "유튜브 쇼츠",
  "인스타 릴스",
  "틱톡",
  "블로그 숏폼",
  "카카오톡 공유용",
  "광고 영상",
  "뉴스형 숏폼",
];

const lengthOptions: LengthOption[] = ["15초", "30초", "45초", "60초"];

function App() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<ToneOption>("공감");
  const [platform, setPlatform] = useState<PlatformOption>("유튜브 쇼츠");
  const [length, setLength] = useState<LengthOption>("30초");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [recentTopics, setRecentTopics] = useState<string[]>([]);

  useEffect(() => {
    const savedInputs = localStorage.getItem(STORAGE_KEYS.inputs);
    const savedTopics = localStorage.getItem(STORAGE_KEYS.recentTopics);

    if (savedInputs) {
      const parsed = JSON.parse(savedInputs) as {
        topic?: string;
        tone?: ToneOption;
        platform?: PlatformOption;
        length?: LengthOption;
      };

      if (parsed.topic) setTopic(parsed.topic);
      if (parsed.tone) setTone(parsed.tone);
      if (parsed.platform) setPlatform(parsed.platform);
      if (parsed.length) setLength(parsed.length);
    }

    if (savedTopics) {
      setRecentTopics(JSON.parse(savedTopics) as string[]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.inputs,
      JSON.stringify({
        topic,
        tone,
        platform,
        length,
      }),
    );
  }, [topic, tone, platform, length]);

  const updateRecentTopics = (nextTopic: string) => {
    const sanitized = nextTopic.trim();
    if (!sanitized) return;

    const nextRecentTopics = [sanitized, ...recentTopics.filter((item) => item !== sanitized)].slice(0, 5);
    setRecentTopics(nextRecentTopics);
    localStorage.setItem(STORAGE_KEYS.recentTopics, JSON.stringify(nextRecentTopics));
  };

  const runGeneration = (overrideTopic?: string) => {
    const nextTopic = (overrideTopic ?? topic).trim();
    if (!nextTopic) {
      setError("주제를 입력해주세요.");
      return;
    }

    setError("");
    setLoading(true);

    const delay = Math.floor(Math.random() * 400) + 300;
    window.setTimeout(() => {
      const generated = generateScripts({
        topic: nextTopic,
        tone,
        platform,
        length,
      });

      setResult(generated);
      updateRecentTopics(nextTopic);
      setLoading(false);
    }, delay);
  };

  const handleCopyAll = async () => {
    if (!result) return false;

    const scriptText = result.scripts
      .map(
        (script, index) => `[대본 ${index + 1}]
제목: ${script.title}

도입부:
${script.hook}

본문:
${script.body}

마무리:
${script.closing}

해시태그:
${script.hashtags.join(" ")}`,
      )
      .join("\n\n");

    const allText = [
      "추천 제목",
      ...result.titles.map((titleItem, index) => `${index + 1}. ${titleItem}`),
      "",
      "썸네일 문구",
      ...result.thumbnails.map((item) => `- ${item}`),
      "",
      scriptText,
      "",
      "전체 해시태그",
      result.hashtags.join(" "),
      "",
      "영상 설명글",
      result.description,
      "",
      "댓글 유도 문구",
      ...result.commentPrompts.map((item, index) => `${index + 1}. ${item}`),
    ].join("\n");

    await navigator.clipboard.writeText(allText);
    return true;
  };

  return (
    <div className="page-shell">
      <main className="page">
        <section className="hero-card">
          <div className="hero-copy">
            <h1>AI 숏폼 대본 생성기</h1>
            <p className="hero-subtitle">주제만 입력하면 쇼츠·릴스·틱톡용 대본을 바로 만들어드립니다.</p>
            <p className="hero-description">
              유튜브 쇼츠, 인스타 릴스, 틱톡에 올릴 짧은 영상 아이디어가 필요할 때 사용해보세요.
              제목, 도입부, 본문, 마무리 멘트, 해시태그까지 한 번에 생성됩니다.
            </p>
          </div>
        </section>

        <section className="input-card">
          <div className="intro-row">
            <div>
              <h2>주제와 옵션 입력</h2>
              <p>
                주제만 입력하면 쇼츠·릴스·틱톡용 제목, 도입부, 본문 대본, 마무리 멘트, 해시태그를 자동으로
                만들어드립니다.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <TopicAutocomplete
              value={topic}
              onChange={setTopic}
              onSelect={(value) => setTopic(value)}
              recentTopics={recentTopics}
            />

            <div className="select-field">
              <label className="field-label" htmlFor="tone">
                분위기
              </label>
              <select
                id="tone"
                className="select-input"
                value={tone}
                onChange={(event) => setTone(event.target.value as ToneOption)}
              >
                {toneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-field">
              <label className="field-label" htmlFor="platform">
                플랫폼
              </label>
              <select
                id="platform"
                className="select-input"
                value={platform}
                onChange={(event) => setPlatform(event.target.value as PlatformOption)}
              >
                {platformOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-field">
              <label className="field-label" htmlFor="length">
                길이
              </label>
              <select
                id="length"
                className="select-input"
                value={length}
                onChange={(event) => setLength(event.target.value as LengthOption)}
              >
                {lengthOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="action-field">
              <label className="field-label field-label--hidden" htmlFor="generate">
                생성
              </label>
              <button id="generate" type="button" className="generate-button" onClick={() => runGeneration()}>
                {loading ? "대본 생성 중..." : "대본 생성하기"}
              </button>
            </div>
          </div>

          {error ? <p className="error-text">{error}</p> : null}
        </section>

        <section className="content-section">
          {loading ? (
            <div className="empty-card empty-card--loading">
              <div className="loader" />
              <h2>대본 생성 중...</h2>
              <p>주제와 옵션에 맞는 제목, 썸네일 문구, 대본을 조합하고 있습니다.</p>
            </div>
          ) : result ? (
            <ScriptResult result={result} onCopyAll={handleCopyAll} onRegenerate={() => runGeneration()} />
          ) : (
            <div className="empty-card">
              <h2>결과가 아직 없습니다</h2>
              <p>주제와 옵션을 선택한 뒤 대본 생성하기 버튼을 눌러보세요.</p>
              <p className="empty-example">예: 연애, 자취, 직장생활, 다이어트, MBTI, 돈관리, 여행, 게임</p>
            </div>
          )}
        </section>
      </main>

      <Analytics />
    </div>
  );
}

export default App;
