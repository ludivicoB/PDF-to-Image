import { useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const PdfUploader = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [multipleMode, setMultipleMode] = useState(false);
  const [converted, setConverted] = useState(false); // Track conversion status

  const handleFileChange = (event) => {
    setSelectedFiles(multipleMode ? [...event.target.files] : [event.target.files[0]]);
    setConverted(false); // Re-enable conversion when new file is selected
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    let allImages = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post("http://localhost:5000/convert", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        allImages.push(...response.data.images);
      } catch (error) {
        console.error("Error uploading PDF:", error);
        alert(`Failed to convert ${file.name}. Try again.`);
      }
    }

    setImages(allImages);
    setConverted(true); // Mark conversion as complete
    setLoading(false);
  };

  const handleDownload = (imageData, index) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `converted_page_${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;

    const zip = new JSZip();
    images.forEach((imageData, index) => {
      const base64Data = imageData.split(",")[1];
      zip.file(`converted_page_${index + 1}.jpg`, base64Data, { base64: true });
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "converted_images.zip");
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setImages([]);
    setLoading(false);
    setConverted(false); // Allow new conversion
    document.getElementById("fileInput").value = ""; // Reset file input field
  };

  return (
    <div className="container">
      <h2>PDF to Image Converter</h2>

      <label>
        <input type="checkbox" checked={multipleMode} onChange={() => setMultipleMode(!multipleMode)} />
        Convert Multiple PDFs
      </label>

      <input id="fileInput" type="file" accept="application/pdf" onChange={handleFileChange} multiple={multipleMode} />

      <button onClick={handleUpload} disabled={loading || converted}>
        {loading ? "Converting..." : "Upload & Convert"}
      </button>

      {images.length > 0 && (
        <>
          <button onClick={handleDownloadAll}>Download All</button>
          <button onClick={handleReset}>Convert Another</button>
        </>
      )}

      <div className="image-grid">
        {images.length > 0 && <h3>Converted Images:</h3>}
        {images.map((img, index) => (
          <div key={index} className="image-card">
            <img src={img} alt={`Thumbnail ${index + 1}`} className="thumbnail" />
            <button onClick={() => handleDownload(img, index)}>Download</button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .container {
          text-align: center;
          max-width: 600px;
          margin: auto;
        }
        input, button {
          margin: 10px;
        }
        .image-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
          margin-top: 20px;
        }
        .image-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }
        .thumbnail {
          width: 100px;
          height: auto;
          border-radius: 5px;
        }
        button {
          margin-top: 10px;
          background: #007bff;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background: #0056b3;
        }
        button:disabled {
          background: gray;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PdfUploader;
