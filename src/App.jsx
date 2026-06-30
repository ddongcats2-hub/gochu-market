import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

import Home from "./pages/Home";
import Detail from "./pages/Detail";
import Sell from "./pages/Sell";
import EditProduct from "./pages/EditProduct";
import Chat from "./pages/Chat";
import ChatList from "./pages/ChatList";
import Favorite from "./pages/Favorite";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Review from "./pages/Review";
import Notifications from "./pages/Notifications";
import MyPage from "./pages/MyPage";
import BottomTab from "./components/BottomTab";

import "./App.css";

const guestProfile = {
  nickname: "비회원",
  intro: "로그인 후 프로필을 설정할 수 있습니다.",
  location: "서울 강남구",
  scoville: 0,
  deals: 0,
  reviews: 0,
  photo: "",
};

function makeDefaultProfile(user) {
  return {
    uid: user.uid,
    nickname: user.displayName || "고추유저",
    email: user.email || "",
    intro: "매콤하지만 안전한 거래를 좋아합니다 🌶️",
    location: "서울 강남구",
    scoville: 1000,
    deals: 0,
    reviews: 0,
    photo: user.photoURL || "",
  };
}

function App() {
  const location = useLocation();

const hideBottomTab =
  location.pathname.startsWith("/chat/");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(guestProfile);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);

        if (!firebaseUser) {
          setProfile(guestProfile);
          setNotifications([]);
          return;
        }

        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile({
            ...guestProfile,
            ...userSnap.data(),
          });
        } else {
          const defaultProfile = makeDefaultProfile(firebaseUser);

          await setDoc(userRef, {
            ...defaultProfile,
            createdAt: serverTimestamp(),
          });

          setProfile(defaultProfile);
        }
      } catch (error) {
        console.error("프로필 불러오기 오류:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const productsQuery = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];

          return {
            id: docSnap.id,
            title: data.title || "",
            price: data.price ?? "",
            location: data.location || "지역 미설정",
            description: data.description || "",
            image: data.image || "🆕",
            seller: data.seller || "고추유저",
sellerUid: data.sellerUid || "",
buyerUid: data.buyerUid || "",
reservedBy: data.reservedBy || "",
reserved: Boolean(data.reserved),
dealStatus: data.dealStatus || "",
sold: Boolean(data.sold),
            likedBy,
            likes: likedBy.length,
            liked: user ? likedBy.includes(user.uid) : false,
            time: data.time || "방금 전",
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            soldAt: data.soldAt || null,
          };
        });

        setProducts(list);
      },
      (error) => {
        console.error("상품 불러오기 오류:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const notificationsQuery = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id,
            icon: data.icon || "🔔",
            title: data.title || "알림",
            message: data.message || "",
            time: data.time || "방금 전",
            read: Boolean(data.read),
            createdAt: data.createdAt || null,
          };
        });

        setNotifications(list);
      },
      (error) => {
        console.error("알림 불러오기 오류:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  function requireLogin() {
    if (!user) {
      alert("로그인이 필요합니다.");
      return false;
    }

    return true;
  }

  async function addNotification(icon, title, message) {
    if (!user) return;

    try {
      await addDoc(collection(db, "users", user.uid, "notifications"), {
        icon,
        title,
        message,
        time: "방금 전",
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("알림 추가 오류:", error);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(guestProfile);
      setNotifications([]);
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  }

  async function addProduct(data) {
    if (!requireLogin()) return false;

    const title = data.title?.trim();
const price = Number(data.price);

if (!title || Number.isNaN(price) || price < 0) {
      alert("상품명과 가격을 입력해주세요.");
      return false;
    }

    try {
      await addDoc(collection(db, "products"), {
        title,
        price,
        description: data.description?.trim() || "",
        image: data.image || "🆕",
        location: profile.location || "지역 미설정",
        seller: profile.nickname || "고추유저",
        sellerUid: user.uid,
        sold: false,
        likedBy: [],
        time: "방금 전",
        createdAt: serverTimestamp(),
      });

      await addNotification(
        "🛒",
        "상품이 등록됐어요",
        `${title} 상품이 등록되었습니다.`
      );

      return true;
    } catch (error) {
      console.error("상품 등록 오류:", error);
      alert("상품 등록 중 오류가 발생했습니다.");
      return false;
    }
  }

  async function updateProduct(id, data) {
    if (!requireLogin()) return false;

    const target = products.find((item) => String(item.id) === String(id));

    if (!target) {
      alert("상품을 찾을 수 없습니다.");
      return false;
    }

    if (target.sellerUid !== user.uid) {
      alert("글쓴이만 수정할 수 있습니다.");
      return false;
    }

    const title = data.title?.trim();
const price = Number(data.price);

if (!title || Number.isNaN(price) || price < 0) {
      alert("상품명과 가격을 입력해주세요.");
      return false;
    }

    try {
      await updateDoc(doc(db, "products", id), {
        title,
        price,
        description: data.description?.trim() || "",
        image: data.image || target.image || "🆕",
        updatedAt: serverTimestamp(),
      });

      await addNotification(
        "✏️",
        "게시글이 수정됐어요",
        `${title} 게시글이 수정되었습니다.`
      );

      return true;
    } catch (error) {
      console.error("상품 수정 오류:", error);
      alert("상품 수정 중 오류가 발생했습니다.");
      return false;
    }
  }

  async function deleteProduct(id) {
    if (!requireLogin()) return false;

    const target = products.find((item) => String(item.id) === String(id));

    if (!target) {
      alert("상품을 찾을 수 없습니다.");
      return false;
    }

    if (target.sellerUid !== user.uid) {
      alert("글쓴이만 삭제할 수 있습니다.");
      return false;
    }

    if (!window.confirm("게시글을 삭제하시겠습니까?")) return false;

    try {
      await deleteDoc(doc(db, "products", id));

      await addNotification(
        "🗑️",
        "게시글이 삭제됐어요",
        `${target.title} 게시글이 삭제되었습니다.`
      );

      return true;
    } catch (error) {
      console.error("상품 삭제 오류:", error);
      alert("상품 삭제 중 오류가 발생했습니다.");
      return false;
    }
  }

  async function toggleLike(id) {
    if (!requireLogin()) return;

    const target = products.find((item) => String(item.id) === String(id));

    if (!target) {
      alert("상품을 찾을 수 없습니다.");
      return;
    }

    try {
      const productRef = doc(db, "products", id);

      if (target.liked) {
        await updateDoc(productRef, {
          likedBy: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(productRef, {
          likedBy: arrayUnion(user.uid),
        });

        await addNotification(
          "❤️",
          "관심상품에 추가했어요",
          `${target.title} 상품을 찜했습니다.`
        );
      }
    } catch (error) {
      console.error("찜 변경 오류:", error);
      alert("찜 변경 중 오류가 발생했습니다.");
    }
  }

  async function completeDeal(id) {
    if (!requireLogin()) return;

    const target = products.find((item) => String(item.id) === String(id));

    if (!target) {
      alert("상품을 찾을 수 없습니다.");
      return;
    }

    if (target.sellerUid !== user.uid) {
      alert("판매자만 거래 완료를 할 수 있습니다.");
      return;
    }

    if (target.sold) {
      alert("이미 거래 완료된 상품입니다.");
      return;
    }

    try {
      await updateDoc(doc(db, "products", id), {
        sold: true,
        soldAt: serverTimestamp(),
      });

await updateDoc(doc(db, "users", user.uid), {
  deals: increment(1),
});

setProfile((prev) => ({
  ...prev,
  deals: Number(prev.deals || 0) + 1,
}));

await addNotification(
  "✅",
  "거래가 완료됐어요",
  `${target.title} 거래가 완료되었습니다. 후기를 작성하면 스코빌이 상승합니다.`
);

alert("거래가 완료되었습니다.\n후기를 작성하면 스코빌이 상승합니다.");

    } catch (error) {
      console.error("거래 완료 오류:", error);
      alert("거래 완료 처리 중 오류가 발생했습니다.");
    }
  }

  async function updateNotifications(nextNotifications) {
    if (!user) return;

    try {
      const updateTasks = nextNotifications
        .filter((notice) => notice.id)
        .map((notice) =>
          updateDoc(doc(db, "users", user.uid, "notifications", notice.id), {
            read: Boolean(notice.read),
          })
        );

      await Promise.all(updateTasks);
    } catch (error) {
      console.error("알림 수정 오류:", error);
    }
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              products={products}
              profile={profile}
              search={search}
              setSearch={setSearch}
              user={user}
              toggleLike={toggleLike}
              deleteProduct={deleteProduct}
              notificationCount={
                notifications.filter((item) => !item.read).length
              }
            />
          }
        />

        <Route
          path="/detail/:id"
          element={
            <Detail
              products={products}
              user={user}
              toggleLike={toggleLike}
              completeDeal={completeDeal}
              deleteProduct={deleteProduct}
            />
          }
        />

        <Route
          path="/sell"
          element={
            <Sell user={user} profile={profile} addProduct={addProduct} />
          }
        />

        <Route
          path="/edit/:id"
          element={
            <EditProduct
              products={products}
              user={user}
              updateProduct={updateProduct}
            />
          }
        />

        <Route
  path="/chat/:productId/:otherUserId"
  element={<Chat />}
/>

        <Route
          path="/chat-list"
          element={
            <ChatList
              user={user}
              profile={profile}
              products={products}
            />
          }
        />

        <Route
          path="/favorite"
          element={
            <Favorite
              products={products}
              user={user}
              toggleLike={toggleLike}
              deleteProduct={deleteProduct}
            />
          }
        />

        <Route
          path="/notifications"
          element={
            <Notifications
  user={user}
  notifications={notifications}
/>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/mypage"
          element={
            <MyPage
              user={user}
              profile={profile}
              setProfile={setProfile}
              products={products}
              toggleLike={toggleLike}
              deleteProduct={deleteProduct}
              logout={logout}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile
              user={user}
              profile={profile}
              setProfile={setProfile}
              logout={logout}
            />
          }
        />

        <Route
          path="/review/:id"
          element={
            <Review
              products={products}
              user={user}
              profile={profile}
              addNotification={addNotification}
            />
          }
        />
      </Routes>

     {!hideBottomTab && <BottomTab user={user} />}
         </>
  );
}

export default App;