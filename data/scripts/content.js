"use strict";

console.info(self.options);

if (self.options.spaceRubyText) {
  process();

  if (self.options.processInsertedContent) {
    register();
  }
}
