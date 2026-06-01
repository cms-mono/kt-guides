/* ============================================================
   통합 매뉴얼 허브 — 화면 (Home / ServiceView / AgentDetail / Search)
   ============================================================ */

const HEADER_OFFSET = 88;
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: y, behavior: "smooth" });
}

/* ============================ HOME ============================ */
function Home({ index, onNavigate }) {
  const [tab, setTab] = React.useState("service");
  const services = window.HUB.SERVICES;
  const agents = window.HUB.AGENTS;

  return (
    <div className="page fade-up">
      <div className="wrap">
        <section className="hero">
          <div className="hero-eyebrow"><span className="dot"></span>KT 메시징 · 통합 문서 허브</div>
          <h1>
            모든 매뉴얼을<br />
            <span className="grad">한 곳에서 찾고 받으세요</span>
          </h1>
          <p>
            서비스와 Agent, 두 갈래 어디로 들어와도 원하는 연동 가이드에 도달합니다.
            검색하고, 열람하고, 바로 다운로드하세요.
          </p>
          <div className="hero-search">
            <SearchBar index={index} onNavigate={onNavigate} large placeholder="서비스, Agent, 문서를 검색해 보세요…" />
          </div>
          <div className="hero-quick">
            <span>바로가기</span>
            <button className="chip" onClick={() => onNavigate({ name: "service", id: "communis" })}>Communis 통합</button>
            <button className="chip" onClick={() => onNavigate({ name: "agent", id: "openapi" })}>서비스 API</button>
            <button className="chip" onClick={() => onNavigate({ name: "service", id: "smart" })}>스마트메시지</button>
            <button className="chip" onClick={() => onNavigate({ name: "search", q: "카카오 알림톡" })}>카카오 알림톡</button>
          </div>
        </section>

        <section style={{ paddingBottom: 64 }}>
          <div className="tabs">
            <button className={"tab" + (tab === "service" ? " active" : "")} onClick={() => setTab("service")}>
              <Icon name="layers" size={16} /> 서비스별 보기
            </button>
            <button className={"tab" + (tab === "agent" ? " active" : "")} onClick={() => setTab("agent")}>
              <Icon name="cpu" size={16} /> Agent별 보기
            </button>
          </div>
          <p className="tab-hint">
            {tab === "service"
              ? "서비스를 선택하면 해당 서비스를 지원하는 Agent 목록을 보여줍니다."
              : "Agent를 선택하면 그 Agent가 지원하는 서비스별 매뉴얼을 보여줍니다."}
          </p>

          {tab === "service" ? (
            <div className="grid svc stagger" key="svc">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} onOpen={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="grid agents stagger" key="agent">
              {agents.map((a) => (
                <AgentCard key={a.id} agent={a} onOpen={onNavigate} />
              ))}
            </div>
          )}
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
            <a onClick={() => onNavigate({ name: "home", tab: "service" })}>서비스</a>
            <Icon name="chevron" size={14} />
            <span className="cur">{service.name}</span>
          </div>
          <div className="svc-hero-inner">
            <div className="svc-hero-icon"><ServiceGlyph service={service} size={32} /></div>
            <div style={{ flex: 1 }}>
              <h1>
                {service.name}
                {service.integrated && <span className="badge mono"><Icon name="layers" size={12} />통합 서비스</span>}
                {service.hasCenter && <span className="badge neutral"><Icon name="cpu" size={12} />센터 구분 있음</span>}
              </h1>
              <p>{service.tagline}</p>
              <div className="svc-hero-feats">
                {service.features.map((f) => <span className="tag" key={f}>{f}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap section-pad">
        {service.sites && service.sites.length > 0 && (
          <div style={{ marginBottom: 44 }}>
            <div className="sec-head">
              <h2 style={{ fontSize: 18 }}>
                <Icon name="globe" size={18} style={{ color: "var(--accent-text)" }} /> 공식 사이트 · 참고 링크
              </h2>
              <p>{service.name} 연동·운영에 필요한 공식 포털과 문서입니다.</p>
            </div>
            <SiteLinks sites={service.sites} />
          </div>
        )}

        <div className="sec-head">
          <h2>
            지원 Agent
            <span className="count-pill">{liveAgents.length}</span>
          </h2>
          <p>
            아래는 <b>{service.name}</b>를 발송할 수 있는 Agent입니다. 카드를 선택하면 해당 Agent의 연동 매뉴얼로 이동합니다.
            {service.hasCenter && " KT 스마트메시지 연동 엔진에는 센터 배지(레거시/차세대)가 표시됩니다."}
          </p>
        </div>
        <div className="grid agents stagger">
          {liveAgents.map((a) => (
            <AgentCard key={a.id} agent={a} onOpen={onNavigate} contextServiceId={serviceId} />
          ))}
        </div>

        {soonAgents.length > 0 && (
          <div style={{ marginTop: 44 }}>
            <div className="sec-head">
              <h2 style={{ fontSize: 18 }}>추가 예정 <span className="count-pill">{soonAgents.length}</span></h2>
              <p>오딧세이 계열은 리브랜딩 출시 후 지원 서비스가 확정되면 이 목록에 자동 반영됩니다.</p>
            </div>
            <div className="grid agents">
              {soonAgents.map((a) => (
                <AgentCard key={a.id} agent={a} onOpen={onNavigate} contextServiceId={serviceId} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ AGENT DETAIL ============================ */
function AgentDetail({ agentId, index, onNavigate, anchor }) {
  const agent = window.HUB.AGENT_MAP[agentId];
  const sections = React.useMemo(() => window.MANUALS.getSections(agentId), [agentId]);
  const [activeSec, setActiveSec] = React.useState(sections[0] ? sections[0].service.id : null);
  const showCenter = agent && window.HUB.showsCenter(agent);
  const dispName = agent ? window.HUB.agentDisplayName(agent, null) : "";
  const isOpenApi = agent && agent.id === "openapi";

  React.useEffect(() => {
    window.scrollTo(0, 0);
    setActiveSec(sections[0] ? sections[0].service.id : null);
    if (anchor) {
      const t = setTimeout(() => scrollToId(anchor), 120);
      return () => clearTimeout(t);
    }
  }, [agentId]);

  // scroll spy
  React.useEffect(() => {
    const ids = sections.map((s) => "sec-" + s.service.id);
    function onScroll() {
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= HEADER_OFFSET + 40) cur = id;
      }
      if (cur) setActiveSec(cur.replace("sec-", ""));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [agentId, sections]);

  if (!agent) return <NotFound onNavigate={onNavigate} />;

  return (
    <div className="page fade-up">
      <div className="wrap">
        <div className="detail-grid">
          {/* LEFT — 전체 목차 */}
          <aside className="toc-left">
            <p className="toc-left-title">전체 메뉴</p>
            <a onClick={() => onNavigate({ name: "home" })}>홈</a>
            <a onClick={() => onNavigate({ name: "home", tab: "agent" })}>모든 Agent</a>
            <div style={{ height: 1, background: "var(--border)", margin: "10px 12px" }}></div>
            <p className="toc-left-title">이 Agent의 서비스</p>
            {sections.map((s, i) => (
              <a key={s.service.id} onClick={() => scrollToId("sec-" + s.service.id)}
                 style={activeSec === s.service.id ? { color: "var(--accent-text)", background: "var(--surface-2)" } : null}>
                {i + 1}. {s.service.name}
              </a>
            ))}
          </aside>

          {/* CENTER — 본문 */}
          <main style={{ minWidth: 0 }}>
            <div className="breadcrumb">
              <a onClick={() => onNavigate({ name: "home" })}>홈</a>
              <Icon name="chevron" size={14} />
              <a onClick={() => onNavigate({ name: "home", tab: "agent" })}>Agent</a>
              <Icon name="chevron" size={14} />
              <span className="cur">{dispName}</span>
            </div>

            <header className="detail-head">
              <div className="detail-head-top">
                <AgentAvatar agent={agent} className="detail-avatar" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1>{dispName}</h1>
                  <p className="lead">{agent.desc}</p>
                </div>
              </div>
              <div className="detail-badges">
                <ProviderBadge provider={agent.provider} />
                <TransportBadge transport={agent.transport} />
                {showCenter && <CenterBadge center={agent.center} />}
                {agent.versions.map((v) => <span className="tag" key={v}>{v}</span>)}
              </div>
            </header>

            {showCenter && (
              <div className="callout warn">
                <span className="ico"><Icon name="cpu" size={20} /></span>
                <div className="callout-body">
                  이 엔진은 <b>{window.HUB.CENTERS[agent.center].name} 센터</b>({window.HUB.CENTERS[agent.center].desc})에 연동됩니다.
                  센터 구분은 <b>KT 스마트메시지(크로샷) 전용</b>이며, 다른 서비스에는 해당하지 않습니다.
                </div>
              </div>
            )}

            <div className="callout">
              <span className="ico"><Icon name="info" size={20} /></span>
              <div className="callout-body">
                {isOpenApi ? (
                  <>
                    이 방식은 각 서비스가 자체 제공하는 <b>REST API</b>입니다. <b>KT 스마트메시지(크로샷)</b>에서는 <b>openAPI</b>로 부르며,
                    Communis·RCS·양방향에서는 각 서비스의 자체 API(예: <b>Communis API</b>, <b>RCS API</b>)로 표현됩니다.
                  </>
                ) : (
                  <>
                    <b>{dispName}</b>는 {agent.supports.length}개 서비스를 지원합니다. 우측 네비게이터에서 서비스를 선택하면 해당 섹션으로 바로 이동합니다.
                  </>
                )}
              </div>
            </div>

            {/* mobile section nav */}
            <div className="mobile-secnav">
              <select value={activeSec || ""} onChange={(e) => scrollToId("sec-" + e.target.value)}>
                {sections.map((s) => (
                  <option key={s.service.id} value={s.service.id}>{s.service.name} 섹션으로 이동</option>
                ))}
              </select>
            </div>

            {sections.map((sec, i) => (
              <ServiceSection key={sec.service.id} sec={sec} n={i + 1} agent={agent} />
            ))}
          </main>

          {/* RIGHT — sticky 서비스 네비게이터 */}
          <aside className="toc-right">
            <div className="toc-right-card">
              <p className="toc-right-title">지원 서비스</p>
              <p className="toc-right-sub">이 Agent로 발송 가능한 서비스</p>
              {sections.map((s, i) => (
                <div
                  key={s.service.id}
                  className={"spy-item" + (activeSec === s.service.id ? " active" : "")}
                  onClick={() => scrollToId("sec-" + s.service.id)}
                >
                  <span className="spy-num">{i + 1}</span>
                  <div className="spy-main">
                    <div className="spy-name">{s.service.name}</div>
                    <div className="spy-sub">{s.service.features.slice(0, 2).join(" · ")}</div>
                  </div>
                </div>
              ))}
              <div className="toc-right-dl">
                <button className="btn ghost sm" style={{ width: "100%", justifyContent: "center" }}>
                  <Icon name="download" size={16} /> 전체 매뉴얼 받기
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* 서비스 섹션 (본문 한 덩어리) */
function ServiceSection({ sec, n, agent }) {
  const svc = sec.service;
  const ctxName = agent && agent.id === "openapi"
    ? window.HUB.agentDisplayName(agent, svc.id)
    : null;
  return (
    <section className="svc-section" id={"sec-" + svc.id}>
      <div className="svc-section-head">
        <span className="svc-section-num">{n}</span>
        <h2>{svc.name}</h2>
        {ctxName && (
          <span className="badge svc"><Icon name="link" size={12} />{ctxName}</span>
        )}
        {svc.integrated && <span className="badge mono"><Icon name="layers" size={12} />기능별 구성</span>}
      </div>
      <p className="svc-section-meta">{sec.intro}</p>
      <DownloadBar download={sec.download} />
      {svc.sites && svc.sites.length > 0 && (
        <div className="svc-section-sites">
          <div className="svc-section-sites-label">공식 사이트</div>
          <SiteLinks sites={svc.sites} compact />
        </div>
      )}

      {sec.type === "features" ? (
        <CommunisFeatures features={sec.features} />
      ) : (
        <div className="steps">
          {sec.steps.map((st, i) => <StepBlock key={i} step={st} n={i + 1} />)}
        </div>
      )}
    </section>
  );
}

/* Communis 기능별 탭 */
function CommunisFeatures({ features }) {
  const [active, setActive] = React.useState(features[0].id);
  const feat = features.find((f) => f.id === active) || features[0];
  return (
    <div>
      <div className="feat-tabs">
        {features.map((f) => (
          <button
            key={f.id}
            className={"feat-tab" + (active === f.id ? " active" : "")}
            onClick={() => setActive(f.id)}
          >
            <span className="fdot" style={active === f.id ? null : { background: f.dot }}></span>
            {f.name}
          </button>
        ))}
      </div>
      <div className="feat-body" key={feat.id}>
        <p className="feat-intro fade-up">{feat.intro}</p>
        {feat.flow && (
          <div className="flow fade-up" style={{ marginLeft: 0 }}>
            {feat.flow.map((node, i) => (
              <div className="flow-node" key={i}>
                <div className="fn-tag">{node.tag}</div>
                <div className="fn-txt">{node.txt}</div>
              </div>
            ))}
          </div>
        )}
        <div className="steps fade-up" style={{ marginLeft: 0 }}>
          {feat.steps.map((st, i) => <StepBlock key={i} step={st} n={i + 1} />)}
        </div>
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
  scrollToId,
});
