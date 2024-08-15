'use client';
import { useState, useEffect, useRef } from "react";
import { firestore, storage } from "@/firebase";
import { deleteDoc, getDoc, getDocs, query, setDoc, collection, doc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Webcam from "react-webcam";
import { openaireq } from "./openai";
import { capturePhoto } from "./capturephoto";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAtzQKHTK91jKDbLgv6Psilgn7shhzQHIU");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [itemName, setItemName] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [webcam, setWebcam] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const webcamRef = useRef(null);

  const toggleWebcam = () => {
    setWebcam(!webcam);
  };


  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);

    const pantryList = [];
    docs.forEach(doc => {
      pantryList.push({
        name: doc.id,
        ...doc.data()
      });
    });
    setPantry(pantryList);
  };

  const addItem = async () => {
    if (itemName.trim() === '') return;
    const docRef = doc(collection(firestore, 'pantry'), itemName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    setItemName('');
    await updatePantry();
  };

  const increaseItemQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    }
    await updatePantry();
  };

  const decreaseItemQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updatePantry();
  };

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const res = await openaireq('');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        console.log('OpenAI response:', data);
      } catch (error) {
        console.error('Error fetching OpenAI response:', error);
      }
    };
  
    fetchResponse();
  }, []);

  const handleCapture = async () => {
    if (!webcamRef.current) {
      console.error("Webcam is not initialized");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    const storageRef = ref(storage, `images/${Date.now()}.png`);
    
    try {
      await uploadString(storageRef, imageSrc, "data_url");
      const imageUrl = await getDownloadURL(storageRef);
      console.log(imageUrl)
      const text= "give me the name of the product shown in the image in one word"

      const result = await model.generateContent([text, webcamRef.current.getScreenshot()]
      );
      const textResponse = await result.response.text();
      setMessage(`AI Response: ${textResponse}`);
      if (textResponse.trim() === '') return;
    const docRef = doc(collection(firestore, 'pantry'), textResponse);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    setItemName('');
    await updatePantry();
      setWebcam(false);
    } catch (error) {
      console.error("Error processing image:", error);
      setMessage('Failed to process image');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Add Item
        </button>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={toggleWebcam}
          className="mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
        >
          <FontAwesomeIcon icon={faCamera} />
          <span>{webcam ? 'Hide Webcam' : 'Capture your photos!'}</span>
        </button>

        {webcam && (
          <div className="relative w-80 h-60 mb-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              className="absolute inset-0 w-full h-full object-cover border-2 border-gray-300 rounded-lg"
            />
            <button
              onClick={handleCapture}
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Capture Photo
            </button>
          </div>
        )}

        {message && (
          <div className="mt-3 p-4 bg-white-500 text-white rounded">
            {message}
          </div>
        )}
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search Items"
        className="w-full p-2 mb-4 border rounded"
      />

      <ul className="space-y-2">
        {pantry.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
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
