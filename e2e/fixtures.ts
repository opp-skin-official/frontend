import type { components } from "../src/lib/api/schema";
import { TERMS_VERSION } from "../src/lib/terms";

/**
 * 스모크 테스트용 가짜 백엔드 데이터. 백엔드 OpenAPI 타입을 그대로 써서, API 모양이 바뀌면 타입 검사에서 걸린다.
 * 테스트는 여기 문구가 화면에 보이는지로 확인한다.
 */
type S = components["schemas"];

export const me: S["MeResponse"] = { id: 1, nickname: "테스트병장", termsAgreed: true, termsVersion: TERMS_VERSION };

export const plan: S["PlanView"] = {
  id: 7,
  goalType: "VACATION",
  goalLabel: "휴가 전 피부 정리",
  focusGoal: "SKIN_CHANGE",
  startDate: "2026-11-20",
  targetDate: "2026-12-10",
  daysLeft: 14,
};

export const today: S["TodayView"] = {
  date: "2026-11-26",
  plan,
  items: [
    { id: 71, timeOfDay: "MORNING", title: "미온수로 세안하기", subtitle: "아침", checked: true },
    { id: 72, timeOfDay: "MORNING", title: "선크림 바르기", subtitle: "외출 전", checked: false },
    { id: 73, timeOfDay: "EVENING", title: "진정 보습제 바르기", subtitle: "세안 후", checked: false },
  ],
  doneCount: 1,
  week: {
    start: "2026-11-23",
    end: "2026-11-29",
    scheduled: 9,
    completed: 4,
    percent: 44,
    lastWeekCompleted: 3,
    days: [
      { date: "2026-11-23", status: "DONE" },
      { date: "2026-11-24", status: "PARTIAL" },
      { date: "2026-11-25", status: "NONE" },
      { date: "2026-11-26", status: "PARTIAL" },
      { date: "2026-11-27", status: "FUTURE" },
      { date: "2026-11-28", status: "FUTURE" },
      { date: "2026-11-29", status: "FUTURE" },
    ],
  },
};

export const assessment: S["AssessmentView"] = {
  id: 3,
  typeCode: "TYPE_05",
  title: "번들거리지만 예민한 피부",
  skinTags: ["번들거림", "자극에 예민"],
  environmentTags: ["야외훈련 잦음"],
  careStyle: "SIMPLE",
  careStyleLabel: "간단 관리",
  axes: [
    { axis: "OIL", letter: "O", score: 70, borderline: false },
    { axis: "SENSITIVITY", letter: "S", score: 65, borderline: false },
    { axis: "PIGMENTATION", letter: "N", score: 30, borderline: false },
    { axis: "WT", letter: "T", score: 40, borderline: true },
  ],
  retestRecommendedAt: "2027-02-26",
  createdAt: "2026-11-20T10:00:00+09:00",
};

const cleanser: S["ProductSummary"] = {
  id: 101,
  brand: "테스트랩",
  name: "약산성 시카 클렌저",
  category: "CLEANSER",
  volume: "150ml",
  price: 9800,
  interested: false,
  owned: true,
  matchScore: 86,
};

const cream: S["ProductSummary"] = {
  id: 102,
  brand: "테스트랩",
  name: "판테놀 장벽 크림",
  category: "CREAM",
  volume: "50ml",
  price: 15900,
  interested: true,
  owned: false,
  matchScore: 72,
};

export const products: S["ProductPage"] = { items: [cleanser, cream], page: 0, hasNext: false };

export const recommendations: S["Recommendations"] = {
  hasSkinType: true,
  usedReport: true,
  items: [
    { product: cleanser, score: 86, reasons: ["병풀추출물: 붉어짐 진정에 도움"], cautions: [] },
    { product: cream, score: 72, reasons: ["판테놀: 진정과 보습"], cautions: [] },
  ],
};

export const productDetail: S["ProductDetail"] = {
  ...cleanser,
  summary: "면도 후에도 순하게 쓰는 약산성 클렌저",
  recommendation: "야외훈련 뒤 저녁 세안에 추천",
  skinFits: ["OILY", "SENSITIVE"],
  features: ["약산성", "무향"],
  keyIngredients: [
    { nameKo: "병풀추출물", inci: "Centella Asiatica Extract" },
    { nameKo: "판테놀", inci: "Panthenol" },
  ],
  fullIngredients: "정제수, 코카미도프로필베타인, 병풀추출물, 판테놀",
};

export const reviews: S["ReviewPage"] = {
  average: 4.5,
  count: 2,
  items: [
    {
      id: 1,
      nickname: "일병김",
      rating: 5,
      content: "훈련 끝나고 써도 안 따가워요",
      skinOption: "SENSITIVE",
      goodTags: ["순해요"],
      badTags: [],
      createdAt: "2026-11-24T20:00:00+09:00",
      mine: false,
    },
    {
      id: 2,
      nickname: "상병이",
      rating: 4,
      content: "거품이 조금 적어요",
      goodTags: [],
      badTags: ["거품이 적어요"],
      createdAt: "2026-11-22T20:00:00+09:00",
      mine: false,
    },
  ],
  page: 0,
  hasNext: false,
};

