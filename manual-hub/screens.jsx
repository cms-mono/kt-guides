/* ============================================================
   통합 매뉴얼 허브 — 화면 (Home / ServiceView / AgentDetail / Search)
   ------------------------------------------------------------
   가독성 우선 리뉴얼:
   - Home: 카드 안에 매뉴얼 목록을 바로 노출(드릴다운 없이 스캔).
   - AgentDetail: 단일 컬럼 "캡처 스택" — 번호+제목 + 큰 화면 캡처 +
     한 줄 캡션만. 사이드바·배지·콜아웃·다운로드바 등 부수 요소 제거.
   ============================================================ */

const HEADER_OFFSET = 88;
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: y, behavior: "smooth" });
}

/* 본문 텍스트에서 한 줄 캡션 추출 (HTML 제거 + 첫 문장 / 길이 제한) */
function stripHtml(s) {
  return (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function firstLine(s, max) {
  const t = stripHtml(s);
  if (!t) return "";
  const m = t.match(/^.*?다\.(?=\s|$)/); // 첫 한국어 문장
  let out = m ? m[0] : t;
  const lim = max || 90;
  if (out.length > lim) out = out.slice(0, lim).trim() + "…";
  return out;
}
function agentInitial(a) {
  if (a.id === "openapi") return "API";
  return a.name.replace(/^KT |^M2X /, "").slice(0, 2);
}

/* (형광펜 제거) 에이전트명은 그대로 표시 — 병합 안내는 카드 보조 텍스트로 */
function hlName(name) {
  return name;
}

/* ============================ 다운로드 버튼 ============================
   매뉴얼·에이전트가 한 페이지(통합 다운로드 센터)에 있어 단일 버튼으로 연결 */
function DownloadButtons() {
  const url = window.HUB.DOWNLOADS;
  return (
    <div className="dl-buttons">
      <a className="dl-btn" href={url} target="_blank" rel="noopener noreferrer">
        <Icon name="download" size={16} /> 매뉴얼 · 에이전트 다운로드
      </a>
    </div>
  );
}

/* ============================ 우측 고정 네비 (전 페이지 공통) ============================ */
function RightNav({ index, onNavigate }) {
  return (
    <aside className="rnav">
      <div className="rnav-card">
        <div className="rnav-title">바로가기</div>
        {window.HUB.QUICKLINKS.map((l, i) => (
          <a key={i} className="rnav-link" href={l.url} target="_blank" rel="noopener noreferrer">
            <span>{l.label}</span>
            <Icon name="external" size={13} />
          </a>
        ))}
      </div>
    </aside>
  );
}

/* ============================ 발송 쿼리 생성기 ============================
   출처: 사내 dashboard 발송 쿼리 템플릿 (tools/dashboard/app.py)
   SDK_*_SEND 테이블 INSERT 쿼리(MariaDB·MySQL / Oracle)를 생성한다.
*/
const QGEN_TYPES = ["SMS", "LMS", "MMS", "FMS", "VMS-TTS"];
const QGEN_FIELDS = {
  SMS: ["userId", "callback", "dest", "subject", "msg"],
  LMS: ["userId", "callback", "dest", "subject", "msg"],
  MMS: ["userId", "callback", "dest", "subject", "msg", "img"],
  FMS: ["userId", "callback", "dest", "subject", "file"],
  "VMS-TTS": ["userId", "callback", "dest", "subject", "tts"],
};
const QGEN_META = {
  userId: { label: "USER_ID (KT 발급 SP_ID)", def: "SP_ID" },
  callback: { label: "회신번호 (CALLBACK)", def: "0212345678" },
  dest: { label: "수신자 DEST_INFO (이름^번호|이름^번호)", def: "홍길동^01012345678" },
  subject: { label: "제목 (SUBJECT)", def: "제목" },
  msg: { label: "메시지 본문", def: "메시지 내용" },
  img: { label: "이미지 CONTENT_DATA (파일명^타입^서브타입)", def: "이미지파일명.jpg^1^0" },
  file: { label: "첨부파일 ATTACH_FILE (확장자 포함)", def: "파일명.pdf" },
  tts: { label: "TTS 메시지", def: "음성 테스트 메시지입니다." },
};

/* 컬럼별 주석 (주석 포함 버전에서 사용) */
const QGEN_COMMENTS = {
  MSG_ID: "PK (Oracle: 시퀀스)",
  USER_ID: "발송 계정 (KT 발급 SP_ID)",
  SCHEDULE_TYPE: "0:즉시 / 1:예약",
  SUBJECT: "제목 (LMS·MMS·FMS·VMS)",
  SMS_MSG: "본문 (90byte 권장)",
  MMS_MSG: "본문",
  NOW_DATE: "등록일시 (yyyymmddHHMMSS)",
  SEND_DATE: "발송일시 (예약 시 지정)",
  CALLBACK: "회신번호 (필수)",
  DEST_INFO: "수신자 (이름^번호|이름^번호)",
  CONTENT_COUNT: "첨부 개수 (0:없음)",
  CONTENT_DATA: "첨부 (파일명^타입^서브타입)",
  MSG_TYPE: "0:TEXT / 1:HTML",
  MSG_SUBTYPE: "메시지 서브타입",
  DEST_TYPE: "수신 타입",
  CDR_ID: "그룹 ID (예약)",
  ATTACH_FILE: "첨부 파일명 (확장자 포함)",
  MENT_TYPE: "멘트 구성 (0~4)",
  VOICE_TYPE: "0:여성 / 1:남성",
  REPLY_TYPE: "0:미사용 / 1:답변받기",
  REPLY_COUNT: "답변 범위 (0~9)",
  TTS_MSG: "TTS 텍스트",
};

/* (dialect, type) → { table, rows: [[col, value], ...] } */
function qgenColumns(dialect, type, v) {
  const oracle = dialect === "oracle";
  const now = oracle ? "to_char(sysdate,'yyyymmddhh24miss')" : "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')";
  const q = (s) => "'" + String(s == null ? "" : s).replace(/'/g, "''") + "'";
  let table, rows;
  if (type === "SMS") {
    table = "SDK_SMS_SEND";
    rows = [["USER_ID", q(v.userId)], ["SCHEDULE_TYPE", "0"], ["SUBJECT", q(v.subject)], ["SMS_MSG", q(v.msg)], ["NOW_DATE", now], ["SEND_DATE", now], ["CALLBACK", q(v.callback)], ["DEST_INFO", q(v.dest)]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_SMS_SEQ.nextval"]);
  } else if (type === "LMS") {
    table = "SDK_MMS_SEND";
    rows = [["USER_ID", q(v.userId)], ["SCHEDULE_TYPE", "0"], ["NOW_DATE", now], ["SEND_DATE", now], ["CONTENT_COUNT", "0"], ["MSG_TYPE", "0"], ["CALLBACK", q(v.callback)], ["DEST_INFO", q(v.dest)], ["SUBJECT", q(v.subject)], ["MMS_MSG", q(v.msg)]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_MMS_SEQ.nextval"]);
  } else if (type === "MMS") {
    table = "SDK_MMS_SEND";
    rows = [["USER_ID", q(v.userId)], ["SCHEDULE_TYPE", "0"], ["NOW_DATE", now], ["SEND_DATE", now], ["CONTENT_COUNT", "1"], ["CONTENT_DATA", q(v.img)], ["MSG_TYPE", "0"], ["CALLBACK", q(v.callback)], ["DEST_INFO", q(v.dest)], ["SUBJECT", q(v.subject)], ["MMS_MSG", q(v.msg)]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_MMS_SEQ.nextval"]);
  } else if (type === "FMS") {
    table = "SDK_FMS_SEND";
    rows = [["USER_ID", q(v.userId)], ["MSG_SUBTYPE", "20"], ["SCHEDULE_TYPE", "0"], ["DEST_TYPE", "0"], ["SUBJECT", q(v.subject)], ["NOW_DATE", now], ["SEND_DATE", now], ["CALLBACK", q(v.callback)], ["CDR_ID", "''"], ["DEST_INFO", q(v.dest)], ["ATTACH_FILE", q(v.file)]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_FMS_SEQ.nextval"]);
  } else {
    table = "SDK_VMS_SEND";
    rows = [["USER_ID", q(v.userId)], ["MSG_SUBTYPE", "30"], ["SCHEDULE_TYPE", "0"], ["MENT_TYPE", "0"], ["VOICE_TYPE", "1"], ["SUBJECT", q(v.subject)], ["NOW_DATE", now], ["SEND_DATE", now], ["CALLBACK", q(v.callback)], ["REPLY_TYPE", "0"], ["REPLY_COUNT", "0"], ["CDR_ID", "''"], ["TTS_MSG", q(v.tts)], ["DEST_INFO", q(v.dest)]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_VMS_SEQ.nextval"]);
  }
  return { table, rows, oracle };
}

function qgenSql(dialect, type, v, commented) {
  const { table, rows, oracle } = qgenColumns(dialect, type, v);
  const e = oracle ? "" : ";";
  const colLines = rows.map((r, i) => "    " + (i ? ", " : "  ") + r[0]).join("\n");
  if (!commented) {
    const valLines = rows.map((r, i) => "    " + (i ? ", " : "  ") + r[1]).join("\n");
    return "INSERT INTO " + table + " (\n" + colLines + "\n)\nVALUES (\n" + valLines + "\n)" + e;
  }
  // 주석 포함 — 값 옆에 [컬럼] 설명
  const w = Math.min(38, Math.max.apply(null, rows.map((r) => r[1].length)));
  const valLines = rows.map((r, i) => {
    const lead = "    " + (i ? ", " : "  ");
    const cmt = QGEN_COMMENTS[r[0]] || "";
    return lead + r[1].padEnd(w) + "  -- " + r[0] + (cmt ? " : " + cmt : "");
  }).join("\n");
  return "INSERT INTO " + table + " (\n" + colLines + "\n)\nVALUES (\n" + valLines + "\n)" + e;
}

function qgenDefaults() {
  const d = {};
  Object.keys(QGEN_META).forEach((k) => { d[k] = QGEN_META[k].def; });
  return d;
}

function QueryGenerator() {
  const [dialect, setDialect] = React.useState("maria");
  const [type, setType] = React.useState("SMS");
  const [v, setV] = React.useState(qgenDefaults);
  const [commented, setCommented] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const sql = qgenSql(dialect, type, v, commented);
  const set = (k, val) => setV((p) => ({ ...p, [k]: val }));

  function copy() {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sql).then(done, done);
    } else {
      const ta = document.createElement("textarea");
      ta.value = sql; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  }

  return (
    <div className="qgen">
      <div className="qgen-controls">
        <div className="qgen-seg">
          <button className={dialect === "maria" ? "active" : ""} onClick={() => setDialect("maria")}>MariaDB · MySQL</button>
          <button className={dialect === "oracle" ? "active" : ""} onClick={() => setDialect("oracle")}>Oracle</button>
        </div>
        <div className="qgen-tabs">
          {QGEN_TYPES.map((t) => (
            <button key={t} className={"qgen-tab" + (type === t ? " active" : "")} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
        <label className="qgen-chk">
          <input type="checkbox" checked={commented} onChange={(e) => setCommented(e.target.checked)} />
          주석 포함
        </label>
      </div>

      <div className="qgen-fields">
        {QGEN_FIELDS[type].map((k) => (
          <label className="qgen-field" key={k}>
            <span>{QGEN_META[k].label}</span>
            <input value={v[k]} onChange={(e) => set(k, e.target.value)} spellCheck={false} />
          </label>
        ))}
      </div>

      <div className="qgen-out">
        <button className="qgen-copy" onClick={copy}>
          <Icon name={copied ? "check" : "doc"} size={14} /> {copied ? "복사됨" : "복사"}
        </button>
        <pre><code>{sql}</code></pre>
      </div>
    </div>
  );
}

/* ============================ HOME ============================ */
/* 서비스 카드 — 헤더 + 간단 설명 (서비스 4개만 노출, Agent 목록은 제외) */
function HomeServiceCard({ service, onNavigate }) {
  const agents = window.HUB.liveAgentsForService(service.id);
  return (
    <a className="hcard hcard-svc linkcard" onClick={() => onNavigate({ name: "service", id: service.id })}>
      <div className="hcard-head">
        <div className="hcard-logo svc"><ServiceGlyph service={service} size={20} /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="hcard-title">{service.name}</p>
        </div>
        {service.integrated && <span className="hcard-tag">통합</span>}
        {service.hasCenter && <span className="hcard-tag neutral">센터</span>}
      </div>
      <p className="hcard-desc">{service.tagline}</p>
      <div className="hcard-foot">
        <span>{agents.length}개 Agent 지원</span>
        <span className="mrow-arrow"><Icon name="arrow" size={15} /></span>
      </div>
    </a>
  );
}

/* Agent 카드 헤더 배경 팔레트 (카드별 1색 — 라이트/다크 공용 반투명 틴트) */
const AGENT_HEAD_COLORS = [
  "rgba(79,70,229,0.12)",   // indigo
  "rgba(14,148,136,0.12)",  // teal
  "rgba(225,29,72,0.10)",   // rose
  "rgba(217,119,6,0.13)",   // amber
  "rgba(14,116,144,0.12)",  // cyan
  "rgba(139,92,246,0.13)",  // violet
  "rgba(22,163,74,0.12)",   // green
  "rgba(100,116,139,0.12)", // slate
];

/* Agent 카드 — 헤더(색상 배경) + 지원 서비스 목록(매뉴얼)을 인라인 노출 */
function HomeAgentCard({ agent, idx, onNavigate }) {
  const soon = agent.status === "soon";
  const services = window.HUB.servicesForAgent(agent.id);
  const p = window.HUB.PROVIDERS[agent.provider];
  const headBg = AGENT_HEAD_COLORS[idx % AGENT_HEAD_COLORS.length];
  return (
    <div className={"hcard" + (soon ? " soon" : "")}>
      <div className="hcard-head" style={{ background: headBg }} onClick={() => !soon && onNavigate({ name: "agent", id: agent.id })}>
        <AgentAvatar agent={agent} className="hcard-logo" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="hcard-title">{window.HUB.agentDisplayName(agent, null)}</p>
          <p className="hcard-sub">{agent.cardSub || (p.name + " · " + (agent.transport === "API" ? "API 연동" : "TCP 소켓"))}</p>
        </div>
        {soon && <span className="hcard-tag soon">예정</span>}
      </div>
      <div className="mlist">
        {soon ? (
          <div className="mrow disabled">지원 서비스 확정 예정</div>
        ) : (
          services.map((s) => (
            <a
              key={s.id}
              className="mrow"
              onClick={() => onNavigate({ name: "agent", id: agent.id, anchor: "sec-" + s.id })}
            >
              <span className="mrow-badge svc"><ServiceGlyph service={s} size={13} /></span>
              <span className="mrow-text">{s.name}</span>
              <span className="mrow-arrow"><Icon name="arrow" size={15} /></span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

function Home({ index, onNavigate }) {
  const services = window.HUB.SERVICES;
  const agents = window.HUB.AGENTS;
  React.useEffect(() => {
    if (window.__homeScroll) {
      const id = window.__homeScroll; window.__homeScroll = null;
      setTimeout(() => scrollToId(id), 80);
    }
  }, []);
  return (
    <div className="page fade-up">
      <div className="wrap">
        <section className="home-sec" style={{ marginTop: 28 }}>
          <div className="home-sec-head">
            <span className="bar"></span>
            <h2>서비스별</h2>
            <span className="count">{services.length}</span>
          </div>
          <div className="hgrid cols2 stagger">
            {services.map((s) => (
              <HomeServiceCard key={s.id} service={s} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        <div className="home-divider"></div>

        <section className="home-sec" id="home-agents" style={{ paddingBottom: 64 }}>
          <div className="home-sec-head">
            <span className="bar agt"></span>
            <h2>에이전트별</h2>
            <span className="count">{agents.length}</span>
          </div>
          <div className="hgrid stagger">
            {agents.map((a, i) => (
              <HomeAgentCard key={a.id} agent={a} idx={i} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============================ SERVICE VIEW ============================ */
function ServiceView({ serviceId, index, onNavigate }) {
  const service = window.HUB.SERVICE_MAP[serviceId];
  if (!service) return <NotFound onNavigate={onNavigate} />;
  const liveAgents = window.HUB.liveAgentsForService(serviceId);
  const soonAgents = window.HUB.AGENTS.filter((a) => a.status === "soon");

  React.useEffect(() => { window.scrollTo(0, 0); }, [serviceId]);

  return (
    <div className="page fade-up">
      <div className="svc-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a onClick={() => onNavigate({ name: "home" })}>홈</a>
            <Icon name="chevron" size={14} />
            <span className="cur">{service.name}</span>
          </div>
          <div className="svc-hero-inner">
            <div className="svc-hero-icon"><ServiceGlyph service={service} size={32} /></div>
            <div style={{ flex: 1 }}>
              <h1>{service.name}</h1>
              <p>{service.tagline}</p>
              <div className="svc-hero-feats">
                {service.features.map((f) => <span className="tag" key={f}>{f}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap section-pad">
        <DownloadButtons />

        <div className="sec-head">
          <h2>지원 Agent <span className="count-pill">{liveAgents.length}</span></h2>
          <p>
            <b>{service.name}</b>를 발송할 수 있는 Agent입니다. 선택하면 해당 연동 매뉴얼로 이동합니다.
          </p>
        </div>
        <div className="hgrid">
          {liveAgents.map((a) => (
            <a key={a.id} className="hcard linkcard"
               onClick={() => onNavigate({ name: "agent", id: a.id, anchor: "sec-" + serviceId })}>
              <div className="hcard-head">
                <AgentAvatar agent={a} className="hcard-logo" />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="hcard-title">{hlName(window.HUB.agentDisplayName(a, serviceId))}</p>
                  <p className="hcard-sub">{a.desc}</p>
                </div>
                <span className="mrow-arrow"><Icon name="arrow" size={16} /></span>
              </div>
            </a>
          ))}
        </div>

        {soonAgents.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div className="sec-head">
              <h2 style={{ fontSize: 18 }}>추가 예정 <span className="count-pill">{soonAgents.length}</span></h2>
            </div>
            <div className="hgrid">
              {soonAgents.map((a) => (
                <div key={a.id} className="hcard soon">
                  <div className="hcard-head">
                    <AgentAvatar agent={a} className="hcard-logo" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p className="hcard-title">{a.name}</p>
                      <p className="hcard-sub">지원 서비스 확정 예정</p>
                    </div>
                    <span className="hcard-tag soon">예정</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ AGENT DETAIL (캡처 스택) ============================ */
/* 섹션 → 페이지 평탄화: features는 기능별로 1페이지, steps는 서비스당 1페이지 */
function buildPages(sections) {
  const pages = [];
  sections.forEach((sec) => {
    if (sec.type === "features") {
      sec.features.forEach((f) => pages.push({
        key: sec.service.id + "/" + f.id,
        serviceId: sec.service.id,
        group: sec.service.name,
        title: f.name,
        construction: !!f.construction,
        steps: f.steps || [],
        intro: f.intro,
      }));
    } else {
      pages.push({
        key: sec.service.id,
        serviceId: sec.service.id,
        group: sec.service.name,
        title: sec.service.name + " 연동 가이드",
        construction: false,
        steps: sec.steps || [],
        intro: sec.intro,
      });
    }
  });
  return pages;
}
/* 페이지를 서비스 단위로 묶어 좌측 네비 구성 */
function buildNavGroups(pages) {
  const groups = [];
  pages.forEach((p, i) => {
    let g = groups[groups.length - 1];
    if (!g || g.serviceId !== p.serviceId) {
      g = { serviceId: p.serviceId, name: p.group, items: [] };
      groups.push(g);
    }
    g.items.push({ idx: i, title: p.title, construction: p.construction });
  });
  return groups;
}

function AgentDetail({ agentId, index, onNavigate, anchor }) {
  const agent = window.HUB.AGENT_MAP[agentId];
  const sections = React.useMemo(() => window.MANUALS.getSections(agentId), [agentId]);
  const pages = React.useMemo(() => buildPages(sections), [sections]);
  const groups = React.useMemo(() => buildNavGroups(pages), [pages]);
  const dispName = agent ? window.HUB.agentDisplayName(agent, null) : "";
  const topRef = React.useRef(null);

  // anchor(sec-<serviceId>)로 진입 시 해당 서비스 첫 페이지 선택
  const initial = React.useMemo(() => {
    if (anchor && anchor.indexOf("sec-") === 0) {
      const sid = anchor.slice(4);
      const i = pages.findIndex((p) => p.serviceId === sid);
      if (i >= 0) return i;
    }
    return 0;
  }, [anchor, pages]);
  const [active, setActive] = React.useState(initial);

  React.useEffect(() => { setActive(initial); window.scrollTo(0, 0); }, [agentId, anchor, initial]);

  function goPage(i) {
    setActive(i);
    if (topRef.current) {
      const y = topRef.current.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (!agent) return <NotFound onNavigate={onNavigate} />;

  const page = pages[active] || pages[0];
  const prev = active > 0 ? pages[active - 1] : null;
  const next = active < pages.length - 1 ? pages[active + 1] : null;

  return (
    <div className="page fade-up">
      <div className="wrap doc-wrap">
        <div className="breadcrumb">
          <a onClick={() => onNavigate({ name: "home" })}>홈</a>
          <Icon name="chevron" size={14} />
          <a onClick={() => { window.__homeScroll = "home-agents"; onNavigate({ name: "home" }); }}>Agent</a>
          <Icon name="chevron" size={14} />
          <span className="cur crumb-dd">
            {dispName}
            <Icon name="chevron" size={12} style={{ transform: "rotate(90deg)", marginLeft: 3, opacity: 0.55 }} />
            <div className="crumb-menu">
              {window.HUB.AGENTS.filter((a) => a.status !== "soon" && a.id !== agentId).map((a) => (
                <a key={a.id} onClick={() => onNavigate({ name: "agent", id: a.id })}>
                  {window.HUB.agentDisplayName(a, null)}
                </a>
              ))}
            </div>
          </span>
        </div>

        <div className="doc-layout" ref={topRef}>
          <aside className="doc-nav">
            {groups.map((g, gi) => (
              <div className="doc-nav-group" key={gi}>
                <div className="doc-nav-svc">{g.name}</div>
                {g.items.map((it) => (
                  <button
                    key={it.idx}
                    className={"doc-nav-item" + (active === it.idx ? " active" : "")}
                    onClick={() => goPage(it.idx)}
                  >
                    {it.title}{it.construction ? " 🚧" : ""}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <main className="doc-main">
            <div className="doc-head-row">
              <header className="cap-head">
                <AgentAvatar agent={agent} className="cap-avatar" />
                <h1>{dispName}</h1>
              </header>
              <DownloadButtons />
            </div>
            {agent.detailIntro ? (
              <ul className="cap-lead-list">
                {agent.detailIntro.map((t, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: t }} />
                ))}
              </ul>
            ) : (
              <p className="cap-lead">{agent.desc}</p>
            )}
            <CapPage page={page} />
            <div className="doc-pager">
              <div className="doc-pager-side">
                {prev && (
                  <button className="doc-pager-btn" onClick={() => goPage(active - 1)}>
                    <span className="dir">← 이전</span>
                    <span className="t">{prev.title}</span>
                  </button>
                )}
              </div>
              <div className="doc-pager-side right">
                {next && (
                  <button className="doc-pager-btn next" onClick={() => goPage(active + 1)}>
                    <span className="dir">다음 →</span>
                    <span className="t">{next.title}</span>
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* 단일 페이지 본문 (캡처 스택 또는 공사중) */
function CapPage({ page }) {
  if (!page) return null;
  if (page.construction) {
    return (
      <div>
        <h2 className="doc-page-title">{page.title}</h2>
        <div className="cap-wip">
          <span className="cap-wip-ico">🚧</span>
          <div>
            <div className="cap-wip-title">공사 중입니다</div>
            <p>{page.intro || "이 항목은 준비 중입니다. 곧 업데이트될 예정입니다."}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 className="doc-page-title">{page.title}</h2>
      {page.intro && <p className="doc-page-intro">{page.intro}</p>}
      <div className="cap-stack">
        {page.steps.map((st, i) => <CapStep key={i} step={st} n={i + 1} />)}
      </div>
    </div>
  );
}

/* 표 렌더러 — schema: 첫 칸을 컬럼명(모노)으로 강조 */
function CapTable({ table }) {
  return (
    <div className="cap-table-wrap">
      <table className={"cap-table" + (table.schema ? " schema" : "")}>
        <thead>
          <tr>{table.cols.map((c, i) => <th key={i}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} dangerouslySetInnerHTML={{ __html: String(cell) }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 단계 한 칸 = 번호+제목 + 본문(설명/목록/표/코드/캡처/노트) */
function CapStep({ step, n }) {
  return (
    <div className="cap-step">
      <div className="cap-step-head">
        <span className="cap-num">{n}</span>
        <h3>{step.title}</h3>
      </div>
      <div className="cap-body">
        {step.body && <p dangerouslySetInnerHTML={{ __html: step.body }} />}
        {step.list && (
          <ul className="cap-list">
            {step.list.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: li }} />)}
          </ul>
        )}
        {step.table && <CapTable table={step.table} />}
        {step.tables && step.tables.map((t, i) => (
          <div className="cap-subtable" key={i}>
            {t.label && <div className="cap-subtable-label">{t.label}</div>}
            <CapTable table={t} />
          </div>
        ))}
        {step.code && <pre className="cap-code"><code>{step.code}</code></pre>}
        {step.widget === "queryGen" && <QueryGenerator />}
        {step.shot && <Shot shot={step.shot} />}
        {step.note && (
          <div className="cap-note">
            <span className="ni"><Icon name="info" size={15} /></span>
            <span dangerouslySetInnerHTML={{ __html: step.note }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ SEARCH RESULTS ============================ */
function SearchResults({ query, index, onNavigate }) {
  const [filter, setFilter] = React.useState("all");
  const [q, setQ] = React.useState(query);

  React.useEffect(() => { setQ(query); window.scrollTo(0, 0); }, [query]);

  const results = React.useMemo(() => searchIndex(index, q), [q, index]);
  const counts = React.useMemo(() => {
    const c = { all: results.length, service: 0, agent: 0, document: 0 };
    results.forEach((r) => c[r.type]++);
    return c;
  }, [results]);

  const filtered = filter === "all" ? results : results.filter((r) => r.type === filter);
  const groups = groupResults(filtered);
  const order = ["service", "agent", "document"];
  const kindLabel = { service: "서비스", agent: "Agent", document: "문서" };

  return (
    <div className="page fade-up">
      <div className="wrap">
        <div className="results-head">
          <div className="breadcrumb">
            <a onClick={() => onNavigate({ name: "home" })}>홈</a>
            <Icon name="chevron" size={14} />
            <span className="cur">검색 결과</span>
          </div>
          <div style={{ maxWidth: 560, margin: "0 0 18px" }}>
            <SearchBar
              index={index}
              onNavigate={onNavigate}
              large
              autoFocus
              placeholder="검색어를 입력하세요…"
            />
          </div>
          <h1>
            <span className="q">"{q}"</span> 검색 결과
          </h1>
          <p className="meta">{results.length}건의 결과를 찾았습니다.</p>
        </div>

        <div className="results-filters">
          {["all", "service", "agent", "document"].map((f) => (
            <button
              key={f}
              className={"filter-pill" + (filter === f ? " active" : "")}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "전체" : kindLabel[f]}
              <span className="c">{counts[f]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="ico"><Icon name="search" size={30} /></div>
            <h3>결과가 없습니다</h3>
            <p>다른 키워드로 검색하거나, 홈에서 서비스·Agent를 둘러보세요.</p>
          </div>
        ) : (
          order.map((type) =>
            groups[type] && groups[type].length ? (
              <div className="result-group" key={type}>
                <div className="result-group-h">
                  {kindLabel[type]} <span style={{ color: "var(--text-3)" }}>{groups[type].length}</span>
                  <span className="line"></span>
                </div>
                {groups[type].map((r) => (
                  <ResultItem key={r.type + r.id} r={r} q={q} onNavigate={onNavigate} />
                ))}
              </div>
            ) : null
          )
        )}
      </div>
    </div>
  );
}

function ResultItem({ r, q, onNavigate }) {
  let icoEl, kicker, tags = [];
  if (r.type === "service") {
    const s = window.HUB.SERVICE_MAP[r.id];
    icoEl = <div className="result-ico" style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}><ServiceGlyph service={s} size={20} /></div>;
    kicker = <>서비스 · {window.HUB.liveAgentsForService(s.id).length}개 Agent</>;
    tags = s.features.slice(0, 3);
  } else if (r.type === "agent") {
    const a = window.HUB.AGENT_MAP[r.id];
    const p = window.HUB.PROVIDERS[a.provider];
    icoEl = <div className={"result-ico " + p.av}><Icon name={a.transport === "TCP_SOCKET" ? "cpu" : "link"} size={20} /></div>;
    kicker = <>Agent · {p.name}</>;
    tags = [a.transport === "API" ? "API 연동" : "TCP 소켓", ...(window.HUB.showsCenter(a) ? [window.HUB.CENTERS[a.center].name + " 센터"] : [])];
  } else {
    const a = window.HUB.AGENT_MAP[r.agentId];
    const s = window.HUB.SERVICE_MAP[r.serviceId];
    icoEl = <div className="result-ico" style={{ background: "var(--bg-sunken)", color: "var(--text-3)" }}><Icon name="doc" size={20} /></div>;
    kicker = <>문서 · {a ? a.name : ""}{s ? " / " + s.name : ""}</>;
    tags = (r.keywords || []).slice(0, 3);
  }

  return (
    <div className="result-item" onClick={() => onNavigate(r.route)}>
      {icoEl}
      <div className="result-main">
        <div className="result-kicker">{kicker}</div>
        <h3 className="result-title">{highlight(r.title, q)}</h3>
        {r.body && <p className="result-snippet">{snippetHL(r.body, q)}</p>}
        {tags.length > 0 && (
          <div className="result-tags">
            {tags.map((t, i) => <span className="tag" key={i}>{t}</span>)}
          </div>
        )}
      </div>
      <span className="result-arrow"><Icon name="arrow" size={18} /></span>
    </div>
  );
}

function snippetHL(body, q) {
  const terms = q.trim().toLowerCase().split(/\s+/);
  let pos = -1;
  for (const t of terms) {
    const i = body.toLowerCase().indexOf(t);
    if (i >= 0) { pos = i; break; }
  }
  let text = body;
  if (pos > 60) text = "…" + body.slice(pos - 30);
  if (text.length > 150) text = text.slice(0, 150) + "…";
  return highlight(text, terms.find((t) => text.toLowerCase().includes(t)) || "");
}

/* ============================ NOT FOUND ============================ */
function NotFound({ onNavigate }) {
  return (
    <div className="wrap">
      <div className="empty-state">
        <div className="ico"><Icon name="search" size={30} /></div>
        <h3>찾을 수 없습니다</h3>
        <p>요청한 페이지가 존재하지 않습니다.</p>
        <button className="btn primary" style={{ marginTop: 18 }} onClick={() => onNavigate({ name: "home" })}>
          홈으로
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  Home,
  ServiceView,
  AgentDetail,
  SearchResults,
  NotFound,
  RightNav,
  scrollToId,
});
