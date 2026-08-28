require('dotenv').config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('No GEMINI_API_KEY set.');
    return;
  }
  console.log('Testing Gemini API key...');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models && data.models.length > 0) {
      console.log('✅ Gemini API Key is VALID!');
      console.log(`   Available models: ${data.models.length} (e.g. ${data.models[0].name})`);
    } else {
      console.log('❌ Gemini API Error:', data.error?.message || JSON.stringify(data));
    }
  } catch (err) {
    console.error('❌ Request error:', err.message);
  }
}

testGemini();
