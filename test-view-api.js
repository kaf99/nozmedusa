// Test script for view configuration API
// Run with: node test-view-api.js

const API_BASE = 'http://localhost:9000/admin';
const AUTH_TOKEN = process.env.MEDUSA_API_KEY || 'your-auth-token'; // Replace with actual token

async function testViewConfigurationAPI() {
  console.log('=== Testing View Configuration API ===\n');
  console.log('API Base:', API_BASE);
  console.log('Auth Token:', AUTH_TOKEN ? '***' + AUTH_TOKEN.slice(-4) : 'NOT SET');
  console.log('');

  // Test 1: Set active view to null
  console.log('1. Setting active view to null...');
  console.log('   POST /view-configurations/active');
  console.log('   Body: { entity: "orders", view_configuration_id: null }');
  try {
    const response = await fetch(`${API_BASE}/view-configurations/active`, {
      method: 'POST',
      headers: {
        'x-medusa-access-token': AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entity: 'orders',
        view_configuration_id: null
      })
    });
    
    const responseText = await response.text();
    console.log('   Status:', response.status);
    console.log('   Response:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('   Parsed:', JSON.stringify(data, null, 2));
    }
    console.log('');
  } catch (error) {
    console.error('   Error:', error.message);
    console.log('');
  }

  // Small delay to ensure the change is persisted
  await new Promise(resolve => setTimeout(resolve, 200));

  // Test 2: Get active view immediately after
  console.log('2. Getting active view configuration...');
  console.log('   GET /view-configurations/active?entity=order');
  try {
    const response = await fetch(`${API_BASE}/view-configurations/active?entity=order`, {
      headers: {
        'x-medusa-access-token': AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    console.log('   Status:', response.status);
    console.log('   Response:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('   Parsed:', JSON.stringify(data, null, 2));
      
      // Verify the result
      console.log('\n3. Verification:');
      if (data.view_key === null) {
        console.log('   ✓ SUCCESS: Active view is null as expected');
      } else {
        console.log(`   ✗ FAILURE: Active view is '${data.view_key}' instead of null`);
        console.log('   Full data:', JSON.stringify(data, null, 2));
      }
    }
    console.log('');
  } catch (error) {
    console.error('   Error:', error.message);
    console.log('');
  }

  // Test 3: Get all views for the entity
  console.log('4. Getting all views for entity "order"...');
  console.log('   GET /views/order');
  try {
    const response = await fetch(`${API_BASE}/views/order`, {
      headers: {
        'x-medusa-access-token': AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   Status:', response.status);
      console.log('   Views found:', data.views?.length || 0);
      if (data.views && data.views.length > 0) {
        console.log('   View keys:', data.views.map(v => v.key).join(', '));
      }
    } else {
      console.log('   Status:', response.status);
      console.log('   Failed to fetch views');
    }
  } catch (error) {
    console.error('   Error:', error.message);
  }

  console.log('\n=== Test Complete ===');
}

// Run the test
testViewConfigurationAPI().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});