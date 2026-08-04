const tests = async () => {
  // Login
  const loginRes = await fetch('http://localhost:5000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  console.log('Login:', loginRes.status, await loginRes.json());

  // Order
  const orderBody = {
    customer_name: 'Test User',
    customer_email: 'test@test.com',
    customer_phone: '01234567890',
    customer_address: 'استلام من المحل',
    shipping_method: 'استلام من المحل',
    items: JSON.stringify([{
      id: '6a6f37ac66848bcb4a0f2498',
      name: 'test product',
      price: 1500,
      quantity: 1
    }])
  };

  try {
    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderBody)
    });
    const orderData = await orderRes.json();
    console.log('Order:', orderRes.status, orderData);
  } catch (err) {
    console.error('Order failed:', err.message);
  }
};

tests();
