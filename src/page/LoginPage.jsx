import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../constants";

const LoginPage = ({ setAuth }) => {
  //登入欄位
  const [credential, setCredential] = useState({
    username: null,
    password: null,
  });

  const [isAuthorising, setAuthorizing] = useState(false); //判斷是否登入中，是的話會disable button，並顯示登入中的字眼

  //Handle User Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthorizing(true);
    try {
      const res = await axios.post(`${BASE_URL}/admin/signin`, credential);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
      axios.defaults.headers.common["Authorization"] = token;
      setAuth(true);
    } catch {
      alert("登入失敗");
    }
    setAuthorizing(false);
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="mb-5">請先登入</h1>
      <form className="d-flex flex-column gap-3" onSubmit={handleLogin}>
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="username"
            placeholder="name@example.com"
            onChange={(e) =>
              setCredential({ ...credential, username: e.target.value })
            }
          />
          <label htmlFor="username">Email address</label>
        </div>
        <div className="form-floating">
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Password"
            onChange={(e) =>
              setCredential({ ...credential, password: e.target.value })
            }
          />
          <label htmlFor="password">Password</label>
        </div>
        <button className="btn btn-primary" disabled={isAuthorising}>
          {isAuthorising ? "驗證中..." : "登入"}
        </button>
      </form>
      <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
    </div>
  );
};

export default LoginPage;
