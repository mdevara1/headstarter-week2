
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager("AIzaSyAtzQKHTK91jKDbLgv6Psilgn7shhzQHIU");

const genAI = new GoogleGenerativeAI("AIzaSyAtzQKHTK91jKDbLgv6Psilgn7shhzQHIU");
console.log('entered 1')
const model = genAI.getGenerativeModel({
  // Choose a Gemini model.
  model: "gemini-1.5-pro",
});
console.log('enetredd 2')
// Upload the file and specify a display name.
export default async function handler(req, res) {
    console.log('entered')
    if (req.method === 'POST') {
      const { imageUrl } = req.body;
  
      try {

        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();
        
        // Debugging statement
        console.log('Image Blob:', imageBlob);
        const uploadResponse = await fileManager.uploadFile(imageUrl, {
          mimeType: "image/png", // You might need to infer the mime type
          displayName: "Captured Image",
        });
  
        // Use the uploaded file URI in the model
        const result = await model.generateContent([
          {
            fileData: {
              mimeType: uploadResponse.file.mimeType,
              fileUri: uploadResponse.file.uri,
            }
          },
          { text: "give me the name of the product shown in the image in one word" },
        ]);
  
        res.status(200).json({ text: await result.response.text() });
      } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Failed to process image' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }