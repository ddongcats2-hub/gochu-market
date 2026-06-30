import { useRef } from "react";

function ImageUploader({ image, setImage }) {
  const fileRef = useRef(null);

  function selectImage(e) {
    const file = e.target.files?.[0];

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
        onClick={() => fileRef.current?.click()}
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          overflow: "hidden",
          backgroundColor: "#f2f2f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "34px",
          flexShrink: 0,
        }}
      >
        {image ? (
          <img
            src={image}
            alt="프로필 사진"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          "📷"
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={selectImage}
      />
    </>
  );
}

export default ImageUploader;