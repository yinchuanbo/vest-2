let curFolder = "", curFolderLans = [];

const getFilesDom = document.getElementById('GetFiles')
const compileCode = document.querySelector(".compile-code")
const pullCode = document.querySelector(".pull-code")
const discardCode = document.querySelector(".discard-code")
const mergeCode = document.querySelector(".merge-code")
const commitPushCode = document.querySelector(".commit-push-code")

let ismark = true

let doc = null;

function renderTabs(data = [], files = {}, initLan = '') {
  const dom = document.querySelector(".wrapper__right_tabs")
  dom.innerHTML = "";
  const lists = (lan = '', d = {}) => {
    return `<ul class="file-list">
    ${files.init.map(item => {
      if (!d[item] || d[item] === 'undefined') return "";
      return `<li data-lan="${lan}"
        data-initlan="${initLan}"
        data-initpath="${item}"
        data-path="${d[item]}" class="${item.includes("/img/") ? 'ishandle' : ''}">
        <p>${item} <span style="color: #2a80eb">-></span> <span class="new-path">${d[item]}</span></p>
        <button class="ui-button async-files" data-type="success">Async</button>
      </li>`
    }).join("")
      }
  </ul>`
  }
  const html = `<div id="tabView" class="ui-tab-tabs">
            ${data.map((item, idx) => {
    return `<a href="#tabTarget${idx}" class="ui-tab-tab ${idx === 0 ? 'active' : ''}">${item.toUpperCase()}</a>`
  }).join('')
    }
          </div>
          <div class="ui-tab-contents">
            ${data.map((item, idx) => {
      return `<div id="tabTarget${idx}" class="ui-tab-content ${idx === 0 ? 'active' : ''}">
        <!--<div class="tab-content-btns"></div>-->
        ${lists(item, files.obj[item])}
      </div>`
    }).join('')
    }
          </div>`;
  dom.insertAdjacentHTML("beforeend", html)
  new Tab(document.querySelectorAll('#tabView > a'), {
    slide: true,
    onSwitch: function (tab, resetTab, panel, resetPanel) { }
  });
}

