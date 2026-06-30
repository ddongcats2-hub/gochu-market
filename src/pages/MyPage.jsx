import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase";
import ProductCard from "../components/ProductCard";

const locations = [
  "서울 강남구",
  "서울 송파구",
  "서울 서초구",
  "서울 마포구",
  "서울 성동구",
  "서울 관악구",
  "경기 성남시",
  "경기 용인시",
  "인천 연수구",
];

function MyPage({
  user,
  profile = {},
  setProfile,
  products = [],
  toggleLike,
  deleteProduct,
  logout,
}) {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(profile.nickname || "");
  const [intro, setIntro] = useState(profile.intro || "");
  const [location, setLocation] = useState(profile.location || "서울 강남구");
  const [photo, setPhoto] = useState(profile.photo || "");
  const [tab, setTab] = useState("posts");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNickname(profile.nickname || "");
    setIntro(profile.intro || "");
    setLocation(profile.location || "서울 강남구");
    setPhoto(profile.photo || "");
  }, [profile]);

  if (!user) {
    return (
      <div className="container">
        <h2>👤 마이페이지</h2>

        <div className="profileBox" style={{ marginTop: "18px" }}>
          <h3>로그인이 필요합니다.</h3>
          <p className="sub" style={{ marginTop: "8px" }}>
            로그인 후 마이페이지를 이용할 수 있습니다.
          </p>

          <button className="primaryBtn" onClick={() => navigate("/login")}>
            로그인 / 회원가입
          </button>
        </div>
      </div>
    );
  }

  const myProducts = products.filter((item) => item.sellerUid === user.uid);
  const likedProducts = products.filter((item) =>
    Array.isArray(item.likedBy) && item.likedBy.includes(user.uid)
  );

  const sellingProducts = myProducts.filter((item) => !item.sold);
  const soldProducts = myProducts.filter((item) => item.sold);

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function saveProfile() {
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
        location,
        photo,
      };

      await updateDoc(doc(db, "users", user.uid), {
        nickname: nextProfile.nickname,
        intro: nextProfile.intro,
        location: nextProfile.location,
        photo: nextProfile.photo,
      });

      setProfile(nextProfile);
      alert("프로필이 저장되었습니다.");
    } catch (error) {
      console.error("프로필 저장 오류:", error);
      alert("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function renderProductList(list, emptyText) {
    if (list.length === 0) {
      return (
        <div className="profileBox" style={{ textAlign: "center" }}>
          <h3>{emptyText}</h3>
        </div>
      );
    }

    return list.map((item) => (
      <ProductCard
        key={item.id}
        item={item}
        user={user}
        toggleLike={toggleLike}
        deleteProduct={deleteProduct}
      />
    ));
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: "18px" }}>👤 마이페이지</h2>

      <div className="profileBox">
        <div className="profileTop">
          <div className="profilePhoto">
            {photo ? <img src={photo} alt="profile" /> : "👤"}
          </div>

          <div>
            <h2>{nickname || "고추유저"}</h2>
            <p className="sub">{location}</p>
            <p className="sub" style={{ marginTop: "6px" }}>
              {intro || "소개글이 없습니다."}
            </p>
          </div>
        </div>
      </div>

      <div className="statGrid">
        <div className="statCard">
          <strong>{profile.scoville || 0}</strong>
          <span>스코빌</span>
        </div>

        <div className="statCard">
          <strong>{profile.deals || 0}</strong>
          <span>거래</span>
        </div>

        <div className="statCard">
          <strong>{profile.reviews || 0}</strong>
          <span>후기</span>
        </div>
      </div>

      <div className="profileBox">
        <h3>프로필 수정</h3>

        <label className="uploadBtn" style={{ marginTop: "14px" }}>
          📷 프로필 사진 업로드
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </label>

        <input
          className="search"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <textarea
          className="search"
          placeholder="소개글"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          style={{ minHeight: "90px", resize: "none" }}
        />

        <select
          className="search"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button className="primaryBtn" onClick={saveProfile} disabled={saving}>
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </div>

      <div className="profileBox">
        <div className="topRow">
          <h3>내 활동</h3>

          <button className="ghostBtn" onClick={() => navigate("/sell")}>
            글쓰기
          </button>
        </div>

        <div className="myTabs">
          <button
            className={tab === "posts" ? "myTab active" : "myTab"}
            onClick={() => setTab("posts")}
          >
            내 게시글 {myProducts.length}
          </button>

          <button
            className={tab === "selling" ? "myTab active" : "myTab"}
            onClick={() => setTab("selling")}
          >
            판매중 {sellingProducts.length}
          </button>

          <button
            className={tab === "sold" ? "myTab active" : "myTab"}
            onClick={() => setTab("sold")}
          >
            판매완료 {soldProducts.length}
          </button>

          <button
            className={tab === "liked" ? "myTab active" : "myTab"}
            onClick={() => setTab("liked")}
          >
            찜 {likedProducts.length}
          </button>
        </div>
      </div>

      {tab === "posts" &&
        renderProductList(myProducts, "작성한 게시글이 없습니다.")}

      {tab === "selling" &&
        renderProductList(sellingProducts, "판매중인 상품이 없습니다.")}

      {tab === "sold" &&
        renderProductList(soldProducts, "판매완료 상품이 없습니다.")}

      {tab === "liked" &&
        renderProductList(likedProducts, "찜한 상품이 없습니다.")}

      <button className="dangerFullBtn" onClick={handleLogout}>
        로그아웃
      </button>
    </div>
  );
}

export default MyPage;