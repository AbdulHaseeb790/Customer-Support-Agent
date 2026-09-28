from langchain_groq import ChatGroq
from dotenv import load_dotenv
load_dotenv
llm=ChatGroq(model="openai/gpt-oss-120b")

#function to  check the escaltions 
def check_escalation(user_message:str)->str:
    prompt = f"""You are an escalation detector for a customer support agent.
Decide if this customer message needs a human agent based on:
- Customer is angry or frustrated
- Customer is asking for a refund
- Customer is threatening legal action
- Customer has a complex billing issue
- Customer has experienced data loss

If it needs human escalation, respond with exactly one word: escalate
If it can be handled by AI, respond with exactly one word: proceed

Customer message: {user_message}"""
    respone=llm.invoke(prompt)
    result=respone.content.strip().lower()
    if 'escalate' in result:
        return 'escalate'
    return 'proceed'
