// Test API endpoints
async function testAPI() {
  try {
    console.log('Testing Skills API...');
    const skillsResponse = await fetch('http://localhost:3000/api/admin/system-categories/skills', {
      headers: {
        Authorization: 'Bearer test-token', // You'll need a real token
        'Content-Type': 'application/json',
      },
    });

    console.log('Skills Response Status:', skillsResponse.status);
    const skillsData = await skillsResponse.json();
    console.log('Skills Data:', skillsData);

    console.log('\nTesting Categories API...');
    const categoriesResponse = await fetch(
      'http://localhost:3000/api/admin/system-categories/categories',
      {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Categories Response Status:', categoriesResponse.status);
    const categoriesData = await categoriesResponse.json();
    console.log('Categories Data:', categoriesData);
  } catch (error) {
    console.error('API Test Error:', error);
  }
}

testAPI();
