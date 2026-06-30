import { useNavigate } from "react-router-dom";

function ProductCard({ item, user, toggleLike, deleteProduct }) {
  const navigate = useNavigate();

  const isOwner = user && item.sellerUid === user.uid;

  function handleLike(e) {
    e.stopPropagation();

    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    toggleLike(item.id);
  }

  function handleDelete(e) {
    e.stopPropagation();

    if (!isOwner) {
      alert("글쓴이만 삭제할 수 있습니다.");
      return;
    }

    deleteProduct(item.id);
  }

  function handleEdit(e) {
    e.stopPropagation();

    if (!isOwner) return;

    navigate(`/edit/${item.id}`);
  }

  return (
    <div
      className="card"
      onClick={() => navigate(`/detail/${item.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="image">
        {item.image?.startsWith?.("data:image") ? (
          <img src={item.image} alt={item.title} />
        ) : (
          <span>{item.image}</span>
        )}

        {item.sold && <div className="soldOverlay">거래완료</div>}
      </div>

      <div className="info">
        <div className="topRow">
          <h2>{item.title}</h2>

          {item.deal?.status === "pending" && (
            <span className="dealBadge">거래중</span>
          )}

          {item.sold && (
            <span className="soldBadge">
              거래완료
            </span>
          )}
        </div>

        <p className="sub">
          📍 {item.location}
        </p>

        <div className="bottomRow">
<h3 className="price">
  {(() => {
    const price = Number(item.price);

    if (!Number.isFinite(price)) {
      return "기타";
    }

    if (price === 0) {
      return "🆓 나눔";
    }

    return `${price.toLocaleString()}원`;
  })()}
</h3>

          <button
            className="likeButton"
            onClick={handleLike}
          >
            {item.liked ? "❤️" : "🤍"} {item.likes}
          </button>
        </div>

        <p
          className="sub"
          style={{ marginTop: "8px" }}
        >
          👤 {item.seller}
        </p>

        {isOwner && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "14px",
            }}
          >
            <button
              className="primaryBtn"
              style={{ flex: 1 }}
              onClick={handleEdit}
            >
              수정
            </button>

            <button
              className="dangerBtn"
              style={{ flex: 1 }}
              onClick={handleDelete}
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;