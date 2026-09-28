from fastapi import APIRouter
from pydantic import BaseModel
from agent.graph import build_graph
from dotenv import load_dotenv
load_dotenv()
router = APIRouter()
graph = build_graph()
class ChatRequest(BaseModel):
    message: str
class ChatResponse(BaseModel):
    reply: str
    escalated: bool

@router.post("/message")
async def chat(request: ChatRequest):
    
    # Build initial state — all fields must match AgentState in graph.py
    initial_state = {
        "user_message": request.message,
        "context": "",
        "relevance": "",
        "escalation": "",
        "final_answer": ""
    }
    
    # Run the graph with initial state
    # Graph runs all 4 nodes and returns final state
    result = graph.invoke(initial_state)
    
    # Check if message was irrelevant
    if result["relevance"] == "irrelevant":
        return ChatResponse(
            reply="I can only help with customer support questions.",
            escalated=False
        )
    
    # Check if message was escalated
    if result["escalation"] == "escalate":
        return ChatResponse(
            reply="Your issue has been escalated to a human agent. You will be contacted within 2 hours.",
            escalated=True
        )
    
    # Return the generated answer
    return ChatResponse(
        reply=result["final_answer"],
        escalated=False
    )