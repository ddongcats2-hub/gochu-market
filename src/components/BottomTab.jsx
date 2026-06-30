import { useLocation, useNavigate } from "react-router-dom";

function BottomTab({ user }) {
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
      >
        <span>💬</span>
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