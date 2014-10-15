"use strict";

var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod').PageMod;
var prefs = require('sdk/simple-prefs');
var vals = prefs.prefs;

function setMod() {
  var rubyTextSize = (vals.rubyTextSizeR / 100) + 'em';
  var rubyLineHeight = (vals.rubyLineHeightR / 100) + 'em';

  var contentStyle = [
    'ruby {' +
      'margin-top: ' + (vals.adjustLineHeight ? rubyTextSize : '0px') + ' !important;' +
    '}',
    'rt, rtc {' +
      'font-size: ' + rubyTextSize + ' !important;' +
      'transform: translateY(-' + rubyLineHeight + ') !important;' +
    '}',
    'rt + rtc, rt + rp + rtc, rtc + rtc, rtc + rp + rtc, rt + rp + rt {' +
      'font-size: ' + rubyTextSize + ' !important;' +
      'transform: translateY(calc(1.4em / ' + (vals.rubyTextSizeR / 100) + ')) !important;' +
    '}'
  ];

  if (!vals.spaceRubyText) {
    contentStyle.push(
      'rt, rtc {' +
        'width: 100% !important;' +
        'left: 0px !important;' +
        'letter-spacing: 0px !important;' +
      '}'
    );
    contentStyle.push(
      'rtc rt {' +
        'left: auto !important;' +
        'width: auto !important;' +
        'position: static !important;' +
      '}'
    );
  }

  return pageMod({
    include: ['*'],
    contentScriptFile: [
      data.url('scripts/processor.js'),
      data.url('scripts/content.js')
    ],
    contentScriptOptions: {
      processInsertedContent: vals.processInsertedContent,
      spaceRubyText: vals.spaceRubyText
    },
    contentScriptWhen: 'end',
    contentStyleFile: [
      data.url('styles/htmlruby.css')
    ],
    contentStyle: contentStyle
  });
}

var mod = setMod();

prefs.on('', function onPrefChange() {
  console.log('onPrefChange');
  mod.destroy();
  vals = prefs.prefs;
  mod = setMod();
});
