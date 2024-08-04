'use client'
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { deleteDoc, getDoc, getDocs, query, setDoc, collection, doc } from "firebase/firestore";

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)

    const pantryList = []
    docs.forEach(doc => {
      pantryList.push(
       {
        name: doc.id,
        ...doc.data()
       }
      )
    });
    setPantry(pantryList)
  }

  const addItem = async () => {
    if (itemName.trim() === '') return;
    const docRef = doc(collection(firestore, 'pantry'), itemName);
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    setItemName('');
    await updatePantry()
  }

  const increaseItemQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    }
    await updatePantry()
  }

  const decreaseItemQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const { quantity } = docSnap.data()
      if(quantity === 1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updatePantry()
  }

  useEffect(() => { 
    if (typeof window !== "undefined") {
      updatePantry();
    }
  }, [])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  }

  const filteredPantry = pantry.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="animate-spin-slow w-16 h-16 bg-cover bg-center rounded-full" style={{ backgroundImage: `url('/logo.webp')` }}></div>
          <h1 className="text-5xl text-white font-bold" style={{ fontFamily: "'Tangerine', serif" }}>Good Food Great Mood</h1>
        </div>
      </div>

      <div className="mb-8">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item Name"
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={addItem}
          className=" p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Add Item
        </button>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search Items"
        className="w-full p-2 mb-4 border rounded"
      />

      <ul className="space-y-2">
        {filteredPantry.map((item) => (
          <li key={item.name} className="flex justify-between items-center p-4 bg-white rounded shadow">
            <div>
              <p className="text-lg font-semibold">{item.name}</p>
              <p className="text-gray-500">Quantity: {item.quantity}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => increaseItemQuantity(item.name)}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-700"
              >
                +
              </button>
              <button
                onClick={() => decreaseItemQuantity(item.name)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                -
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
