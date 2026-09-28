# Import Groq LLM wrapper from langchain
from langchain_groq import ChatGroq

# Import load_dotenv to read API keys from .env file
from dotenv import load_dotenv

# Actually load the .env file into memory
load_dotenv()

# Initialize the Groq LLM
llm=ChatGroq(model="openai/gpt-oss-120b")

# Function that takes customer message and returns relevant or irrelevant
def check_relevance(user_message: str) -> str:
    
    # Prompt tells LLM exactly what to decide
    # We force it to respond with ONE word only
    prompt = f"""You are a guardrail for a customer support agent.
Your job is to decide if the user's message is related to customer support queries like:
- Product questions
- Pricing
- Complaints
- Orders
- Refunds
- Technical issues

If it is related, respond with exactly one word: relevant
If it is NOT related, respond with exactly one word: irrelevant

User message: {user_message}"""

    # Send the prompt to LLM and get response
    response = llm.invoke(prompt)
    
    # Clean the response — remove spaces and make lowercase
    # Example: " Irrelevant " becomes "irrelevant"
    result = response.content.strip().lower()
    
    # If LLM said irrelevant → return irrelevant
    if "irrelevant" in result:
        return "irrelevant"
    
    # Otherwise → return relevant and proceed to next node
    return "relevant"