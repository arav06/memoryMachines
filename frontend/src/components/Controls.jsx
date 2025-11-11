import React from "react";
import "./Controls.css";

const Controls = ({ isRecording, onStartStop, sentiment, sentimentLabel }) => {
  const percent = Math.min(100, Math.max(0, ((sentiment + 1) / 2) * 100));
  const barColor = sentiment < -0.3 ? "#60a5fa" : sentiment > 0.3 ? "#7dd3fc" : "#93c5fd";
  const labelText = sentimentLabel || "neutral";
  return (
    <div className="controls">
      <button 
        className={`recordingButton ${isRecording ? "recording" : ""}`}
        onClick={onStartStop}>
        <span className="recordingButtonIcon">{isRecording ? "⏸" : "▶"}</span>
        <span className="recordingButtonText">{isRecording ? "Stop Recording" : "Start Recording"}</span>
      </button>
      
      <div className="status">
        <div className="statusRow">
          <div className={`recording ${isRecording ? "active" : ""}`}></div>
          <span className="statusText">
            {isRecording ? "Recording..." : "Ready"}
          </span>
        </div>
      </div>

      <div className="sentimentDisplay">
        <div className="label">
          Sentiment: <span className={`score ${labelText}`}>{labelText}</span>
        </div>
        <div className="container">
          <div
            className="bar"
            style={{
              width: `${percent}%`,
              backgroundColor: barColor
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
