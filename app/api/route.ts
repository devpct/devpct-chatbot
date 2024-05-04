let OpenAI  = require("openai");

export async function POST(request: Request) {
    const inputData = await request.json();
    
    const openai = new OpenAI({    
        apiKey: "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",
    });

    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: inputData.text }],
        model: "gpt-3.5-turbo",
    });

    const botReply = completion.choices[0].message.content;

    const responseData = { status: 'OK', botReply: botReply };
    
    const responseBody = JSON.stringify(responseData);

    return new Response(responseBody, { status: 200, headers: { 'Content-Type': 'application/json' } });
}
