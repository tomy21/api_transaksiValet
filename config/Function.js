// userCodeGenerator.js
const generateRandomLetters = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomIndex1 = Math.floor(Math.random() * alphabet.length);
  const randomIndex2 = Math.floor(Math.random() * alphabet.length);
  return alphabet[randomIndex1] + alphabet[randomIndex2];
};

const formatDate = (date) => {
  const year = date.getFullYear().toString().slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return year + month + day;
};

const generateUserCode = async (lastId) => {
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  const randomLetters = generateRandomLetters();
  const userCode = `USR${formattedDate}${randomLetters}${(lastId + 1)
    .toString()
    .padStart(5, "0")}`;
  return userCode;
};

export default generateUserCode;
