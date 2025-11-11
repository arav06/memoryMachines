import React, { useState, useEffect } from "react";
import "./KeywordsDisplay.css";

const KeywordsDisplay = ({ keywords }) => {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    setVisible([]);
    
    if (keywords && keywords.length > 0) {
      keywords.forEach((keyword, index) => {
        setTimeout(() => {
          setVisible(prev => [...prev, keyword]);
        }, index * 200);
      });
    }
  }, [keywords]);

  return (
    <div className="keywordsDisplay">
      <div className="header">Keywords</div>
      <div className="content">
        {visible.length === 0 ? (
          <p className="placeholder">
            Keywords will appear here
          </p>
        ) : (
          visible.map((keyword, index) => (
            <span 
              key={`${keyword}-${index}`} 
              className="keyword"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {keyword}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default KeywordsDisplay;
