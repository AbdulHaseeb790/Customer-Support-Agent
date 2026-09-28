from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter  # new - correct
import os
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Upload endpoint — accepts a file from the business owner
@router.post("/docs")
async def upload_docs(file: UploadFile = File(...)):
    
    if file.content_type not in ["text/plain", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Only txt and pdf files allowed")
    
    # Read the file contents as bytes then decode to string
    contents = await file.read()
    text = contents.decode("utf-8")
    
    # Split text into chunks of 500 characters with 50 overlap
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.create_documents([text])
    
    # Embed chunks and store them in Pinecone
    PineconeVectorStore.from_documents(
        chunks,
        embeddings,
        index_name=os.getenv("PINECONE_INDEX_NAME")
    )
    
    # Return success message
    return {"message": f"Successfully uploaded and indexed {len(chunks)} chunks"}