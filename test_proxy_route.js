const fetch = global.fetch || require('node-fetch');
require('dotenv').config({path: '.env.local'});
fetch('http://localhost:3000/api/supabase-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/groups?select=*',
    options: {
      method: 'GET',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }
  })
}).then(async r => {
  console.log('Status:', r.status);
  console.log('Headers:', r.headers.raw());
  console.log('Body:', await r.text());
}).catch(console.error);
