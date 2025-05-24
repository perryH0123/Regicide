function injectScript (src) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(src);
    console.log(s.src);
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}
window.addEventListener('load', function() {
    console.log("Loaded Regicide!");
    injectScript('scripts/script.js');
});