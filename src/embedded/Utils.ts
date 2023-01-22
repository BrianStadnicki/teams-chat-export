export function htmlToContent(html: string) {
    let div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').replace(/[^\x00-\x7F]/g, '').trim();
}
