import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditProduct({ products = [], user, updateProduct }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const item = products.find((product) => String(product.id) === String(id));

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("🆕");

  useEffect(() => {
    if (!item) return;

    setTitle(item.title || "");
    setPrice(String(item.price ?? ""));
    setDescription(item.description || "");
    setImage(item.image || "🆕");
  }, [item]);

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

  if (item.sellerUid !== user.uid) {
    return (
      <div className="container">
        <h2>수정 권한이 없습니다.</h2>
        <button className="primaryBtn" onClick={() => navigate("/")}>
          홈으로
        </button>
      </div>
    );
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function submitEdit(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    if (price === "") {
      alert("가격을 입력해주세요. 나눔은 0을 입력해주세요.");
      return;
    }

    const success = await updateProduct(item.id, {
      title: title.trim(),
      price: String(Number(price)),
      description: description.trim(),
      image,
    });

    if (success) {
      navigate(`/detail/${item.id}`);
    }
  }

  return (
    <div className="container">
      <button className="ghostBtn" onClick={() => navigate(-1)}>
        ← 뒤로가기
      </button>

      <div className="profileBox" style={{ marginTop: "16px" }}>
        <h2>상품 수정</h2>
      </div>

      <form className="profileBox" onSubmit={submitEdit}>
        <div className="uploadPreview">
          {image?.startsWith?.("data:image") ? (
            <img src={image} alt="상품 이미지" />
          ) : (
            <span>{image}</span>
          )}
        </div>

        <label className="uploadBtn">
          📷 상품 사진 변경
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>

        <input
          className="search"
          placeholder="상품명"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="search"
          type="number"
          min="0"
          placeholder="가격 (0 입력 시 나눔)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {price !== "" && Number(price) === 0 && (
          <p
            style={{
              color: "#34c759",
              marginTop: "-8px",
              marginBottom: "12px",
              fontWeight: "700",
            }}
          >
            🆓 나눔으로 표시됩니다.
          </p>
        )}

        <textarea
          className="search"
          placeholder="상품 설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            minHeight: "130px",
            resize: "none",
          }}
        />

        <button className="sellBtn" type="submit">
          수정 완료
        </button>
      </form>
    </div>
  );
}

export default EditProduct;