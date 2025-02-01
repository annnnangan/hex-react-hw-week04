/* eslint-disable react/prop-types */
import { Modal } from "bootstrap";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BASE_URL, API_PATH } from "../constants";

const ProductModal = ({
  modalMode,
  selectedProduct,
  isOpenProductModal,
  setOpenProductModal,
  setSelectedProduct,
  getProducts,
}) => {
  const [isUpdatingProduct, setUpdatingProduct] = useState(false); //判斷是否正在更新/刪除product，用於modal 上的確認/刪除按鈕
  const modalRef = useRef(null);
  const productModalRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    modalRef.current = new Modal(productModalRef.current);
  }, []);

  //Handle modal open
  useEffect(() => {
    if (isOpenProductModal) {
      modalRef.current.show();
    }
  }, [isOpenProductModal]);

  //Handle modal close
  const handleCloseProductModal = () => {
    modalRef.current.hide();
    setOpenProductModal(false);
    //when product modal is closed, remove preview image and file
    setPreviewImage(null);
    uploadImageRef.current.value = "";
  };

  const handleModalInputChange = (e) => {
    const { value, name, checked, type } = e.target;

    setSelectedProduct({
      ...selectedProduct,
      [name]: type === "checkbox" ? checked : value,
    });
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
      handleCloseProductModal();
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
      handleCloseProductModal();
      alert("成功修改產品");
    } catch (error) {
      console.dir(error);
      alert("修改產品失敗");
    }
    setUpdatingProduct(false);
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

  return (
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
  );
};

export default ProductModal;
