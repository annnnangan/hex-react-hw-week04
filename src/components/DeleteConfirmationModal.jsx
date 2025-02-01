/* eslint-disable react/prop-types */
import axios from "axios";
import { Modal } from "bootstrap";
import { useEffect, useRef, useState } from "react";
import { API_PATH, BASE_URL } from "../constants";

const DeleteConfirmationModal = ({
  selectedProduct,
  getProducts,
  isOpenModal,
  setIsOpenModal,
}) => {
  const [isUpdatingProduct, setUpdatingProduct] = useState(false); //判斷是否正在更新/刪除product，用於modal 上的確認/刪除按鈕

  const modalRef2 = useRef(null);
  const deleteProductModalRef = useRef(null);

  useEffect(() => {
    modalRef2.current = new Modal(deleteProductModalRef.current);
  }, []);

  useEffect(() => {
    if (isOpenModal) {
      modalRef2.current.show();
    }
  }, [isOpenModal]);

  //API: Delete existing product
  const deleteProduct = async () => {
    setUpdatingProduct(true);
    try {
      await axios.delete(
        `${BASE_URL}/api/${API_PATH}/admin/product/${selectedProduct.id}`
      );
      getProducts();
      handleCloseDeleteProductModal();
      alert("成功刪除產品");
    } catch {
      alert("刪除產品失敗");
    }
    setUpdatingProduct(false);
  };

  const handleCloseDeleteProductModal = () => {
    modalRef2.current.hide();
    setIsOpenModal(false);
  };

  return (
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
            <span className="text-danger fw-bold">{selectedProduct.title}</span>
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
  );
};

export default DeleteConfirmationModal;
