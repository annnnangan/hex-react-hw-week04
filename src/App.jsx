import { useState, useCallback, useEffect } from "react";
import LoginPage from "./page/LoginPage";
import ProductPage from "./page/ProductPage";
import { BASE_URL } from "./constants";
import axios from "axios";

function App() {
  const [isAuth, setAuth] = useState(false); //判斷是否已經登入，是的話會顯示product list，不是的話會顯示login form

  const checkUserLogin = useCallback(async () => {
    try {
      await axios.post(`${BASE_URL}/api/user/check`);
      setAuth(true);
    } catch {
      alert("請先登入，才可以操作。");
    }
  }, []);

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    axios.defaults.headers.common["Authorization"] = token;

    checkUserLogin();
  }, [checkUserLogin]);

  return <>{isAuth ? <ProductPage /> : <LoginPage setAuth={setAuth} />}</>;
}

export default App;