const popup = (html = '') => {
  const content = `
    <div class="popup">
      <div class="popup-main">${html}</div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", content)
}

discardCode.onclick = () => {
  const html = `
    <div class="discard">
      <div class="discard-header">
        <p>是否一并取消暂存区文件？</p>
        <input type="checkbox" id="discard-switch"><label class="ui-switch" for="discard-switch"></label>
      </div>
      <div class="discard-btns">
        <button class="ui-button discardOk" data-type="primary">确定</button>
        <button class="ui-button diacardCancel" data-type="danger">取消</button>
      </div>
    </div>
  `;
  popup(html);
  const popupDom = document.querySelector(".popup");
  const discardSwitch = document.querySelector("#discard-switch");
  const discardOk = document.querySelector(".discardOk");
  const diacardCancel = document.querySelector(".diacardCancel");
  discardOk.onclick = async () => {
    const res = await window.electronAPI.discardCode({
      curP: curFolder,
      isChecked: discardSwitch.checked
    })
    popupDom.remove();
    window.electronAPI.showErrorDialog({
      title: "info",
      message: res
    })
  }
  diacardCancel.onclick = () => {
    popupDom.remove();
  }
}

mergeCode.onclick = async () => {
  const getBranchs = await window.electronAPI.getBranchs({ curP: curFolder })
  if (getBranchs?.code === 200) {
    const lists = getBranchs?.res;
    const html = `
    <div class="merge2">
      <div class="merge2-header">
        <select id="select01">
            ${lists.map(list => {
      return `<option value="${list}" label="${list}" title="${list}"></option>`
    })
      }
        </select>
        <p>Merge To</p>
        <select id="select02">
        ${lists.map(list => {
        return `<option value="${list}" label="${list}" title="${list}"></option>`
      })
      }
        </select>
      </div>
      <div class="merge2-btns">
        <button class="ui-button mergeOk" data-type="primary">确定</button>
        <button class="ui-button mergeCancel" data-type="danger">取消</button>
      </div>
    </div>
  `;
    popup(html);
    const popupDom = document.querySelector(".popup")
    const select01 = document.querySelector('#select01')
    const select02 = document.querySelector('#select02')
    const mergeOk = document.querySelector('.mergeOk')
    const mergeCancel = document.querySelector('.mergeCancel')

    mergeOk.onclick = async () => {
      mergeOk.classList.add("loading")
      const res = await window.electronAPI.mergeCode({
        curP: curFolder,
        from: select01.value,
        to: select02.value
      })
      popupDom.remove();
      window.electronAPI.showErrorDialog({
        title: "info",
        message: res
      })
    }
    mergeCancel.onclick = () => {
      popupDom.remove()
    }
  }
}

commitPushCode.onclick = async () => {

  const res = await window.electronAPI.checkStaus({ curP: curFolder })
  if (res?.code === 200) {
    const status = res?.res;
    const html = `
      <div class="commitPush">
        <div class="commitPush-header">
          <div class="commitPush-radio">
            <div class="commitPush-radio-item">
              <input type="radio" id="radio1" value="commit" ${status ? 'disabled' : ""} ${!status ? `checked="checked"` : ""} name="commitpush">
              <label for="radio1" class="ui-radio"></label><label for="radio1">Commit</label>
            </div>
            <div class="commitPush-radio-item">
              <input type="radio" id="radio2" value="push" ${status ? `checked="checked"` : ""} name="commitpush">
              <label for="radio2" class="ui-radio"></label><label for="radio2">Push</label>
            </div>
          </div>
          <div class="commitPush-content">
            <select id="select03" ${status ? 'disabled' : ""}>
              <option class="feat" title="新功能 feature">feat</option>
              <option class="fix" title="修复 bug">fix</option>
              <option class="docs" title="文档注释">docs</option>
              <option class="style" title="代码格式(不影响代码运行的变动)">style</option>
              <option class="refactor" title="重构、优化(既不增加新功能，也不是修复bug)">refactor</option>
              <option class="perf" title="性能优化">perf</option>
              <option class="test" title="增加测试">test</option>
              <option class="chore" title="构建过程或辅助工具的变动">chore</option>
              <option class="revert" title="回退">revert</option>
              <option class="build" title="打包">build</option>
            </select>
            <input class="ui-input" placeholder="请输入 commit 内容" ${status ? 'disabled' : ""}>
          </div>
        </div>
        <div class="commitPush-btns">
          <button class="ui-button commitPushOk" data-type="primary">确定</button>
          <button class="ui-button commitPushCancel" data-type="danger">取消</button>
        </div>
      </div>
    `;
    popup(html);
    const popupDom = document.querySelector(".popup");
    const commitPushOk = document.querySelector(".commitPushOk");
    const commitPushCancel = document.querySelector(".commitPushCancel");
    const radio = document.querySelector('[name="commitpush"]:checked')
    const select = document.querySelector('#select03')
    const input = document.querySelector('.commitPush-content input')
    commitPushOk.onclick = async () => {
      commitPushOk.classList.add('loading')
      const commitContent = `${select.value}:${input.value}`;
      const res = await window.electronAPI.pushCode({
        curP: curFolder,
        commit: commitContent,
        status,
        type: radio.value,
      });
      popupDom.remove();
      window.electronAPI.showErrorDialog({
        title: "info",
        message: res
      })
    }
    commitPushCancel.onclick = () => {
      popupDom.remove()
    }
  }
}

const renderDiff = (lhs, rhs, lan, initlan, p = '', parentDom = null) => {
  console.log('p', p)
  doc = null;
  const html = `
    <div class="diff">
      <div class="diff__header">
        <button class="ui-button" id="Prev" data-type="warning">Prev</button>
        <button class="ui-button" id="Next" data-type="warning">Next</button>
        <button class="ui-button" id="Unmarkup" data-type="warning">Unmarkup</button>
        <button class="ui-button" id="save" data-type="primary">Save</button>
        <button class="ui-button" id="cancel" data-type="danger">Cancel</button>
      </div>
      <div class="diff_left">${lan}</div>
      <div class="diff_right">${initlan}</div>
      <div id="compare"></div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
  let diffDom = document.querySelector(".diff")
  doc = new Mergely("#compare", {
    sidebar: true,
    ignorews: false,
    license: "lgpl-separate-notice",
    lhs,
    rhs
  });
  doc.once('updated', () => {
    doc.once('updated', () => {
      doc.scrollToDiff('next');
    });
  });

  save.onclick = async () => {
    const val = doc.get("lhs");
    const res = await window.electronAPI.updateFile(p, val);
    if (res !== "success") {
      window.electronAPI.showErrorDialog({
        title: "info",
        message: error?.message || error || "Save Fail"
      })
    } else {
      doc = null;
      if (parentDom) parentDom.classList.add("ishandle")
      if (diffDom) diffDom.remove()
    }
  }
  cancel.onclick = () => {
    doc = null;
    if (diffDom) {
      diffDom.remove()
      diffDom = null
    }
  }
  Prev.onclick = () => {
    if (doc) doc.scrollToDiff('prev');
  }
  Next.onclick = () => {
    if (doc) doc.scrollToDiff('next');
  }
  Unmarkup.onclick = () => {
    if (doc) {
      ismark = !ismark;
      if (ismark) {
        doc.diff()
        doc.update()
        Unmarkup.textContent = "Unmarkup"
        Unmarkup.setAttribute("data-type", "warning")
      } else {
        doc.unmarkup()
        Unmarkup.textContent = "setDiff"
        Unmarkup.setAttribute("data-type", "success")
      }
    }
  }
}

