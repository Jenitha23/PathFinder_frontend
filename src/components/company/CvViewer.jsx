/**
 * File: src/components/company/CvViewer.jsx
 * Purpose: Preview and download CV from Azure Blob Storage
 */
import { useState, useEffect } from "react";

export default function CvViewer({ cvUrl, studentName, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!cvUrl) return;

    const isPdf = cvUrl.toLowerCase().includes('.pdf') || 
                  cvUrl.toLowerCase().includes('application/pdf');
    const isAzureUrl = cvUrl.includes('blob.core.windows.net');

    if (isPdf) {
      // For Azure URLs, use Google Docs Viewer (most reliable)
      if (isAzureUrl) {
        const encodedUrl = encodeURIComponent(cvUrl);
        // Using Google Docs Viewer with proper parameters
        const googleViewerUrl = `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
        setPreviewType('google');
        setPreviewUrl(googleViewerUrl);
      } else {
        // For non-Azure PDFs
        setPreviewType('direct');
        setPreviewUrl(cvUrl);
      }
    } else if (cvUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      setPreviewType('image');
      setPreviewUrl(cvUrl);
    } else {
      // For other file types, just show download option
      setPreviewType('unsupported');
      setError("Preview not available for this file type.");
    }
    
    setIsLoading(false);
  }, [cvUrl]);

  const handleDownload = async () => {
    if (!cvUrl) {
      alert("No CV available for this candidate.");
      return;
    }
    
    try {
      // Try to fetch the file with credentials
      const response = await fetch(cvUrl, {
        mode: 'cors',
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${studentName.replace(/\s/g, '_')}_CV.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: open in new tab
        window.open(cvUrl, '_blank');
      }
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(cvUrl, '_blank');
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Unable to preview CV. Please download the file to view it.");
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
            {previewType === 'google' && "PDF Document (Preview via Google Docs)"}
            {previewType === 'direct' && "PDF Document"}
            {previewType === 'image' && "Image File"}
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
        
        {!error && previewType === 'google' && (
          <iframe
            src={previewUrl}
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
        
        {!error && previewType === 'direct' && (
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
        
        {!error && previewType === 'image' && (
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
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}