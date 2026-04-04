/**
 * File: src/components/company/CvViewer.jsx
 * Purpose: Preview and download CV from Azure Blob Storage
 */
import { useState } from "react";

export default function CvViewer({ cvUrl, studentName, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDownload = () => {
    if (!cvUrl) {
      alert("No CV available for this candidate.");
      return;
    }
    
    // Open in new tab for download
    window.open(cvUrl, '_blank');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Unable to preview CV. Click download to view the file.");
  };

  if (!cvUrl) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <h3>No CV Available</h3>
        <p className="helper">This candidate hasn't uploaded a CV yet.</p>
      </div>
    );
  }

  // Check if URL is from Azure Blob Storage
  const isAzureUrl = cvUrl.includes('blob.core.windows.net');
  const isPdf = cvUrl.toLowerCase().endsWith('.pdf');
  const isImage = cvUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header with actions */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        paddingBottom: 16,
        borderBottom: "1px solid var(--border)",
        marginBottom: 16
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{studentName}'s CV</h3>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            {isAzureUrl ? "Azure Blob Storage" : "External Storage"}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="btn btn-teal"
          style={{ padding: "8px 16px" }}
        >
          📥 Download CV
        </button>
      </div>

      {/* Preview Area */}
      <div style={{ flex: 1, minHeight: "500px", position: "relative" }}>
        {isLoading && (
          <div style={{ 
            position: "absolute", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)",
            textAlign: "center"
          }}>
            <div className="spinner" style={{ 
              width: 40, 
              height: 40, 
              border: "3px solid var(--border)",
              borderTopColor: "var(--teal)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }} />
            <p>Loading CV preview...</p>
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ color: "var(--coral)", marginBottom: 16 }}>{error}</p>
            <button onClick={handleDownload} className="btn btn-outline">
              Download CV Instead
            </button>
          </div>
        )}
        
        {!error && (
          <iframe
            src={cvUrl}
            title={`${studentName} - CV`}
            style={{
              width: "100%",
              height: "100%",
              minHeight: "500px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              display: isLoading ? "none" : "block"
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}