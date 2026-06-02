/* ============================================================
   매뉴얼 셀 — KT MCS & X_MCS Agent × KT 스마트메시지(biz)
   ------------------------------------------------------------
   출처: MCS Agent 설치가이드 v1.4 (2023-07-19, ㈜다이얼로그스페이스)
   archive/창용's/스마트메시지biz/MCS_Agent_Manual_설치가이드.txt
   ※ 본 문서는 McsAgent(1·2센터, 레거시) 기준. 차세대(X_McsAgent)는
     'MCS 센터 선택'과 접속 IP만 다르고 절차는 동일.
   ============================================================ */
(function () {
  "use strict";
  var C = (window.HUB_CONTENT = window.HUB_CONTENT || {});
  var A = (C["mcs"] = C["mcs"] || {});

  A["smart"] = {
    intro: "MCS Agent 설치부터 메시지 유형별 연동까지 안내합니다. 아래 탭에서 선택하세요. (덜 채워진 항목은 ‘공사 중’으로 표시됩니다.)",
    download: { title: "MCS Agent 설치가이드 (v1.4)", meta: "PDF · 2023-07-19 · ㈜다이얼로그스페이스" },
    features: [
      {
        id: "install",
        name: "1. 설치 가이드",
        intro: "설치 환경 확인 → 준비사항 → 패키지 설치 → 실행 → 시험발송 → 발송 쿼리 순서입니다.",
        steps: [
      {
        title: "개요 · 용어",
        body: "본 가이드는 KT MCS 메시지 서버와 연동하여 문자/음성/팩스/멀티미디어 메시지를 전송하는 <b>Java 기반 MCS Agent</b>의 설치 및 환경설정 방법을 설명합니다.",
        table: {
          cols: ["용어", "설명"],
          rows: [
            ["MCS Agent", "문자(SMS)·음성(VMS)·팩스(FMS)·멀티미디어(MMS) 발송을 위해 SP가 사용하는 Java 기반 프로그램 (Client)"],
            ["MCS Server", "Agent의 발송 요청을 받아 처리·중계·저장하는 KT 메시지 시스템 (Server)"],
            ["SP", "KT 메시지 서비스를 사용하는 업체 (Service Provider)"],
            ["라이선스 키", "Server 인증 시 사용하는 인증 Ticket 생성용 Key File (<code>*.cert</code>)"],
            ["Agent 디렉토리", "McsAgent를 설치한 디렉토리 (예: <code>C:\\McsAgent</code>)"],
            ["*.bat / *.sh", "배치(쉘) 스크립트 — Windows: <code>*.bat</code> / Unix·Linux: <code>*.sh</code> (Agent 디렉토리에서 실행)"],
          ],
        },
        note: "이 문서는 <b>McsAgent(1·2센터, 레거시)</b> 기준입니다. <b>차세대(X_McsAgent)</b>는 ‘MCS 센터 선택’ 단계와 접속 IP만 다르고 나머지 절차는 동일합니다.",
      },
      {
        title: "설치 가능 OS 및 지원 DBMS",
        body: "Agent 설치가 가능한 OS와 연동 지원 DBMS는 아래와 같습니다.",
        table: {
          cols: ["Agent 설치 OS", "지원 DBMS"],
          rows: [
            ["MS Windows (2000 이상)", "Oracle (8i 이상)"],
            ["Linux (커널버전 2.2 · 2.4 이상)", "MySQL (4.x 이상)"],
            ["IBM AIX (5.x 이상)", "MS SQLServer (2000 이상)"],
            ["Sun Solaris", "Informix (11.x 이상)"],
            ["HP-UX", "Tibero (4.x 이상)"],
            ["", "MariaDB (5.5X 이상)"],
            ["", "Sybase (15.x 이상)"],
            ["", "Caché (2013 이상)"],
            ["", "PostgreSQL (11.x 이상)"],
            ["", "EPAS (11.x 이상)"],
          ],
        },
      },
      {
        title: "설치 전 준비사항 — 소프트웨어 (Java · DBMS)",
        body: "Agent 설치를 위해서는 <b>Java 1.8 이상</b>의 실행환경과 <b>DBMS 정보</b>가 필요합니다.",
        list: [
          "<b>Java 실행환경</b> — Java 1.8 버전 이상 <i>(최신 버전 권장)</i>",
          "<b>DBMS 정보</b> — DB 서버 IP(Agent와 동일 장비면 <code>localhost</code>/<code>127.0.0.1</code>), Listening Port, DB명(Oracle은 SID), 사용자 ID/PW",
          "<b>DB 권한</b> — Create/Alter Table · Insert · Select · Update · Delete · Create/Drop Index <i>(<code>envTest.bat</code> 실행 결과로 확인)</i>",
          "<b>JDBC Driver</b> — <code>&lt;Agent&gt;/lib/jdbc/</code> 에 DBMS별 기본 제공. 환경에 맞지 않으면 벤더 사이트에서 받아 교체(교체 후 Agent 재시작)",
          "<b>Unix/Linux 한글 설정</b> — Korean·UTF-8 로케일 필요(<code>jenv.sh</code>). 예: Linux/AIX <code>export LANG=ko_KR.UTF-8</code>, HP-UX <code>ko_KR.utf8</code>",
        ],
        note: "JDBC 다운로드: MySQL · Oracle · SQL Server · MariaDB 벤더 페이지. DataSource·Driver 클래스·JDBC URL은 환경설정 파일에서 수동 변경할 수 있습니다.",
      },
      {
        title: "설치 전 준비사항 — 네트워크 설정 / 방화벽",
        body: "Agent가 설치될 서버에서 아래 IP·PORT와 통신되도록 방화벽을 설정합니다. IPS 등 보안장비가 있으면 함께 확인하세요. (<b>레거시</b> = 1·2센터 / <b>차세대</b> = 차세대 센터)",
        tables: [
          {
            label: "네트워크 설정 정보 · 1센터 (레거시)",
            cols: ["서버", "IP", "PORT", "비고"],
            rows: [
              ["자원 관리 서버", "<code>119.205.196.225</code>", "<code>80</code>", "<code>rcs.xroshot.com</code>"],
              ["메시지 연동 서버", "<code>119.205.196.240</code>", "<code>80</code>", ""],
              ["", "<code>119.205.196.241</code>", "", ""],
              ["", "<code>119.205.196.242</code>", "", ""],
              ["", "<code>119.205.196.243</code>", "", ""],
              ["", "<code>119.205.196.244</code>", "", ""],
              ["", "<code>119.205.196.245</code>", "", ""],
              ["파일 연동 서버", "<code>119.205.196.211</code>", "<code>80</code>", ""],
            ],
          },
          {
            label: "네트워크 설정 정보 · 2센터 (레거시)",
            cols: ["서버", "IP", "PORT", "비고"],
            rows: [
              ["자원 관리 서버", "<code>210.105.195.140</code>", "<code>80</code>", "<code>rcs2.xroshot.com</code>"],
              ["메시지 연동 서버", "<code>210.105.195.150</code>", "<code>80</code>", ""],
              ["", "<code>210.105.195.151</code>", "", ""],
              ["", "<code>210.105.195.152</code>", "", ""],
              ["", "<code>210.105.195.153</code>", "", ""],
              ["", "<code>210.105.195.154</code>", "", ""],
              ["", "<code>210.105.195.155</code>", "", ""],
              ["파일 연동 서버", "<code>210.105.195.145</code>", "<code>80</code>", ""],
              ["", "<code>210.105.195.146</code>", "", ""],
              ["", "<code>210.105.195.147</code>", "", ""],
            ],
          },
          {
            label: "네트워크 설정 정보 · 차세대 센터 (X_McsAgent)",
            cols: ["서버", "IP", "PORT", "비고"],
            rows: [
              ["자원 관리 서버", "<code>14.32.72.193</code>", "<code>80</code>", "<code>info.xroshot.com</code>"],
              ["", "<code>14.32.72.178</code>", "", ""],
              ["", "<code>221.148.244.20</code>", "", ""],
              ["", "<code>221.148.244.212</code>", "", ""],
              ["메시지 연동 서버", "<code>14.32.72.20</code>", "<code>8900</code>", "14.32.xx (분당) / 221.148.xx (대전)"],
              ["", "<code>14.32.72.148</code>", "", ""],
              ["", "<code>221.148.244.22</code>", "", ""],
              ["", "<code>221.148.244.194</code>", "", ""],
              ["파일 연동 서버", "<code>14.32.72.151</code>", "<code>80</code>", ""],
              ["", "<code>221.148.244.77</code>", "", ""],
            ],
          },
        ],
        note: "방화벽 확인은 <code>telnet &lt;목적지IP&gt; &lt;목적지Port&gt;</code> 로 모든 IP·Port에 대해 점검합니다. 표의 IP·PORT는 드래그하여 복사할 수 있습니다.",
      },
      {
        title: "패키지 설치 — 준비물 수령 및 압축 해제",
        body: "설치를 위해 아래 항목을 담당 영업 또는 KT 협력사를 통해 제공받습니다.",
        list: [
          "<b>McsAgent 패키지</b> — <code>mcs_agent_x.x.x.zip</code>",
          "<b>인증파일</b>(<code>*.cert</code>) — 서버 인증 Ticket 생성용 Key File",
          "<b>SP_ID / SP_Password</b> — 서버 접속 계정 <i>(Agent를 여러 개 쓰면 Agent별 ID 별도 발급)</i>",
          "설치할 디렉토리에서 패키지 <b>압축 해제</b> — 발송량이 많으면 로그도 커지므로 여유 공간이 넉넉한 위치 권장",
          "<i>(Linux/UNIX 필수)</i> Agent 운영 OS 계정을 정해 파일 복사·운영하고, <code>chmod u+x *.sh</code> 로 스크립트 실행권한 부여",
        ],
        note: "환경설정 완료 후 인증파일(<code>*.cert</code>)을 <code>&lt;Agent&gt;/file/auth/</code> 경로에 둬야 서버 로그인이 됩니다. 라이선스 파일이 없으면 Agent가 시작 직후 종료됩니다.",
      },
      {
        title: "설치 실행",
        body: "Agent 디렉토리에서 설치 스크립트를 실행합니다.",
        code:
          "# Linux / UNIX\n" +
          "./installAgent.sh\n\n" +
          "# Windows  (Vista/2008 이후 버전은 ‘관리자 권한으로 실행’)\n" +
          "installAgent.bat",
        note: "설치 메시지의 한글이 깨지면 위 ‘한글 설정’을 적용하세요. 설치 결과로 환경설정 파일 <code>config\\mcs_agent_config.xml</code> 이 생성되며, 이후 설정 변경은 재설치 없이 이 파일 수정 후 Agent 재시작으로 반영됩니다.",
      },
      {
        title: "설치 단계 — 주요 입력값",
        body: "설치 스크립트 실행 후 순서대로 값을 입력합니다. <code>[Enter]</code>=기본값, <code>(Y/N)</code>=Y 또는 N, 번호 항목은 해당 번호 입력, 종료는 <code>exit</code> 입니다.",
        table: {
          cols: ["입력 항목", "설명"],
          rows: [
            ["라이선스 동의", "정책 동의 (Y/N). N이면 설치 종료 — 동의해야 진행"],
            ["비밀번호 암호화", "KT·DB 비밀번호 암호화 여부 (Y/N). 이후 <code>setupPasswd</code> 로 변경 가능"],
            ["MCS 센터 선택", "<b>1: 1센터 / 2: 2센터</b> — 사용자 ID에 해당하는 센터 선택 (차세대는 X_McsAgent에서 별도)"],
            ["KT 사용자 ID / PW", "KT에서 제공받은 SP_ID / SP_Password"],
            ["라이선스 파일명", "KT 제공 <code>*.cert</code> 파일명 (설치 후 <code>file/auth/</code> 에 배치)"],
            ["발송 이중화", "Y 선택 시 SUB 계정(센터·ID·PW·라이선스) 추가 입력"],
            ["서비스 사용 여부", "SMS · SMS MO · VMS · FMS · FMS MO · MMS 각각 (Y/N) — 미사용은 N으로 부하 감소"],
            ["발송금지 시간", "Y 선택 시 시작·종료 시각(HHMM 4자리). 예: 2100~0800"],
            ["REPORT 테이블 방식", "1: Fixed / 2: Monthly (월 단위 생성, suffix <code>_yymm</code>)"],
            ["RESERVED 컬럼", "사용자 컬럼 개수·크기 맞춤 (Y/N). 기본 개수 9, RESERVED1=64, 그 외 50"],
            ["연동규격", "1: 신규(MCS) / 2: UMS_SDK / 3: IMO / 4: EMMA / 5: JRobot"],
            ["DBMS 선택", "1:Oracle 2:MSSQL 3:MySQL 4:MySQL8 5:MariaDB 6:Tibero 7:Informix 8:Sybase 9:CacheDB 10:PostgreSQL 11:EPAS"],
            ["JDBC URL 직접입력", "Y 시 Driver 클래스·URL 직접 설정 (이때 서버·Port·DB명 입력 생략)"],
            ["DBMS 접속정보", "서버 IP(Oracle RAC는 연결 문자열)·Port·DB명(Oracle=SID)·USER·PW"],
            ["DB 한글 설정", "정상 출력되는 한글(‘한글 테스트샾’) 보기 번호 선택 (예: UTF8|UTF8)"],
          ],
        },
        note: "입력을 마치면 ‘입력사항’ 요약이 출력되고 <code>[Enter]</code> 시 <code>config\\mcs_agent_config.xml</code> 이 생성됩니다. 항목별 상세는 매뉴얼 ‘부록 — MCS 환경설정 파일 설명’ 참고.",
      },
      {
        title: "DB 객체 생성",
        body: "환경설정 후 발송에 필요한 DB 객체(Table·Index·Sequence)가 자동 생성됩니다. 이미 있으면 생성은 Skip되고 누락된 Field·Index만 추가됩니다. <code>installAgent.bat(sh) -d</code> 로 DB 객체 생성만 수행할 수도 있습니다.",
        list: [
          "발송 <code>SDK_SMS_SEND</code> · 결과 <code>SDK_SMS_REPORT</code>, <code>SDK_SMS_REPORT_DETAIL</code> · 수신 <code>SDK_SMS_RECEIVE</code>",
          "VMS·FMS·MMS도 동일 패턴 — <code>SDK_VMS_*</code>, <code>SDK_FMS_*</code>, <code>SDK_MMS_*</code>",
          "상태 테이블 <code>SDK_SEND_STAT</code>, <code>SDK_RECV_STAT</code>",
          "<i>(Oracle)</i> 서비스별 시퀀스 — 발송용 <code>SDK_SMS_SEQ</code> 등, 수신용 <code>SDK_SMS_RECV_SEQ</code> 등",
        ],
        note: "고객 시스템은 <code>SDK_SMS_SEND</code> 테이블에 INSERT하여 발송을 요청합니다. 주요 필드 — <code>SMS_MSG</code>(본문·90byte 권장), <code>CALLBACK</code>(회신번호·필수), <code>DEST_INFO</code>(수신자 이름^번호|…, 최대 100), <code>USER_ID</code>(SP_ID). 아래 ‘발송 쿼리 생성기’로 INSERT 쿼리를 바로 만들 수 있습니다.",
      },
      {
        title: "Agent 실행 · 종료 · 상태 확인",
        body: "설치 후 Agent를 기동합니다. 하나의 ID에는 하나의 세션만 허용되며(동일 ID 다중 접속 시 기존 세션이 끊어짐), 고객이 지정한 IP에서만 발송하는 보안 기능이 있습니다.",
        code:
          "# 실행\n" +
          "[Linux/UNIX]  ./startAgent.sh        [Windows]  startAgent.bat\n" +
          "# 종료\n" +
          "[Linux/UNIX]  ./stopAgent.sh         [Windows]  stopAgent.bat\n" +
          "# 상태 확인\n" +
          "[Linux/UNIX]  ./agentStatus.sh       [Windows]  agentStatus.bat",
        list: [
          "프로세스 — <code>MCSAgent</code>(실제 발송) + <code>MCSMon</code>(Agent 감시·재시작). 강제 종료 시 <b>MCSMon → McsAgent</b> 순서",
          "<i>(Windows)</i> <code>installService.bat</code> 실행 시 ‘MCSAgent Service’로 등록(자동 시작). 제거는 <code>uninstallService.bat</code>",
        ],
        note: "Windows 서비스가 NAS 등 네트워크 자원을 사용하면 ‘Local System’ 권한 문제로 접근이 안 될 수 있습니다 — 서비스 ‘속성 &gt; 로그온’에서 권한 있는 계정으로 변경하세요. (발송 IP 보안 문의: 080-258-0303)",
      },
      {
        title: "문자(SMS) 시험발송",
        body: "<code>agentTest</code> 프로그램으로 문자(SMS)·음성(VMS)·팩스(FMS)를 시험 발송할 수 있습니다. (Agent가 정상 기동된 상태에서 실행)",
        code:
          "[Linux/UNIX] ./agentTest.sh      [Windows] agentTest.bat\n\n" +
          ">> 선택 : 1               (1.문자  2.음성  3.팩스)\n" +
          "전송 타입 >> 1            (1.즉시  2.예약)\n" +
          "회신번호  >> 01012345678\n" +
          "KT OFFICE CODE >>         (없으면 비워둠)\n" +
          "메시지    >> sms test msg\n" +
          "수신자    >> name^01087654321     (형식: 이름^전화번호|이름^전화번호|…)",
        note: "Windows 환경은 McsAgent v2.3.2.0 이상에서 제공되는 UI 프로그램으로 모니터링할 수도 있습니다.",
      },
      {
        title: "발송 쿼리 생성기",
        body: "DBMS와 메시지 유형(SMS/LMS/MMS/FMS/VMS)을 선택하고 값을 입력하면 <code>SDK_*_SEND</code> 테이블 INSERT 쿼리가 생성됩니다. 복사해서 그대로 사용하세요.",
        widget: "queryGen",
        note: "사내 발송 대시보드(tools/dashboard)의 쿼리 템플릿과 동일합니다. 수신자는 <code>이름^번호|이름^번호</code> 형식, USER_ID는 KT 발급 SP_ID입니다.",
      },
        ],
      },
      {
        id: "sms",
        name: "2. 문자(SMS)",
        construction: true,
        intro: "문자(SMS) 발송 테이블 레이아웃과 필드 설명을 준비 중입니다. (출처: MCS_Agent_Manual_문자메시지)",
      },
      {
        id: "mms",
        name: "3. 멀티메시지(LMS·MMS)",
        construction: true,
        intro: "멀티메시지(LMS/MMS) 발송 테이블 레이아웃과 필드 설명을 준비 중입니다. (출처: MCS_Agent_Manual_멀티미디어메시지)",
      },
    ],
  };
})();
