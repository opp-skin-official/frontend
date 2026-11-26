/**
 * 지금 화면에 보여 주는 약관 버전. 약관·개인정보 문서(app/terms, app/privacy)를 바꾸면 이 값과
 * 백엔드 TermsService.CURRENT_VERSION을 같이 올린다 → 모든 사용자가 다시 동의한다.
 */
export const TERMS_VERSION = "2026-11-26";

/** 동의 없이도 볼 수 있는 화면 */
export const TERMS_FREE_PATHS = ["/agree", "/terms", "/privacy", "/login"];
