export function getCurrentChannel() {
    return new URLSearchParams(window.location.href.substring(window.location.href.indexOf("?"))).get("threadId");
}
