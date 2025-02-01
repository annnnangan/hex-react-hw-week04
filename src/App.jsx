import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""],
};

function App() {
  //登入欄位
  const [credential, setCredential] = useState({
    username: null,
    password: null,
  });

  const [isAuthorising, setAuthorizing] = useState(false); //判斷是否登入中，是的話會disable button，並顯示登入中的字眼
  const [isAuth, setAuth] = useState(false); //判斷是否已經登入，是的話會顯示product list，不是的話會顯示login form

  const [products, setProducts] = useState([]); //API 回傳的product list
  const [selectedProduct, setSelectedProduct] = useState(defaultModalState); //正在點選的product
  const [modalMode, setModalMode] = useState(null); //判斷是新增product還是修改product的modal
  const [isUpdatingProduct, setUpdatingProduct] = useState(false); //判斷是否正在更新/刪除product，用於modal 上的確認/刪除按鈕
  const [pageInfo, setPageInfo] = useState(""); //pagination
  const [previewImage, setPreviewImage] = useState(null);

  //API: Return all products
  const getProducts = async (page = 1) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/${API_PATH}/admin/products?page=${page}`
      );
      setProducts(res.data.products);
      setPageInfo(res.data.pagination);
    } catch (error) {
      console.dir(error);
      alert("取得產品失敗");
    }
  };

  //API: Add new product
  const createProduct = async () => {
    setUpdatingProduct(true);
    try {
      await axios.post(`${BASE_URL}/api/${API_PATH}/admin/product`, {
        data: {
          ...selectedProduct,
          origin_price: parseInt(selectedProduct.origin_price),
          price: parseInt(selectedProduct.price),
          is_enabled: selectedProduct.is_enabled ? 1 : 0,
        },
      });
      getProducts();
      modalRef.current.hide();
      alert("新增產品成功");
    } catch (error) {
      console.dir(error);
      alert("新增產品失敗");
    }
    setUpdatingProduct(false);
  };

  //API: Update existing product
  const updateProduct = async () => {
    setUpdatingProduct(true);
    try {
      await axios.put(
        `${BASE_URL}/api/${API_PATH}/admin/product/${selectedProduct.id}`,
        {
          data: {
            ...selectedProduct,
            origin_price: parseInt(selectedProduct.origin_price),
            price: parseInt(selectedProduct.price),
            is_enabled: selectedProduct.is_enabled ? 1 : 0,
          },
        }
      );
      getProducts();
      modalRef.current.hide();
      alert("成功修改產品");
    } catch (error) {
      console.dir(error);
      alert("修改產品失敗");
    }
    setUpdatingProduct(false);
  };

  //API: Delete existing product
  const deleteProduct = async () => {
    setUpdatingProduct(true);
    try {
      await axios.delete(
        `${BASE_URL}/api/${API_PATH}/admin/product/${selectedProduct.id}`
      );
      getProducts();
      modalRef2.current.hide();
      alert("成功刪除產品");
    } catch (error) {
      console.dir(error);
      alert("刪除產品失敗");
    }
    setUpdatingProduct(false);
  };

  //Handle User Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthorizing(true);

    try {
      const res = await axios.post(`${BASE_URL}/admin/signin`, credential);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
      axios.defaults.headers.common["Authorization"] = token;
      getProducts();
      setAuth(true);
    } catch (error) {
      console.dir(error);
      alert("登入失敗");
    }
    setAuthorizing(false);
  };

  const checkUserLogin = useCallback(async () => {
    try {
      await axios.post(`${BASE_URL}/api/user/check`);
      getProducts();
      setAuth(true);
    } catch (error) {
      console.dir(error);
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

  //Handle Modal
  const modalRef = useRef(null);
  const productModalRef = useRef(null);

  const modalRef2 = useRef(null);
  const deleteProductModalRef = useRef(null);

  useEffect(() => {
    modalRef.current = new Modal(productModalRef.current);
    modalRef2.current = new Modal(deleteProductModalRef.current);
  }, []);

  //Open and close product modal
  const handleOpenProductModal = (mode, product) => {
    setModalMode(mode);
    mode === "create"
      ? setSelectedProduct(defaultModalState)
      : setSelectedProduct(product);

    modalRef.current.show();
  };

  const handleCloseProductModal = () => {
    modalRef.current.hide();
    //when product modal is closed, remove preview image and file
    setPreviewImage(null);
    uploadImageRef.current.value = "";
  };

  //Open and close delete product modal
  const handleOpenDeleteProductModal = (product) => {
    setSelectedProduct(product);
    modalRef2.current.show();
  };

  const handleCloseDeleteProductModal = () => {
    modalRef2.current.hide();
  };

  //Handle input value change
  const handleModalInputChange = (e) => {
    const { value, name, checked, type } = e.target;

    setSelectedProduct({
      ...selectedProduct,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  //Handle image change
  const handleImageChange = (e, index) => {
    const { value } = e.target;

    //copy a new imagesUrl array
    const newImages = [...selectedProduct.imagesUrl];

    //replace with the new image
    newImages[index] = value;

    //update the selected product array
    setSelectedProduct({ ...selectedProduct, imagesUrl: newImages });
  };

  const handleAddImage = () => {
    //copy a new imagesUrl array
    const newImages = [...selectedProduct.imagesUrl, ""];

    //update the selected product array
    setSelectedProduct({ ...selectedProduct, imagesUrl: newImages });
  };

  const handleRemoveImage = () => {
    //copy a new imagesUrl array
    const newImages = [...selectedProduct.imagesUrl];

    //remove last image
    newImages.pop();

    //update the selected product array
    setSelectedProduct({ ...selectedProduct, imagesUrl: newImages });
  };

  const uploadImageRef = useRef(null);

  //show preview image
  const handleFileChange = (e) => {
    if (e.target.files) {
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleImageUpload = async () => {
    const formData = new FormData();

    formData.append("file-to-upload", uploadImageRef.current.files[0]);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/${API_PATH}/admin/upload`,
        formData
      );
      const uploadedImageUrl = res.data.imageUrl;

      setSelectedProduct({
        ...selectedProduct,
        imageUrl: uploadedImageUrl,
      });

      setPreviewImage(null);
      uploadImageRef.current.value = "";
      alert("圖片上傳成功");
    } catch {
      alert("圖片上傳失敗");
    }
  };

  //Pagination Logic
  const handlePageChange = (page) => {
    getProducts(page);
  };

  return (
    <>
      {isAuth ? (
        <div className="container my-5">
          <div className="d-flex justify-content-between">
            <h2>產品列表</h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenProductModal("create")}
            >
              建立新的產品
            </button>
          </div>

          <>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">產品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <th>{product.title}</th>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td>
                      <span
                        className={
                          product.is_enabled === 1
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {product.is_enabled === 1 ? "啟用" : "沒有啟用"}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            handleOpenProductModal("edit", product)
                          }
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleOpenDeleteProductModal(product)}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pageInfo.total_pages > 1 && (
              <nav aria-label="pagination">
                <ul className="pagination">
                  <li
                    className={`page-item ${!pageInfo.has_pre && "disabled"}`}
                    onClick={() => handlePageChange(pageInfo.current_page - 1)}
                  >
                    <p className="page-link" aria-label="Previous">
                      <span aria-hidden="true">&laquo;</span>
                    </p>
                  </li>

                  {Array.from({ length: pageInfo.total_pages }, (v, i) => (
                    <li
                      className={`page-item ${
                        pageInfo.current_page === i + 1 && "active"
                      }`}
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      <p className="page-link">{i + 1}</p>
                    </li>
                  ))}

                  <li
                    className={`page-item ${!pageInfo.has_next && "disabled"}`}
                    onClick={() => handlePageChange(pageInfo.current_page + 1)}
                  >
                    <p className="page-link" aria-label="Next">
                      <span aria-hidden="true">&raquo;</span>
                    </p>
                  </li>
                </ul>
              </nav>
            )}
          </>
        </div>
      ) : (
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
      )}

      {/* Product Modal */}
      <div
        id="productModal"
        className="modal"
        ref={productModalRef}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">
                {modalMode === "create" ? "新增產品" : "編輯產品"}{" "}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleCloseProductModal}
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="fileInput" className="form-label">
                      主圖
                    </label>

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="form-control"
                      id="fileInput"
                      onChange={handleFileChange}
                      ref={uploadImageRef}
                    />

                    {previewImage && (
                      <>
                        <img
                          src={previewImage}
                          alt="preview image"
                          className="img-fluid mt-2"
                        />

                        <button
                          className="btn btn-outline-primary mt-2"
                          type="button"
                          onClick={handleImageUpload}
                        >
                          確認圖片
                        </button>
                      </>
                    )}

                    {selectedProduct.imageUrl && (
                      <>
                        <input
                          value={selectedProduct.imageUrl}
                          onChange={handleModalInputChange}
                          name="imageUrl"
                          type="text"
                          id="primary-image"
                          className="form-control mt-2"
                          placeholder="請輸入圖片連結"
                        />

                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.title}
                          className="img-fluid"
                        />
                      </>
                    )}
                  </div>
                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {selectedProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          value={image}
                          onChange={(e) => handleImageChange(e, index)}
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}

                    <div className="btn-group w-100">
                      {selectedProduct.imagesUrl.length < 5 &&
                        selectedProduct.imagesUrl[
                          selectedProduct.imagesUrl.length - 1
                        ] !== "" && (
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={handleAddImage}
                          >
                            新增圖片
                          </button>
                        )}

                      {selectedProduct.imagesUrl.length > 1 && (
                        <button
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={handleRemoveImage}
                        >
                          取消圖片
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={selectedProduct.title}
                      onChange={handleModalInputChange}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={selectedProduct.category}
                      onChange={handleModalInputChange}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={selectedProduct.unit}
                      onChange={handleModalInputChange}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={selectedProduct.origin_price}
                        onChange={handleModalInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={selectedProduct.price}
                        onChange={handleModalInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={selectedProduct.description}
                      onChange={handleModalInputChange}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={selectedProduct.content}
                      onChange={handleModalInputChange}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={selectedProduct.is_enabled}
                      onChange={handleModalInputChange}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseProductModal}
                disabled={isUpdatingProduct}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={modalMode === "create" ? createProduct : updateProduct}
                disabled={isUpdatingProduct}
              >
                {isUpdatingProduct ? "資料處理中" : "確認"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        ref={deleteProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseDeleteProductModal}
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">
                {selectedProduct.title}
              </span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseDeleteProductModal}
                disabled={isUpdatingProduct}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={isUpdatingProduct}
                onClick={() => deleteProduct(selectedProduct.id)}
              >
                {isUpdatingProduct ? "產品刪除中" : "刪除"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
