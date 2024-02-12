const link_by_href = new Map();
let script_speculationrules = null;
let hrefs_to_prerender = [];

function prerender(href) {
  if (script_speculationrules) {
    document.head.removeChild(script_speculationrules);
  }

  script_speculationrules = document.createElement("script");
  script_speculationrules.setAttribute("type", "speculationrules");

  hrefs_to_prerender = [...new Set(hrefs_to_prerender)].slice(0, 3);
  hrefs_to_prerender.unshift(href);
  script_speculationrules.textContent = `${JSON.stringify({
    prerender: [
      {
        source: "list",
        urls: hrefs_to_prerender,
      },
    ],
  })}
  `;

  document.head.appendChild(script_speculationrules);
}

const href_set_to_prefetch = new Set();
function prefetch(href) {
  if (!href_set_to_prefetch.has(href)) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  }
  href_set_to_prefetch.add(href);
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

// const intersection_observer = new IntersectionObserver((entries) => {
//   for (const entry of entries) {
//     if (entries[0].intersectionRatio <= 0) {
//       continue;
//     }

//     const element_intersected = entry.target;
//     element_intersected.
//   }
// });

// Prefetch links when A elements are near to mouse cursor
window.addEventListener("mousemove", (event) => {
  const near_px = 40;

  const mouse_x = event.clientX;
  const mouse_y = event.clientY;
  document.body.querySelectorAll("a").forEach((a_elem) => {
    if (a_elem.href) {
      const rect = a_elem.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        const min_diff_x = Math.min(
          Math.abs(mouse_x - rect.left),
          Math.abs(mouse_x - rect.right)
        );
        const min_diff_y = Math.min(
          Math.abs(mouse_y - rect.top),
          Math.abs(mouse_x - rect.bottom)
        );
        if (
          (rect.left < mouse_x &&
            mouse_x < rect.right &&
            min_diff_y < near_px) ||
          (rect.top < mouse_y &&
            mouse_y < rect.bottom &&
            min_diff_x < near_px) ||
          (min_diff_x < near_px && min_diff_y < near_px)
        ) {
          prefetch(a_elem.href);
        }
      }
    }
  });
});
