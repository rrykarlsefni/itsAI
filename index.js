const fetch = require("node-fetch");

module.exports = async function itsAI(text, options = {}) {
  const {
    userId = "anon",
    prompt = "kamu jago roasting, suka sarkas dan satir,kamu palimg ga suka sama orang toxic/berkata kasar, klo ada org toxic, sarkasin aja sampe kena mental, karna itu akibat dia berkata kasar, pake gaya gen Z, tidak memakai emoji alay, emoji psatir biasanya ini 😹, 😥, 🤭, 🥴, jangan kasi ampun"
  } = options;

  try {
    const res = await fetch("https://luminai.my.id/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, user: userId, prompt })
    });
    const data = await res.json();
    const reply = data.result || data.message;
    if (reply) return reply;
  } catch (e) {}

  try {
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text }
        ]
      })
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply) return reply;
  } catch (e) {}

  try {
    const input = `[SISTEM]: ${prompt}\n[USER]: ${text}`;
    const res = await fetch(`https://www.kazeai.site/api/v1?text=${encodeURIComponent(input)}`);
    const data = await res.json();
    const reply = data.response;
    if (reply) return reply;
  } catch (e) {}

  return "Maaf, AI tidak bisa menjawab saat ini.";
};
