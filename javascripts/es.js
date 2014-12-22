// Generated by CoffeeScript 1.8.0
var SimpleSlider, T_CODE, T_COMMON, T_IMAGE, getHeight, getWidth, render_inline_makeup, to_type, type_cb;

getHeight = function() {
  return $(window).height();
};

getWidth = function() {
  return $(window).width();
};

render_inline_makeup = function(line) {
  return line.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/{{(\w+)\|(.+?)}}/g, "<span class=\"$1\">$2</span>");
};

T_COMMON = 0;

T_CODE = 1;

T_IMAGE = 2;

to_type = function(str) {
  var type;
  type = 0;
  switch (str) {
    case "code":
      type = T_CODE;
      break;
    case "image":
      type = T_IMAGE;
  }
  return type;
};

type_cb = [
  null, {
    render: function(slide) {
      return slide.html_nodes.push($('<pre><code>' + slide.raw_text + '</code></pre>'));
    },
    post_render: function() {
      console.log("run post_render");
      return $('pre code').each(function(i, block) {
        return hljs.highlightBlock(block);
      });
    }
  }, {
    render: function(slide) {
      var div, height, img, params, width;
      div = $('<div></div>');
      div.css('text-align', 'center');
      params = slide.raw_text.match(/(\S+)\s+(\d+)\s+(\d+)/);
      if (params) {
        img = $('<img></img>');
        img.attr('src', params[1]);
        width = parseInt(params[2], 10);
        height = parseInt(params[3], 10);
        if (width !== 0) {
          img.width(width);
        } else {
          img.width('90%');
        }
        if (height !== 0) {
          img.height(height);
        } else {
          img.height("auto");
        }
        div.append(img);
        return slide.html_nodes.push(div);
      } else {
        return console.log('bad content');
      }
    },
    post_render: function() {}
  }
];

