import OpenAI from "openai"
import readlineSync from 'readline-sync'
const OPENAI_API_KEY = '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'

const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

function getCryptoCurr(Stocks=''){
    if (Stocks.toLowerCase() === "Bitcoin") return "7200000";
    if (Stocks.toLowerCase() === "Ethereum") return "130000";
    if (Stocks.toLowerCase() === "Solana") return "11000";
    if (Stocks.toLowerCase() === "Dogecoin") return "13.59Rup";
}
const tools = {
    getCryptoCurr:getCryptoCurr,
}

const SYSTEM_PROMPT = `
YOU are an AI assistant with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first plan using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations, return the AI response based on the start prompt and observations.

Strictly follow the json output format as in examples

Available Tools:
-function getCryptoCurr(Stocks: String): String
getCryptoCurr is a function that accepts cryptoCurrency as a string and returns the appropriate details.

Example:
START
{ "type": "user","user": "what is the current price of Bitcoin in the market?"}
{ "type": "plan","plan": "I will call the getCryptoCurr for Bitcoin"}
{ "type": "action","function": "getCryptoCurr", "input": "Bitcoin"}
{ "type": "observation","observation": "72Lakhs"}
{ "type": "output","output": "The current price of BITCOIN is 72 Lakhs"}

`;

const messages = [{ role: 'system', content: SYSTEM_PROMPT}];

while(true){
    const query = readlineSync.question('>> ');
    const q = {
        type: 'user',
        user: query,
    };
    messages.push({ role:"user",content: JSON.stringify(q) });

    while(true){
        const chat = await client.chat.completions.create({
            model:'gpt-4o',
            messages: messages,
            response_format: {type: 'json_object'},
        });

        const result =  chat.choices[0].message.content;
        messages.push({ role: 'assistant',content: result});
        
        console.log('\n\n----------AI---------')
        console.log(result)
        console.log('----------AI---------\n\n')

        
        const call = JSON.parse(result);

        if (call.type== "output"){
            console.log(`🤖: ${call.output}`);
            break;
            
        }else if(call.type == 'action'){
            const fn = tools[call.function];
            const observation = fn(call.input);
            const obs = { type: "observation",observation: observation};
            messages.push({role: 'developer', content: JSON.stringify(obs)});
        }
    }

} 