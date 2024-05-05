const { G4F } = require("g4f");

export async function POST(request: Request) {
    const inputData = await request.json();

    const g4f = new G4F();
    const messages = [
        { role: "user", content: inputData.text },
    ];
    const options = {
        model: "gpt-4",
    };

    const text = await g4f.chatCompletion(messages, options);	

    const botReply = text;

    const responseData = { status: 'OK', botReply: botReply };
    
    const responseBody = JSON.stringify(responseData);

    return new Response(responseBody, { status: 200, headers: { 'Content-Type': 'application/json' } });
}


