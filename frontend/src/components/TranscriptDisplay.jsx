import React, { useEffect, useRef } from "react";
import "./TranscriptDisplay.css";

const TranscriptDisplay = ({ transcript }) => {
  const scroll = useRef(null);

  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollTo({
        top: scroll.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [transcript]);

  return (
    <div className="transcriptDisplay" ref={scroll}>
      <div className="header">Transcript</div>
      <div className="content">
        {transcript.length === 0 ? (
          <p className="placeholder">
            Start speaking to see your words appear here
          </p>
        ) : (
          transcript.map((line, index) => (
            <p key={index} className="line">
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
