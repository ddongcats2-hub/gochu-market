import { useRef } from "react";

function ProductImageUploader({ image, setImage }) {
  const fileRef = useRef(null);

  function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  }

  return (
    <>
      <div
        className="productUploadBox"
        onClick={() => fileRef.current.click()}
      >
        {image ? <img src={image} alt="상품 사진" /> : <span>📷 상품 사진 추가</span>}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </>
  );
}

export default ProductImageUploader;