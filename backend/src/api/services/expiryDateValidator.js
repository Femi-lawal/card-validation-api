const validateExpiryDate = (expiryDate) => {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiryDate)) return false;

  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const now = new Date();

  return expiry > now;
};

module.exports = { validateExpiryDate };
