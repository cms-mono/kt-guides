/* ============================================================
   통합 매뉴얼 허브 — App (라우팅 / 헤더 / 다크모드 / 마운트)
   ============================================================ */

/* 라우트 ↔ 해시 직렬화 */
function routeToHash(r) {
  if (!r || r.name === "home") return "#/";
  if (r.name === "service") return "#/service/" + r.id;
  if (r.name === "agent") return "#/agent/" + r.id + (r.anchor ? "?sec=" + r.anchor : "");
  if (r.name === "search") return "#/search?q=" + encodeURIComponent(r.q || "");
  return "#/";
}
function hashToRoute(hash) {
  const h = (hash || "").replace(/^#\/?/, "");
  if (!h) return { name: "home" };
  const [path, qs] = h.split("?");
  const parts = path.split("/");
  const params = {};
  (qs || "").split("&").forEach((p) => {
    const [k, v] = p.split("=");
    if (k) params[k] = decodeURIComponent(v || "");
  });
  if (parts[0] === "service") return { name: "service", id: parts[1] };
  if (parts[0] === "agent") return { name: "agent", id: parts[1], anchor: params.sec };
  if (parts[0] === "search") return { name: "search", q: params.q || "" };
  return { name: "home" };
}

/* 다크모드 훅 */
function useTheme() {
  const [theme, setTheme] = React.useState(() => {
    try { return localStorage.getItem("hub-theme") || "light"; } catch (e) { return "light"; }
  });
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("hub-theme", theme); } catch (e) {}
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "light" ? "dark" : "light"))];
}

/* 헤더 */
function Header({ index, onNavigate, route, theme, toggleTheme }) {
  const onHome = route.name === "home";
  return (
    <header className="hdr">
      <div className="hdr-inner">
        <div className="brand" onClick={() => onNavigate({ name: "home" })}>
          <div className="brand-mark"><Icon name="layers" size={19} /></div>
          <div>
            <div className="brand-name">매뉴얼 허브</div>
            <div className="brand-sub">KT 메시징 · 통합 문서</div>
          </div>
        </div>

        {!onHome && (
          <div className="hdr-search">
            <SearchBar index={index} onNavigate={onNavigate} placeholder="문서·서비스·Agent 검색…" />
          </div>
        )}
        {onHome && <div style={{ flex: 1 }}></div>}

        <div className="hdr-actions">
          <button className="icon-btn" onClick={() => onNavigate({ name: "search", q: "" })} title="검색" aria-label="검색">
            <Icon name="search" size={18} />
          </button>
          <button className="icon-btn" onClick={toggleTheme} title="테마 전환" aria-label="테마 전환">
            <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

/* 푸터 */
function Footer({ onNavigate }) {
  return (
    <footer className="ftr">
      <div className="wrap ftr-inner">
        <div className="ftr-brand">
          <div className="brand-mark" style={{ width: 30, height: 30 }}><Icon name="layers" size={16} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>통합 매뉴얼 허브</div>
            <div className="ftr-copy">KT 기반 B2B 메시징 · 서비스 &amp; Agent 문서</div>
          </div>
        </div>
        <div className="ftr-links">
          <a onClick={() => onNavigate({ name: "home" })}>홈</a>
          <a onClick={() => onNavigate({ name: "service", id: "communis" })}>Communis</a>
          <a onClick={() => onNavigate({ name: "agent", id: "openapi" })}>서비스 API</a>
          <a onClick={() => onNavigate({ name: "search", q: "" })}>검색</a>
        </div>
      </div>
    </footer>
  );
}

/* App */
function App() {
  const index = React.useMemo(
    () => window.HUB.buildSearchIndex(window.MANUALS),
    []
  );
  const [route, setRoute] = React.useState(() => hashToRoute(location.hash));
  const [theme, toggleTheme] = useTheme();

  const navigate = React.useCallback((r) => {
    location.hash = routeToHash(r);
  }, []);

  React.useEffect(() => {
    function onHash() { setRoute(hashToRoute(location.hash)); }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // ⌘K / Ctrl+K → 검색 포커스
  React.useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = document.querySelector(".hdr-search input, .hero-search input");
        if (input) input.focus();
        else navigate({ name: "search", q: "" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  let screen;
  if (route.name === "service") screen = <ServiceView serviceId={route.id} index={index} onNavigate={navigate} />;
  else if (route.name === "agent") screen = <AgentDetail key={route.id} agentId={route.id} index={index} onNavigate={navigate} anchor={route.anchor} />;
  else if (route.name === "search") screen = <SearchResults query={route.q} index={index} onNavigate={navigate} />;
  else screen = <Home index={index} onNavigate={navigate} />;

  return (
    <div className="app-root">
      <Header index={index} onNavigate={navigate} route={route} theme={theme} toggleTheme={toggleTheme} />
      {screen}
      <Footer onNavigate={navigate} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
