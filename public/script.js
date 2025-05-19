document.getElementById('notification-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const userId = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  try {
    const res = await fetch('/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type: 'email',
        message
      })
    });

    const data = await res.json();
    document.getElementById('response-msg').innerText = data.message || 'Sent!';
    console.log('Server response:', data);
  } catch (err) {
    console.error('Error:', err);
    document.getElementById('response-msg').innerText = 'Failed to send notification.';
  }
});
