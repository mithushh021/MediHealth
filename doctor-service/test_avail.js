async function test() {
  const id = '69c3e346e5fa55b7d69910bb'; // Dr. doca doca
  // First get current state
  const r1 = await fetch(`http://localhost:5000/doctors/${id}`, { cache: 'no-store' });
  const before = await r1.json();
  console.log('Before toggle - isAvailable:', before.isAvailable);
  
  // Toggle
  const r2 = await fetch(`http://localhost:5000/doctors/${id}/availability`, { method: 'PUT', cache: 'no-store' });  
  const after = await r2.json();
  console.log('After toggle - isAvailable:', after.isAvailable);
  
  // Fetch list and check filter
  const r3 = await fetch('http://localhost:5000/doctors', { cache: 'no-store' });
  const all = await r3.json();
  console.log('All doctors availability:', all.map(d => ({ name: d.firstName, isAvailable: d.isAvailable })));
}
test();
