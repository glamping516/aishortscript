import { useState } from "react";
import type { GeneratedResult } from "../types";

interface ScriptResultProps {
  result: GeneratedResult;
  onCopyAll: () => Promise<boolean>;
  onRegenerate: () => void;
}

interface CopyState {
  [key: string]: boolean;
}

function formatAllContent(result: GeneratedResult) {
  const scriptBlock = result.scripts
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

  return `추천 제목
${result.titles.map((title, index) => `${index + 1}. ${title}`).join("\n")}

썸네일 문구
${result.thumbnails.map((item) => `- ${item}`).join("\n")}

${scriptBlock}

전체 해시태그
${result.hashtags.join(" ")}

영상 설명글
${result.description}

댓글 유도 문구
${result.commentPrompts.map((item, index) => `${index + 1}. ${item}`).join("\n")}`;
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function ScriptResult({ result, onCopyAll, onRegenerate }: ScriptResultProps) {
  const [copyState, setCopyState] = useState<CopyState>({});

  const flashCopied = (key: string) => {
    setCopyState((current) => ({ ...current, [key]: true }));
    window.setTimeout(() => {
      setCopyState((current) => ({ ...current, [key]: false }));
    }, 1500);
  };

  const handleCopy = async (key: string, text: string) => {
    await copyText(text);
    flashCopied(key);
  };

  const handleCopyAll = async () => {
    const copied = await onCopyAll();
    if (copied) {
      flashCopied("all");
    }
  };

  return (
    <section className="result-stack">
      <div className="result-toolbar">
        <div>
          <h2>생성 결과</h2>
          <p>제목, 썸네일, 대본, 해시태그까지 바로 복사해서 활용할 수 있어요.</p>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="secondary-button" onClick={onRegenerate}>
            다시 생성하기
          </button>
          <button type="button" className="primary-button" onClick={handleCopyAll}>
            {copyState.all ? "복사 완료!" : "전체 복사하기"}
          </button>
        </div>
      </div>

      <article className="result-card">
        <div className="section-head">
          <h3>추천 제목 5개</h3>
          <button
            type="button"
            className="copy-button"
            onClick={() => handleCopy("titles", result.titles.join("\n"))}
          >
            {copyState.titles ? "복사 완료!" : "복사하기"}
          </button>
        </div>
        <ol className="number-list">
          {result.titles.map((title) => (
            <li key={title}>{title}</li>
          ))}
        </ol>
      </article>

      <article className="result-card">
        <div className="section-head">
          <h3>썸네일 문구 5개</h3>
          <button
            type="button"
            className="copy-button"
            onClick={() => handleCopy("thumbnails", result.thumbnails.join("\n"))}
          >
            {copyState.thumbnails ? "복사 완료!" : "복사하기"}
          </button>
        </div>
        <ul className="tag-list">
          {result.thumbnails.map((item) => (
            <li key={item} className="tag-pill tag-pill--muted">
              {item}
            </li>
          ))}
        </ul>
      </article>

      {result.scripts.map((script, index) => {
        const scriptText = `[대본 ${index + 1}]
제목: ${script.title}

도입부:
${script.hook}

본문:
${script.body}

마무리:
${script.closing}

해시태그:
${script.hashtags.join(" ")}`;

        return (
          <article key={`${script.title}-${index}`} className="result-card">
            <div className="section-head">
              <h3>숏폼 대본 {index + 1}</h3>
              <button
                type="button"
                className="copy-button"
                onClick={() => handleCopy(`script-${index}`, scriptText)}
              >
                {copyState[`script-${index}`] ? "복사 완료!" : "복사하기"}
              </button>
            </div>
            <div className="script-layout">
              <div className="script-block">
                <span className="script-label">제목</span>
                <p>{script.title}</p>
              </div>
              <div className="script-block">
                <span className="script-label">도입부</span>
                <p>{script.hook}</p>
              </div>
              <div className="script-block">
                <span className="script-label">본문</span>
                <p className="multiline">{script.body}</p>
              </div>
              <div className="script-block">
                <span className="script-label">마무리</span>
                <p>{script.closing}</p>
              </div>
              <div className="script-block">
                <span className="script-label">해시태그</span>
                <p className="hashtag-row">{script.hashtags.join(" ")}</p>
              </div>
            </div>
          </article>
        );
      })}

      <article className="result-card">
        <div className="section-head">
          <h3>해시태그 15개</h3>
          <button
            type="button"
            className="copy-button"
            onClick={() => handleCopy("hashtags", result.hashtags.join(" "))}
          >
            {copyState.hashtags ? "복사 완료!" : "복사하기"}
          </button>
        </div>
        <ul className="tag-list">
          {result.hashtags.map((tag) => (
            <li key={tag} className="tag-pill">
              {tag}
            </li>
          ))}
        </ul>
      </article>

      <article className="result-card">
        <div className="section-head">
          <h3>영상 설명글</h3>
          <button
            type="button"
            className="copy-button"
            onClick={() => handleCopy("description", result.description)}
          >
            {copyState.description ? "복사 완료!" : "복사하기"}
          </button>
        </div>
        <p className="multiline">{result.description}</p>
      </article>

      <article className="result-card">
        <div className="section-head">
          <h3>댓글 유도 문구 3개</h3>
          <button
            type="button"
            className="copy-button"
            onClick={() => handleCopy("comment-prompts", result.commentPrompts.join("\n"))}
          >
            {copyState["comment-prompts"] ? "복사 완료!" : "복사하기"}
          </button>
        </div>
        <ol className="number-list">
          {result.commentPrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ol>
      </article>

      <article className="result-card result-card--plain">
        <div className="section-head">
          <h3>전체 결과 미리보기</h3>
          <button
            type="button"
            className="copy-button"
            onClick={() => handleCopy("preview", formatAllContent(result))}
          >
            {copyState.preview ? "복사 완료!" : "복사하기"}
          </button>
        </div>
        <pre className="preview-box">{formatAllContent(result)}</pre>
      </article>
    </section>
  );
}
