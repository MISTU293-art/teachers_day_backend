const { DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT } = require('../config/constants');

/**
 * Parses and sanitizes pagination parameters
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const rawLimit = parseInt(query.limit, 10) || DEFAULT_PAGINATION_LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), MAX_PAGINATION_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Builds standard pagination response metadata
 */
const buildPaginationData = (totalRecords, page, limit) => {
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalRecords,
    limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

module.exports = {
  getPagination,
  buildPaginationData
};