export const reviewForm: S["ReviewForm"] = {
  goodTagOptions: ["순해요", "보습이 좋아요"],
  badTagOptions: ["거품이 적어요", "건조해요"],
};

export const myProducts: S["MyProductView"][] = [{ productId: 101, kind: "OWNED", product: cleanser }];

export const conversations: S["ConversationSummary"][] = [
  { id: 31, kind: "CONSULT", title: "턱 · 면도 후 붉어짐·따가움", createdAt: "2026-11-25T09:00:00+09:00", updatedAt: "2026-11-25T09:01:00+09:00" },
  { id: 41, kind: "QNA", title: "선크림은 언제 다시 발라요?", createdAt: "2026-11-24T19:00:00+09:00", updatedAt: "2026-11-24T19:02:00+09:00" },
];

export const conversation: S["ConversationView"] = {
  id: 41,
  kind: "QNA",
  title: "선크림은 언제 다시 발라요?",
  useSavedProfile: true,
  createdAt: "2026-11-24T19:00:00+09:00",
  messages: [
    { id: 1, role: "USER", status: "DONE", content: "선크림은 언제 다시 발라요?", createdAt: "2026-11-24T19:00:00+09:00" },
    {
      id: 2,
      role: "ASSISTANT",
      status: "DONE",
      content: "야외훈련 중이면 2~3시간마다 다시 바르는 게 좋아요.",
      actionTips: ["땀을 닦은 뒤 덧바르기"],
      followUpQuestions: [],
      referToClinician: false,
      notice: "참고용 안내입니다.",
      createdAt: "2026-11-24T19:00:10+09:00",
    },
  ],
};

export const consultation: S["ConsultView"] = {
  id: 31,
  state: "COMPLETED",
  title: "턱 · 면도 후 붉어짐·따가움",
  createdAt: "2026-11-25T09:00:00+09:00",
  answers: {
    kind: "FOLLICULITIS_SHAVING",
    regions: ["CHIN"],
    onset: "POST_PRODUCT_SHAVE",
    duration: "ACUTE_DAYS",
    severity: 3,
    change: "WORSENED",
    redFlag: false,
    activities: ["SHAVING"],
    careTime: "EVENING_ONLY",
    products: ["CLEANSER", "MOISTURIZER"],
    targetDays: 14,
  },
  report: {
    pairs: [
      {
        regions: ["CHIN"],
        observation: "턱에 붉은기가 보여요",
        cause: "면도 마찰이 영향을 줄 수 있어요",
        solution: "결 방향으로 면도하고 진정 보습제를 바르세요",
        confidence: "high",
      },
    ],
    referToClinician: false,
    notice: "참고용 안내입니다.",
    recommendedIngredients: [{ key: "panthenol", labelKo: "판테놀", inci: "Panthenol" }],
    cautionIngredients: [{ key: "synthetic_fragrance", labelKo: "인공 향료" }],
    routine: {
      mode: "period_plan",
      targetDays: 14,
      summary: "14일 저녁 중심 루틴이에요.",
      phases: [
        {
          label: "1단계 자극 완화",
          dayRange: "1~4일차",
          focus: "자극을 줄여요",
          morning: ["미온수로 세안하기"],
          evening: ["순한 세안제로 씻기", "진정 보습제 바르기"],
          postActivity: ["훈련 직후 헹구기"],
          checkpoint: "붉어짐 기록",
        },
      ],
      referToClinician: false,
    },
  },
};

export const careInfo: S["CareInfoView"] = {
  environment: { washTime: "EVENING_ONLY", outdoorTraining: "TWO_TO_THREE_PER_WEEK", allergyExperience: "YES" },
  alerts: [{ id: 5, target: "향료" }],
};

export const survey: S["SurveyView"] = {
  version: 1,
  questions: [
    {
      number: 1,
      axis: "OIL",
      text: "세안 후 2시간이 지나면 이마와 코는 어떤가요?",
      image: false,
      sensitive: false,
      options: [
        { position: 1, label: "당기고 건조해요" },
        { position: 2, label: "보통이에요" },
        { position: 3, label: "조금 번들거려요" },
        { position: 4, label: "많이 번들거려요" },
      ],
    },
    {
      number: 2,
      axis: "SENSITIVITY",
      text: "새 제품을 쓰면 따갑거나 붉어지나요?",
      image: false,
      sensitive: false,
      options: [
        { position: 1, label: "거의 없어요" },
        { position: 2, label: "가끔 있어요" },
        { position: 3, label: "자주 있어요" },
        { position: 4, label: "거의 항상 있어요" },
      ],
    },
  ],
};

export const progressRecords: S["RecordView"][] = [
  { date: "2026-11-25", perceivedChange: "BETTER", skinCondition: "COMFORT", memo: "붉은기 줄었음" },
];
