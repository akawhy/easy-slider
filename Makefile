jsdir      := javascripts
coffeedir  := coffee

all: $(jsdir)/es.js

$(jsdir)/%.js: $(coffeedir)/%.coffee
	coffee -o $(jsdir) -b -c $<
