import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Sell({ user, profile, addProduct }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("🆕");

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

  function handleImageUpload(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function submitProduct(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    if (!price.trim()) {
      alert("가격을 입력해주세요.");
      return;
    }

    await addProduct({
      title: title.trim(),
      price: price.trim(),
      description: description.trim(),
      image,
    });

    navigate("/");
  }

  return (
    <div className="container">
      <button className="ghostBtn" onClick={() => navigate(-1)}>
        ← 뒤로가기
      </button>

      <div className="profileBox" style={{ marginTop: "16px" }}>
        <h2>＋ 판매하기</h2>

        <p className="sub" style={{ marginTop: "8px" }}>
          {profile.location}에 등록됩니다.
        </p>
      </div>

      <form className="profileBox" onSubmit={submitProduct}>
        <div className="uploadPreview">
          {image?.startsWith?.("data:image") ? (
            <img src={image} alt="상품 이미지" />
          ) : (
            <span>{image}</span>
          )}
        </div>

        <label className="uploadBtn">
          📷 상품 사진 업로드
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
    🆓 나눔으로 등록됩니다.
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
          등록하기
        </button>
      </form>
    </div>
  );
}

export default Sell;