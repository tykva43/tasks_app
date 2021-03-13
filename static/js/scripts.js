var left_menu_width = 300;
var left_menu_margin = 0;
var left_min_menu = 50;
var slider_width = 160;
var width_of_others = 140;
var content_padding_width = 25;
var random_colors = ['#FFB6B9', '#BBDED6', '#29F087', '#A73DE3', '#E33927', ];
var content_left_margin = left_min_menu;

function div(val, by){
    return (val - val % by) / by;
}

$(document).ready(function() {

    $('.expander').on('click', function() {
        $(this).toggleClass('rotated');
        $('.groups_list').toggleClass('invisible');
    });

    $('.menu_item').on( 'click', function() {

        $('#flip_toggle').toggleClass('flip');

        if ($('.left_menu.pop_up_menu').css('margin-left') == left_min_menu.toString() + "px") { // если левое меню выдвинуто
            // задвинуть левое меню
            $('.left_menu.pop_up_menu').css('margin-left', (-left_menu_width).toString() + 'px');

            // изменить ширину для уменьшения контента
            width_of_others += left_menu_width
            // изменить маргин контента
            content_left_margin -= left_menu_width
            changeContentWidth();
        }
        else {
            // вытащить левое меню
            $('.left_menu.pop_up_menu').css('margin-left', left_min_menu.toString() + "px");
/*
            // изменить ширину для уменьшения контента
            width_of_others = left_menu_width;
            // изменить маргин контента
            content_left_margin += left_menu_width;
            changeContentWidth();*/
        }

        if ($('.left_menu').css('margin-left') == '50px') {
            left_menu_margin += 300;
            console.log(left_menu_margin);
            }
        else {
            left_menu_margin -= 300;
            console.log(left_menu_margin);
            }
    });

    changeContentWidth();

    $(window).on( "resize", changeContentWidth );

    $("[data-tooltip]").mousemove(function(event) {
        $data_tooltip = $(this).attr("data-tooltip");
        if ($(".left_min_menu").is(':hidden')) {
             $(".tooltip").text($data_tooltip)
            .css({"top": event.pageY + 5,
                  "left": event.pageX + 5})
            .show();
        }
        else {
            $(".tooltip").text($data_tooltip)
            .css({"top": event.pageY + 5,
                  "left": event.pageX -75 })
            .show();
        }

    }).mouseout(function() {
        $(".tooltip").hide()
                     .text("")
                     .css({
                        "top": 0,
                        "left": 0
                     });
    });

});

function changeContentWidth() {
        $( ".content" ).css("width", ( $(window).width() - left_min_menu - width_of_others ).toString()+ "px");
        $('.left_menu').addClass('pop_up_menu');
        $('.left_menu.pop_up_menu').css('margin-left', left_menu_margin.toString() + 'px');
}