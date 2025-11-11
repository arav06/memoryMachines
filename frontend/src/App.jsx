import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import AuraVisualization from "./components/AuraVisualization";
import TranscriptDisplay from "./components/TranscriptDisplay";
import KeywordsDisplay from "./components/KeywordsDisplay";
import Controls from "./components/Controls";
import "./App.css";

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [sentiment, setSentiment] = useState(0);
  const [sentimentLabel, setSentimentLabel] = useState("");
  const [keywords, setKeywords] = useState([]);
  
  const deepgramRef = useRef(null);
  const connectionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const processingTimeout = useRef(null);

  useEffect(() => {
    deepgramRef.current = createClient(DEEPGRAM_API_KEY);
    return () => {
      if (connectionRef.current) connectionRef.current.finish();
      if (processingTimeout.current) clearTimeout(processingTimeout.current);
    };
  }, []);

  const evalTranscript = async (text) => {
    if (processingTimeout.current) clearTimeout(processingTimeout.current);

    processingTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.post("https://memorymachinesapi.onrender.com/process_text/", { data: text });
        setSentiment(res.data.sentimentScore);
        setSentimentLabel(res.data.sentimentLabel);
        setKeywords(res.data.keywords);
      } catch (err) {
        console.error("Could not process transcript");
      }
    }, 1000);
  };

  const handleStartStop = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (connectionRef.current) {
        connectionRef.current.finish();
        connectionRef.current = null;
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setTranscript([]);
        setSentiment(0);
        setSentimentLabel("");
        setKeywords([]);
        
        const connection = deepgramRef.current.listen.live({
          model: "nova-2",
          language: "en-US",
          smart_format: true,
          interim_results: true,
          utterance_end_ms: 1000,
          vad_events: true,
        });
        
        connectionRef.current = connection;
        
        connection.on(LiveTranscriptionEvents.Open, () => {
          const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
          mediaRecorderRef.current = recorder;
          
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0 && connection.getReadyState() === 1) {
              connection.send(e.data);
            }
          };
          recorder.start(250);
        });
        
        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const text = data.channel.alternatives[0].transcript;
          if (text && text.trim().length > 0 && data.is_final) {
            setTranscript(prev => [...prev, text]);
            evalTranscript(text);
          }
        });
        
        setIsRecording(true);
      } catch (error) {
        alert("Could not access microphone");
      }
    }
  };

  return (
    <div className="app">
      <AuraVisualization sentiment={sentiment} keywords={keywords} />
      
      <Controls 
        isRecording={isRecording}
        onStartStop={handleStartStop}
        sentiment={sentiment}
        sentimentLabel={sentimentLabel}
      />
      
      <KeywordsDisplay keywords={keywords} />
      <TranscriptDisplay transcript={transcript} />
    </div>
  );
};

export default App;
