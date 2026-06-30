import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
<<<<<<< HEAD
=======
  increment,
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

function makeChatId(uid1, uid2, productId) {
  return [uid1, uid2].sort().join("_") + "_" + productId;
}

function formatTime(timestamp) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price) {
  const num = Number(price);
  if (!Number.isFinite(num)) return "가격 미정";
  if (num === 0) return "🆓 나눔";
  return `${num.toLocaleString()}원`;
}

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [product, setProduct] = useState(location.state?.product || null);
  const [otherUser, setOtherUser] = useState(location.state?.otherUser || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const [showPromiseBox, setShowPromiseBox] = useState(false);
  const [promiseDate, setPromiseDate] = useState("");
  const [promisePlace, setPromisePlace] = useState("");

  const productId =
    params.productId || location.state?.productId || location.state?.product?.id;

  const otherUserId =
    params.otherUserId ||
    location.state?.otherUserId ||
    location.state?.product?.sellerUid ||
    otherUser?.uid ||
    otherUser?.id;

  const chatId = useMemo(() => {
    if (!currentUser?.uid || !otherUserId || !productId) return null;
    return makeChatId(currentUser.uid, otherUserId, productId);
  }, [currentUser, otherUserId, productId]);

  const isSeller =
    currentUser?.uid &&
    product &&
    product.sellerUid === currentUser.uid;

  const buyerUid = isSeller ? otherUserId : currentUser?.uid;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }
<<<<<<< HEAD
=======

