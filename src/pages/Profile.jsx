import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase";
import ImageUploader from "../components/ImageUploader";

function getPepperLevel(score = 0) {
  if (score < 1000) {
    return {
      name: "🫑 풋고추",
      color: "#4CAF50",
    };
  }

  if (score < 3000) {
    return {
      name: "🌶 꽈리고추",
      color: "#66BB6A",
    };
  }

  if (score < 8000) {
    return {
      name: "🌶🌶 청양고추",
      color: "#FF5722",
    };
  }

  if (score < 20000) {
    return {
      name: "🔥 베트남고추",
      color: "#F44336",
    };
  }

  if (score < 50000) {
    return {
      name: "🌋 하바네로",
      color: "#D32F2F",
    };
  }

  return {
    name: "☠ 캐롤라이나 리퍼",
    color: "#8B0000",
  };
}

function Profile({ user, profile = {}, setProfile, logout }) {
  const pepper = getPepperLevel(profile.scoville || 0);

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(profile.nickname || "");
  const [intro, setIntro] = useState(profile.intro || "");
  const [location, setLocation] = useState(profile.location || "");
  const [photo, setPhoto] = useState(profile.photo || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNickname(profile.nickname || "");
    setIntro(profile.intro || "");
    setLocation(profile.location || "");
    setPhoto(profile.photo || "");
  }, [profile]);

  async function saveProfile() {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      const nextProfile = {
        ...profile,
        nickname: nickname.trim(),
        intro: intro.trim(),
        location: location.trim() || "지역 미설정",
        photo,
      };

      await updateDoc(doc(db, "users", user.uid), {
        nickname: nextProfile.nickname,
        intro: nextProfile.intro,
        location: nextProfile.location,
        photo: nextProfile.photo,
      });

      setProfile(nextProfile);
      setEditing(false);
      alert("프로필이 저장되었습니다.");
    } catch (error) {
      console.error("프로필 저장 오류:", error);
      alert("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function updatePhoto(nextPhoto) {
    setPhoto(nextPhoto);

    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        photo: nextPhoto,
      });

      setProfile({
        ...profile,
        photo: nextPhoto,
      });
    } catch (error) {
      console.error("프로필 사진 저장 오류:", error);
      alert("프로필 사진 저장 중 오류가 발생했습니다.");
    }
  }

  if (!user) {
    return (
      <div className="container">
        <div className="profileBox">
          <h2>로그인이 필요합니다.</h2>
          <p className="sub" style={{ marginTop: "8px" }}>
            로그인 후 프로필을 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profileBox">
        <div className="profileTop">
          <ImageUploader image={photo} setImage={updatePhoto} />

          <div>
            <h2>{profile.nickname || "고추유저"}</h2>

            <p
              style={{
                color: "#8e8e93",
                marginTop: "5px",
              }}
            >
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="profileBox">
        <h3>🌶 스코빌 지수</h3>

        <h1
          style={{
            marginTop: "10px",
            color: pepper.color,
            fontSize: "40px",
          }}
        >
          {profile.scoville || 0} SHU
        </h1>

        <h2
          style={{
            color: pepper.color,
            marginTop: "8px",
          }}
        >
          {pepper.name}
        </h2>
      </div>

      <div className="statGrid">
        <div className="statCard">
          <strong>{profile.deals || 0}</strong>
          <span>거래</span>
        </div>

        <div className="statCard">
          <strong>{profile.reviews || 0}</strong>
          <span>후기</span>
        </div>

        <div className="statCard">
          <strong>{profile.scoville || 0}</strong>
          <span>SHU</span>
        </div>
      </div>

      <div className="profileBox">
        {editing ? (
          <>
            <h3>프로필 수정</h3>

            <input
              className="search"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            <input
              className="search"
              placeholder="활동지역"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <textarea
              className="search"
              placeholder="소개글"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              style={{
                minHeight: "100px",
                resize: "none",
              }}
            />

            <button
              className="primaryBtn"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? "저장 중..." : "저장하기"}
            </button>

            <button className="ghostBtn" onClick={() => setEditing(false)}>
              취소
            </button>
          </>
        ) : (
          <>
            <h3>내 소개</h3>

            <p
              style={{
                marginTop: "12px",
                lineHeight: 1.8,
              }}
            >
              {profile.intro || "소개글이 없습니다."}
            </p>

            <hr
              style={{
                margin: "20px 0",
                border: "none",
                borderTop: "1px solid #eee",
              }}
            />

            <p>📍 {profile.location || "지역 미설정"}</p>

            <button className="primaryBtn" onClick={() => setEditing(true)}>
              ✏ 프로필 수정
            </button>
          </>
        )}
      </div>

      <button
        className="sellBtn"
        style={{
          background: "#ff3b30",
        }}
        onClick={logout}
      >
        로그아웃
      </button>
    </div>
  );
}

export default Profile;