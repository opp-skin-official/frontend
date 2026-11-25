import { KAKAO_LOGIN_URL } from "@/lib/auth";

/**
 * 카카오 로그인 버튼. 색은 카카오 디자인 가이드(바탕 #FEE500, 글자 #000 85%)를 따른다.
 * 가이드의 말풍선 심볼은 아직 넣지 않았다(공식 리소스 반영 필요).
 */
export function KakaoLoginButton() {
  return (
    <a
      href={KAKAO_LOGIN_URL}
      className="flex h-[47px] items-center justify-center rounded-[12px] bg-[#FEE500] type-body font-semibold text-black/85"
    >
      카카오 로그인
    </a>
  );
}
