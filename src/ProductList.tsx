import React, { useState } from "react";

const ProductList = ({ products, isFetchingProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState([]);

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between">
        <h2>產品列表</h2>
        <button type="button" className="btn btn-primary">
          建立新的產品
        </button>
      </div>

      {isFetchingProducts ? (
        <p className="h4 text-primary font-medium mt-5">
          產品列表正在加載中...
        </p>
      ) : (
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
                <td>{product.is_enabled}</td>
                <td>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductList;
