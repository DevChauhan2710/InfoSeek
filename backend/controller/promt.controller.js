import OpenAI from "openai";
import { Promt } from "../model/promt.model.js";

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});
// console.log(openai.apiKey);


export const sendPromt = async (req, res) => {
  // console.log("loading prompt");

  const { content } = req.body;
  const userId = req.userId;

  if (!content || content.trim() === "") {
    return res.status(400).json({ errors: "Promt content is required" });
  }
  try {
    // save user promt at db (user promt de raha hein)
    const userPromt = await Promt.create({
      userId,
      role: "user",
      content,
    });
    console.log(content);

    //send to openAI(or wo promt ai assistant k pass ja raha hein)
    //or ai assistant ka answer completion me ayenga
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [{role: 'user', content: content,},],
      max_tokens: 500,
    });

    const aiContent = completion.choices[0].message.content;



    // save assistant promt at db 
    const aiMessage = await Promt.create({
      userId,
      role: "assistant",
      content: aiContent,
    });

    return res.status(200).json({ reply: aiContent });
  } catch (error) {

    console.log("Error in Promt: ", error);
    return res
      .status(500)
      .json({ error: "Something went wrong with the AI response" });
  }
}

