async function test() {
  const url = 'https://ai-startup-builders-saas-1.onrender.com/api/auth/verify-otp';
  console.log('Testing URL:', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'renugopal067@gmail.com',
        fullName: 'Mano Test Investor',
        password: 'Password123!',
        role: 'investor',
        otp: '123456' // using bypass code
      })
    });
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

test();