getFilesDom.onclick = async () => {
  if (!curFolder) {
    window.electronAPI.showErrorDialog({
      title: "info",
      message: "Please select the folder where the project is located"
    })
    return;
  }
  const initLan = document.querySelector("select[name='lan0']").value
  let AsyncLan = document.querySelectorAll("input[name='async-lan']:checked");
  AsyncLan = Array.from(AsyncLan).map(checkbox => checkbox.value);
  if (!AsyncLan?.length) {
    window.electronAPI.showErrorDialog({
      title: "info",
      message: "Please select Async Lan"
    })
    return;
  }
  let commitVal = document.querySelector(".commitIds").value || '';
  commitVal = commitVal.trim();
  let resultFromCommit = null;
  if (commitVal) {
    try {
      resultFromCommit = await window.electronAPI.getCommitFilesByCommitId(curFolder, commitVal, { initLan, AsyncLan });
      if (!resultFromCommit?.init?.length) {
        window.electronAPI.showErrorDialog({
          title: "info",
          message: "No Files"
        })
        return;
      }
    } catch (error) {
      window.electronAPI.showErrorDialog({
        title: "info",
        message: error?.message || "No Files From CommitId"
      })
      return;
    }
  }
  const result = resultFromCommit || await window.electronAPI.getFiles(curFolder, { initLan, AsyncLan });
  let resultFilterByInitLan = result;
  if (!resultFilterByInitLan?.init?.length) {
    window.electronAPI.showErrorDialog({
      title: "info",
      message: "No modifications to this language"
    })
    return;
  }
  renderTabs(AsyncLan, resultFilterByInitLan, initLan);
  const asyncFiles = document.querySelectorAll(".async-files")
  const syncResources = document.querySelectorAll(".sync-resources")
  const newPaths = document.querySelectorAll(".new-path")
  asyncFiles.forEach(item => {
    item.onclick = async () => {
      item.classList.add('loading')
      const { lan, path, initlan, initpath } = item.parentNode.dataset;
      const sourceImage = `${curFolder}\\${initpath.replaceAll("/", "\\")}`
      const destinationImage = `${curFolder}\\${path.replaceAll("/", "\\")}`;
      try {
        if (initpath.includes("/img/")) {
          const res = await window.electronAPI.copyImg({ sourceImage, destinationImage })
          console.log('res', res)
          if (res !== "success") {
            window.electronAPI.showErrorDialog({
              message: res?.message || res || "copy img fail."
            })
          } else {
            window.electronAPI.showErrorDialog({
              message: "Resource Async Success"
            })
            item.parentNode.classList.add('ishandle')
          }
          item.classList.remove('loading')
          return;
        }
        const initContent = await window.electronAPI.readFile(sourceImage);
        const nowContent = await window.electronAPI.readFile(destinationImage, sourceImage);
        renderDiff(nowContent, initContent, lan, initlan, destinationImage, item.parentNode)
        item.classList.remove('loading')
      } catch (error) {
        console.log('error', error)
        item.classList.remove('loading')
      }
    }
  })
  syncResources.forEach(item => {
    item.onclick = async () => {
      const { lan } = item.dataset;
      let imgs = resultFilterByInitLan.obj[lan];
      imgs = Object.keys(imgs).filter(k => k.includes("/img/"))
      if (!imgs?.length) {
        window.electronAPI.showErrorDialog({
          title: "info",
          message: "No pictures, audio and video resources"
        })
        return;
      }
      for (const key in resultFilterByInitLan.obj[lan]) {
        if (key.includes("/img/")) {
          const source = `${curFolder}\\${key.replaceAll("/", "\\")}`
          const destination = `${curFolder}\\${resultFilterByInitLan.obj[lan][key].replaceAll("/", "\\")}`;
          window.electronAPI.copyImg({ source, destination })
        }
      }
      window.electronAPI.showErrorDialog({
        title: "info",
        message: "copy img success"
      })
    }
  })
  newPaths.forEach(item => {
    item.onclick = () => {
      item.setAttribute("contenteditable", true)
    }
    item.onblur = () => {
      item.setAttribute("contenteditable", false)
    }
    item.oninput = () => {
      item.parentNode.parentNode.setAttribute("data-path", item.textContent)
    }
  })
}

