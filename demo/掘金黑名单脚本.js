// ==UserScript==
// @name         掘金文章黑名单
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://juejin.im/*
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
  const authorBlackList = JSON.parse(
    localStorage.getItem("authorBlackList") || "[]"
  );
  const keywordsBlackList = JSON.parse(
    localStorage.getItem("keywordsBlackList") || "[]"
  );
  const pathname = location.pathname.split("/")[1];

  if (pathname === "timeline") {
    authorBlackList.length > 0 && filterArticle();
  } else {
    addBlackListBtn();
  }

  function addBlackListBtn() {
    const container = document.querySelector("#juejin");
    const config = {
      childList: true,
      subtree: true
    };
    let blackBtn;
    const handleLoad = mutationsList => {
      for (let mutation of mutationsList) {
        let type = mutation.type;
        let addedNodes = mutation.addedNodes;
        switch (type) {
          case "childList":
            if (addedNodes.length > 0) {
              const infoBox = document.querySelector(
                ".author-info-block .username"
              );
              if (infoBox && infoBox.children.length > 0) {
                loadObserver.disconnect();
                addBtn();
                return;
              }
            }
            break;
        }
      }
    };
    const loadObserver = createNodeListener(container, config, handleLoad);
    function addBtn() {
      const box = document.querySelector(".article-suspended-panel");
      const btn = document.querySelector(".share-btn");
      const author = getAuthor();
      const isInBlack = authorBlackList.includes(author);
      blackBtn = btn.cloneNode();
      blackBtn.className = "panel-btn";
      blackBtn.style.cssText = `height:36px;line-height:36px;text-align:center;${
        isInBlack ? "color:#000" : "color:#ccc"
      }`;
      blackBtn.textContent = "黑";
      blackBtn.onclick = function() {
        defriend();
      };
      box.appendChild(blackBtn);
    }
    function defriend() {
      const author = getAuthor();
      const arrIndex = authorBlackList.indexOf(author);
      const isInBlack = arrIndex >= 0;
      if (isInBlack) {
        blackBtn.style.color = "#ccc";
        authorBlackList.splice(arrIndex, 1);
      } else {
        blackBtn.style.color = "#000";
        authorBlackList.push(author);
      }
      localStorage.setItem("authorBlackList", JSON.stringify(authorBlackList));
    }
    function getAuthor() {
      const authorBox = document.querySelector(".author-info-block .username");
      console.log(authorBox, [authorBox.firstChild.data]);
      const author = authorBox ? authorBox.innerText : "";
      return author;
    }
  }

  function filterArticle() {
    const container = document.querySelector("#juejin");
    let list;
    const config = {
      childList: true,
      subtree: true
    };
    const handleLoad = mutationsList => {
      for (let mutation of mutationsList) {
        let type = mutation.type;
        let addedNodes = mutation.addedNodes;
        switch (type) {
          case "childList":
            if (addedNodes.length > 0) {
              list = document.querySelector(".entry-list");
              if (list && list.children.length > 0) {
                loadObserver.disconnect();
                const articles = document.querySelectorAll(".entry-list>.item");
                filter(articles);
                updateObserver = createNodeListener(list, config, updateLoad);
              }
            }
            break;
        }
      }
    };
    const updateLoad = mutationsList => {
      for (let mutation of mutationsList) {
        let type = mutation.type;
        let addedNodes = mutation.addedNodes;
        switch (type) {
          case "childList":
            if (addedNodes.length > 0) {
              filter(addedNodes);
            }
            break;
        }
      }
    };
    const loadObserver = createNodeListener(container, config, handleLoad);
    let updateObserver;
    function filter(articles) {
      if (!(keywordsBlackList.length || authorBlackList.length)) return;
      articles.forEach(item => {
        const info = item.innerText;
        const infoList = info.split(/\n/);
        if (infoList.length <= 1) return;
        const author = infoList[0] === "专栏" ? infoList[1] : infoList[2];
        const title = infoList.slice(-3, -2);
        if (authorBlackList.includes(author) || testTitle(title)) {
          item.style.display = "none";
        }
      });
    }
    function testTitle(title) {
      const titleRegex = new RegExp(keywordsBlackList.join("|"));
      if (!keywordsBlackList.length) return;
      return titleRegex.test(title);
    }
  }

  function createNodeListener(node, config, mutationCallback) {
    const observer = new MutationObserver(mutationCallback);
    observer.observe(node, config);
    return observer;
  }
})();
