from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
import os
from dotenv import load_dotenv
load_dotenv()
#initizaling embediiings models
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore=PineconeVectorStore(
    index_name=os.getenv("PINECONE_INDEX_NAME"),
    embedding=embeddings

)
def retrieve_context(user_message: str) -> str:
    docs=vectorstore.similarity_search(user_message,k=3)
   # joining all the chunks Intoo one seprate string
    context = "\n\n".join([doc.page_content for doc in docs])
    return context

