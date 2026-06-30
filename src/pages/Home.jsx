import TopBar from "../components/TopBar";
import SearchBar from "../components/SearchBar";
import ScovilleCard from "../components/ScovilleCard";
import ProductCard from "../components/ProductCard";

function Home({
  products,
  profile,
  search,
  setSearch,
  user,
  toggleLike,
  deleteProduct,
  openProfile,
  notificationCount,
}) {
  const filteredProducts = products.filter(
    (item) =>
      item.location === profile.location &&
      item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <TopBar
        user={user}
        profile={profile}
        openProfile={openProfile}
        notificationCount={notificationCount}
      />

      <SearchBar search={search} setSearch={setSearch} />

      <ScovilleCard profile={profile} />

      <h2 style={{ margin: "22px 0 14px" }}>
        최신상품
      </h2>

      {filteredProducts.length === 0 ? (
        <div className="profileBox" style={{ textAlign: "center" }}>
          <h3>이 지역의 상품이 없습니다.</h3>
          <p className="sub" style={{ marginTop: "8px" }}>
            지역을 바꾸거나 상품을 등록해보세요.
          </p>
        </div>
      ) : (
        filteredProducts.map((item) => (
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

export default Home;