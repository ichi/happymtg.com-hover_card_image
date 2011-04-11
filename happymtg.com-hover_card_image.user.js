// ==UserScript==
// @name           happymtg.com hover_card_image
// @namespace      happymtg_com_hover_card_image
// @version        0.2.0
// @include        http://www.happymtg.com/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js
// @require        https://github.com/ichi/greasemonkey_console/raw/master/console.js
// ==/UserScript==


var after_loaded_jquery = function($){ // $ = jQuery
if(!$) return;

var $body = $('body');
var $card_links = $('span.cardLink > a');
var datas = {};

var get_data = function($link, name){
    var href = $link.attr('href');
    var data = datas[href];
    if(!data) return false;
    if(name){
        return data[name] || false;
    }
    return data;
}
var set_data = function($link, hash){
    var href = $link.attr('href');
    datas[href] = datas[href] || {};
    $.extend(datas[href], hash);
}

var show_card_img = function($link){
    var data = get_data($link);
    if(!data) return;
    if(!data.hover) return;
    var $img = data.card_img;
    var $text = data.card_text;
    $img.show();
    $text.show();
};

var hide_card_img = function($link){
    var data = get_data($link);
    if(!data) return;
    var $img = data.card_img;
    var $text = data.card_text;
    if($img && $text){
        $img.hide();
        $text.hide();
    }
};

var on_success = function(data, status, xhr){
    var $link = $(this);
    var offset = $link.offset();
    var $data = $(data);
    var width = $link.width(),
    height = $link.height();
    var $img = $data.find('img.jpnItem')
        .css({
            position: 'absolute'
            , display: 'none'
            , top: offset.top + height + 5
            , left: offset.left + width / 2
        })
    var $card_detail = $data.find('#carddetail');
    var text_ja = $card_detail.find('tr.jpnItem:eq(1) > td').text();
    var text_en = $card_detail.find('tr.engItem:eq(1) > td').text();
    var $text = $('<div />')
        .css({
            position: 'absolute'
            , display: 'none'
            , width: 200
            , top: offset.top + height + 5
            , padding: '5px'
            , background: '#ffffee'
            , border: '1px solid #000000'
            , color: '#000000'
        });
    $img.load(function(ev){
        $text.css('left', offset.left + width / 2 + 10 + this.naturalWidth);
    });
    var $hr = $('<hr />')
        .css({
            height: 0
            , margin: '5px 0'
            , border: 'none'
            , 'border-bottom': '1px solid #000000'
        });
    $text
        .append('<div>' + text_ja + '</div>')
        .append($hr)
        .append('<div>' + text_en + '</div>')
    $body
        .append($img)
        .append($text);
    
    set_data($link, {
        card_img: $img
        , card_text: $text
    });
    show_card_img($link);
};

$card_links
    .live('mouseenter', function(ev){
        var $link = $(this);
        set_data($link, {hover: true});
        var data = get_data($link);
        if(data.card_img){
            show_card_img($link);
        }else{
            var href = $link.attr('href');
            $.ajax({
                url: href
                , context: $link[0]
                , type: 'GET'
                , success: on_success
            });
        }
        set_data($link, {hover: true});
    })
    .live('mouseleave', function(ev){
        var $link = $(this);
        set_data($link, {hover: false});
        hide_card_img($link);
    });
};


//main
var jQuery = jQuery || false;
if(jQuery){
    after_loaded_jquery(jQuery);
}else{
    var script = document.createElement("script");
    script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "(" + after_loaded_jquery.toString() + ")(jQuery);";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}