openFolder.onclick = async () => {
  const folderPath = await window.electronAPI.openFolder();
  if (folderPath) {
    compileCode.removeAttribute("disabled")
    pullCode.removeAttribute("disabled")
    discardCode.removeAttribute("disabled")
    mergeCode.removeAttribute("disabled")
    commitPushCode.removeAttribute("disabled")
    curFolder = folderPath;
    let folderArr = curFolder.split("\\")
    folderArr = folderArr.at(-1);
    document.querySelector(".website-name").textContent = folderArr;
    document.querySelector(".website-name").style.display = "block"
    const folders = await window.electronAPI.getSubdirectories(curFolder);
    curFolderLans = folders.filter(item => !item.startsWith(".") && item !== "node_modules" && item !== "buil");
    if (curFolderLans?.length) {
      renderLansHtml()
    } else {
      const wrapperLans = document.querySelectorAll(".wrapper__lan_lans");
      wrapperLans.forEach(item => item.innerHTML = "");
    }
  } else {
    console.log('Folder selection was canceled.');
  }
}

function renderLansHtml() {
  const wrapperLans = document.querySelectorAll(".wrapper__lan_lans");
  wrapperLans.forEach(item => item.innerHTML = "");
  function getHTML(idx) {
    let html = '';
    if (idx === 0) {
      html = `<select name="lan${idx}">`
      html += curFolderLans.map((item) => {
        return `<option value="${item}" label="${item}">`
      }).join('');
      html += `</select>`;
    } else {
      html = curFolderLans.map((item, idx) => {
        return `<div class="wrapper__lan_item">
              <input type="checkbox" id="checkbox${idx}" value="${item}" ${idx === 0 ? 'disabled' : ''} class="dom-${item}" name="async-lan" />
              <label for="checkbox${idx}" class="ui-checkbox"></label>
              <label for="checkbox${idx}">${item}</label>
            </div>`
      }).join('');
    }
    return html;
  }
  wrapperLans.forEach((item, idx) => item.insertAdjacentHTML("beforeend", getHTML(idx)));
  const initLanSelect = document.querySelector("select[name='lan0']");
  if (initLanSelect) {
    initLanSelect.onchange = () => {
      document.querySelectorAll("[name='async-lan']").forEach(item => {
        item.checked = false;
        item.removeAttribute("disabled")
        document.querySelector('.wrapper__right_tabs').innerHTML = "";
      })
      const classes = `.dom-${initLanSelect.value}`
      console.log("classes", classes)
      document.querySelector(classes).setAttribute('disabled', true)
    }

  }
}

compileCode.onclick = async () => {
  compileCode.classList.add('loading')
  const res = await window.electronAPI.compileCode({
    langs: curFolderLans,
    curP: curFolder
  })
  compileCode.classList.remove('loading')
  window.electronAPI.showErrorDialog({
    type: "info",
    message: res?.message || res
  })
}

pullCode.onclick = async () => {
  if (!curFolder) {
    window.electronAPI.showErrorDialog({
      title: "info",
      message: "Please select a folder"
    })
    return;
  }
  pullCode.classList.add('loading')
  const res = await window.electronAPI.pullCode({ curP: curFolder })
  pullCode.classList.remove('loading')
  window.electronAPI.showErrorDialog({
    title: "info",
    message: res?.message || res
  })
}
