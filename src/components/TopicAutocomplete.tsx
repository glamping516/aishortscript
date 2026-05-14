import { useDeferredValue, useMemo, useState } from "react";
import { topicSuggestions } from "../data/templateData";

interface TopicAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  recentTopics: string[];
}

function rankSuggestions(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  const normalizedKeyword = keyword.trim().toLowerCase();
  const startsWithMatches: string[] = [];
  const includesMatches: string[] = [];

  for (const suggestion of topicSuggestions) {
    const normalizedSuggestion = suggestion.toLowerCase();
    if (!normalizedSuggestion.includes(normalizedKeyword)) {
      continue;
    }

    if (normalizedSuggestion.startsWith(normalizedKeyword)) {
      startsWithMatches.push(suggestion);
    } else {
      includesMatches.push(suggestion);
    }
  }

  return [...startsWithMatches, ...includesMatches].slice(0, 8);
}

export function TopicAutocomplete({
  value,
  onChange,
  onSelect,
  recentTopics,
}: TopicAutocompleteProps) {
  const [dismissed, setDismissed] = useState(false);
  const deferredValue = useDeferredValue(value);
  const suggestions = useMemo(() => rankSuggestions(deferredValue), [deferredValue]);
  const showSuggestions = value.trim().length > 0 && !dismissed;

  return (
    <div className="topic-field">
      <label className="field-label" htmlFor="topic">
        주제
      </label>
      <input
        id="topic"
        className="text-input"
        type="text"
        placeholder="예: 연애, 자취, 직장생활, 다이어트, MBTI"
        value={value}
        onChange={(event) => {
          setDismissed(false);
          onChange(event.target.value);
        }}
        autoComplete="off"
      />
      {showSuggestions ? (
        <div className="suggestion-panel">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="suggestion-chip"
                onClick={() => {
                  setDismissed(true);
                  onSelect(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))
          ) : (
            <p className="suggestion-empty">추천 주제가 없습니다. 직접 입력한 주제로 생성합니다.</p>
          )}
        </div>
      ) : null}
      {recentTopics.length > 0 ? (
        <div className="recent-topics">
          <span className="recent-label">최근 사용한 주제</span>
          <div className="chip-row">
            {recentTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                className="recent-chip"
                onClick={() => {
                  setDismissed(true);
                  onSelect(topic);
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
