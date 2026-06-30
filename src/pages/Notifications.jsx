import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function Notifications({ user, notifications = [] }) {
  async function readAll() {
    if (!user) return;

    try {
      const tasks = notifications
        .filter((notice) => notice.id && !notice.read)
        .map((notice) =>
          updateDoc(doc(db, "users", user.uid, "notifications", notice.id), {
            read: true,
          })
        );

      await Promise.all(tasks);
    } catch (error) {
      console.error("알림 읽음 처리 오류:", error);
      alert("알림 읽음 처리 중 오류가 발생했습니다.");
    }
  }

  async function deleteAll() {
    if (!user) return;
    if (!window.confirm("내 알림을 모두 삭제할까요?")) return;

    try {
      const tasks = notifications
        .filter((notice) => notice.id)
        .map((notice) =>
          deleteDoc(doc(db, "users", user.uid, "notifications", notice.id))
        );

      await Promise.all(tasks);
    } catch (error) {
      console.error("알림 삭제 오류:", error);
      alert("알림 삭제 중 오류가 발생했습니다.");
    }
  }

  if (!user) {
    return (
      <div className="container">
        <h2>🔔 알림</h2>

        <div className="profileBox" style={{ marginTop: "18px" }}>
          <h3>로그인이 필요합니다.</h3>
          <p className="sub" style={{ marginTop: "8px" }}>
            로그인 후 내 알림을 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topRow" style={{ marginBottom: "22px" }}>
        <h2>🔔 알림</h2>

        {notifications.length > 0 && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="ghostBtn" onClick={readAll}>
              모두 읽음
            </button>

            <button className="ghostBtn" onClick={deleteAll}>
              전체 삭제
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="profileBox" style={{ textAlign: "center" }}>
          <h3>알림이 없습니다.</h3>
          <p className="sub" style={{ marginTop: "8px" }}>
            찜, 거래, 후기 알림이 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        notifications.map((notice) => (
          <div
            key={notice.id}
            className={`notificationCard ${notice.read ? "" : "unread"}`}
          >
            <div className="notificationIcon">{notice.icon || "🔔"}</div>

            <div className="notificationInfo">
              <div className="topRow">
                <strong>{notice.title || "알림"}</strong>
                <span className="sub">{notice.time || "방금 전"}</span>
              </div>

              <p style={{ marginTop: "8px", lineHeight: "1.6" }}>
                {notice.message || ""}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;