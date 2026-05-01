const SYMBOLS = {
  "{p}": "fab_icons/icon_p.png",
  "{r}": "fab_icons/icon_r.png",
  "{d}": "fab_icons/icon_d.png",
  "{h}": "fab_icons/icon_h.png",
  "{i}": "fab_icons/icon_i.png",
  "{c}": "fab_icons/icon_c.png",
  "{t}": "fab_icons/icon_t.png",
  "{u}": "fab_icons/icon_u.png",
};

function replaceText(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    let text = node.nodeValue;

    let replaced = false;
    const fragment = document.createDocumentFragment();

    while (true) {
      let matchIndex = -1;
      let matchKey = null;

      for (const key in SYMBOLS) {
        const i = text.indexOf(key);
        if (i !== -1 && (matchIndex === -1 || i < matchIndex)) {
          matchIndex = i;
          matchKey = key;
        }
      }

      if (matchIndex === -1) break;

      // Add text before match
      if (matchIndex > 0) {
        fragment.appendChild(document.createTextNode(text.slice(0, matchIndex)));
      }

      // Create image
      const img = document.createElement("img");
      img.src = browser.runtime.getURL(SYMBOLS[matchKey]);
      img.style.height = "1em";
      img.style.width = "auto";
      img.style.display = "inline-block";
      img.style.verticalAlign = "-0.15em";
      img.style.margin = "0 0.05em";

      img.alt = matchKey;
      img.title = matchKey;
      img.className = "fab-symbol";

      fragment.appendChild(img);

      text = text.slice(matchIndex + matchKey.length);
      replaced = true;
    }

    if (replaced) {
      if (text.length > 0) {
        fragment.appendChild(document.createTextNode(text));
      }
      node.parentNode.replaceChild(fragment, node);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Avoid messing with scripts/styles
    if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(node.tagName)) {
      return;
    }

    for (const child of [...node.childNodes]) {
      replaceText(child);
    }
  }
}

// Initial run
replaceText(document.body);

// Observe dynamic changes (important for modern sites)
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      replaceText(node);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});