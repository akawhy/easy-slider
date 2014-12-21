getHeight = ->
  $(window).height()

getWidth = ->
  $(window).width()

render_inline_makeup = (line) ->
  return line.replace(/</g, "&lt;").
              replace(/>/g, "&gt;").
              replace(/"/g, "&quot;").
              replace(/'/g, "&apos;").
              replace(/{{(\w+)\|(.+?)}}/g, "<span class=\"$1\">$2</span>")

T_COMMON = 0
T_CODE   = 1
T_IMAGE  = 2

to_type = (str) ->
    type = 0
    switch str
        when "code"  then type = T_CODE
        when "image" then type = T_IMAGE

    return type

type_cb = [
  null,
  {
    render: (slide) ->
      slide.html_nodes.push $('<pre><code>' + slide.raw_text + '</code></pre>')
    post_render: ->
      console.log("run post_render")
      $('pre code').each (i, block) ->
        hljs.highlightBlock(block)
  },
  {
    render: (slide) ->
      div = $('<div></div>')
      div.css 'text-align', 'center'

      params = slide.raw_text.match /(\S+)\s+(\d+)\s+(\d+)/
      if params
        img = $('<img></img>')
        img.attr('src', params[1])
        img.width(params[2])
        img.height(params[3])

        div.append img
        
        slide.html_nodes.push div
      else
        console.log 'bad content'
    post_render: ->
      return
  }
]

class SimpleSlider
  constructor: ->
    @size      = 9
    @container = $('#container')
    @content   = $('#content')

    ## get slide text
    @raw_content = $('#raw_content').text()
    @slides      = @pre_init(@raw_content)

    @current_page_number = 0
    @max_page_number     = @slides.length - 1

    @show @current_page_number

  pre_init: (raw_content) ->
    console.log raw_content

    ## split the raw_content into each slide
    raw_slides = raw_content.split /^-----\s*$/m

    slides = []
    for rs in raw_slides
      continue if rs.match /^\s*$/    # skip empty slide

      type = T_COMMON
      s    = rs

      special_type = rs.match /^=(\w+)([\s\S]*)/m
      if special_type
        type = to_type special_type[1]
        s    = special_type[2].trim()

      slides.push {
        type      : type
        raw_text  : s
        rendered  : false
      }

    return slides

  ## set the slide html content
  render: (slide) ->
    type     = slide.type
    raw_text = slide.raw_text

    slide.html_nodes = []

    tbcb = type_cb[slide.type]
    if tbcb
      tbcb.render slide
      return slide.rendered = true

    lines  = raw_text.split("\n")

    append_ul = (nodes, ul) ->
      nodes.push($('<div></div>').append ul)

    ul  = null
    while (line = lines.shift())?
      rendered_line = render_inline_makeup line
      console.log rendered_line

      # two case
      if rendered_line.match /^\s*$/
        if ul?
          append_ul slide.html_nodes, ul
          ul = null

        p = $('<div>&nbsp</div>')
        p.addClass 'pre-big'
        p.css 'align', 'left'
        slide.html_nodes.push p

      else if rendered_line.match /^\s+/
        ul ?= $('<ul></ul>')

        li = $("<li>" + rendered_line + "</li>")
        ul.append li

      else
        ## status changed
        if ul?
          append_ul slide.html_nodes, ul
          ul = null

        p = $("<div>" + rendered_line + "</div>")
        p.css('text-align', 'center')

        slide.html_nodes.push p

    if ul?
        append_ul slide.html_nodes, ul
        ul = null

    #slide.html_text = slide.html_nodes.join(' ')
    slide.rendered = true

  ## set the content fontsize
  set_fontsize: (size) ->
    fontsize = if size < 1 then 1 else size
    fontsize = fontsize + 'px'

    @content.css('font-size', fontsize)


  #################################
  ## resize the container        ##
  ## most important function     ##
  ## too hard for me, so magic   ##
  #################################
  resize: () ->
    if @content == null
      console.log('@content is null')
      return

    #return
    @set_fontsize @size

    console.log(@content.height())

    if @content.height()
      container_h = getHeight()
      @container.height(container_h)
      container_w = getWidth()

      @container.css('width', '9999px')
      @content.css('float', 'left')

      content_w = @content.width()

      #console.log "content_w #{content_w}"
      #console.log "container_h #{container_h} container_w #{container_w}"

      new_fs = Math.floor(container_w / content_w * @size)

      @set_fontsize new_fs

      ## clean container css, for resize
      @container.css('width', '')
      @content.css('float', '')

      content_h    = @content.height()
      container_h  = @container.height()

      if content_h > container_h
        new_fs = Math.ceil(container_h / content_h * new_fs)
        @set_fontsize new_fs

      console.log "content_h #{content_h}"
      console.log "container_h #{container_h}"

      diff = container_h - content_h
      if diff > 20
        @content.css('top', diff / 2.8 + 'px')


  show: (page_number) ->
    slide = @slides[page_number]

    @content.empty()
    @content.css('top', '0px')
    container_h = getHeight()
    @container.height(container_h)

    @render @slides[page_number] unless slide.rendered

    ## set the content element's content
    @content.append slide.html_nodes

    @resize()

    tbcb = type_cb[slide.type]
    if tbcb
      tbcb.post_render()

  ## key action related
  next: ->
    unless @current_page_number + 1 > @max_page_number
      @current_page_number++
      @show @current_page_number

  last: ->
    unless @current_page_number - 1 < 0
      @current_page_number--
      @show @current_page_number


## here we go~
$ ->
  ss = new SimpleSlider

  $(document).keydown (e) ->
    key = e.which

    switch key
      when 37                 ## left
        ss.last()
      when 39                 ## right
        ss.next()

#
#   - Licence
#   - from sprox.js
#
#   - Version: MPL 1.1 
#   - 
#   - The contents of this file are subject to the Mozilla Public License Version 
#   - 1.1 (the "License"); you may not use this file except in compliance with 
#   - the License. You may obtain a copy of the License at 
#   - http://www.mozilla.org/MPL/ 
#   - 
#   - Software distributed under the License is distributed on an "AS IS" basis, 
#   - WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License 
#   - for the specific language governing rights and limitations under the 
#   - License. 
#   - 
#   - The Original Code is the Takahashi-Method-based Presentation Tool in XUL. 
#   - 
#   - The Initial Developer of the Original Code is SHIMODA Hiroshi. 
#   - Portions created by the Initial Developer are Copyright (C) 2005 
#   - the Initial Developer. All Rights Reserved. 
#   - 
#   - Contributor(s): SHIMODA Hiroshi <piro@p.club.ne.jp> 
