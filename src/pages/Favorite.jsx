import ProductCard from "../components/ProductCard";

function Favorite({
  products = [],
  user,
  toggleLike,
  deleteProduct,
}) {
  const likedProducts = user
    ? products.filter(
        (item) =>
          Array.isArray(item.likedBy) &&
          item.likedBy.includes(user.uid)
      )
    : [];

  if (!user) {
    return (
      <div className="container">
        <h2 style={{ marginBottom: "20px" }}>❤️ 관심상품</h2>

        <div
          className="profileBox"
          style={{ textAlign: "center" }}
        >
          <h3>로그인이 필요합니다.</h3>

          <p
            className="sub"
            style={{ marginTop: "8px" }}
          >
            로그인 후 찜한 상품을 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: "20px" }}>
        ❤️ 관심상품
      </h2>

      {likedProducts.length === 0 ? (
        <div
          className="profileBox"
          style={{ textAlign: "center" }}
        >
          <h3>관심상품이 없습니다.</h3>

          <p
            className="sub"
            style={{ marginTop: "8px" }}
          >
            마음에 드는 상품의 ❤️ 버튼을 눌러보세요.
          </p>
        </div>
      ) : (
        likedProducts.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            user={user}
            toggleLike={toggleLike}
            deleteProduct={deleteProduct}
          />
        ))
      )}
    </div>
  );
}

export default Favorite;