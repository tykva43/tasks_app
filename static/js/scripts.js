var is_menu_opened = 0;
var MEDIUM_LVL = '#ffd700',
    LOW_LVL = '#cc0000',
    HIGH_LVL = '#7cfc00'


    function div(val, by) {
        return (val - val % by) / by;
    }

    function onExpanderClicked() {
        $(this).toggleClass('rotated');
        $(this).parents('.expander_wrapper').eq(0).find('.drop_down_list').toggleClass('invisible');
    }

    // Changes task marker status and statuses of related subtasks and update tasklist readiness
    function taskMarkerClicked(obj) {
        obj.toggleClass('fa-square-o fa-check-square-o');
        var is_task_completed = obj.hasClass('fa-check-square-o');
        var subtasks = obj.parents('.tasklist_block').find('.subtask_marker');
        obj.parents('.tasklist_block').find('.subtask_marker').each(function() {
           var is_subtask_completed = $(this).hasClass('fa-check-square-o');
           if (is_subtask_completed != is_task_completed)
               $(this).toggleClass('fa-square-o fa-check-square-o');
        });
    };

    function updateReadiness(obj, tlReadiness) {
        console.log('im here')
        readinessInPercents = tlReadiness * 100;
        var color;
        if (readinessInPercents <= 25)
            color = LOW_LVL;
        else if (readinessInPercents <= 75)
            color = MEDIUM_LVL;
            else
            color = HIGH_LVL;
        obj.children('.ready').css({'width': readinessInPercents.toString() + '%', 'background-color': color});
    }

    // Changes subtask status
    function subtaskMarkerClicked(obj, is_task_toggled) {
        if (is_task_toggled) {
            obj.parents('.subtask_block').siblings('.task_block').find('.task_marker').eq(0).toggleClass('fa-square-o fa-check-square-o');
        }
        obj.toggleClass('fa-square-o fa-check-square-o');
    };

    // Insert new task
    function insertTask(new_task) {
    var is_favorite = new_task.fields.is_favorite? "fas": "far";
    var task_block = `<div class=\"expander_wrapper\">
                            <div class=\"task_block_wrapper\">
                                <div class=\"expander task_expander rotated\">
                                    <i class=\"fas fa-angle-down\"></i>
                                </div>
                                <div class=\"list_elem task_block pointer flex_div\">
                                    <i class=\"fa fa-square-o task_marker\" id=\"t${new_task.pk}\" aria-hidden=\"true\"></i>
                                    ${new_task.fields.title}
                                </div>
                                <i class=\"${is_favorite} fa-star\" id=\"f${new_task.pk}\"></i>
                            </div>
                            <div class=\"subtask_block drop_down_list invisible\">
                                <div class=\"description\">There are no subtasks yet
                                </div>
                            </div>
                       </div>`;

        var tasklist_id = "#l" + new_task.fields.tasklist;
        $(tasklist_id).children('.description').remove();    // Remove the description that there are no tasks in this task list
        $(tasklist_id).append(task_block);                   // Append task block in html
        $(tasklist_id).find('.expander').click(onExpanderClicked);
    };

    // Update is_favorite field
    function updateFavoriteStatus(obj, url) {
        $.ajax({
	            method: 'post',
                data: {'csrfmiddlewaretoken': getCookie('csrftoken')},
                url: url,
                success: function(data) {
                    if (data.is_successful)
                        obj.toggleClass('far fas');
                }
        });
    };

    function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
    };

    // Update the readiness value for all tasklists in the document
    function updateAllTasklistsReadiness() {
        var tasklists = $('#tasklists').children('.expander_wrapper');
        tasklists.each(function() {
            var tasks = $(this).find('.tasklist_block').children('.expander_wrapper');
            var tasksCount = tasks.length;
            var completedTasksCount = 0;
            tasks.find('.task_marker').each(function() {
                completedTasksCount += $(this).hasClass('fa-check-square-o')? 1 : 0;
            })
            console.log('tasksCount', tasksCount);
            console.log('completedTasksCount', completedTasksCount);
            console.log('completedTasksCount/tasksCount', completedTasksCount/tasksCount);
            updateReadiness($(this).find('.readiness'), completedTasksCount/tasksCount);
        });
        var tasks =
        console.log(tasklists);
    }

$(document).ready(function() {

    changeContentWidth();

    updateAllTasklistsReadiness();

    $(window).scroll(function(){
        var scrollTop = $(this).scrollTop();
        var taskFormHeight = $('.task_form').outerHeight();
        var windowHeight = $(window).height();
        var tasklistsTop = $('#tasklists').offset().top;
        if(windowHeight - tasklistsTop + scrollTop >= taskFormHeight) {
        var delta;
            if (scrollTop <= tasklistsTop)
                delta = (windowHeight - (tasklistsTop- scrollTop) - taskFormHeight)/2 ;
            else
                delta = (windowHeight - taskFormHeight)/2 + scrollTop - tasklistsTop ;
            $('.task_form').css({'margin-top': delta.toString() + "px"});
        }
        else
            $('.task_form').css({'margin-top': "0px"});
    });

    $( "#id_deadline" ).datetimepicker({format: 'Y-m-d H:i'});

    $('.expander').on('click', onExpanderClicked);

    $('.drop_down_menu').on('click', function() { $(this).children('.drop_down_menu_content').toggleClass('invisible') });

    $('.menu_item').on('click', menuItemClicked);

    $(window).on( "resize", changeContentWidth);

   /* $("[data-tooltip]").mousemove(function(event) {
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
                  "left": event.pageX - 75 })
            .show();
        }

    }).mouseout(function() {
        $(".tooltip").hide()
                     .text("")
                     .css({
                        "top": 0,
                        "left": 0
                     });
    });*/
});

function changeContentWidth() {

    var left_min_menu_width = $('.left_min_menu').width();
    var content_outer_width = $('.content').innerWidth() - $('.content').width();
    var left_menu_width = is_menu_opened * $('.left_menu').width();
    var content_left_margin = left_menu_width;

    $(".content").css("width", ( $(window).width() - content_outer_width - left_menu_width - left_min_menu_width).toString()+ "px");
    $('.content').css('margin-left', content_left_margin.toString() + 'px');
}

function menuItemClicked() {

    $('#flip_toggle').toggleClass('flip');
    $('.left_menu').toggleClass('pop_up_menu');

    var left_min_menu_width = $('.left_min_menu').width();
    var left_menu_width = $('.left_menu').width();

    if ($('.left_menu').css('margin-left') == $('.left_min_menu').width().toString() + "px") { // если левое меню выдвинуто
        // задвинуть левое меню
        is_menu_opened = 0;
        $('.left_menu').css('margin-left', (-left_menu_width).toString() + 'px');
        changeContentWidth();
    }
    else {
        // вытащить левое меню
        is_menu_opened = 1;
        $('.left_menu').css('margin-left', left_min_menu_width.toString() + "px");
        changeContentWidth();
        }
    }