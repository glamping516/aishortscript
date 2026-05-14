import { AdBanner } from "./AdBanner";

interface AdInterstitialModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdInterstitialModal({ open, onClose, onConfirm }: AdInterstitialModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="regenerate-ad-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-copy">
          <span className="modal-kicker">광고 팝업</span>
          <h2 id="regenerate-ad-title">다시 생성 전 광고 안내</h2>
          <p>
            실제 Google AdSense 강제 팝업은 정책상 직접 제어하기 어렵기 때문에, 현재는 레이아웃 확인용 광고
            모달 플레이스홀더로 연결해두었습니다.
          </p>
        </div>

        <AdBanner label="재생성 전 광고 영역" />

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            닫기
          </button>
          <button type="button" className="primary-button" onClick={onConfirm}>
            광고 닫고 다시 생성
          </button>
        </div>
      </div>
    </div>
  );
}
