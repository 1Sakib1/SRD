async function test() {
  const res = await fetch('https://qqxftmbuosckaqpmetcc.supabase.co/functions/v1/make-server-3e3b490b/auth/google-signup', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeGZ0bWJ1b3Nja2FxcG1ldGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTAwMzAsImV4cCI6MjA4NzY4NjAzMH0.LV2mhCzzTO1O4CA7wrUcRr7VURiKWbNalF-Hux5Dq08'
    },
    body: JSON.stringify({ email: 'testgoogle@test.com', name: 'Test Google', googleId: '123' })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
