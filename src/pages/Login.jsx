import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, provider, db } from "../firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailLogin(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("로그인 완료!");
      navigate("/");
    } catch (error) {
      console.log(error);
      alert("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  }

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          nickname: user.displayName || "고추유저",
          email: user.email,
          photo: user.photoURL || "",
          intro: "매콤하지만 안전한 거래를 좋아합니다 🌶️",
          location: "지역 미설정",
          scoville: 1000,
          deals: 0,
          reviews: 0,
          createdAt: new Date().toISOString(),
        });
      }

      alert("Google 로그인 완료!");
      navigate("/");
    } catch (error) {
      console.log(error);
      alert("Google 로그인 실패");
    }
  }

  return (
    <div className="container">
      <div className="authBox">
        <h1>🌶️ 로그인</h1>
        <p className="sub">고추마켓에 다시 오신 걸 환영해요.</p>

        <form onSubmit={handleEmailLogin}>
          <input
            className="search"
            placeholder="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="search"
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="primaryBtn">로그인</button>
        </form>

        <button
          className="sellBtn"
          style={{ background: "#1c1c1e" }}
          onClick={handleGoogleLogin}
        >
          Google로 로그인
        </button>

        <button className="ghostBtn" onClick={() => navigate("/signup")}>
          계정이 없나요? 회원가입
        </button>
      </div>
    </div>
  );
}

export default Login;