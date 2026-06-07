const cache =
  new Map();

// =========================
// SET CACHE
// =========================

const setCache =
  async (
    key,
    value,
    ttl = 300
  ) => {
    cache.set(key, {
      value,

      expires:
        Date.now() +
        ttl * 1000,
    });
  };

// =========================
// GET CACHE
// =========================

const getCache =
  async (key) => {
    const item =
      cache.get(key);

    if (!item) {
      return null;
    }

    if (
      Date.now() >
      item.expires
    ) {
      cache.delete(key);

      return null;
    }

    return item.value;
  };

// =========================
// DELETE CACHE
// =========================

const deleteCache =
  async (key) => {
    cache.delete(key);
  };

module.exports = {
  setCache,

  getCache,

  deleteCache,
};