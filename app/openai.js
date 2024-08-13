// app/api/openai/route.js
import { OpenAI } from 'openai';

export async function openaireq(request) {
  const openai = new OpenAI({
    apiKey: "AIzaSyAtzQKHTK91jKDbLgv6Psilgn7shhzQHIU",
    dangerouslyAllowBrowser: true
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'hello',
        },
      ],
    });
    console.log('I am here')
    return new Response(JSON.stringify({ message: response.choices[0].message.content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
  }
}
