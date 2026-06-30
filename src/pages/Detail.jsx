import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

function Detail({ products = [], user, toggleLike, completeDeal }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const item = products.find((product) => String(product.id) === String(id));

const [reviews, setReviews] = useState([]);
const [alreadyReviewed, setAlreadyReviewed] = useState(false);
const [sellerProfile, setSellerProfile] = useState(null);

  useEffect(() => {
    if (!id) return;

    const reviewsQuery = query(
      collection(db, "products", id, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setReviews(list);
      },
      (error) => {
        console.error("후기 불러오기 오류:", error);
      }
    );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!user || !id) {
      setAlreadyReviewed(false);
      return;
    }

    const myReviewQuery = query(
      collection(db, "products", id, "reviews"),
      where("writerUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      myReviewQuery,
      (snapshot) => {
        setAlreadyReviewed(!snapshot.empty);
      },
      (error) => {
        console.error("내 후기 확인 오류:", error);
      }
    );

    return () => unsubscribe();
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

  function requireLogin() {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return false;
    }

    return true;
  }

function goChat() {
  if (!requireLogin()) return;

  if (user.uid === item.sellerUid) {
    alert("내 상품에는 채팅할 수 없습니다.");
    return;
  }

  navigate(`/chat/${item.id}/${item.sellerUid}`, {
    state: {
      productId: item.id,
      otherUserId: item.sellerUid,
      product: item,
    },
  });
}

  function formatRating(value) {
    const rating = Number(value || 0);
    return rating.toFixed(1);
  }

  function renderStars(value) {
    const rating = Math.round(Number(value || 0));
    return "⭐".repeat(rating);
  }

  return (
    <div className="container">
      <button className="ghostBtn" onClick={() => navigate(-1)}>
        ← 뒤로가기
      </button>

      <div className="productDetailImage">
        {item.image?.startsWith?.("data:image") ? (
          <img src={item.image} alt={item.title} />
        ) : (
          <span>{item.image}</span>
        )}
      </div>

      <div className="profileBox">
        <h1>{item.title}</h1>
        <h2 className="price">{item.price}</h2>
        <p className="sub">
          📍 {item.location} · {item.time || "방금 전"}
        </p>

        {item.sold && (
          <p style={{ marginTop: "10px", color: "#34c759", fontWeight: 700 }}>
            ✅ 거래 완료된 상품입니다
          </p>
        )}

{(item.reserved || item.dealStatus === "reserved") && !item.sold && (
  <p style={{ marginTop: "10px", color: "#ff3b30", fontWeight: 700 }}>
    🔥 예약중인 상품입니다
  </p>
)}

        <hr />

        <h3>판매자</h3>
        <div className="sellerBox">
          <div className="profilePhoto">👤</div>
          <div>
            <strong>{item.seller || "고추유저"}</strong>
            <p className="sub">🌶 스코빌 정보</p>
          </div>
        </div>

        <hr />

        <h3>상품 설명</h3>
        <p className="description">
          {item.description || "상품 설명이 없습니다."}
        </p>
      </div>

      <div className="detailButtons">
        <button
          className="primaryBtn"
          onClick={() => {
            if (!requireLogin()) return;
            toggleLike(item.id);
          }}
        >
          {item.liked ? "❤️ 찜 취소" : "🤍 찜하기"}
        </button>

        <button className="sellBtn" onClick={goChat}>
          💬 채팅하기
        </button>
      </div>

      <button
        className="primaryBtn"
        style={{ background: item.sold ? "#8e8e93" : "#34c759" }}
        disabled={item.sold}
        onClick={() => {
          if (!requireLogin()) return;
          completeDeal(item.id);
        }}
      >
        {item.sold ? "✅ 거래 완료됨" : "✅ 거래 완료"}
      </button>

      {item.sold && !alreadyReviewed && (
        <button
          className="primaryBtn"
          onClick={() => {
            if (!requireLogin()) return;
            navigate(`/review/${item.id}`);
          }}
        >
          ⭐ 거래 후기 작성
        </button>
      )}

      {item.sold && alreadyReviewed && (
        <div className="profileBox" style={{ marginTop: "18px" }}>
          <p className="sub">이미 이 거래품목에 후기를 작성했습니다.</p>
        </div>
      )}

      <div className="profileBox" style={{ marginTop: "18px" }}>
        <h3>받은 후기</h3>

        {reviews.length === 0 ? (
          <p className="sub" style={{ marginTop: "12px" }}>
            아직 후기가 없습니다.
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              style={{ padding: "16px 0", borderBottom: "1px solid #eee" }}
            >
              <strong>
                {renderStars(review.averageRating)}{" "}
                {formatRating(review.averageRating)}점
              </strong>

              <p className="sub" style={{ marginTop: "6px" }}>
                {review.anonymous
                  ? `익명 · 작성자 평균 별점 ${
                      review.writerAverageRating || "신규"
                    }`
                  : review.writer || "고추유저"}{" "}
                · {review.date || ""}
              </p>

              {review.tags?.positive?.length > 0 && (
                <div className="tagWrap" style={{ marginTop: "10px" }}>
                  {review.tags.positive.map((tag) => (
                    <span className="tag small active" key={tag}>
                      👍 {tag}
                    </span>
                  ))}
                </div>
              )}

              {review.tags?.negative?.length > 0 && (
                <div className="tagWrap" style={{ marginTop: "8px" }}>
                  {review.tags.negative.map((tag) => (
                    <span className="tag small negative active" key={tag}>
                      👎 {tag}
                    </span>
                  ))}
                </div>
              )}

              <p style={{ marginTop: "10px", lineHeight: 1.7 }}>
                {review.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Detail;