/**
 * File: src/components/company/CvViewer.jsx
 * Purpose: Preview and download CV from Azure Blob Storage
 */
import { useState, useEffect } from "react";

export default function CvViewer({ cvUrl, studentName, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!cvUrl) return;

    // For Azure Blob Storage URLs, we need to handle them properly
    const isAzureUrl = cvUrl.includes('blob.core.windows.net');
    
    if (isAzureUrl && !cvUrl.includes('?')) {
      // Add download=false parameter for Azure to force preview instead of download
      const separator = cvUrl.includes('?') ? '&' : '?';
      setPreviewUrl(`${cvUrl}${separator}download=false&preview=true`);
    } else {
      setPreviewUrl(cvUrl);
    }
  }, [cvUrl]);

  const handleDownload = () => {
    if (!cvUrl) {
      alert("No CV available for this candidate.");
      return;
    }
    
    // Create a temporary anchor to trigger download
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = `${studentName.replace(/\s/g, '_')}_CV.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Check file type for better preview handling
  const isPdf = previewUrl?.toLowerCase().endsWith('.pdf') || previewUrl?.includes('.pdf');
  const isImage = previewUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isDocx = previewUrl?.toLowerCase().endsWith('.docx') || previewUrl?.includes('.docx');

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header with actions */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        paddingBottom: 16,
        borderBottom: "1px solid var(--border)",
        marginBottom: 16,
        flexWrap: "wrap",
        gap: 12
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{studentName}'s CV</h3>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            {isPdf ? "PDF Document" : isImage ? "Image File" : isDocx ? "Word Document" : "Document"}
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
            <p className="helper" style={{ marginBottom: 16 }}>
              The file cannot be previewed in the browser.
            </p>
            <button onClick={handleDownload} className="btn btn-outline">
              Download CV Instead
            </button>
          </div>
        )}
        
        {!error && previewUrl && (
          <>
            {isPdf && (
              <iframe
                src={`${previewUrl}#toolbar=1&navpanes=1`}
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
            
            {isImage && (
              <img
                src={previewUrl}
                alt={`${studentName}'s CV`}
                style={{
                  width: "100%",
                  height: "auto",
                  minHeight: "500px",
                  objectFit: "contain",
                  border: "1px solid var(--border)",
                  borderRadius: 8
                }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            )}
            
            {!isPdf && !isImage && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                <p>Preview not available for this file type.</p>
                <button onClick={handleDownload} className="btn btn-outline" style={{ marginTop: 16 }}>
                  Download CV
                </button>
              </div>
            )}
          </>
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