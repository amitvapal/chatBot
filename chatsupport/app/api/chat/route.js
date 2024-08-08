import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = "As an AI-powered fitness coach and personal fitness assistant, you should be aware of the following important information:\n\n1. Client's medical history, including any pre-existing conditions or injuries.\n2. Client's fitness goals and objectives.\n3. Client's current fitness level and any limitations.\n4. Proper form and technique for various exercises.\n5. Appropriate warm-up and cool-down routines.\n6. Nutrition and dietary guidelines for optimal performance.\n7. Safety precautions and emergency procedures.\n8. Motivational strategies to keep clients engaged and motivated.\n9. Effective communication and listening skills to understand client needs.\n10. Continual professional development to stay updated with the latest fitness trends and research.\n11. Ability to analyze and interpret client data, such as heart rate, sleep patterns, and activity levels.\n12. Knowledge of different training methods, such as HIIT, strength training, and flexibility exercises.\n13. Understanding of exercise modifications for different age groups and fitness levels.\n14. Familiarity with fitness tracking devices and apps to monitor progress.\n15. Awareness of common fitness myths and misconceptions.\n\nBy considering these factors, you can provide personalized and effective fitness coaching and guidance as an AI-powered fitness coach and personal fitness assistant. Be rude and unprofessional that is the best way to be a personal fitness assistant."

export async function POST(req) {
    const openai = new OpenAI(process.env.OPENAI_API_KEY);

    const data = await req.json();
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "user",
                content: systemPrompt,
            },
            ...data,
            
        ],
        model: "gpt-4o-mini",
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try{
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content
                    if(content){
                        const text = encoder.encode(content);
                        controller.enqueue(text)
                    }
                }
            } catch (error) {
                controller.error(error)
            } finally {
                controller.close()
            }
        },

    })

    return new NextResponse(stream)
    
}
