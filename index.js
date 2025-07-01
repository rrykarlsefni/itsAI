const fetch = require("node-fetch");
const AbortController = require("abort-controller");

async function fetchWithTimeout(url, options = {}, timeout = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  options.signal = controller.signal;
  try {
    const res = await fetch(url, options);
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function isErrorReply(reply = "") {
  return !reply ||
    [
      "Maaf, terjadi kesalahan saat memproses permintaan Anda.",
      "Terjadi kesalahan",
      "Silakan coba lagi nanti"
    ].some(msg => reply.toLowerCase().includes(msg.toLowerCase())) ||
    /error|kesalahan|gagal|tidak.*memproses|silakan.*coba.*lagi/i.test(reply);
}

module.exports = async function itsAI(text, options = {}) {
  const {
    userId = "anon",
    prompt = "kamu jago roasting, suka sarkas dan satir, kamu paling ga suka sama orang toxic/berkata kasar..."
  } = options;

  try {
    const res = await fetchWithTimeout("https://luminai.my.id/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      body: JSON.stringify({ content: text, user: userId, prompt })
    }, 7000);

    if (res.ok) {
      const data = await res.json();
      const reply = data.result || data.message;
      if (!isErrorReply(reply)) return reply;
    }
  } catch (e) {}

  try {
    const res = await fetchWithTimeout(
      `https://text.pollinations.ai/${encodeURIComponent(text)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      },
      5000
    );

    if (res.ok) {
      const reply = await res.text();
      if (!isErrorReply(reply)) return reply;
    }
  } catch (e) {}

  try {
    const input = `[SISTEM]: ${prompt}\n[USER]: ${text}`;
    const res = await fetchWithTimeout(
      `https://www.kazeai.site/api/v1?text=${encodeURIComponent(input)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      },
      7000
    );

    if (res.ok) {
      const data = await res.json();
      const reply = data.response;
      if (!isErrorReply(reply)) return reply;
    }
  } catch (e) {}

  return "gagal respon jink";
};
