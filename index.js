const fetch = require("node-fetch");
const AbortController = require("abort-controller");

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
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
  if (!reply) return true;

  const genericErrors = [
    "Maaf, terjadi kesalahan saat memproses permintaan Anda.",
    "Terjadi kesalahan",
    "Silakan coba lagi nanti"
  ];
  if (genericErrors.some(msg => reply.trim().toLowerCase() === msg.toLowerCase())) return true;
  return false;
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
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data.result || data.message;
      if (!isErrorReply(reply)) return reply;
    }
  } catch {}

  try {
    const res = await fetchWithTimeout(`https://text.pollinations.ai/${encodeURIComponent(text)}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (res.ok) {
      const reply = await res.text();
      if (!isErrorReply(reply)) return reply;
    }
  } catch {}

  try {
    const input = `[SISTEM]: ${prompt}\n[USER]: ${text}`;
    const res = await fetchWithTimeout(`https://www.kazeai.site/api/v1?text=${encodeURIComponent(input)}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (res.ok) {
      const data = await res.json();
      if (!isErrorReply(data.response)) return data.response;
    }
  } catch {}

  try {
    const res = await fetchWithTimeout(`https://apizell.web.id/ai/gemini20flash?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.status && !isErrorReply(data.result)) return data.result;
    }
  } catch {}
  
  try {
    const res = await fetchWithTimeout(`https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}&content=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.status && !isErrorReply(data.data)) return data.data;
    }
  } catch {}

  try {
    const res = await fetchWithTimeout(`https://apizell.web.id/ai/blackbox?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.status === "success" && !isErrorReply(data.result)) return data.result;
    }
  } catch {}

  try {
    const res = await fetchWithTimeout(`https://www.abella.icu/gpt-3.5?q=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.status === "success" && !isErrorReply(data?.data?.answer)) return data.data.answer;
    }
  } catch {}

  try {
    const res = await fetchWithTimeout(`https://flowfalcon.dpdns.org/ai/openai?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.status === true && !isErrorReply(data.result)) return data.result;
    }
  } catch {}

  return "gagal respon jink.";
};
