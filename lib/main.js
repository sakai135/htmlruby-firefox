var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod').PageMod;
var prefs = require('sdk/simple-prefs');
var vals = prefs.prefs;

function setMod() {
  return pageMod({
    include: ['*'],
    contentScriptFile: [
      data.url('scripts/util.js'),
      data.url('scripts/rubydata.js'),
      data.url('scripts/processor.js'),
      data.url('scripts/content.js')
    ],
    contentScriptOptions: {
      processInsertedContent: vals['processInsertedContent'],
      spaceRubyText: vals['spaceRubyText'],
      debug: vals['debug']
    },
    contentScriptWhen: 'ready',
    contentStyleFile: [
      data.url('styles/htmlruby.css')
    ],
    contentStyle: [
      'rtc, ruby>rt { font-size: ' + vals['rubyTextSize'] + ' !important; -moz-transform: translateY(-' + vals['rubyLineHeight'] + ') !important }',
      'ruby { margin-top: ' + (vals['adjustLineHeight'] ? vals['rubyTextSize'] : '0px') + ' !important }'
    ]
  });
}

var mod = setMod();

prefs.on('', function onPrefChange() {
  mod.destroy();
  mod = setMod();
});
