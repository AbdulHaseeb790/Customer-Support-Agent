from typing import TypedDict

from langgraph.graph import StateGraph, END

from agent.guardrail import check_relevance
from agent.retriever import retrieve_context
from agent.escalation import check_escalation
from agent.generator import generate_answer

class AgentState(TypedDict):
    user_message: str      # original customer message
    context: str           # chunks retrieved from Pinecone
    relevance: str         # relevant or irrelevant
    escalation: str        # escalate or proceed
    final_answer: str      # final response to customer

# Guardrail node
def guardrail_node(state: AgentState) -> dict:
    result = check_relevance(state["user_message"])
    return {"relevance": result}

# Retriever node
def retriever_node(state: AgentState) -> dict:
    result = retrieve_context(state["user_message"])
    return {"context": result}

# Escalation node
def escalation_node(state: AgentState) -> dict:
    result = check_escalation(state["user_message"])
    return {"escalation": result}

# Generator node
def generator_node(state: AgentState) -> dict:
    result = generate_answer(state["user_message"], state["context"])
    return {"final_answer": result}

# After guardrail — route based on relevance if this or that
def route_after_guardrail(state: AgentState) -> str:
    if state["relevance"] == "irrelevant":
        return "irrelevant"
    return "retrieve"

# After escalation — route based on escalation
def route_after_escalation(state: AgentState) -> str:
    if state["escalation"] == "escalate":
        return "escalate"
    return "generate"
#buidling the graphhh
def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("guardrail", guardrail_node)
    graph.add_node("retrieve", retriever_node)
    graph.add_node("escalation", escalation_node)
    graph.add_node("generate", generator_node)

    # Entry point
    graph.set_entry_point("guardrail")

    # Conditional edges
    graph.add_conditional_edges("guardrail", route_after_guardrail, {
        "irrelevant": END,
        "retrieve": "retrieve"
    })

    graph.add_edge("retrieve", "escalation")

    graph.add_conditional_edges("escalation", route_after_escalation, {
        "escalate": END,
        "generate": "generate"
    })

    graph.add_edge("generate", END)

    return graph.compile()