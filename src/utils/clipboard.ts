export async function copyHTMLToClipboard(signatureHTML: string): Promise<boolean> {
  if (!signatureHTML) {
    return false;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const blob = new Blob([signatureHTML], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = signatureHTML;
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const success = document.execCommand('copy');
    document.body.removeChild(tempDiv);
    selection?.removeAllRanges();

    return success;
  } catch (error) {
    console.error('Error al copiar HTML:', error);
    return false;
  }
}