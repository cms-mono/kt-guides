/* ============================================================
   통합 매뉴얼 허브 — 공용 컴포넌트
   ============================================================ */

/* ---------------- 아이콘 세트 ---------------- */
const ICONS = {
  search: "M21 21l-4.3-4.3M11 19a8 8 0 110-16 8 8 0 010 16z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevron: "M9 6l6 6-6 6",
  back: "M19 12H5M11 18l-6-6 6-6",
  download: "M12 3v12m0 0l-4-4m4 4l4-4M5 21h14",
  file: "M14 3v5h5M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5z",
  doc: "M9 13h6M9 17h4M14 3v5h5M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5z",
  message: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  sparkle: "M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z",
  exchange: "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
  moon: "M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z",
  sun: "M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  info: "M12 16v-4M12 8h.01M12 22a10 10 0 100-20 10 10 0 000 20z",
  check: "M20 6L9 17l-5-5",
  checkCircle: "M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14.1l-3-3",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  cpu: "M9 9h6v6H9zM4 9h1M4 15h1M19 9h1M19 15h1M9 4v1M15 4v1M9 19v1M15 19v1M6 6h12v12H6z",
  api: "M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.8 1.7M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7",
  link: "M9 17H7A5 5 0 017 7h2M15 7h2a5 5 0 010 10h-2M8 12h8",
  building: "M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h.01M9 13h.01M9 17h.01",
  bolt: "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  compass: "M12 22a10 10 0 100-20 10 10 0 000 20zM16.2 7.8l-2.9 6.4-6.4 2.9 2.9-6.4 6.4-2.9z",
  x: "M18 6L6 18M6 6l12 12",
  command: "M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M6 9V6a3 3 0 013-3M18 9V6a3 3 0 00-3-3M6 15v3a3 3 0 003 3M18 15v3a3 3 0 01-3 3",
  hash: "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  external: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  globe: "M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  book: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z",
};

function Icon({ name, size, style, className }) {
  const d = ICONS[name];
  if (!d) return null;
  const paths = d.split("M").filter(Boolean).map((p) => "M" + p);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size || 24}
      height={size || 24}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}

/* ---------------- 배지 ---------------- */
function ProviderBadge({ provider, dot }) {
  const p = window.HUB.PROVIDERS[provider];
  if (!p) return null;
  const icon = provider === "KT" ? "building" : provider === "Mono" ? "cpu" : "api";
  return (
    <span className={"badge " + p.cls}>
      <Icon name={icon} size={12} />
      {p.name}
    </span>
  );
}

function TransportBadge({ transport }) {
  const isApi = transport === "API";
  return (
    <span className="badge transport">
      <Icon name={isApi ? "link" : "cpu"} size={12} />
      {isApi ? "API 연동" : "TCP 소켓 엔진"}
    </span>
  );
}

function CenterBadge({ center }) {
  const c = window.HUB.CENTERS[center];
  if (!c) return null;
  const cls = center === "legacy" ? "legacy" : "nextgen";
  return (
    <span className={"badge dot " + cls} title={c.engine + " 연동"}>
      {c.name} 센터
    </span>
  );
}

function SoonBadge() {
  return <span className="badge soon">추가 예정</span>;
}

/* 서비스 아이콘 (provider tint 없이 accent) */
function ServiceGlyph({ service, size }) {
  return <Icon name={service.icon || "message"} size={size || 24} />;
}

/* Agent 아바타 (provider 색) */
function AgentAvatar({ agent, className }) {
  const p = window.HUB.PROVIDERS[agent.provider];
  const initial =
    agent.id === "openapi"
      ? "API"
      : agent.name.replace(/^KT |^M2X /, "").slice(0, 2);
  return (
    <div className={(className || "agent-avatar") + " " + p.av}>
      {agent.transport === "TCP_SOCKET" ? <Icon name="cpu" size={18} /> : initial}
    </div>
  );
}

