const { PDFDocument } = PDFLib;
let files = { 1: null, 2: null };

function handleFile(input, num) {
  const file = input.files[0];
  if (file) {
    files[num] = file;
    document.getElementById(`box${num}`).classList.add("loaded");
    document.getElementById(`name${num}`).innerText = file.name;

    // Enable button if both files are present
    if (files[1] && files[2]) {
      document.getElementById("mergeBtn").disabled = false;
    }
  }
}

async function mergePDFs() {
  const btn = document.getElementById("mergeBtn");
  const status = document.getElementById("status");

  btn.disabled = true;
  btn.innerText = "PROCESSING...";
  status.innerText = "Merging data...";

  try {
    // Load both files
    const [buf1, buf2] = await Promise.all([
      files[1].arrayBuffer(),
      files[2].arrayBuffer(),
    ]);
    const pdf1 = await PDFDocument.load(buf1);
    const pdf2 = await PDFDocument.load(buf2);

    // Create new doc and copy pages
    const mergedPdf = await PDFDocument.create();

    const pages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
    pages1.forEach((p) => mergedPdf.addPage(p));

    const pages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
    pages2.forEach((p) => mergedPdf.addPage(p));

    // Save & Download
    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "merged.pdf";
    link.click();

    btn.innerText = "MERGE FILES";
    btn.disabled = false;
    status.innerText = "✅ Download started!";
  } catch (err) {
    console.error(err);
    status.innerText = "❌ Error merging files.";
    btn.disabled = false;
  }
}
