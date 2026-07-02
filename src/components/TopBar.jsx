import { useNavigate } from "react-router-dom";

function TopBar({ user, profile, notificationCount = 0 }) {
  const navigate = useNavigate();

  function goMyPage() {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/mypage");
  }

  function goNotifications() {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/notifications");
  }

  return (
    <div className="topBar">
      <div>
        <h1 className="logo">🌶 고추마켓</h1>

        <div className="locationRow">
          📍 {profile?.location || "지역 미설정"} <span>▼</span>
        </div>
      </div>

      <div className="topIcons">
        <button className="circleButton" onClick={goNotifications}>
          🔔
          {notificationCount > 0 && (
            <div className="alarmDot">
              {notificationCount > 99 ? "99+" : notificationCount}
            </div>
          )}
        </button>

        <button className="circleButton profileButton" onClick={goMyPage}>
          {profile?.photo ? (
            <img
              src={profile.photo}
              alt="profile"
              className="topProfileImage"
            />
          ) : (
            "👤"
          )}
        </button>
      </div>
    </div>
  );
}

export default TopBar;