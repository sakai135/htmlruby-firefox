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

  var dataset = [];

  console.log('collect');

  for (let i = 0; i < rubyCount; i++) {
    let ruby = rubies[i];
    let rtElems = ruby.querySelectorAll('rt');
    let rpElems = ruby.querySelectorAll('rp');
    let rbWidth = ruby.clientWidth;
    let rubyChars = ruby.textContent.trim().length;
    let groups = [];
    let gElems = [];
    let gWidth = 0;
    let gChars = 0;
    let rpChars = 0;
    let rtChars = 0;

    for (let j = 0, jMax = rtElems.length; j < jMax; j++) {
      let rt = rtElems[j];
      if (gWidth !== 0 && (rt.previousElementSibling === null || rt.previousElementSibling.nodeName.toLowerCase() !== 'rt')) {
        rtChars += gChars;
        groups.push([gWidth, gChars, gElems, 0]);
        gWidth = 0;
        gChars = 0;
        gElems = [];
      }
      gWidth += rt.clientWidth;
      gChars += rt.textContent.trim().length;
      gElems.push([rt, 0]);
    }
    rtChars += gChars;
    groups.push([gWidth, gChars, gElems, 0]);

    for (let j = 0, jMax = rpElems.length; j < jMax; j++) {
      rpChars += rpElems[j].textContent.trim.length;
    }

    dataset.push([rbWidth, rubyChars - rtChars - rpChars, groups]);
  }
  
  console.log('space');

  for (let i = 0; i < rubyCount; i++) {
    let ruby = rubies[i];
    let data = dataset[i];
    let rbWidth = data[0];
    let rbChars = data[1];
    let groups = data[2];
    let maxWidth = rbWidth;

    for (let j = 0, jMax = groups.length; j < jMax; j++) {
      let group = groups[j];
      if (group[0] > maxWidth) {
        maxWidth = group[0];
      }
    }

    if (maxWidth > rbWidth) {
      let perChar = (maxWidth - rbWidth) / rbChars;
      ruby.style.letterSpacing = perChar + 'px';
      ruby.style.textIndent = (perChar / 2) + 'px';
    }

    for (let j = 0, jMax = groups.length; j < jMax; j++) {
      let group = groups[j];
      let gWidth = group[0];
      
      if (maxWidth > gWidth) {
        let gElems = group[2];
        let perChar = (rbWidth - gWidth) / group[1];

        for (let k = 0, kMax = gElems.length; k < kMax; k++) {
          let rt = gElems[k][0];
          group[3] = perChar;
          rt.style.letterSpacing = perChar + 'px';
        }
      }
    }
  }

  console.log('position');

  for (let i = 0; i < rubyCount; i++) {
    let data = dataset[i];
    let groups = data[2];

    for (let j = 0, jMax = groups.length; j < jMax; j++) {
      let group = groups[j];
      let perChar = group[3];
      let gElems = group[2];
      let offset = 0;

      for (let k = 0, kMax = gElems.length; k < kMax; k++) {
        let elem = gElems[k];
        gElems[k][1] = offset + (perChar / 2);
        offset += gElems[k][0].clientWidth;
      }
    }
  }
  for (let i = 0; i < rubyCount; i++) {
    let data = dataset[i];
    let groups = data[2];

    for (let j = 0, jMax = groups.length; j < jMax; j++) {
      let group = groups[j];
      let gElems = group[2];

      for (let k = 0, kMax = gElems.length; k < kMax; k++) {
        gElems[k][0].style.marginLeft = gElems[k][1] + 'px';
      }
    }
  }

  console.log('mark');

  for (let i = 0; i < rubyCount; i++) {
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
