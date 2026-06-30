import { useLocation, useNavigate } from "react-router-dom";

<<<<<<< HEAD
function BottomTab({ user }) {
=======
function BottomTab({
  user,
  unreadChatCount = 0,
}) {
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
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

<<<<<<< HEAD
      <button className="sellTab" onClick={goSell}>
=======
      <button
        className="sellTab"
        onClick={goSell}
      >
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
        <span>＋</span>
      </button>

      <button
        className={location.pathname === "/chat-list" ? "activeTab" : ""}
        onClick={() => navigate("/chat-list")}
<<<<<<< HEAD
      >
        <span>💬</span>
=======
        style={{ position: "relative" }}
      >
        <span>💬</span>

        {unreadChatCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 10,
              minWidth: 18,
              height: 18,
              borderRadius: 999,
              background: "#ff3b30",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
            }}
          >
            {unreadChatCount > 999
              ? "999+"
              : unreadChatCount}
          </span>
        )}

>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
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