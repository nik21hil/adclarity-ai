console.log("🚀 AdClarity AI MutationObserver script running...");

function showExplanationPopup(rawText) {
  const sections = rawText.split(/\n{2,}/); // Split by double line breaks
  const cleanedSections = sections.map(section => {
    const [rawTitle, ...rest] = section.split(/[:\-–]\s*/);
    const title = rawTitle.replace(/\*\*/g, "").trim();
    const body = rest.join(" ").replace(/\*\*/g, "").replace(/\n/g, " ").trim();
    return `<div class="adclarity-section"><span class="adclarity-section-title">${title}:</span> ${body}</div>`;
  });

  const formattedHtml = cleanedSections.join("");

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "adclarity-modal";

  const popup = document.createElement("div");
  popup.className = "adclarity-popup";
  popup.innerHTML = `
    <div class="adclarity-popup-header-row">
      <button class="adclarity-copy" title="Copy to clipboard">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4C2.9 1 2 .9 2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 
          .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 
          2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
      </button>
      <div class="adclarity-popup-title">💡 Why you may be seeing this ad</div>
      <button class="adclarity-close" title="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

    </div>
    <div class="adclarity-popup-body">${formattedHtml}</div>
  `;

  modalOverlay.appendChild(popup);
  document.body.appendChild(modalOverlay);

  // Close logic
  const removePopup = () => modalOverlay.remove();

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) removePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") removePopup();
  }, { once: true });

  popup.querySelector(".adclarity-close").onclick = removePopup;

  popup.querySelector(".adclarity-copy").onclick = () => {
    navigator.clipboard.writeText(rawText);
    showToast("Explanation copied!");
  };
}


// Identify a span that contains "Promoted"
function isPromotedSpan(span) {
  return span.innerHTML?.includes("Promoted");
}

// Traverse up the DOM to find the post container
function findPostContainer(start) {
  let current = start;
  for (let i = 0; i < 10; i++) {
    current = current.parentElement;
    if (!current) break;

    const hasDataId = current.getAttribute("data-id");
    const hasRole = current.getAttribute("role");

    if (
      hasDataId?.includes("activity") ||
      hasRole === "article" ||
      current.classList.contains("update-components") ||
      current.classList.contains("feed-shared-update-v2")
    ) {
      return current;
    }
  }
  return null;
}

// Inject the minimal info icon
function injectButton(container, adText) {
  if (container.querySelector(".adclarity-btn")) return;

  const icon = document.createElement("div");
  icon.className = "adclarity-btn";
  icon.setAttribute("title", "Why am I seeing this ad?");
  icon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
               10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6h2v6zm0-8h-2V7h2v4z"/>
    </svg>
  `;

  icon.onclick = () => {
    chrome.runtime.sendMessage(
        { type: "explain-ad", adText },
        (response) => {
        if (chrome.runtime.lastError) {
            console.error("Message failed:", chrome.runtime.lastError.message);
            alert("Could not fetch explanation for the ad.");
            return;
        }

        if (!response || !response.message) {
            console.error("No valid response received:", response);
            alert("No explanation available.");
            return;
        }

        showExplanationPopup(response.message);

        }
    );
    };



  const wrapper = document.createElement("div");
  wrapper.className = "adclarity-wrapper";
  wrapper.appendChild(icon);

  container.style.position = "relative";
  container.appendChild(wrapper);

  console.log("✅ Injected circular info icon into ad container.");
}


// Core scan function
function scanAndInject() {
  const spans = document.querySelectorAll("span");

  spans.forEach(span => {
    if (isPromotedSpan(span)) {
      const container = findPostContainer(span);
      if (!container) {
        console.warn("⚠️ Promoted span found but no valid post container.");
        return;
      }

      const adText = container.innerText?.trim().substring(0, 300);
      injectButton(container, adText);
    }
  });
}

// Setup MutationObserver for dynamic content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;

      const spans = node.querySelectorAll?.("span") || [];
      spans.forEach((span) => {
        if (isPromotedSpan(span)) {
          const container = findPostContainer(span);
          if (!container) {
            console.warn("⚠️ (Observer) Promoted span found but no valid container.");
            return;
          }

          const adText = container.innerText?.trim().substring(0, 300);
          injectButton(container, adText);
        }
      });
    });
  });
});

// Initial DOM scan after load
window.addEventListener("load", () => {
  setTimeout(() => {
    console.log("🔁 First run after load");
    scanAndInject();
  }, 2000);
});

// First scroll trigger (just in case it's lazy-loaded)
let hasScrolled = false;
window.addEventListener("scroll", () => {
  if (!hasScrolled) {
    hasScrolled = true;
    setTimeout(() => {
      console.log("🌀 First scroll trigger");
      scanAndInject();
    }, 1000);
  }
});

// Start watching
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "adclarity-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

