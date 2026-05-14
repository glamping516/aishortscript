export type ToneOption =
  | "웃긴"
  | "공감"
  | "감성적인"
  | "자극적인"
  | "진지한"
  | "팩폭"
  | "설레는"
  | "정보성"
  | "힐링"
  | "반전있는";

export type PlatformOption =
  | "유튜브 쇼츠"
  | "인스타 릴스"
  | "틱톡"
  | "블로그 숏폼"
  | "카카오톡 공유용"
  | "광고 영상"
  | "뉴스형 숏폼";

export type LengthOption = "15초" | "30초" | "45초" | "60초";

export interface Script {
  title: string;
  hook: string;
  body: string;
  closing: string;
  hashtags: string[];
}

export interface GeneratedResult {
  titles: string[];
  thumbnails: string[];
  scripts: Script[];
  hashtags: string[];
  description: string;
  commentPrompts: string[];
}
