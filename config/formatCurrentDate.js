function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  let month = (today.getMonth() + 1).toString().padStart(2, "0"); // Tambahkan 0 di depan jika bulan hanya satu digit
  let day = today.getDate().toString().padStart(2, "0"); // Tambahkan 0 di depan jika tanggal hanya satu digit
  return `${year}${month}${day}`;
}

const currentdate = getCurrentDate();

module.exports = currentdate;