/* ---------------- 하이라이트 ---------------- */
function highlight(text, q) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/* ---------------- 검색바 + 자동완성 ---------------- */
function SearchBar({ index, onNavigate, large, placeholder, autoFocus }) {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const ref = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  React.useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = React.useMemo(() => {
    if (!q.trim()) return [];
    return searchIndex(index, q).slice(0, 8);
  }, [q, index]);

  React.useEffect(() => setActive(0), [q]);

  function go(r) {
    setOpen(false);
    setQ("");
    onNavigate(r.route);
  }
  function submit() {
    if (results[active]) {
      go(results[active]);
    } else if (q.trim()) {
      setOpen(false);
      onNavigate({ name: "search", q: q.trim() });
      setQ("");
    }
  }
  function onKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current && inputRef.current.blur();
    }
  }

  const groups = groupResults(results);
  const kindLabel = { service: "서비스", agent: "Agent", document: "문서" };

  return (
    <div className="search" ref={ref}>
      <div className={"search-box" + (large ? " lg" : "")}>
        <Icon name="search" />
        <input
          ref={inputRef}
          value={q}
          placeholder={placeholder || "문서·서비스·Agent 검색…"}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => q && setOpen(true)}
          onKeyDown={onKey}
        />
        {q ? (
          <button className="search-clear" onClick={() => { setQ(""); inputRef.current.focus(); }} aria-label="지우기">
            <Icon name="x" size={16} />
          </button>
        ) : (
          !large && <span className="search-kbd">⌘K</span>
        )}
      </div>

      {open && q.trim() && (
        <div className="ac">
          {results.length === 0 ? (
            <div className="ac-empty">
              "<b>{q}</b>"에 대한 결과가 없습니다.
            </div>
          ) : (
            <>
              {["service", "agent", "document"].map((type) =>
                groups[type] && groups[type].length ? (
                  <div key={type}>
                    <div className="ac-group-label">{kindLabel[type]}</div>
                    {groups[type].map((r) => {
                      const flatIdx = results.indexOf(r);
                      return (
                        <div
                          key={r.type + r.id}
                          className={"ac-item" + (flatIdx === active ? " active" : "")}
                          onMouseEnter={() => setActive(flatIdx)}
                          onMouseDown={(e) => { e.preventDefault(); go(r); }}
                        >
                          <AcIcon r={r} />
                          <div className="ac-main">
                            <div className="ac-title">{highlight(r.title, q)}</div>
                            <div className="ac-snippet">{snippet(r, q)}</div>
                          </div>
                          <span className="ac-kind">{kindLabel[r.type]}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : null
              )}
              <div className="ac-foot">
                <span>↑↓ 이동 · ↵ 열기</span>
                <span>전체 결과 보기 ↵</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AcIcon({ r }) {
  if (r.type === "service") {
    const s = window.HUB.SERVICE_MAP[r.id];
    return (
      <div className="ac-ico av-svc" style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}>
        <ServiceGlyph service={s} size={15} />
      </div>
    );
  }
  if (r.type === "agent") {
    const a = window.HUB.AGENT_MAP[r.id];
    const p = window.HUB.PROVIDERS[a.provider];
    return <div className={"ac-ico " + p.av}><Icon name={a.transport === "TCP_SOCKET" ? "cpu" : "link"} size={15} /></div>;
  }
  return (
    <div className="ac-ico" style={{ background: "var(--bg-sunken)", color: "var(--text-3)" }}>
      <Icon name="doc" size={15} />
    </div>
  );
}

function snippet(r, q) {
  const text = (r.body || "") + " " + (r.keywords || []).join(" · ");
  return text.length > 64 ? text.slice(0, 64) + "…" : text;
}

/* ---------------- 검색 로직 ---------------- */
function searchIndex(index, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = [];
  index.forEach((item) => {
    const title = (item.title || "").toLowerCase();
    const kw = (item.keywords || []).join(" ").toLowerCase();
    const body = (item.body || "").toLowerCase();
    let score = 0;
    terms.forEach((t) => {
      if (title.includes(t)) score += title.startsWith(t) ? 12 : 8;
      if (kw.includes(t)) score += 5;
      if (body.includes(t)) score += 2;
    });
    // type weight
    if (score > 0) {
      if (item.type === "service") score += 3;
      else if (item.type === "agent") score += 2;
      scored.push({ ...item, _score: score });
    }
  });
  return scored.sort((a, b) => b._score - a._score);
}

function groupResults(results) {
  const g = {};
  results.forEach((r) => {
    (g[r.type] = g[r.type] || []).push(r);
  });
  return g;
}

/* ---------------- 카드 ---------------- */
function ServiceCard({ service, onOpen }) {
  const agents = window.HUB.liveAgentsForService(service.id);
  const soon = window.HUB.AGENTS.filter((a) => a.status === "soon").length;
  return (
    <div className="card svc-card" onClick={() => onOpen({ name: "service", id: service.id })}>
      <div className="svc-top">
        <div className="svc-icon"><ServiceGlyph service={service} /></div>
        {service.integrated && (
          <span className="badge mono"><Icon name="layers" size={12} />통합 서비스</span>
        )}
        {service.hasCenter && (
          <span className="badge neutral"><Icon name="cpu" size={12} />센터 구분</span>
        )}
      </div>
      <div>
        <h3 className="svc-name">{service.name}</h3>
        <p className="svc-tagline">{service.tagline}</p>
      </div>
      <div className="svc-feats">
        {service.features.slice(0, 4).map((f) => (
          <span className="tag" key={f}>{f}</span>
        ))}
      </div>
      <div className="svc-foot">
        <span className="svc-count">
          <b>{agents.length}</b>개 Agent 지원{soon ? ` · ${soon} 예정` : ""}
        </span>
        <span className="svc-go">Agent 보기 <Icon name="arrow" size={15} /></span>
      </div>
    </div>
  );
}

function AgentCard({ agent, onOpen, contextServiceId }) {
  const svcCount = agent.supports.length;
  const showCenter = window.HUB.showsCenter(agent) &&
    (!contextServiceId || contextServiceId === "smart");
  const soon = agent.status === "soon";
  const dispName = window.HUB.agentDisplayName(agent, contextServiceId);
  return (
    <div
      className="card agent-card"
      onClick={() => !soon && onOpen({ name: "agent", id: agent.id })}
      style={soon ? { cursor: "default", opacity: 0.72 } : null}
    >
      <div className="agent-top">
        <AgentAvatar agent={agent} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="agent-name">
            {dispName}
            {soon && <SoonBadge />}
          </h3>
          <p className="agent-desc">{agent.desc}</p>
        </div>
      </div>
      <div className="agent-meta">
        <ProviderBadge provider={agent.provider} />
        <TransportBadge transport={agent.transport} />
        {showCenter && <CenterBadge center={agent.center} />}
      </div>
      {agent.versions && agent.versions.length > 0 && (
        <div className="agent-meta">
          {agent.versions.map((v) => (
            <span className="tag" key={v}>{v}</span>
          ))}
        </div>
      )}
      <div className="agent-foot">
        <span className="svc-count">
          {soon ? "지원 서비스 확정 예정" : <><b>{svcCount}</b>개 서비스 지원</>}
        </span>
        {!soon && <span className="svc-go">매뉴얼 <Icon name="arrow" size={15} /></span>}
      </div>
    </div>
  );
}

/* ---------------- 스크린샷 플레이스홀더 ---------------- */
function Shot({ shot }) {
  if (!shot) return null;
  return (
    <div className="shot">
      <div className="shot-bar">
        <div className="shot-dots"><i></i><i></i><i></i></div>
        <span className="shot-url">{shot.url}</span>
      </div>
      <div className="shot-canvas">
        <div className="shot-label">
          <Icon name="grid" size={26} />
          <span>{shot.label}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 블록 ---------------- */
function StepBlock({ step, n }) {
  return (
    <div className="step">
      <div className="step-num">{n}</div>
      <div className="step-body">
        <h4>{step.title}</h4>
        {step.body && <p dangerouslySetInnerHTML={{ __html: step.body }} />}
        {step.list && (
          <ul>
            {step.list.map((li, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: li }} />
            ))}
          </ul>
        )}
        {step.shot && <Shot shot={step.shot} />}
        {step.note && (
          <div className="step-note">
            <span className="ni"><Icon name="info" size={15} /></span>
            <span dangerouslySetInnerHTML={{ __html: step.note }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* 공식 사이트 / 참고 링크 */
function siteHost(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return url; }
}
function SiteLinks({ sites, compact }) {
  if (!sites || !sites.length) return null;
  return (
    <div className={"site-links" + (compact ? " compact" : "")}>
      {sites.map((s, i) => (
        <a
          key={i}
          className="site-link"
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="site-link-ico"><Icon name="globe" size={18} /></div>
          <div className="site-link-main">
            <div className="site-link-top">
              <span className="site-kind">{s.kind}</span>
              <span className="site-title">{s.title}</span>
            </div>
            <div className="site-desc">{s.desc}</div>
            <div className="site-url"><Icon name="external" size={12} />{siteHost(s.url)}</div>
          </div>
          <span className="site-arrow"><Icon name="arrow" size={16} /></span>
        </a>
      ))}
    </div>
  );
}

/* 다운로드 바 */
function DownloadBar({ download }) {
  return (
    <div className="dl-bar">
      <div className="fileico"><Icon name="file" size={20} /></div>
      <div className="dl-info">
        <div className="t">{download.title}</div>
        <div className="m">{download.meta}</div>
      </div>
      <button className="btn primary sm" onClick={(e) => e.stopPropagation()}>
        <Icon name="download" size={16} /> 다운로드
      </button>
    </div>
  );
}

Object.assign(window, {
  Icon,
  ProviderBadge,
  TransportBadge,
  CenterBadge,
  SoonBadge,
  ServiceGlyph,
  AgentAvatar,
  SearchBar,
  ServiceCard,
  AgentCard,
  Shot,
  StepBlock,
  DownloadBar,
  SiteLinks,
  siteHost,
  highlight,
  searchIndex,
});
