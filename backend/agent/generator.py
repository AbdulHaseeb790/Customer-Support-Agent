from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage,HumanMessage
from dotenv import load_dotenv
load_dotenv
llm=ChatGroq(model="openai/gpt-oss-120b")

def generate_answer(user_message: str, context: str) -> str:
    system = SystemMessage(content=f"""You are a helpful customer support agent.
Answer the customer's question using ONLY the information provided below.
If the answer is not in the context, say: "I don't have that information, please contact support."
Do not use your own knowledge. Be concise and friendly.

Context from knowledge base:
{context}""")
    human=HumanMessage(content=user_message)
    response=llm.invoke([system,human])
    return response.content