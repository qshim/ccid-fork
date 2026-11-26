/**
 * 화면 고정 문구 (한국어). 키를 추가하면 en.ts 에도 같은 키가 필요합니다.
 * 제목(헤딩)은 한국어 화면에서도 영어로 둡니다.
 */
export const ko = {
  meta: {
    description:
      "컴퓨테이셔널 디자인과 생성형 AI를 바탕으로 사용자 경험을 연구하고 디자인하는 인간 중심의 디자인 센터입니다.",
  },
  nav: {
    about: "About",
    research: "Research",
    projects: "Projects",
    people: "People",
    lab: "Lab",
  },
  footer: {
    people: "People",
    research: "Research",
    /** People 페이지의 그룹으로 이동하는 링크 */
    peopleLinks: {
      director: "Director",
      advisory_board: "Advisors",
      researcher: "Researchers",
      alumni: "Alumni",
    },
  },
  language: {
    switchLabel: "Switch to English",
  },
  common: {
    loading: "불러오는 중…",
    skipToContent: "본문으로 건너뛰기",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
  },
  /** 에이전트 구 대화 창 (components/agent-blob — mode="agent" 일 때) */
  agent: {
    open: "보이스 에이전트 열기",
    hover: "클릭하여 물어보세요",
    /** 터치 화면: 처음 한 번 구 옆에 뜨는 안내 (커서 안내 대신) */
    tap: "눌러서 물어보세요",
    title: "cciD 에이전트",
    close: "닫기",
    talk: "말하기",
    send: "보내기",
    placeholder: "질문을 입력하세요",
    thinking: "생각하는 중",
    ended: "대화를 마쳤어요",
    suggestions: "추천 질문",
    /** 팀에 보낼 메시지 미리보기 */
    to: "cciD 팀에게",
    yes: "네, 보내 주세요",
    sentTo: "cciD 팀에 보냈어요",
    mailApp: "메일 앱에서 보내기",
    /** 메일 앱으로 보낼 때 제목 */
    subject: "cciD 문의",
    mic: "목소리로 이야기하기",
    micOff: "마이크 끄기",
    /** 마이크를 켜기 전 안내 (브라우저 허용 창보다 먼저 보임) */
    askTitle: "목소리로 이야기할까요?",
    askBody:
      "마이크가 켜져 있는 동안 말소리만 골라 글자로 받아 적어요.\n녹음은 저장하지 않고, 언제든 끌 수 있어요.",
    askNote: "받아 적기와 목소리는 ElevenLabs, 대답은 OpenAI가 만들어요.",
    askAllow: "마이크 켜기",
    askDecline: "아니요, 글로 할게요",
    askHint: "다음에 브라우저가 마이크 허용을 한 번 더 물어봐요.",
    starting: "마이크를 켜는 중",
    listening: "듣고 있어요",
    speaking: "말을 걸면 멈춰요",
    notices: {
      micBlocked:
        "마이크가 막혀 있어요. 주소창의 자물쇠 아이콘에서 허용하거나, 글로 물어봐 주세요.",
      noVoice: "이 브라우저에서는 말로 할 수 없어요. 글로 물어봐 주세요.",
      voiceFailed: "음성을 불러오지 못했어요. 글로 물어봐 주세요.",
      quiet: "한동안 조용해서 마이크를 껐어요.",
    },
  },
  home: {
    research: "Research",
    projects: "Projects",
    viewAll: "전체 보기",
    partners: "Partners",
    /** 첫 화면 아래 스크롤 안내 버튼 (스크린리더용) */
    scrollHint: "아래로 스크롤",
    /** 넓은 화면 오른쪽 섹션 인디케이터 (스크린리더용) */
    sections: "섹션 이동",
  },
  about: {
    title: "About",
    lead: "cciD는 사용자 리서치, 생성형 AI, 인터랙션 디자인을 하나의 과정으로 잇습니다. 기술이 제품과 브랜드 안에서 어떤 경험이 되어야 하는지 정의하고, 그 경험을 직접 구현합니다.",
    body: "삼성전자와는 차세대 UI와 감성 UX를, 현대자동차그룹과는 AI를 내재화한 디자인 프로세스를, LG전자와는 AI 비전을 공간 경험으로 다뤘습니다. 지금은 롯데와 함께 지주사 차원의 AX를 브랜드 관점에서 풀어가고 있습니다. cciD는 CMU의 Computational Design Thinking과 MIT의 Demo or Die를 하나로 잇습니다.",
    capabilitiesTitle: "What we do",
    capabilities: [
      {
        name: "Design Strategy",
        description:
          "cciD는 변화하는 사용자 요구와 기술의 흐름, 시스템적 전환을 예측하는 전략적 프레임워크를 디자인합니다. 리서치, 미래 예측을 위한 프로토타이핑, AI 기반 인사이트를 결합하여 인간 경험과 신기술, 비즈니스의 접점에서 혁신을 주도하는 방식입니다.",
      },
      {
        name: "Human-centered Design",
        description:
          "인간 중심의 사고를 기반으로 합니다. 사용자의 니즈, 루트 커즈, 만족도 등의 조사, 행동 관찰과 더불어, AI와 데이터 인사이트를 활용하여 디지털과 물리적 환경 전반에서 접근성과 반응성, 몰입도를 높이는 인터랙션을 설계합니다.",
      },
      {
        name: "Experience Design",
        description:
          "디지털 경험은 기술 혁신만으로 완성되지 않습니다. cciD는 상황에 적절한 인터랙션을 디자인함으로써 보다 감성적으로 세련되고 선호할만한 사용자 경험을 만듭니다. 인지과학, 행동 심리학, 데이터 모델링을 기반으로, 사용자의 여정을 더욱 자연스럽고 유기적으로 연결합니다.",
      },
      {
        name: "Interaction Design",
        description:
          "사용자가 디지털 제품과 상호작용하는 방식을 설계하여 사용자와 인터페이스 간의 인터랙션을 원활하게 합니다.",
      },
      {
        name: "Generative AI",
        description:
          "AI 기술을 기반으로 한 제품 및 서비스의 UX/UI를 설계하여, AI 추천 시스템, 자동화된 UI, 사용자 맞춤형 인터페이스 등을 디자인합니다.",
      },
      {
        name: "AR/VR/XR Design",
        description:
          "증강현실(AR)과 가상현실(VR) 환경에서의 사용자 경험을 설계하고, 3D 모델링, 몰입형 UI, 제스처 기반 인터랙션 등을 포함합니다.",
      },
      {
        name: "Conversational Design",
        description:
          "챗봇, 음성 인식 AI, 가상 비서 등 사용자와의 자연스러운 대화를 위한 UX 라이팅, 플로우 설계, 자연어 처리(NLP) 등을 포함합니다.",
      },
      {
        name: "Data Visualization",
        description:
          "복잡한 데이터를 시각화하여 정보 전달을 효과적으로 만들고, 정보를 직관적으로 이해할 수 있도록 UI/UX 및 인터랙티브 요소와 결합합니다.",
      },
      {
        name: "Interface Design",
        description:
          "웹사이트, 앱, 소프트웨어 등에서 버튼, 아이콘, 메뉴, 애니메이션 등의 시각적 요소를 제작합니다.",
      },
      {
        name: "Prototyping",
        description:
          "디자인이 실제로 구현되기 전에 사용자 테스트를 할 수 있도록 시뮬레이션하는 과정으로, Figma, Adobe XD, ProtoPie, Framer 등 다양한 도구를 활용하여 프로토타입을 제작합니다.",
      },
    ],
  },
  join: {
    eyebrow: "Recruitment",
    title: "새로운 관점을 기다립니다.",
    description:
      "cciD와 함께 새로운 가능성을 탐구하고 만들어갈 분들을 기다립니다.",
    cta: "참여 및 채용 안내",
    closedTitle: "지금은 모집 기간이 아닙니다",
  },
  research: {
    title: "Research",
    description: "분야마다 던지는 질문과 그 질문을 따라간 연구를 소개합니다.",
    keywords: "Focus areas",
    projects: "Projects",
    images: "Images",
    prevImage: "이전 이미지",
    nextImage: "다음 이미지",
    others: "More research",
    more: "자세히 보기",
  },
  projects: {
    title: "Projects",
    description: "기업 · 기관과 함께한 프로젝트를 연도별로 모았습니다.",
    all: "전체",
    filterLabel: "리서치 분야로 보기",
  },
  project: {
    year: "기간",
    title: "프로젝트",
    client: "협력 기관",
    themes: "리서치 분야",
    nda: "NDA",
    empty: "아직 공개된 프로젝트가 없습니다.",
    open: "자세히",
    close: "닫기",
    prev: "이전 프로젝트",
    next: "다음 프로젝트",
    /** 프로젝트 모달: 리서치 카드 위 제목 · 카드 안 버튼 */
    research: "Related research",
    researchMore: "리서치 자세히 보기",
    ndaNote: "NDA 프로젝트라 기본 정보만 공개합니다.",
  },
  people: {
    title: "People",
    profile: "약력 전체 보기",
    categories: {
      director: "Director",
      advisory_board: "Advisory Board",
      former_advisor: "Former Advisors",
      researcher: "Student Researchers",
      intern: "Research Interns",
      alumni: "Alumni",
    },
  },
  lab: {
    title: "Lab",
    eyebrow: "Coming soon",
    lead: "새로운 cciD만의 다양한 이야기들이 곧 공개됩니다.",
    description:
      "연구실에서 만들고 있는 프로토타입, 도구, 작은 실험들을 한곳에 모으고 있습니다. 곧 공개됩니다.",
    research: "리서치 보기",
  },
  notFound: {
    title: "페이지를 찾을 수 없습니다",
    description: "주소가 바뀌었거나 삭제된 페이지일 수 있습니다.",
    home: "홈으로",
  },
};

export type Dictionary = typeof ko;
