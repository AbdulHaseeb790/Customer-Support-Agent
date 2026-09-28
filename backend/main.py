from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.chat import router as chat_router
app=FastAPI(title='Customer Support Agent')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']

)

app.include_router(upload_router, prefix="/upload")

# Register chat route — handles customer messages
app.include_router(chat_router, prefix="/chat")

# Health check endpoint just to checkk whether our server is srunning or nott
@app.get("/")
def root():
    return {"status": "Customer Support Agent is running"}