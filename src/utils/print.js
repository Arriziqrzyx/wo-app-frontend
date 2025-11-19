// src/utils/print.js
// Helper untuk memanggil print dengan konfigurasi default terbaik yang bisa
// dikontrol dari halaman web (best-effort). Note: browser print options
// seperti "print background graphics" tidak bisa dipaksa dari JS, tapi kita
// dapat meminta browser untuk mencetak warna/latar belakang via
// `print-color-adjust` dan meng-inject aturan @page margin:0.

export default function printWithDefaults() {
  try {
    // create a temporary style element that enforces print defaults
    const styleId = "__print_defaults_style";
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.type = "text/css";
      styleEl.appendChild(
        document.createTextNode(
          `@media print {\n  @page { margin: 0 !important; }\n  html, body { margin:0 !important; padding:0 !important; }\n  body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n}`
        )
      );
      document.head.appendChild(styleEl);
    }

    // trigger print
    window.print();

    // remove the temporary style after a short delay. Some browsers block JS
    // while the print dialog is open, others don't; removing after a delay
    // keeps things tidy.
    setTimeout(() => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    }, 1500);
  } catch (err) {
    // fallback: call native print
    window.print();
  }
}
