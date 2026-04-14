import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const formData = new FormData();

// 👉 put your audio file name here
formData.append("audio", fs.createReadStream("./test.wav"));

axios.post("http://localhost:5000/transcribe", formData, {
  headers: formData.getHeaders(),
})
.then(res => {
  console.log("✅ RESULT:", res.data);
})
.catch(err => {
  console.error("❌ ERROR:", err.response?.data || err.message);
});
