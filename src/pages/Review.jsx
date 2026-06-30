import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const positiveTags = [
  "친절해요",
  "약속을 잘 지켜요",
  "응답이 빨라요",
  "상품 설명이 정확해요",
  "다시 거래하고 싶어요",
];

const negativeTags = [
  "연락이 늦어요",
  "약속을 안 지켜요",
  "설명과 달라요",
  "불친절했어요",
];

function calculateScovilleChange(scores, positive, negative) {
  const average =
    (scores.manner +
      scores.time +
      scores.reply +
      scores.accuracy +
      scores.safe) /
    5;

  let change = 0;

  if (average >= 4.8) change = 180;
  else if (average >= 4.3) change = 120;
  else if (average >= 3.8) change = 80;
  else if (average >= 3.0) change = 30;
  else if (average >= 2.0) change = -30;
  else change = -80;

  change += positive.length * 10;
  change -= negative.length * 15;

  return change;
}

function Review({ products = [], user, profile = {}, addNotification }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const item = products.find((product) => String(product.id) === String(id));

  const [scores, setScores] = useState({
    manner: 5,
    time: 5,
    reply: 5,
    accuracy: 5,
    safe: 5,
  });

  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [positive, setPositive] = useState([]);
  const [negative, setNegative] = useState([]);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkReviewed() {
      if (!user || !id) return;

      const q = query(
        collection(db, "products", id, "reviews"),
        where("writerUid", "==", user.uid)
      );

      const snap = await getDocs(q);
      setAlreadyReviewed(!snap.empty);
    }

    checkReviewed();
  }, [user, id]);

  if (!item) {
    return (
      <div className="container">
        <h2>상품을 찾을 수 없습니다.</h2>
        <button className="primaryBtn" onClick={() => navigate("/")}>
          홈으로
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <h2>로그인이 필요합니다.</h2>
        <button className="primaryBtn" onClick={() => navigate("/login")}>
          로그인하러 가기
        </button>
      </div>
    );
  }

  if (!item.sold) {
    return (
      <div className="container">
        <h2>거래 완료 후 후기를 작성할 수 있습니다.</h2>
        <button className="primaryBtn" onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>
    );
  }

  const isSeller = item.sellerUid === user.uid;
  const isBuyer = item.buyerUid === user.uid || item.reservedBy === user.uid;

  if (isSeller) {
    return (
      <div className="container">
        <h2>내 상품에는 후기를 작성할 수 없습니다.</h2>
        <button className="primaryBtn" onClick={() => navigate(`/detail/${id}`)}>
          돌아가기
        </button>
      </div>
    );
  }

  if (!isBuyer) {
    return (
      <div className="container">
        <h2>거래 구매자만 후기를 작성할 수 있습니다.</h2>
        <p className="sub" style={{ marginTop: "8px" }}>
          채팅에서 예약 또는 약속 잡기를 먼저 해야 구매자로 기록됩니다.
        </p>
        <button className="primaryBtn" onClick={() => navigate(`/detail/${id}`)}>
          돌아가기
        </button>
      </div>
    );
  }

  const targetUid = item.sellerUid;
  const targetName = item.seller || "고추유저";

  function updateScore(key, value) {
    setScores((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  }

  function toggleTag(tag, type) {
    if (type === "positive") {
      setPositive((prev) =>
        prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
      );
    } else {
      setNegative((prev) =>
        prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
      );
    }
  }

  async function submitReview() {
    if (alreadyReviewed) {
      alert("이미 이 거래에 후기를 작성했습니다.");
      return;
    }

    if (!text.trim()) {
      alert("후기 내용을 입력해주세요.");
      return;
    }

    if (!targetUid) {
      alert("판매자 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      setLoading(true);

      const averageRating =
        (scores.manner +
          scores.time +
          scores.reply +
          scores.accuracy +
          scores.safe) /
        5;

      const scovilleChange = calculateScovilleChange(
        scores,
        positive,
        negative
      );

      await addDoc(collection(db, "products", item.id, "reviews"), {
        productId: item.id,
        productTitle: item.title,
        writerUid: user.uid,
        writer: isAnonymous
          ? "익명"
          : profile.nickname || user.email || "고추유저",
        writerEmail: user.email || "",
        targetUid,
        targetName,
        anonymous: isAnonymous,
        averageRating,
        writerAverageRating: averageRating.toFixed(1),
        scores,
        tags: {
          positive,
          negative,
        },
        text: text.trim(),
        scovilleChange,
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString("ko-KR"),
      });

      await updateDoc(doc(db, "users", targetUid), {
        reviews: increment(1),
        scoville: increment(scovilleChange),
        ratingTotal: increment(averageRating),
        ratingCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "users", targetUid, "notifications"), {
        icon: "⭐",
        title: "새 후기가 등록됐어요",
        message: `${item.title} 거래 후기가 도착했습니다. 🌶 ${
          scovilleChange > 0 ? "+" : ""
        }${scovilleChange} SHU`,
        time: "방금 전",
        read: false,
        createdAt: serverTimestamp(),
      });

      if (addNotification) {
        await addNotification(
          "⭐",
          "후기를 작성했어요",
          `${item.title} 후기가 등록되었습니다.`
        );
      }

      alert(
        `후기가 등록되었습니다 🌶\n판매자 스코빌 ${
          scovilleChange > 0 ? "+" : ""
        }${scovilleChange} SHU`
      );

      navigate(`/detail/${item.id}`);
    } catch (error) {
      console.error("후기 등록 오류:", error);
      alert("후기 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <button className="ghostBtn" onClick={() => navigate(-1)}>
        ← 돌아가기
      </button>

      <div className="profileBox">
        <h2>⭐ 거래 후기 작성</h2>
        <p className="sub" style={{ marginTop: "8px" }}>
          {targetName}님과의 {item.title} 거래는 어떠셨나요?
        </p>
      </div>

      {alreadyReviewed ? (
        <div className="profileBox">
          <h3>이미 이 거래품목에 후기를 작성했습니다.</h3>
        </div>
      ) : (
        <>
          <div className="profileBox">
            <label>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />{" "}
              익명으로 후기 남기기
            </label>
          </div>

          <div className="profileBox">
            <ReviewItem
              title="친절하고 매너가 좋았어요"
              value={scores.manner}
              onChange={(value) => updateScore("manner", value)}
            />

            <ReviewItem
              title="약속 시간을 잘 지켰어요"
              value={scores.time}
              onChange={(value) => updateScore("time", value)}
            />

            <ReviewItem
              title="답장이 빨랐어요"
              value={scores.reply}
              onChange={(value) => updateScore("reply", value)}
            />

            <ReviewItem
              title="상품 설명이 정확했어요"
              value={scores.accuracy}
              onChange={(value) => updateScore("accuracy", value)}
            />

            <ReviewItem
              title="안전하게 거래했어요"
              value={scores.safe}
              onChange={(value) => updateScore("safe", value)}
            />
          </div>

          <div className="profileBox">
            <h3>👍 좋았던 점</h3>
            <div className="tagWrap">
              {positiveTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={positive.includes(tag) ? "tag active" : "tag"}
                  onClick={() => toggleTag(tag, "positive")}
                >
                  {tag}
                </button>
              ))}
            </div>

            <h3 style={{ marginTop: "20px" }}>👎 아쉬웠던 점</h3>
            <div className="tagWrap">
              {negativeTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={
                    negative.includes(tag)
                      ? "tag negative active"
                      : "tag negative"
                  }
                  onClick={() => toggleTag(tag, "negative")}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="profileBox">
            <h3>후기 내용</h3>
            <textarea
              className="search"
              placeholder="거래 후기를 자세히 적어주세요."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                minHeight: "130px",
                resize: "none",
                marginTop: "12px",
              }}
            />

            <button
              className="primaryBtn"
              onClick={submitReview}
              disabled={loading}
            >
              {loading ? "등록 중..." : "후기 등록하기"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ReviewItem({ title, value, onChange }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <h3 style={{ fontSize: "15px", marginBottom: "10px" }}>{title}</h3>

      <select
        className="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value={5}>매우 좋음</option>
        <option value={4}>좋음</option>
        <option value={3}>보통</option>
        <option value={2}>아쉬움</option>
        <option value={1}>매우 아쉬움</option>
      </select>
    </div>
  );
}

export default Review;