const link_by_href = new Map();

function prerender(href) {
  const script_speculationrules = document.createElement("script");
  script_speculationrules.setAttribute("type", "speculationrules");
  document.head.appendChild(script_speculationrules);

  script_speculationrules.innerHTML = `
    {
        "prerender": [
            {
                "source": "list",
                "urls": ["${href}"]
            }
        ]
    }
  `;
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

const a_elems = document.querySelectorAll("a");
a_elems.forEach((a_elem) => {
  a_elem.addEventListener("mouseover", preload_link_add);
  a_elem.addEventListener("touchstart", preload_link_add);

  //   a_elem.addEventListener("mouseout", preload_link_remove);
});
