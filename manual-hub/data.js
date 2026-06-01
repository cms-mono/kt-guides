/* ============================================================
   통합 매뉴얼 허브 — 데이터 모델
   서비스 / Agent / 매핑(2.3) 기준. 데이터 기반(반복형) 설계.
   신규 Agent는 AGENTS 배열에 한 줄(객체) 추가 + supports 매핑만
   채우면 양방향 네비게이션에 자동 반영된다.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 서비스 (4종) ---------------- */
  const SERVICES = [
    {
      id: "smart",
      name: "KT 스마트메시지",
      short: "스마트메시지",
      tagline: "문자 · 음성 · 팩스를 발송하는 KT 대표 메시징 서비스 (크로샷).",
      features: ["문자(SMS/LMS/MMS)", "음성(보이스)", "팩스"],
      hasCenter: true,
      icon: "message",
      sites: [
        { kind: "서비스 소개", title: "스마트메시지 biz (크로샷)", url: "https://www.ktsmartmsg.com/XroshotBIZ/product.jsp", desc: "크로샷 상품 소개, 이용안내, 요금안내" },
        { kind: "Open API", title: "크로샷 Open API", url: "https://openapi.xroshot.com/", desc: "BIZ API 가이드, SDK 다운로드, API 테스트 (HMAC+IP 인증)" },
      ],
    },
    {
      id: "communis",
      name: "Communis",
      short: "Communis",
      tagline: "문자 · RCS · 카카오 알림톡 · 국제 SMS를 하나로 묶은 통합 메시징 서비스.",
      features: ["통합 API", "문자", "RCS", "카카오 알림톡", "메일·앱푸쉬", "국제 SMS", "2FA"],
      hasCenter: false,
      integrated: true,
      icon: "layers",
      sites: [
        { kind: "서비스 소개", title: "KT Communis", url: "https://communis.kt.co.kr/", desc: "통합 메시징 API 플랫폼, 요금, 이용 가이드, 콘솔" },
      ],
    },
    {
      id: "rcs",
      name: "KT RCS",
      short: "RCS",
      tagline: "브랜드 카드 · 캐러셀 · 리치 콘텐츠를 발송하는 RCS 전용 서비스.",
      features: ["RCS 단문/장문", "리치카드", "캐러셀"],
      hasCenter: false,
      icon: "sparkle",
      sites: [
        { kind: "Biz Center", title: "RCS Biz Center", url: "https://www.rcsbizcenter.com/main", desc: "RCS 브랜드, 에이전트 등록 및 메시지 관리" },
        { kind: "발송 연동", title: "RCS 헤르메스 (Hermes)", url: "https://rcs.hermes.kt.com/", desc: "RCS 발송 연동 게이트웨이, 운영 포털" },
      ],
    },
    {
      id: "twoway",
      name: "KT 양방향서비스",
      short: "양방향",
      tagline: "고객 회신을 수신하고 대화형 시나리오를 운영하는 양방향 송수신 서비스.",
      features: ["양방향 발송", "수신(인바운드)", "키워드 응답"],
      hasCenter: false,
      icon: "exchange",
      sites: [],
    },
  ];

  /* ---------------- Agent (접근 방식) ----------------
     provider: "service" | "KT" | "Mono"
     transport: "API" | "TCP_SOCKET"
     center: "legacy" | "next_gen" | null   (KT 스마트메시지 연동 엔진만)
     supports: [serviceId...]               (매핑표 2.3)
     status: "live" | "soon"
  */
  const AGENTS = [
    {
      id: "openapi",
      name: "서비스 API",
      label: "API",
      provider: "service",
      transport: "API",
      center: null,
      desc: "각 서비스가 자체적으로 제공하는 표준 REST API 연동 방식. 별도 엔진 설치 없이 HTTP로 직접 연동한다. KT 스마트메시지(크로샷)에서는 이 방식을 'openAPI'라고 부른다.",
      aliases: ["openAPI", "open API", "REST API"],
      versions: [],
      supports: ["smart", "communis", "rcs", "twoway"],
      status: "live",
    },
    {
      id: "mcsagent",
      name: "KT McsAgent",
      label: "엔진",
      provider: "KT",
      transport: "TCP_SOCKET",
      center: "legacy",
      desc: "KT가 직접 제공하는 TCP 소켓 통신 엔진. 스마트메시지(크로샷) 전용이며 1·2센터(레거시)에 연동한다.",
      versions: ["스마트메시지 버전", "스마트메시지 + RCS 버전"],
      supports: ["smart", "rcs"],
      status: "live",
    },
    {
      id: "xmcsagent",
      name: "KT X_McsAgent",
      label: "엔진",
      provider: "KT",
      transport: "TCP_SOCKET",
      center: "next_gen",
      desc: "McsAgent와 동일 구성의 TCP 소켓 엔진으로, 차세대 센터에 연동한다. 스마트메시지·RCS 발송을 지원한다.",
      versions: ["스마트메시지 버전", "스마트메시지 + RCS 버전"],
      supports: ["smart", "rcs"],
      status: "live",
    },
    {
      id: "m2x",
      name: "M2X Agent",
      label: "API 연동",
      provider: "Mono",
      transport: "API",
      center: null,
      desc: "Mono가 자체 API 서비스 연동용으로 제공하는 기본 Agent. 경량 연동에 적합하다.",
      versions: [],
      supports: ["smart", "rcs"],
      status: "live",
    },
    {
      id: "m2x_one",
      name: "M2X ONE",
      label: "API 연동",
      provider: "Mono",
      transport: "API",
      center: null,
      desc: "여러 서비스를 단일 연동 포인트로 통합한 Mono Agent. 스마트메시지·Communis·RCS를 함께 지원한다.",
      versions: [],
      supports: ["smart", "communis", "rcs"],
      status: "live",
    },
    {
      id: "m2x_ent",
      name: "M2X Ent",
      label: "API 연동",
      provider: "Mono",
      transport: "API",
      center: null,
      desc: "대량 발송·고가용성을 위한 엔터프라이즈급 Mono Agent. 멀티 채널 통합 운영에 적합하다.",
      versions: [],
      supports: ["smart", "communis", "rcs"],
      status: "live",
    },
    {
      id: "tw",
      name: "TW Agent",
      label: "API 연동",
      provider: "Mono",
      transport: "API",
      center: null,
      desc: "양방향 송수신 전용 Mono Agent. 인바운드 수신과 대화형 시나리오 연동을 담당한다.",
      versions: [],
      supports: ["twoway"],
      status: "live",
    },
    {
      id: "odyssey",
      name: "오딧세이",
      label: "API 연동",
      provider: "Mono",
      transport: "API",
      center: null,
      desc: "M2X 계열을 리브랜딩한 차세대 Mono Agent. 출시 후 지원 서비스가 순차 확정될 예정이다.",
      versions: [],
      supports: [],
      status: "soon",
    },
    {
      id: "odyssey_air",
      name: "오딧세이 에어",
      label: "API 연동",
      provider: "Mono",
      transport: "API",
      center: null,
      desc: "오딧세이의 경량 버전. 빠른 도입과 소규모 연동을 위한 Agent로 추가 예정이다.",
      versions: [],
      supports: [],
      status: "soon",
    },
  ];

  /* ---------------- 센터 구분 (스마트메시지 전용) ---------------- */
  const CENTERS = {
    legacy: { id: "legacy", name: "레거시", desc: "1·2센터", engine: "KT McsAgent" },
    next_gen: { id: "next_gen", name: "차세대", desc: "차세대 센터", engine: "KT X_McsAgent" },
  };

  /* ---------------- provider 메타 ---------------- */
  const PROVIDERS = {
    service: { key: "service", name: "서비스 자체", cls: "svc", av: "av-svc" },
    KT: { key: "KT", name: "KT 제공", cls: "kt", av: "av-kt" },
    Mono: { key: "Mono", name: "Mono 제공", cls: "mono", av: "av-mono" },
  };

  /* ---------------- 파생 헬퍼 ---------------- */
  const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
  const SERVICE_MAP = byId(SERVICES);
  const AGENT_MAP = byId(AGENTS);

  // 특정 서비스를 지원하는 Agent 목록 (status 무관 — soon이면 '추가 예정' 표기)
  function agentsForService(serviceId) {
    return AGENTS.filter(
      (a) => a.supports.includes(serviceId) || a.status === "soon"
    );
  }
  // 실제 지원(live)하는 Agent만
  function liveAgentsForService(serviceId) {
    return AGENTS.filter((a) => a.supports.includes(serviceId));
  }
  // Agent가 지원하는 서비스 목록 (본문 섹션 순서 = SERVICES 순서)
  function servicesForAgent(agentId) {
    const a = AGENT_MAP[agentId];
    if (!a) return [];
    return SERVICES.filter((s) => a.supports.includes(s.id));
  }
  // 이 Agent에 센터 배지를 노출할지 (스마트메시지 연동 엔진만)
  function showsCenter(agent) {
    return !!agent.center && agent.supports.includes("smart");
  }

  // 문맥(서비스)에 따른 Agent 표시명.
  // openAPI는 KT 스마트메시지(크로샷)에서만 'openAPI'로 불리고,
  // 다른 서비스에서는 각 서비스의 자체 API로 표현된다.
  function agentDisplayName(agent, serviceId) {
    if (!agent) return "";
    if (agent.id === "openapi") {
      if (serviceId === "smart") return "openAPI";
      if (serviceId && SERVICE_MAP[serviceId]) return SERVICE_MAP[serviceId].short + " API";
      return agent.name; // 단독 노출(홈 목록/상세 헤더) — "서비스 API"
    }
    return agent.name;
  }

  // 전역 검색 인덱스 빌드 (서비스 / Agent / 문서)
  function buildSearchIndex(manuals) {
    const idx = [];
    SERVICES.forEach((s) =>
      idx.push({
        type: "service",
        id: s.id,
        title: s.name,
        keywords: [s.short, ...s.features, ...((s.sites || []).map((x) => x.title))],
        body: s.tagline,
        route: { name: "service", id: s.id },
      })
    );
    AGENTS.forEach((a) =>
      idx.push({
        type: "agent",
        id: a.id,
        title: a.name,
        keywords: [
          PROVIDERS[a.provider].name,
          a.transport === "API" ? "API" : "소켓",
          a.label,
          ...(a.aliases || []),
        ],
        body: a.desc,
        route: { name: "agent", id: a.id },
      })
    );
    if (manuals && manuals.documents) {
      manuals.documents.forEach((d) =>
        idx.push({
          type: "document",
          id: d.id,
          title: d.title,
          keywords: d.keywords || [],
          body: d.body || "",
          agentId: d.agentId,
          serviceId: d.serviceId,
          feature: d.feature || null,
          route: { name: "agent", id: d.agentId, anchor: "sec-" + d.serviceId },
        })
      );
    }
    return idx;
  }

  window.HUB = {
    SERVICES,
    AGENTS,
    CENTERS,
    PROVIDERS,
    SERVICE_MAP,
    AGENT_MAP,
    agentsForService,
    liveAgentsForService,
    servicesForAgent,
    showsCenter,
    agentDisplayName,
    buildSearchIndex,
  };
})();
