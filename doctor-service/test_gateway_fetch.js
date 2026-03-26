async function test() {
  const url = `http://localhost:5000/doctors`;
  console.log(`Fetching from ${url}...`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Total Doctors:', data.length);
    console.log('Statuses:', data.map(d => ({id: d._id, email: d.email, approved: d.isApproved})));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
