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

module.exports = async function itsAI(text, options = {}) {
  const {
    userId = "anon",
    prompt = "kamu jago roasting, suka sarkas dan satir, kamu paling ga suka sama orang toxic/berkata kasar..."
  } = options;

  try {
    const res = await fetchWithTimeout("https://luminai.my.id/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, user: userId, prompt })
    }, 7000);

    if (!res.ok) throw new Error();

    const data = await res.json();
    const reply = data.result || data.message;
    const isError = !reply || /kesalahan|error|silakan coba/i.test(reply);
    if (!isError) return reply;
  } catch (e) {}

  try {
    const res = await fetchWithTimeout("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text }
        ]
      })
    }, 7000);

    if (!res.ok) throw new Error();

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply) return reply;
  } catch (e) {}

  try {
    const input = `[SISTEM]: ${prompt}\n[USER]: ${text}`;
    const res = await fetchWithTimeout(`https://www.kazeai.site/api/v1?text=${encodeURIComponent(input)}`, {}, 7000);

    if (!res.ok) throw new Error();

    const data = await res.json();
    const reply = data.response;
    if (reply) return reply;
  } catch (e) {}

  return "Maaf, AI tidak dapat merespon.";
};
