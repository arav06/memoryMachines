from fastapi import FastAPI, Request
from pydantic import BaseModel
import uvicorn
from google import genai
from dotenv import load_dotenv
import os
from json import loads

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

class ProcessTextInputModel(BaseModel):
    data: str

class ProcessTextOutputModel(BaseModel):
    sentimentScore: float
    sentimentLabel: str
    keywords: list[str]

@app.post("/process_text", response_model=ProcessTextOutputModel)
async def processText(model: ProcessTextInputModel):

      prompt = f"""

      Analyze the following transcript for emotional sentiment and key topics. 
      Return only a valid JSON response (not in a code block) with the following:

      - sentimentScore: a float between -1.0 (very negative) and 1.0 (very positive)
      - sentimentLabel: one of ["negative", "neutral", "positive"]
      - keywords: a list of concise, relevant keywords

      Ensure the response is a valid JSON object with the above keys and values.
      Only return the JSON object, no additional text. Remove the ```json and ```json markers.

      Transcript:
      {model.data}
      """

      response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
      print(response.text)
      obj = loads(response.text.strip())

      return {"sentimentScore": float(obj["sentimentScore"]), 
            "sentimentLabel": obj["sentimentLabel"], 
            "keywords": obj["keywords"]}

@app.get("/health")
async def health():
    return {"status": "up"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)