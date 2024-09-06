import { makeHikvisionRequest } from "../../config/HikvisioConfig.js";
import { spawn } from "child_process";

// Controller untuk menangkap gambar (capture)
export const captureImage = async (req, res) => {
  const channelId = req.query.channelId || 101;
  const captureUrl = `/ISAPI/Streaming/channels/${channelId}/picture`; // Endpoint capture untuk channel 101
  const hasil = await makeHikvisionRequest(
    captureUrl,
    "GET",
    null,
    "arraybuffer"
  );

  if (hasil) {
    res.setHeader("Content-Type", "image/jpeg"); // Pastikan mengirim tipe gambar
    res.send(Buffer.from(hasil, "binary")); // Mengirim data sebagai binary
  } else {
    res.status(500).send("Gagal menangkap gambar");
  }
};

// Controller untuk memulai streaming video
export const streamVideo = async (req, res) => {
  const rtspUrl =
    "rtsp://ops:adm12345@nvrshlv.ddns.net:554/Streaming/Channels/501";

  // Atur header respons untuk video
  res.setHeader("Content-Type", "video/mp4");

  // Gunakan FFmpeg untuk mengonversi RTSP ke MP4
  const ffmpeg = spawn("ffmpeg", [
    "-i",
    rtspUrl, // Input RTSP stream
    "-f",
    "mp4", // Format output (MP4)
    "-movflags",
    "frag_keyframe+empty_moov", // Streaming secara langsung
    "-vf",
    "scale=1280:720", // Menyesuaikan resolusi (opsional)
    "-vcodec",
    "libx264", // Video codec (H264)
    "-preset",
    "ultrafast", // Kecepatan konversi
    "-tune",
    "zerolatency", // Mengurangi latensi
    "-f",
    "mp4", // Output format
    "pipe:1", // Output melalui pipe ke response HTTP
  ]);

  // Streaming data dari FFmpeg ke client
  ffmpeg.stdout.pipe(res);

  // Tangani error FFmpeg
  ffmpeg.stderr.on("data", (data) => {
    console.error(`FFmpeg error: ${data}`);
  });

  // Jika proses FFmpeg selesai, tutup respons
  ffmpeg.on("close", (code) => {
    if (code !== 0) {
      res.status(500).send("Gagal memulai streaming");
    }
  });
};
