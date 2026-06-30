import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase";

function Signup() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  async function handleSignup(e) {
    e.preventDefault();

    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        "비밀번호는 8자 이상이며\n대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다."
      );
      return;
    }

    if (password !== passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);

      // 닉네임 중복 확인
// const nicknameQuery = query(
//   collection(db, "users"),
//   where("nickname", "==", nickname.trim())
// );

// const nicknameSnap = await getDocs(nicknameQuery);

// if (!nicknameSnap.empty) {
//   alert("이미 사용 중인 닉네임입니다.");
//   return;
// }

      // 회원가입
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // displayName 저장
      await updateProfile(credential.user, {
        displayName: nickname.trim(),
      });

      // Firestore 저장
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        nickname: nickname.trim(),
        email: credential.user.email,
        photo: "",
        intro: "매콤하지만 안전한 거래를 좋아합니다 🌶️",
        location: "서울 강남구",
        scoville: 1000,
        deals: 0,
        reviews: 0,
        createdAt: serverTimestamp(),
      });

      alert("회원가입이 완료되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("========== FIREBASE ERROR ==========");
      console.error(error);
      console.error("code :", error.code);
      console.error("message :", error.message);
      console.error("customData :", error.customData);
      console.error("===================================");

      alert(
        `code : ${error.code}\n\nmessage : ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="authBox">
        <h1>🌶 회원가입</h1>

        <p
          className="sub"
          style={{
            marginTop: "8px",
            marginBottom: "20px",
          }}
        >
          고추마켓 계정을 만들어보세요.
        </p>

        <form onSubmit={handleSignup}>
          <input
            className="search"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <input
            className="search"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="search"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p
            className="sub"
            style={{
              marginTop: "-8px",
              marginBottom: "12px",
            }}
          >
            8자 이상, 대문자·소문자·숫자·특수문자를 각각 1개 이상 포함해야 합니다.
          </p>

          <input
            className="search"
            type="password"
            placeholder="비밀번호 확인"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
          />

          <button
            className="primaryBtn"
            type="submit"
            disabled={loading}
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <button
          className="ghostBtn"
          onClick={() => navigate("/login")}
        >
          이미 계정이 있나요? 로그인
        </button>
      </div>
    </div>
  );
}

export default Signup;