var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod').PageMod;
var prefs = require('sdk/simple-prefs');
var vals = prefs.prefs;

function setMod() {
  var contentStyle = [
    'ruby { margin-top: ' + (vals.adjustLineHeight ? vals.rubyTextSize : '0px') + ' !important }',
    'rt, rt + rtc, rtc + rtc { font-size: ' + vals.rubyTextSize + ' !important; transform: translateY(-' + vals.rubyLineHeight + ') !important }',
    'rt + rtc, rtc + rtc { bottom: -' + vals.rubyTextSize + ' !important }'
  ];

  if (!vals.spaceRubyText) {
    contentStyle.push('rt, rt + rtc, rtc + rtc { width: 100% !important; right: 0px !important; letter-spacing: 0px !important }');
  }

  return pageMod({
    include: ['*'],
    contentScriptFile: [
      data.url('scripts/utils.js'),
      data.url('scripts/processor.js'),
      data.url('scripts/content.js')
    ],
    contentScriptOptions: {
      processInsertedContent: vals.processInsertedContent,
      spaceRubyText: vals.spaceRubyText,
      debug: vals.debug
    },
    contentScriptWhen: 'ready',
    contentStyleFile: [
      data.url('styles/htmlruby.css')
    ],
    contentStyle: contentStyle
  });
}

var mod = setMod();

prefs.on('', function onPrefChange() {
  mod.destroy();
  mod = setMod();
});
