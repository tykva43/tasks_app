var isMenuOpened = 0;
var MEDIUM_LVL = '#ffd700',
    LOW_LVL = '#cc0000',
    HIGH_LVL = '#7cfc00'
var taskInfo;
var isCreating = false;

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
                                <div class=\"list_elem_wrapper\">
                                    <div class=\"list_elem task_block pointer flex_div\">
                                        <i class=\"fa fa-square-o task_marker\" id=\"t${new_task.pk}\" aria-hidden=\"true\"></i>
                                        ${new_task.fields.title}
                                    </div>
                                    <div class=\"list_elem_controls\">
                                        <i class=\"${is_favorite} fa-star\" id=\"f${new_task.pk}\"></i>
                                        <i class=\"far fa-trash-alt\" id=\"d${new_task.pk}\"></i>
                                    </div>
                                </div>
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
        $(tasklist_id).find(`#d${new_task.pk}`).on('click', deleteTask);
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

    // Change type (for creating or for updating a task) for task form
    function changeTaskFormType(type) {
        switch (type) {
            case "update":
                if (isCreating) {
                    onSubmitUpdateForm(true);
                    onSubmitCreateForm(false);
                    isCreating = !isCreating;
                }
                $('.task_form').find('h2').text('Task Info');
                $('.task_form').find('form').toggleClass('create_form', false).toggleClass('update_form', true);
                $('.task_form').find('.create_task').text('Update');
                $('.task_form').find('label').css({ 'color': 'white'});
                $('.task_form').css({'background-color': 'rgb(110, 3, 35)'});
                $('.task_form').children('h2').css({'color': 'white'});
                break;
            case "create":
                if (!isCreating) {
                    onSubmitUpdateForm(false);
                    onSubmitCreateForm(true);
                    isCreating = !isCreating;
                }
                $('.task_form').find('h2').text('Task creating');
                $('.task_form').find('form').toggleClass('create_form', true).toggleClass('update_form', false);
                $('.task_form').find('.create_task').text('Create');
                $('.task_form').css({'background-color': '#dfdfdf', 'color': '#480323'});
                $('.task_form').find('label').css({'color': '#480323'});
                $('.task_form').children('h2').css({'color': '#480323'});
                cleanTaskFormFields();
        }
    };

    // Clean all the fields of task form
    function cleanTaskFormFields() {
        var form = $('.task_form').children('form');
        form.find('#id_title').val('');
        form.find('#id_description').text('');
        form.find('#id_deadline').val('');
        form.find('#id_notification').val($(form.find('#id_notification')).children('option').eq(0).val());
        form.find('#id_priority').val($(form.find('#id_priority')).children('option').eq(0).val());
        form.find('#id_is_favorite').prop("checked", false);
        form.find('#id_tasklist').val($(form.find('#id_tasklist')).children('option').eq(0).val());
    }

    // Fill in task form with input task
    function fillInTaskForm(task) {
        taskInfo = task;
        var form = $('.task_form').children('form');
        form.find('#id_title').val(taskInfo.fields.title);
        form.find('#id_description').text(taskInfo.fields.description);
        form.find('#id_deadline').val(taskInfo.fields.deadline);
        form.find('#id_notification').val(taskInfo.fields.notification);
        form.find('#id_priority').val(taskInfo.fields.priority);
        form.find('#id_is_favorite').prop("checked", taskInfo.fields.is_favorite) ;
        form.find('#id_tasklist').val(taskInfo.fields.tasklist);
    };

    // Update the readiness value or a certain tasklist
    function updateTasklistReadiness(tasklist) {
        var tasks = tasklist.find('.tasklist_block').children('.expander_wrapper');
        // If there are no tasks, assign a value of 1 to avoid division by 0
        var tasksCount = tasks.length? tasks.length : 1;
        var completedTasksCount = 0;
        tasks.find('.task_marker').each(function() {
            completedTasksCount += $(this).hasClass('fa-check-square-o')? 1 : 0;
        });
        updateReadiness(tasklist.find('.readiness'), completedTasksCount/tasksCount);
    }

    // Update the readiness value for all tasklists in the document
    function updateAllTasklistsReadiness() {
        var tasklists = $('#tasklists').children('.expander_wrapper');
        tasklists.each(function() {
            updateTasklistReadiness($(this));
        });
    }

$(document).ready(function() {

    changeContentWidth();

    updateAllTasklistsReadiness();

    $('.create_task_btn').on('click', function() {
        changeTaskFormType('create');
    });

    $(window).scroll(function() {
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
    var left_menu_width = isMenuOpened * $('.left_menu').width();
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
        isMenuOpened = 0;
        $('.left_menu').css('margin-left', (-left_menu_width).toString() + 'px');
        changeContentWidth();
    }
    else {
        // вытащить левое меню
        isMenuOpened = 1;
        $('.left_menu').css('margin-left', left_min_menu_width.toString() + "px");
        changeContentWidth();
        }
    }