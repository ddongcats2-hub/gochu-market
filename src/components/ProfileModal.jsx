import { useNavigate } from "react-router-dom";

function getPepperLevel(score) {
  if (score < 1000) return "🫑 풋고추";
  if (score < 3000) return "🌶 꽈리고추";
  if (score < 8000) return "🌶🌶 청양고추";
  if (score < 20000) return "🔥 베트남고추";
  if (score < 50000) return "🌋 하바네로";
  return "☠ 캐롤라이나 리퍼";
}

function ProfileModal({
  user,
  profile,
  login,
  logout,
  closeProfile,
}) {
  const navigate = useNavigate();

  function goProfile() {
    closeProfile();
    navigate("/profile");
  }

  return (
    <div
      className="overlay"
      onClick={closeProfile}
    >
      <div
        className="bottomSheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="handle"></div>

        {!user ? (
          <>
            <h2>👤 로그인</h2>

            <p
              style={{
                color: "#8e8e93",
                marginBottom: "18px",
              }}
            >
              로그인하면 채팅, 거래,
              <br />
              스코빌 지수를 사용할 수 있습니다.
            </p>

            <button
              className="primaryBtn"
              onClick={login}
            >
              Google 로그인
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div className="profilePhoto">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt=""
                  />
                ) : (
                  "👤"
                )}
              </div>

              <div>
                <h2>{profile.nickname}</h2>

                <p
                  style={{
                    color: "#8e8e93",
                  }}
                >
                  {user.email}
                </p>

                <p
                  style={{
                    marginTop: "5px",
                    color: "#ff3b30",
                    fontWeight: 700,
                  }}
                >
                  🌶 {profile.scoville} SHU
                </p>

                <p
                  style={{
                    color: "#8e8e93",
                    fontSize: "13px",
                  }}
                >
                  {getPepperLevel(profile.scoville)}
                </p>
              </div>
            </div>

            <button
              className="primaryBtn"
              onClick={goProfile}
            >
              👤 프로필 보기
            </button>

            <button
              className="primaryBtn"
              style={{
                background: "#34C759",
              }}
            >
              ❤️ 관심상품
            </button>

            <button
              className="primaryBtn"
              style={{
                background: "#FF9500",
              }}
            >
              💬 채팅목록
            </button>

            <button
              className="primaryBtn"
              style={{
                background: "#8E8E93",
              }}
            >
              ⚙ 설정
            </button>

            <button
              className="primaryBtn"
              style={{
                background: "#ff3b30",
              }}
              onClick={logout}
            >
              로그아웃
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;