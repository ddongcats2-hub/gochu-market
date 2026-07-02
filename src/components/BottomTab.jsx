import { useLocation, useNavigate } from "react-router-dom";

function BottomTab({ user, unreadChatCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  function move(path) {
    if ((path === "/sell" || path === "/chat-list" || path === "/mypage") && !user) {
      navigate("/login");
      return;
    }

    navigate(path);
  }

  return (
    <nav className="bottomTab">
      <button
        className={location.pathname === "/" ? "activeTab" : ""}
        onClick={() => move("/")}
      >
        <span>🏠</span>
        홈
      </button>

      <button
        className={location.pathname === "/favorite" ? "activeTab" : ""}
        onClick={() => move("/favorite")}
      >
        <span>❤️</span>
        관심
      </button>

      <button
        className="sellTab"
        onClick={() => move("/sell")}
      >
        <span>＋</span>
      </button>

      <button
        className={location.pathname === "/chat-list" ? "activeTab" : ""}
        onClick={() => move("/chat-list")}
      >
        <span
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          💬

          {Number(unreadChatCount) > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-12px",
                minWidth: "18px",
                height: "18px",
                padding: "0 5px",
                borderRadius: "999px",
                background: "#ff3b30",
                color: "#fff",
                fontSize: "11px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                boxShadow: "0 2px 6px rgba(255,59,48,.3)",
              }}
            >
              {unreadChatCount > 999 ? "999+" : unreadChatCount}
            </span>
          )}
        </span>

        채팅
      </button>

      <button
        className={location.pathname === "/mypage" ? "activeTab" : ""}
        onClick={() => move("/mypage")}
      >
        <span>👤</span>
        마이
      </button>
    </nav>
  );
}

export default BottomTab;