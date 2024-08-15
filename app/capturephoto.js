// capturePhoto.js
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

export const capturePhoto = async (webcamRef) => {
  if (!webcamRef.current) {
    throw new Error("Webcam is not initialized");
  }

  const imageSrc = webcamRef.current.getScreenshot();
  const imageUrl = await uploadImagetoFirebase(imageSrc);
  console.log("inside capture photo",imageUrl)
  return {imageUrl};
};

export const uploadImagetoFirebase = async (imageSrc) => {
  const storageRef = ref(storage, `images/${Date.now()}.png`);
  try {
    await uploadString(storageRef, imageSrc, "data_url");
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Image uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw new Error("Failed to upload image");
  }
};
