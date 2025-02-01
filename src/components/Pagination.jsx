import React from "react";

const Pagination = ({ pageInfo, handlePageChange }) => {
  return (
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
  );
};

export default Pagination;
