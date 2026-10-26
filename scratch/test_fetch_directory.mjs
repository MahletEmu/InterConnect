import http from 'http';

http.get('http://localhost:3000/companies', (res) => {
  console.log('Status code:', res.statusCode);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Page response length:', data.length);
    console.log('Has verified text:', data.includes('Verified Ethiopian Employers Directory'));
  });
}).on('error', (e) => {
  console.error('Request error:', e);
});
