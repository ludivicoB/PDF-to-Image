import PdfUploader from "./PdfUploader";

function App() {
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", }}>
      <h1 >PDF to Image Converter</h1>
      <PdfUploader />
    </div>
  );
}

export default App;
