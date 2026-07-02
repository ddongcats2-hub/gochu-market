import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

export default function ChatList() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const rooms = await Promise.all(
          snapshot.docs.map(async (chatDoc) => {
            const chatData = {
              id: chatDoc.id,
              ...chatDoc.data(),
            };

            const otherUserId = chatData.participants?.find(
              (uid) => uid !== currentUser.uid
            );

            let otherUser = null;
            let product = null;

            if (otherUserId) {
              const userSnap = await getDoc(doc(db, "users", otherUserId));
              if (userSnap.exists()) {
                otherUser = { id: userSnap.id, ...userSnap.data() };
              }
            }

            if (chatData.productId) {
              const productSnap = await getDoc(
                doc(db, "products", chatData.productId)
              );
              if (productSnap.exists()) {
                product = { id: productSnap.id, ...productSnap.data() };
              }
            }

            return {
              ...chatData,
              otherUserId,
              otherUser,
              product,
              unread: Number(chatData.unreadCount?.[currentUser.uid] || 0),
            };
          })
        );

        const sortedRooms = rooms.sort((a, b) => {
          if (b.unread !== a.unread) return b.unread - a.unread;

          const aTime = a.updatedAt?.toMillis?.() || 0;
          const bTime = b.updatedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        setChatRooms(sortedRooms);
        setLoading(false);
      } catch (error) {
        console.error("채팅 목록 불러오기 실패:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  function formatDate(timestamp) {
    if (!timestamp?.toDate) return "";

    const date = timestamp.toDate();
    const now = new Date();

    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (isToday) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  }

  function goChat(room) {
    navigate(`/chat/${room.productId}/${room.otherUserId}`, {
      state: {
        productId: room.productId,
        otherUserId: room.otherUserId,
        product: room.product,
        otherUser: room.otherUser,
      },
    });
  }

  if (loading) {
    return <div style={styles.center}>채팅 목록 불러오는 중...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ←
        </button>
        <h2 style={styles.headerTitle}>채팅</h2>
      </div>

      {chatRooms.length === 0 ? (
        <div style={styles.empty}>아직 채팅방이 없습니다.</div>
      ) : (
        <div style={styles.list}>
          {chatRooms.map((room) => (
            <button
              key={room.id}
              style={{
                ...styles.card,
                backgroundColor: room.unread > 0 ? "#fff8f7" : "#fff",
              }}
              onClick={() => goChat(room)}
            >
              <div style={styles.imageWrap}>
                {room.product?.imageUrl || room.product?.image ? (
                  <img
                    src={room.product.imageUrl || room.product.image}
                    alt={room.product?.title || "상품 이미지"}
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.noImage}>사진 없음</div>
                )}

                {room.unread > 0 && (
                  <span style={styles.badge}>
                    {room.unread > 999 ? "999+" : room.unread}
                  </span>
                )}
              </div>

              <div style={styles.info}>
                <div style={styles.topLine}>
                  <span
                    style={{
                      ...styles.name,
                      fontWeight: room.unread > 0 ? 900 : 700,
                    }}
                  >
                    {room.otherUser?.nickname ||
                      room.otherUser?.displayName ||
                      room.otherUser?.name ||
                      room.otherUser?.email ||
                      "상대방"}
                  </span>

                  <span style={styles.time}>{formatDate(room.updatedAt)}</span>
                </div>

                <div style={styles.productTitle}>
                  {room.product?.title || "거래 상품"}
                </div>

                <div
                  style={{
                    ...styles.lastMessage,
                    fontWeight: room.unread > 0 ? 800 : 400,
                    color: room.unread > 0 ? "#222" : "#444",
                  }}
                >
                  {room.lastMessage
  ? room.lastMessageSenderId === currentUser.uid
    ? `나: ${room.lastMessage}`
    : room.lastMessage
  : "메시지가 없습니다."}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: "720px",
    minHeight: "100vh",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderLeft: "1px solid #eee",
    borderRight: "1px solid #eee",
  },
  center: {
    padding: "40px",
    textAlign: "center",
    color: "#777",
  },
  header: {
    height: "64px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 16px",
    borderBottom: "1px solid #eee",
  },
  backButton: {
    border: "none",
    background: "none",
    fontSize: "24px",
    cursor: "pointer",
  },
  headerTitle: {
    fontSize: "22px",
    margin: 0,
  },
  empty: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#999",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "14px 16px",
    border: "none",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    textAlign: "left",
  },
  imageWrap: {
    position: "relative",
    width: "58px",
    height: "58px",
    flexShrink: 0,
  },
  image: {
    width: "58px",
    height: "58px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  noImage: {
    width: "58px",
    height: "58px",
    borderRadius: "12px",
    backgroundColor: "#eee",
    color: "#999",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    borderRadius: "999px",
    backgroundColor: "#ff3b30",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(255, 59, 48, 0.35)",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  topLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "4px",
  },
  name: {
    fontSize: "15px",
    color: "#222",
  },
  time: {
    fontSize: "12px",
    color: "#aaa",
    whiteSpace: "nowrap",
  },
  productTitle: {
    fontSize: "13px",
    color: "#777",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  lastMessage: {
    fontSize: "14px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

