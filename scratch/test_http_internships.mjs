import http from 'http';

http.get('http://localhost:3000/internships', (res) => {
  console.log('Status code:', res.statusCode);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Internships page response length:', data.length);
    console.log('Includes Ethio Telecom:', data.includes('Ethio Telecom'));
    console.log('Includes Chapa:', data.includes('Chapa'));
    console.log('Includes Software Engineering:', data.includes('Software Engineering'));
  });
}).on('error', (e) => {
  console.error('Request error:', e);
});
