"use strict";

console.log(self.options);

if (self.options.spaceRubyText) {
  process();

  if (self.options.processInsertedContent) {
    register();
  }
}