>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
      setCurrentUser(user);
    });

    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    async function loadData() {
      if (!currentUser?.uid) return;

      if (!productId || !otherUserId) {
        alert("채팅 정보를 불러올 수 없습니다.");
        navigate(-1);
        return;
      }

      try {
        if (!product) {
          const productSnap = await getDoc(doc(db, "products", productId));
<<<<<<< HEAD
          if (productSnap.exists()) {
            setProduct({ id: productSnap.id, ...productSnap.data() });
=======

          if (productSnap.exists()) {
            setProduct({
              id: productSnap.id,
              ...productSnap.data(),
            });
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
          }
        }

        if (!otherUser) {
          const userSnap = await getDoc(doc(db, "users", otherUserId));
<<<<<<< HEAD
          if (userSnap.exists()) {
            setOtherUser({ id: userSnap.id, ...userSnap.data() });
=======

          if (userSnap.exists()) {
            setOtherUser({
              id: userSnap.id,
              ...userSnap.data(),
            });
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
          }
        }
      } catch (error) {
        console.error("채팅 정보 로딩 실패:", error);
      }
    }

    loadData();
  }, [currentUser, productId, otherUserId, product, otherUser, navigate]);

  useEffect(() => {
    if (!chatId || !currentUser?.uid || !otherUserId || !productId) return;

    async function makeRoom() {
      try {
        const chatRef = doc(db, "chats", chatId);
<<<<<<< HEAD
        const snap = await getDoc(chatRef);

        if (!snap.exists()) {
          await setDoc(chatRef, {
=======

        await setDoc(
          chatRef,
          {
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
            id: chatId,
            productId,
            participants: [currentUser.uid, otherUserId],
            participantMap: {
              [currentUser.uid]: true,
              [otherUserId]: true,
            },
<<<<<<< HEAD
=======
            unreadCount: {
              [currentUser.uid]: 0,
              [otherUserId]: 0,
            },
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
            lastMessage: "",
            lastMessageSenderId: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
<<<<<<< HEAD
          });
        }
=======
          },
          { merge: true }
        );

        await updateDoc(chatRef, {
          [`unreadCount.${currentUser.uid}`]: 0,
        });
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd

        setLoading(false);
      } catch (error) {
        console.error("채팅방 생성 실패:", error);
        setLoading(false);
      }
    }

    makeRoom();
  }, [chatId, currentUser, otherUserId, productId]);

  useEffect(() => {
    if (!chatId || !currentUser?.uid) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setMessages(list);

<<<<<<< HEAD
      snapshot.docs.forEach(async (docSnap) => {
        const data = docSnap.data();

        if (data.receiverId === currentUser.uid && !data.read) {
          await updateDoc(doc(db, "chats", chatId, "messages", docSnap.id), {
            read: true,
          });
        }
      });
=======
      try {
        await updateDoc(doc(db, "chats", chatId), {
          [`unreadCount.${currentUser.uid}`]: 0,
        });

        snapshot.docs.forEach(async (docSnap) => {
          const data = docSnap.data();

          if (data.receiverId === currentUser.uid && !data.read) {
            await updateDoc(doc(db, "chats", chatId, "messages", docSnap.id), {
              read: true,
            });
          }
        });
      } catch (error) {
        console.error("읽음 처리 실패:", error);
      }
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
    });

    return () => unsub();
  }, [chatId, currentUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(messageData, lastMessage) {
    if (!chatId || !currentUser?.uid || !otherUserId || !productId) {
      alert("채팅방 정보를 찾을 수 없습니다.");
      return false;
    }

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: currentUser.uid,
        receiverId: otherUserId,
        createdAt: serverTimestamp(),
        read: false,
        ...messageData,
      });

      await setDoc(
        doc(db, "chats", chatId),
        {
          id: chatId,
          productId,
          participants: [currentUser.uid, otherUserId],
          participantMap: {
            [currentUser.uid]: true,
            [otherUserId]: true,
          },
          lastMessage,
          lastMessageSenderId: currentUser.uid,
<<<<<<< HEAD
=======
          [`unreadCount.${otherUserId}`]: increment(1),
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지 전송에 실패했습니다.");
      return false;
    }
  }

  async function handleSend(e) {
    e.preventDefault();

    const messageText = text.trim();
    if (!messageText) return;

    setText("");

    const ok = await sendMessage(
      {
        type: "text",
        text: messageText,
      },
      messageText
    );

    if (!ok) setText(messageText);
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage(
        {
          type: "image",
          imageUrl: reader.result,
          text: "",
        },
        "📷 사진"
      );

      if (fileRef.current) fileRef.current.value = "";
    };

    reader.readAsDataURL(file);
  }

  async function handleReserveOnly() {
    if (!buyerUid) {
      alert("구매자 정보를 찾을 수 없습니다.");
      return;
    }

    if (!window.confirm("이 상품을 예약중으로 변경할까요?")) return;

    try {
      await updateDoc(doc(db, "products", productId), {
        reserved: true,
        reservedBy: buyerUid,
        buyerUid,
        dealStatus: "reserved",
        reservedAt: serverTimestamp(),
      });

      setProduct((prev) => ({
        ...prev,
        reserved: true,
        reservedBy: buyerUid,
        buyerUid,
        dealStatus: "reserved",
      }));

      await sendMessage(
        {
          type: "system",
          text: "✅ 상품이 예약중으로 변경되었습니다.",
        },
        "✅ 예약중"
      );
    } catch (error) {
      console.error("예약 실패:", error);
      alert("예약 처리 중 오류가 발생했습니다.");
    }
  }

  async function handlePromiseSubmit(e) {
    e.preventDefault();

    if (!promiseDate) {
      alert("약속 시간을 선택해주세요.");
      return;
    }

    if (!promisePlace.trim()) {
      alert("거래 장소를 입력해주세요.");
      return;
    }

    if (!buyerUid) {
      alert("구매자 정보를 찾을 수 없습니다.");
      return;
    }

    const promiseText = `📅 거래 약속\n시간: ${promiseDate}\n장소: ${promisePlace.trim()}`;

    const ok = await sendMessage(
      {
        type: "promise",
        text: promiseText,
        promiseDate,
        promisePlace: promisePlace.trim(),
      },
      "📅 거래 약속"
    );

    if (!ok) return;

    try {
      await updateDoc(doc(db, "products", productId), {
        reserved: true,
        reservedBy: buyerUid,
        buyerUid,
        dealStatus: "reserved",
        reservedAt: serverTimestamp(),
        promiseDate,
        promisePlace: promisePlace.trim(),
      });

      setProduct((prev) => ({
        ...prev,
        reserved: true,
        reservedBy: buyerUid,
        buyerUid,
        dealStatus: "reserved",
        promiseDate,
        promisePlace: promisePlace.trim(),
      }));

      setPromiseDate("");
      setPromisePlace("");
      setShowPromiseBox(false);
    } catch (error) {
      console.error("약속 저장 실패:", error);
      alert("약속 저장 중 오류가 발생했습니다.");
    }
  }

  function renderMessage(msg) {
    if (msg.type === "image") {
      return (
        <img
          src={msg.imageUrl}
          alt="채팅 이미지"
          style={styles.chatImage}
        />
      );
    }

    return <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>;
  }

  if (loading) {
    return <div style={styles.center}>채팅방 불러오는 중...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ←
        </button>

        <div>
          <div style={styles.title}>
            {otherUser?.nickname ||
              otherUser?.displayName ||
              otherUser?.email ||
              "상대방"}
          </div>
          <div style={styles.productTitle}>{product?.title || "거래 상품"}</div>
        </div>
      </div>

      {product && (
        <div style={styles.productBox}>
          {product.image?.startsWith?.("data:image") ? (
<<<<<<< HEAD
            <img src={product.image} alt={product.title} style={styles.productImage} />
=======
            <img
              src={product.image}
              alt={product.title}
              style={styles.productImage}
            />
>>>>>>> f107ef44276ccee10e56d2ab37750cf493f449dd
          ) : (
            <div style={styles.noImage}>{product.image || "🆕"}</div>
          )}

          <div style={{ flex: 1 }}>
            <div style={styles.productName}>{product.title}</div>
            <div style={styles.price}>{formatPrice(product.price)}</div>

            {(product.reserved || product.dealStatus === "reserved") &&
              !product.sold && <div style={styles.badge}>예약중</div>}
          </div>

          <button style={styles.reserveButton} onClick={handleReserveOnly}>
            예약
          </button>
        </div>
      )}

      <div style={styles.actionBar}>
        <button style={styles.actionButton} onClick={() => fileRef.current?.click()}>
          📷 사진
        </button>

        <button
          style={styles.actionButton}
          onClick={() => setShowPromiseBox((prev) => !prev)}
        >
          📅 약속 잡기
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageSelect}
        />
      </div>

      {showPromiseBox && (
        <form style={styles.promiseBox} onSubmit={handlePromiseSubmit}>
          <input
            style={styles.promiseInput}
            type="datetime-local"
            value={promiseDate}
            onChange={(e) => setPromiseDate(e.target.value)}
          />
          <input
            style={styles.promiseInput}
            placeholder="거래 장소"
            value={promisePlace}
            onChange={(e) => setPromisePlace(e.target.value)}
          />
          <button style={styles.promiseButton} type="submit">
            확정
          </button>
        </form>
      )}

      <div style={styles.messages}>
        {messages.length === 0 ? (
          <div style={styles.empty}>아직 메시지가 없습니다.</div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser.uid;

            if (msg.type === "system") {
              return (
                <div key={msg.id} style={styles.systemMessage}>
                  {msg.text}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  ...styles.messageRow,
                  justifyContent: isMine ? "flex-end" : "flex-start",
                }}
              >
                {isMine && (
                  <div style={styles.metaLeft}>
                    <div>{msg.read ? "읽음" : "안읽음"}</div>
                    <div>{formatTime(msg.createdAt)}</div>
                  </div>
                )}

                <div
                  style={{
                    ...styles.bubble,
                    ...(isMine ? styles.myBubble : styles.otherBubble),
                    ...(msg.type === "image" ? styles.imageBubble : {}),
                  }}
                >
                  {renderMessage(msg)}
                </div>

                {!isMine && (
                  <div style={styles.metaRight}>{formatTime(msg.createdAt)}</div>
                )}
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <form style={styles.inputForm} onSubmit={handleSend}>
        <input
          style={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button style={styles.sendButton} type="submit">
          전송
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: "720px",
    height: "100vh",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
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
    flexShrink: 0,
  },
  backButton: {
    border: "none",
    background: "none",
    fontSize: "24px",
    cursor: "pointer",
  },
  title: {
    fontSize: "17px",
    fontWeight: "700",
  },
  productTitle: {
    fontSize: "13px",
    color: "#888",
    marginTop: "3px",
  },
  productBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fafafa",
    flexShrink: 0,
  },
  productImage: {
    width: "52px",
    height: "52px",
    borderRadius: "10px",
    objectFit: "cover",
  },
  noImage: {
    width: "52px",
    height: "52px",
    borderRadius: "10px",
    backgroundColor: "#eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    fontSize: "15px",
    fontWeight: "700",
  },
  price: {
    fontSize: "14px",
    color: "#ff3b30",
    fontWeight: "700",
    marginTop: "4px",
  },
  badge: {
    display: "inline-block",
    marginTop: "5px",
    padding: "3px 8px",
    borderRadius: "999px",
    backgroundColor: "#fff1f1",
    color: "#ff3b30",
    fontSize: "12px",
    fontWeight: "800",
  },
  reserveButton: {
    border: "none",
    borderRadius: "14px",
    backgroundColor: "#ff3b30",
    color: "#fff",
    padding: "10px 12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  actionBar: {
    display: "flex",
    gap: "8px",
    padding: "10px 16px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  actionButton: {
    border: "1px solid #e5e5ea",
    backgroundColor: "#fff",
    borderRadius: "999px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "700",
  },
  promiseBox: {
    display: "flex",
    gap: "8px",
    padding: "10px 16px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fafafa",
    flexShrink: 0,
  },
  promiseInput: {
    flex: 1,
    minWidth: 0,
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid #ddd",
  },
  promiseButton: {
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#34c759",
    color: "#fff",
    padding: "10px 12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    padding: "16px",
    paddingBottom: "115px",
    overflowY: "auto",
    backgroundColor: "#f7f8fa",
  },
  empty: {
    textAlign: "center",
    color: "#aaa",
    marginTop: "40px",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "6px",
    marginBottom: "10px",
  },
  bubble: {
    maxWidth: "68%",
    padding: "10px 13px",
    borderRadius: "18px",
    fontSize: "15px",
    lineHeight: "1.4",
    wordBreak: "break-word",
  },
  myBubble: {
    backgroundColor: "#ff3b30",
    color: "#fff",
    borderBottomRightRadius: "5px",
  },
  otherBubble: {
    backgroundColor: "#fff",
    color: "#222",
    border: "1px solid #eee",
    borderBottomLeftRadius: "5px",
  },
  imageBubble: {
    padding: "4px",
    backgroundColor: "transparent",
    border: "none",
  },
  chatImage: {
    maxWidth: "220px",
    maxHeight: "260px",
    borderRadius: "14px",
    objectFit: "cover",
    display: "block",
  },
  metaLeft: {
    fontSize: "10px",
    color: "#999",
    textAlign: "right",
    marginBottom: "3px",
    lineHeight: "1.3",
  },
  metaRight: {
    fontSize: "10px",
    color: "#999",
    marginBottom: "3px",
  },
  systemMessage: {
    maxWidth: "80%",
    margin: "12px auto",
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#e5e5ea",
    color: "#555",
    textAlign: "center",
    fontSize: "13px",
  },
  inputForm: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderTop: "1px solid #eee",
    backgroundColor: "#fff",
    position: "fixed",
    left: "50%",
    bottom: "0",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "720px",
    boxSizing: "border-box",
    zIndex: 3000,
  },
  input: {
    flex: 1,
    height: "44px",
    border: "1px solid #ddd",
    borderRadius: "22px",
    padding: "0 16px",
    fontSize: "15px",
    outline: "none",
  },
  sendButton: {
    width: "68px",
    height: "44px",
    border: "none",
    borderRadius: "22px",
    backgroundColor: "#ff3b30",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
};