import { useLocation, useNavigate } from "react-router-dom";

function BottomTab({ user, unreadChatCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  function goMyPage() {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/mypage");
  }

  function goSell() {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/sell");
  }

  return (
    <nav className="bottomTab">
      <button
        className={location.pathname === "/" ? "activeTab" : ""}
        onClick={() => navigate("/")}
      >
        <span>🏠</span>
        홈
      </button>

      <button
        className={location.pathname === "/favorite" ? "activeTab" : ""}
        onClick={() => navigate("/favorite")}
      >
        <span>❤️</span>
        관심
      </button>

      <button className="sellTab" onClick={goSell}>
        <span>＋</span>
      </button>

      <button
        className={location.pathname === "/chat-list" ? "activeTab" : ""}
        onClick={() => navigate("/chat-list")}
        style={{ position: "relative" }}
      >
        <span>💬</span>

        {unreadChatCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "10px",
              minWidth: "18px",
              height: "18px",
              padding: "0 5px",
              borderRadius: "999px",
              backgroundColor: "#ff3b30",
              color: "white",
              fontSize: "11px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              boxShadow: "0 2px 6px rgba(255, 59, 48, 0.35)",
            }}
          >
            {unreadChatCount > 999 ? "999+" : unreadChatCount}
          </span>
        )}

        채팅
      </button>

      <button
        className={location.pathname === "/mypage" ? "activeTab" : ""}
        onClick={goMyPage}
      >
        <span>👤</span>
        마이
      </button>
    </nav>
  );
}

export default BottomTab;