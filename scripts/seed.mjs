/**
 * Seed script — adds realistic fake drivers to Firestore.
 * Usage: node scripts/seed.mjs <email> <password>
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAric8e5Bzm8Hv0Ba96Ioz272XR11THR-I",
  authDomain: "student-rides-bb77e.firebaseapp.com",
  projectId: "student-rides-bb77e",
  storageBucket: "student-rides-bb77e.firebasestorage.app",
  messagingSenderId: "856900955842",
  appId: "1:856900955842:web:c1ff508d982cf0b297155b",
};

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node scripts/seed.mjs <email> <password>');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Signing in...');
await signInWithEmailAndPassword(auth, email, password);
console.log('Signed in successfully.\n');

const drivers = [
  {
    name: "Aryan Sharma",
    service: "Campus Rides",
    phone: "+23057234891",
    availability: "Free",
    ratings: [5, 4, 5, 5, 4],
    ownerEmail: email,
    priceList: [
      { location: "Rose Hill", price: "150" },
      { location: "Quatre Bornes", price: "200" },
      { location: "Curepipe", price: "250" },
      { location: "Port Louis", price: "350" },
    ],
  },
  {
    name: "Priya Nair",
    service: "Campus Rides",
    phone: "+23058412367",
    availability: "Free",
    ratings: [4, 5, 4, 4],
    ownerEmail: email,
    priceList: [
      { location: "Beau Bassin", price: "120" },
      { location: "Phoenix", price: "180" },
      { location: "Vacoas", price: "200" },
    ],
  },
  {
    name: "Karan Mehta",
    service: "Campus Rides",
    phone: "+23059823145",
    availability: "Busy",
    ratings: [3, 4, 4, 5],
    ownerEmail: email,
    priceList: [
      { location: "Floreal", price: "100" },
      { location: "Curepipe", price: "200" },
      { location: "Tamarin", price: "450" },
    ],
  },
  {
    name: "Lena Dupont",
    service: "Airport Transfers",
    phone: "+23057991234",
    availability: "Free",
    ratings: [5, 5, 5, 4, 5],
    ownerEmail: email,
    priceList: [
      { location: "SSR Airport", price: "800" },
      { location: "Port Louis", price: "400" },
    ],
  },
  {
    name: "Dev Ramchurn",
    service: "Airport Transfers",
    phone: "+23058321988",
    availability: "Free",
    ratings: [4, 4, 5],
    ownerEmail: email,
    priceList: [
      { location: "SSR Airport (one-way)", price: "700" },
      { location: "SSR Airport (return)", price: "1300" },
    ],
  },
  {
    name: "Tia Boodhoo",
    service: "Late Night Rides",
    phone: "+23059441267",
    availability: "Free",
    ratings: [5, 5, 4, 5],
    ownerEmail: email,
    priceList: [
      { location: "Rose Hill", price: "250" },
      { location: "Port Louis", price: "400" },
      { location: "Mahebourg", price: "550" },
    ],
  },
  {
    name: "Rahul Gobin",
    service: "Late Night Rides",
    phone: "+23057102934",
    availability: "Busy",
    ratings: [4, 3, 4],
    ownerEmail: email,
    priceList: [
      { location: "Curepipe", price: "300" },
      { location: "Quatre Bornes", price: "275" },
    ],
  },
  {
    name: "Meera Patel",
    service: "Campus Rides",
    phone: "+23058763412",
    availability: "Free",
    ratings: [5, 4, 5],
    ownerEmail: email,
    priceList: [
      { location: "Réduit", price: "80" },
      { location: "Moka", price: "130" },
      { location: "Rose Hill", price: "160" },
    ],
  },
];

console.log(`Adding ${drivers.length} drivers...`);
for (const driver of drivers) {
  const ref = await addDoc(collection(db, 'drivers'), driver);
  console.log(`  ✓ ${driver.name} (${driver.service}) — ${ref.id}`);
}

// Approve any pending services
console.log('\nChecking for pending services to approve...');
const pendingSnap = await getDocs(collection(db, 'pendingServices'));
let approved = 0;
for (const pendingDoc of pendingSnap.docs) {
  const data = pendingDoc.data();
  if (data.status === 'pending' && data.drivers) {
    for (const driver of data.drivers) {
      await addDoc(collection(db, 'drivers'), {
        name: driver.name,
        service: data.service,
        phone: driver.phone,
        availability: 'Free',
        ratings: [],
        ownerEmail: data.ownerEmail,
        priceList: driver.priceList || [],
      });
      approved++;
    }
    await updateDoc(doc(db, 'pendingServices', pendingDoc.id), { status: 'approved' });
    console.log(`  ✓ Approved: ${data.service} (${data.drivers.length} driver${data.drivers.length > 1 ? 's' : ''})`);
  }
}

if (approved === 0) console.log('  No pending services found.');
console.log(`\nDone! Added ${drivers.length} seed drivers, approved ${approved} pending.`);
process.exit(0);
