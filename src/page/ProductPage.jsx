import axios from "axios";
import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import ProductModal from "../components/ProductModal";
import { API_PATH, BASE_URL } from "../constants";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

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

const ProductPage = () => {
  const [products, setProducts] = useState([]); //API 回傳的product list
  const [selectedProduct, setSelectedProduct] = useState(defaultModalState); //正在點選的product
  const [pageInfo, setPageInfo] = useState(""); //pagination
  const [isOpenProductModal, setOpenProductModal] = useState(false);
  const [isOpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState(null);

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

  //Call when 編輯 button is clicked
  const handleOpenProductEditModal = (product) => {
    setOpenProductModal(true);
    setSelectedProduct(product);
    setModalMode("edit");
  };

  //Call when 建立新的產品 button is clicked
  const handleOpenProductCreateModal = () => {
    setOpenProductModal(true);
    setSelectedProduct(defaultModalState);
    setModalMode("create");
  };

  //Call when pagination is being clicked
  const handlePageChange = (page) => {
    getProducts(page);
  };

  const handleOpenDeleteModal = (product) => {
    setOpenDeleteModal(true);
    setSelectedProduct(product);
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      <div className="container my-5">
        <div className="d-flex justify-content-between">
          <h2>產品列表</h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenProductCreateModal}
          >
            建立新的產品
          </button>
        </div>

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
                      product.is_enabled === 1 ? "text-success" : "text-danger"
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
                      onClick={() => handleOpenProductEditModal(product)}
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleOpenDeleteModal(product)}
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
          <Pagination pageInfo={pageInfo} handlePageChange={handlePageChange} />
        )}
      </div>

      <ProductModal
        modalMode={modalMode}
        selectedProduct={selectedProduct}
        isOpenProductModal={isOpenProductModal}
        setOpenProductModal={setOpenProductModal}
        setSelectedProduct={setSelectedProduct}
        getProducts={getProducts}
      />

      <DeleteConfirmationModal
        selectedProduct={selectedProduct}
        getProducts={getProducts}
        isOpenModal={isOpenDeleteModal}
        setIsOpenModal={setOpenDeleteModal}
      />
    </>
  );
};

export default ProductPage;
