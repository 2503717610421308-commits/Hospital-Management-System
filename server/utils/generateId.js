const generateId = (prefix, count) => {
  return `${prefix}-${String(count).padStart(5, '0')}`;
};

module.exports = { generateId };
