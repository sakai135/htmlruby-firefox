log('processor.js');

function process() {
  log('processor.process()');

  var rubies = document.body.querySelectorAll('ruby:not([hr-processed])');

  if (rubies.length < 1) {
    return;
  }

  var dataset = new Array(rubies.length);
  var multi = [];
  var ruby, i, j, rts, rbw, rbl, rt, rtw, rtl, perChar, rpl, rps;

  log('found rubies, starting collection');

  for (i = rubies.length; i--;) {
    ruby = rubies[i];
    rbw = ruby.clientWidth;
    rbl = ruby.textContent.trim().length;
    rts = ruby.querySelectorAll('rt');
    if (rts.length > 1) {
      multi.push(i);
      rtw = 0;
      rtl = 0;
      for (j = rts.length; j--;) {
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
    for (j = rps.length; j--;) {
      rpl += rps[j].textContent.trim().length;
    } 
    dataset[i] = [rtw, rtl, rbw, rbl - rtl - rpl, rts];
  }

  log('collection done, starting spacing');

  for (i = rubies.length; i--;) {
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
      for (j = rts.length; j--;) {
        rt = rts[j];
        rt.style.letterSpacing = perChar + 'px';
        rt.style.right = -(j > 0 ? perChar : (perChar / 2)) + 'px';
      }
    } else {
      perChar = (rtw - rbw) / rbl;

      ruby.style.width = rtw + 'px';
      ruby.style.letterSpacing = perChar + 'px';
      ruby.style.textIndent = perChar / 2 + 'px';
    }
  }

  log('spacing done, correcting multi');

  rtw = new Array(multi.length);
  for (i = multi.length; i--;) {
    rts = dataset[multi[i]][4];
    rtl = new Array(rts.length);
    rbw = 0;
    for (j = rts.length; j--;) {
      rtl[j] = rbw;
      rbw += rts[j].clientWidth;
    }
    rtw[i] = rtl;
  }
  for (i = multi.length; i--;) {
    rts = dataset[multi[i]][4];
    rtl = rtw[i];
    for (j = rts.length; j--;) {
      rts[j].style.marginRight = rtl[j] + 'px';
    }
  }

  log('correcting multi done');

  for (i = rubies.length; i--;) {
    rubies[i].setAttribute('hr-processed', 1);
  }
}
function register() {
  log('processor.onResume()');

  function checkNode(node) {
  return node.nodeType === Node.ELEMENT_NODE && (node.nodeName.toLowerCase() === 'ruby' || node.querySelector('ruby'));
  }
  function checkMutation(mutation) {
  var i = 0, max = mutation.addedNodes.length, node;
  for (; i<max; i++) {
    node = mutation.addedNodes[i];
    if (checkNode(node)) {
    log('observer found inserted ruby');
    return true;
    }
  }
  return false;
  }
  function onMutations(mutations) {
  var i = 0, max = mutations.length, mutation;
  for (; i<max; i++) {
    mutation = mutations[i];
    if (mutation.type === 'childList' && mutation.addedNodes && checkMutation(mutation)) {
    flush();
    break;
    }
  }
  }

  observer = new MutationObserver(onMutations);
  observer.observe(document.body, {
  childList: true,
  attributes: false,
  characterData: false,
  subtree: true
  });
}
