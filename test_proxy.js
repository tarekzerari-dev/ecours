const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});

global.window = {};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    global: {
      fetch: (url, options) => {
        options.headers = {
          ...options.headers,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
        };
        return fetch(url, options);
      }
    }
  }
);

supabase.from('groups').select('*').then(res => {
  console.log(res.data ? res.data.length + ' groups found via hack!' : res.error);
});
