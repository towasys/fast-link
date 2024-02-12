const link_by_href = new Map();
let script_speculationrules = null;
let hrefs_to_prefetch = [];

function prerender(href) {
  if (script_speculationrules) {
    document.head.removeChild(script_speculationrules);
  }

  script_speculationrules = document.createElement("script");
  script_speculationrules.setAttribute("type", "speculationrules");

  hrefs_to_prefetch = [...new Set(hrefs_to_prefetch)].slice(0, 3);
  hrefs_to_prefetch.unshift(href);
  script_speculationrules.textContent = `${JSON.stringify({
    prerender: [
      {
        source: "list",
        urls: hrefs_to_prefetch,
      },
    ],
  })}
  `;

  document.head.appendChild(script_speculationrules);
}

function preload_link_add(event) {
  const href = event.currentTarget.getAttribute("href");
  //   const link = document.createElement("link");
  //   link.rel = "prefetch";
  //   link.href = href;
  //   console.log(href);
  //   document.head.appendChild(link);
  //   link_by_href.set(href, link);

  prerender(href);
}

function preload_link_remove(event) {
  const href = event.currentTarget.getAttribute("href");
  const link = link_by_href.get(href);
  if (link) {
    document.head.removeChild(link);
  }
}

window.addEventListener("load", (event) => {
  const a_elems = document.querySelectorAll("a");
  a_elems.forEach((a_elem) => {
    a_elem.addEventListener("mouseover", preload_link_add);
    a_elem.addEventListener("touchstart", preload_link_add);

    //   a_elem.addEventListener("mouseout", preload_link_remove);
  });
});

new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    // 処理
    mutation.addedNodes.forEach((node) => {
      if (typeof node.querySelectorAll == "function") {
        const a_elems = node.querySelectorAll("a");
        a_elems.forEach((a_elem) => {
          a_elem.addEventListener("mouseover", preload_link_add);
          a_elem.addEventListener("touchstart", preload_link_add);
        });
        if (node.tagName == "A") {
          node.addEventListener("mouseover", preload_link_add);
          node.addEventListener("touchstart", preload_link_add);
        }
      }
    });
  }
}).observe(document.body, { childList: true, subtree: true });
