/* ============================================================
   통합 매뉴얼 허브 — 본문 소비자(consumer)
   ------------------------------------------------------------
   실제 본문은 content/<agent>/<service>.js 셀 파일에 들어 있고
   (window.HUB_CONTENT[agentId][serviceId]), 이 파일은 그것을 읽어
   화면이 기대하는 섹션 형태로 조립만 한다.

   - 셀이 아직 없거나 비어 있으면 공용 더미(HUB_TPL)로 폴백 →
     셀을 하나씩 채워 나가도 화면은 항상 정상 동작.
   - 신규 Agent/서비스 추가: data.js에 매핑 + content에 셀 파일 추가.

   섹션 형태(= screens.jsx가 받는 계약):
     { service, download:{title,meta}, intro, type:"steps"|"features",
       steps?[], features?[] }
   ============================================================ */
(function () {
  "use strict";
  const H = window.HUB;
  const CONTENT = window.HUB_CONTENT || {};
  const TPL = window.HUB_TPL || {};

  /* 서비스별 기본 인트로(셀에서 intro로 덮어쓸 수 있음) */
  const SVC_INTRO = {
    smart: "KT 스마트메시지(크로샷)로 문자(SMS/LMS/MMS)·음성·팩스를 발송하기 위한 연동 절차입니다.",
    rcs: "브랜드 RCS 메시지(리치카드·캐러셀 포함) 발송을 위한 연동 절차입니다. 발송 전 브랜드 등록이 선행되어야 합니다.",
    twoway: "고객 회신 수신 및 대화형 시나리오 운영을 위한 양방향 송수신 연동 절차입니다.",
    communis: "Communis는 통합 서비스이므로, 발송 기능별로 연동 절차가 나뉩니다. 아래 탭에서 기능을 선택하세요.",
  };

  /* 특정 (agent, service) 셀을 가져온다(없으면 {}) */
  function cellOf(agentId, serviceId) {
    const a = CONTENT[agentId];
    return (a && a[serviceId]) || {};
  }

  /* 셀이 비었을 때 transport 기준 공용 더미 */
  function fallbackSteps(agent, svc) {
    if (agent.transport === "TCP_SOCKET") {
      return TPL.socketSteps ? TPL.socketSteps(svc.short, agent.center) : [];
    }
    return TPL.apiSteps ? TPL.apiSteps(svc.short) : [];
  }
  function fallbackFeatures() {
    return TPL.communisFeatures ? TPL.communisFeatures() : [];
  }

  /* 다운로드 바 기본 제목 */
  function defaultDlTitle(agent, svc) {
    const ctxName = H.agentDisplayName(agent, svc.id);
    return agent.id === "openapi"
      ? `${ctxName} 연동 가이드`
      : `${agent.name} × ${svc.name} 연동 가이드`;
  }

  /* ---------------- 섹션 빌더 ----------------
     Agent 한 개의 본문 섹션 = 지원 서비스마다 1섹션.
     각 섹션 본문은 해당 셀(content/<agent>/<svc>.js)에서 읽고,
     없으면 공용 더미로 폴백한다. */
  function getSections(agentId) {
    const agent = H.AGENT_MAP[agentId];
    if (!agent) return [];

    return H.servicesForAgent(agentId).map((svc) => {
      const cell = cellOf(agentId, svc.id);
      const dl = cell.download || {};
      const base = {
        service: svc,
        download: {
          title: dl.title || defaultDlTitle(agent, svc),
          meta: dl.meta || "PDF · 업데이트 2026-04-24",
        },
        intro: cell.intro || SVC_INTRO[svc.id],
      };

      if (svc.id === "communis") {
        const features =
          cell.features && cell.features.length ? cell.features : fallbackFeatures();
        return Object.assign({}, base, { type: "features", features });
      }

      const steps =
        cell.steps && cell.steps.length ? cell.steps : fallbackSteps(agent, svc);
      return Object.assign({}, base, { type: "steps", steps });
    });
  }

  /* ---------------- 검색용 문서 인덱스 ----------------
     Agent×서비스(및 Communis 기능)마다 문서 1건 생성.
     본문/키워드는 셀의 intro·features를 그대로 활용한다. */
  function buildDocuments() {
    const docs = [];
    H.AGENTS.forEach((agent) => {
      if (agent.status === "soon") return;
      H.servicesForAgent(agent.id).forEach((svc) => {
        const ctxName = H.agentDisplayName(agent, svc.id);
        const cell = cellOf(agent.id, svc.id);

        if (svc.id === "communis") {
          const features =
            cell.features && cell.features.length ? cell.features : fallbackFeatures();
          features.forEach((f) => {
            docs.push({
              id: `${agent.id}-communis-${f.id}`,
              title: `${svc.name} ${f.name} 연동 가이드 (${ctxName})`,
              keywords: [ctxName, agent.name, "Communis", f.name, "발송", "연동"],
              body: f.intro,
              agentId: agent.id,
              serviceId: "communis",
              feature: f.id,
            });
          });
        } else {
          docs.push({
            id: `${agent.id}-${svc.id}`,
            title: `${svc.name} 연동 가이드 (${ctxName})`,
            keywords: [ctxName, agent.name, svc.short, ...svc.features, "연동", "발송"],
            body: cell.intro || SVC_INTRO[svc.id],
            agentId: agent.id,
            serviceId: svc.id,
          });
        }
      });
    });
    return docs;
  }

  window.MANUALS = {
    getSections,
    documents: buildDocuments(),
    // 하위 호환: 기본 Communis 기능 구성
    COMMUNIS_FEATURES: fallbackFeatures(),
  };
})();