SimpleSlider = (function() {
  function SimpleSlider() {
    this.size = 9;
    this.container = $('#container');
    this.content = $('#content');
    this.raw_content = $('#raw_content').text();
    this.slides = this.pre_init(this.raw_content);
    this.current_page_number = 0;
    this.max_page_number = this.slides.length - 1;
    this.show(this.current_page_number);
  }

  SimpleSlider.prototype.pre_init = function(raw_content) {
    var raw_slides, rs, s, slides, special_type, type, _i, _len;
    console.log(raw_content);
    raw_slides = raw_content.split(/^-----\s*$/m);
    slides = [];
    for (_i = 0, _len = raw_slides.length; _i < _len; _i++) {
      rs = raw_slides[_i];
      if (rs.match(/^\s*$/)) {
        continue;
      }
      type = T_COMMON;
      s = rs;
      special_type = rs.match(/^=(\w+)([\s\S]*)/m);
      if (special_type) {
        type = to_type(special_type[1]);
        s = special_type[2].trim();
      }
      slides.push({
        type: type,
        raw_text: s,
        rendered: false
      });
    }
    return slides;
  };

  SimpleSlider.prototype.render = function(slide) {
    var append_ul, li, line, lines, p, raw_text, rendered_line, tbcb, type, ul;
    type = slide.type;
    raw_text = slide.raw_text;
    slide.html_nodes = [];
    tbcb = type_cb[slide.type];
    if (tbcb) {
      tbcb.render(slide);
      return slide.rendered = true;
    }
    lines = raw_text.split("\n");
    append_ul = function(nodes, ul) {
      return nodes.push($('<div></div>').append(ul));
    };
    ul = null;
    while ((line = lines.shift()) != null) {
      if (line.match(/^#/)) {
        continue;
      }
      rendered_line = render_inline_makeup(line);
      console.log(rendered_line);
      if (rendered_line.match(/^\s*$/)) {
        if (ul != null) {
          append_ul(slide.html_nodes, ul);
          ul = null;
        }
        p = $('<div>&nbsp</div>');
        p.addClass('pre-big');
        p.css('align', 'left');
        slide.html_nodes.push(p);
      } else if (rendered_line.match(/^\s+/)) {
        if (ul == null) {
          ul = $('<ul></ul>');
        }
        li = $("<li>" + rendered_line + "</li>");
        ul.append(li);
      } else {
        if (ul != null) {
          append_ul(slide.html_nodes, ul);
          ul = null;
        }
        p = $("<div>" + rendered_line + "</div>");
        p.css('text-align', 'center');
        slide.html_nodes.push(p);
      }
    }
    if (ul != null) {
      append_ul(slide.html_nodes, ul);
      ul = null;
    }
    return slide.rendered = true;
  };

  SimpleSlider.prototype.set_fontsize = function(size) {
    var fontsize;
    fontsize = size < 1 ? 1 : size;
    fontsize = fontsize + 'px';
    return this.content.css('font-size', fontsize);
  };

  SimpleSlider.prototype.resize = function() {
    var container_h, container_w, content_h, content_w, diff, new_fs;
    if (this.content === null) {
      console.log('@content is null');
      return;
    }
    this.set_fontsize(this.size);
    console.log(this.content.height());
    if (this.content.height()) {
      container_h = getHeight();
      this.container.height(container_h);
      container_w = getWidth();
      this.container.css('width', '9999px');
      this.content.css('float', 'left');
      content_w = this.content.width();
      new_fs = Math.floor(container_w / content_w * this.size);
      this.set_fontsize(new_fs);
      this.container.css('width', '');
      this.content.css('float', '');
      content_h = this.content.height();
      container_h = this.container.height();
      if (content_h > container_h) {
        new_fs = Math.ceil(container_h / content_h * new_fs);
        this.set_fontsize(new_fs);
      }
      console.log("content_h " + content_h);
      console.log("container_h " + container_h);
      diff = container_h - content_h;
      if (diff > 20) {
        return this.content.css('top', diff / 3 + 'px');
      } else if (this.content.css('top') !== "0px") {
        return this.content.css('top', '0px');
      }
    }
  };

  SimpleSlider.prototype.show = function(page_number, cb) {
    var container_h, slide, tbcb;
    slide = this.slides[page_number];
    this.content.empty();
    this.content.css('top', '0px');
    container_h = getHeight();
    this.container.height(container_h);
    if (!slide.rendered) {
      this.render(this.slides[page_number]);
    }
    this.content.append(slide.html_nodes);
    this.resize();
    tbcb = type_cb[slide.type];
    if (tbcb) {
      tbcb.post_render();
    }
    if (cb) {
      return setTimeout(cb, 100);
    }
  };

  SimpleSlider.prototype.next = function() {
    if (!(this.current_page_number + 1 > this.max_page_number)) {
      this.current_page_number++;
      return this.show(this.current_page_number);
    }
  };

  SimpleSlider.prototype.last = function() {
    if (!(this.current_page_number - 1 < 0)) {
      this.current_page_number--;
      return this.show(this.current_page_number);
    }
  };

  SimpleSlider.prototype.print_pdf = function() {
    var content, div, h, i, proc, step;
    div = $('<div></div>');
    content = this.content;
    h = this.container.height;
    i = this.slides.length - 1;
    step = (function(_this) {
      return function() {
        console.log("print pdf " + _this.current_page_number);
        div.prepend(content.clone().attr("_id", _this.current_page_number).css({
          'height': h,
          'page-break-after': 'always'
        }));
        if (_this.current_page_number > 0) {
          _this.current_page_number -= 1;
          return setTimeout(proc, 0);
        } else {
          div.prependTo(document.body);
          return window.print();
        }
      };
    })(this);
    proc = (function(_this) {
      return function() {
        console.log("begin to print pdf");
        return _this.show(_this.current_page_number, step);
      };
    })(this);
    this.current_page_number = i;
    return proc();
  };

  return SimpleSlider;

})();

$(function() {
  var ss;
  ss = new SimpleSlider;
  return $(document).keydown(function(e) {
    var key;
    key = e.which;
    switch (key) {
      case 37:
        return ss.last();
      case 39:
        return ss.next();
      case 50:
        return ss.print_pdf();
      default:
        return console.log("unknow key " + key);
    }
  });
});
