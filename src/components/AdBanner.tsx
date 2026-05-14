interface AdBannerProps {
  label?: string;
}

export function AdBanner({ label = "광고 영역" }: AdBannerProps) {
  /*
  <!--
  Google AdSense 승인 후 아래 위치에 실제 광고 코드를 삽입하세요.
  예:
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX" crossorigin="anonymous"></script>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-XXXXXXXXXXXX"
       data-ad-slot="XXXXXXXXXX"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  -->
  */

  return (
    <aside className="ad-banner" aria-label={label}>
      <span className="ad-badge">Ad</span>
      <div className="ad-copy">
        <strong>{label}</strong>
        <p>Google AdSense 승인 전에도 레이아웃이 자연스럽게 유지되는 플레이스홀더입니다.</p>
      </div>
    </aside>
  );
}
