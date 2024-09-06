import axios from "axios";

// Kredensial autentikasi untuk perangkat Hikvision
const hikvisionAuth = {
  username: "ops",
  password: "adm12345",
};

// URL dasar untuk perangkat Hikvision (ganti dengan DDNS publik Anda)
const hikvisionBaseUrl = "http://nvrshlv.ddns.net:8000";

// Fungsi untuk melakukan request ke API Hikvision
export const makeHikvisionRequest = async (
  url,
  method = "GET",
  data = null,
  responseType = "json" // responseType diatur secara dinamis
) => {
  const auth = Buffer.from(
    `${hikvisionAuth.username}:${hikvisionAuth.password}`
  ).toString("base64");

  const config = {
    method: method,
    url: `${hikvisionBaseUrl}${url}`,
    headers: {
      Authorization: `Basic ${auth}`,
    },
    responseType: responseType, // responseType bisa diatur menjadi 'stream' atau 'arraybuffer'
    data: data,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("Terjadi kesalahan saat menghubungi API Hikvision:", error);
    return null;
  }
};
