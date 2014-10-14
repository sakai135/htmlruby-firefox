"use strict";

var observer;

function process() {
  console.log('process() start');

  var rubies = document.body.querySelectorAll('ruby:not([hr-processed])');
  var rubyCount = rubies.length;

  if (rubyCount < 1) {
    console.log('process() end');
    return;
  }

  stopObserver();

  var dataset = new Array(rubies.length);
  var multi = [];
  var ruby, i, j, rts, rbw, rbl, rt, rtw, rtl, data, perChar, rps, rpl, iMax, jMax;

  console.log('collect');

  for (i = 0; i < rubyCount; i++) {
    ruby = rubies[i];
    rbw = ruby.clientWidth;
    rbl = ruby.textContent.trim().length;
    rts = ruby.querySelectorAll('rt');
    if (rts.length > 1) {
      multi.push(i);
      rtw = 0;
      rtl = 0;
      for (j = 0, jMax = rts.length; j < jMax; j++) {
        rt = rts[j];
        rtw += rt.clientWidth;
        rtl += rt.textContent.trim().length;
      }
    } else {
      rt = rts[0];
      rtw = rt.clientWidth;
      rtl = rt.textContent.trim().length;
    }
    rpl = 0;
    rps = ruby.querySelectorAll('rp');
    for (j = 0, jMax = rps.length; j < jMax; j++) {
      rpl += rps[j].textContent.trim().length;
    } 
    dataset[i] = [rtw, rtl, rbw, rbl - rtl - rpl, rts];
  }

  console.log('space');

  for (i = 0; i < rubyCount; i++) {
    ruby = rubies[i];
    data = dataset[i];
    rtw = data[0];
    rtl = data[1];
    rbw = data[2];
    rbl = data[3];
    rts = data[4];
    if (rbw > rtw) {
      perChar = (rbw - rtw) / rtl;

      ruby.style.maxWidth = rbw + 'px';
      for (j = 0, jMax = rts.length; j < jMax; j++) {
        rt = rts[j];
        rt.style.letterSpacing = perChar + 'px';
        rt.style.left = (j > 0 ? perChar : (perChar / 2)) + 'px';
      }
    } else {
      perChar = (rtw - rbw) / rbl;

      ruby.style.maxWidth = rtw + 'px';
      ruby.style.letterSpacing = perChar + 'px';
      ruby.style.textIndent = perChar / 2 + 'px';
    }
  }

  console.log('multi');

  rtw = new Array(multi.length);
  for (i = 0, iMax = multi.length; i < iMax; i++) {
    rts = dataset[multi[i]][4];
    rtl = new Array(rts.length);
    rbw = 0;
    for (j = 0, jMax = rts.length; j < jMax; j++) {
      rtl[j] = rbw;
      rbw += rts[j].clientWidth;
    }
    rtw[i] = rtl;
  }
  for (i = 0, iMax = multi.length; i < iMax; i++) {
    rts = dataset[multi[i]][4];
    rtl = rtw[i];
    for (j = 0, jMax = rts.length; j < jMax; j++) {
      rts[j].style.marginRight = rtl[j] + 'px';
    }
  }

  console.log('mark');

  for (i = 0; i < rubyCount; i++) {
    rubies[i].setAttribute('hr-processed', 1);
  }

  startObserver();

  console.log('process() end');
}

function register() {
  console.log('register() start');

  function checkNode(node) {
    return node.nodeType === Node.ELEMENT_NODE &&
      (node.nodeName.toLowerCase() === 'ruby' || node.querySelector('ruby')) &&
      node.querySelector('rt');
  }
  function checkMutation(mutation) {
    var i;
    for (i = mutation.addedNodes.length; i--;) {
      if (checkNode(mutation.addedNodes[i])) {
        console.log('observer found inserted ruby');
        return true;
      }
    }
    return false;
  }
  function onMutations(mutations) {
    var i, mutation;
    for (i = mutations.length; i--;) {
      mutation = mutations[i];
      if (mutation.type === 'childList' && mutation.addedNodes && checkMutation(mutation)) {
        process();
        break;
      }
    }
  }

  observer = new MutationObserver(onMutations);
  startObserver();

  console.log('register() end');
}

function startObserver() {
  if (observer) {
    console.log('starting observer');

    observer.observe(document.body, {
      childList: true,
      attributes: false,
      characterData: false,
      subtree: true
    });

    console.log('started observer');
  }
}

function stopObserver() {
  if (observer) {
    console.log('stopping observer');

    observer.disconnect();

    console.log('stopped observer');
  }
}
