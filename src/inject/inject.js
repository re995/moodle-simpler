const EDIT_BUTTON_CLASS = "moodlesimpler_edit_button"
const HIDE_BUTTON_CLASS = "moodlesimpler_hide_button"
const STORAGE_DESCRIPTION_PREFIX = "edit_course_"
const HIDE_COURSE_PREFIX = "hide_course_"
var currentUrl = window.location.href;

function onLoad() {
    var courseDescriptors = $(".block-fcl__list__item--course");
    if (courseDescriptors.length == 0) {
        console.log("No course descriptors found. Returning...");
        return;
    }

    putEditButtons(courseDescriptors);

    renderChanges();

    reorderCourses();

    var editButtons = $("." + EDIT_BUTTON_CLASS);
    registerEditButtonsClick(editButtons);

    var hideButtons = $("." + HIDE_BUTTON_CLASS)
    registerHideButtonsClick(hideButtons);
}

function putEditButtons(descriptors) {
    descriptors.each(function (index) {
        var descriptor = $(descriptors[index]);
        var courseSerial = descriptor.find(".block-fcl__list__link").attr('title');
        var editToInject = '<i class="icon fa fa-pencil fa-fw ' + EDIT_BUTTON_CLASS + '" title="עריכת תיאור" aria-label="עריכת תיאור" id="' + STORAGE_DESCRIPTION_PREFIX + courseSerial + '"></i>';
        var hideToInject = '<i class="icon fa fa-eye fa-fw ' + HIDE_BUTTON_CLASS + '" title="הסתר/הצג קורס" aria-label="הסתר/הצג קורס" id="' + HIDE_COURSE_PREFIX + courseSerial + '"></i>';
        descriptor.prepend(editToInject);
        descriptor.prepend(hideToInject);
    });
}

function registerEditButtonsClick(editButtons) {
    editButtons.each(function (index) {
       var button = $(editButtons[index])
       button.click(function() {
            description = prompt("מהו התיאור החדש שברצונך לתת לקורס הזה?\nניתן להשאיר ריק כדי להחזיר את מספר הקורס הדיפולטי");
            var key = button.attr('id');
            if (description == null) {
                // Prompt exited without editing. Don't do anything
            }
            else if (description.length == 0) {
                // Prompt given empty input. Remove from storage to go back to defaults
                // In this case, we don't know the real course number, so we just refresh so everything will be loaded
                localStorage.removeItem(key);
                location.reload();
            }
            else {
                // Prompt given actual input. Save and update
                localStorage.setItem(button.attr('id'), description);
            }

            renderChanges();
       });
    });
}

function registerHideButtonsClick(hideButtons) {
    hideButtons.each(function (index) {
       var button = $(hideButtons[index])
       button.click(function() {
            var id = button.attr('id')
            var isVisible = localStorage.getItem(id) != "false"
            if (isVisible == null || isVisible) {
                // Course is currently visible. Hide it
                localStorage.setItem(id, false);
            }
            else {
                // Course is currently hidden. Show it
                localStorage.setItem(id, true);
            }

            renderChanges();
       });
    });
}

function renderChanges() {
    for (var i = 0; i < localStorage.length; i++){
        var key = localStorage.key(i);
        if (key.startsWith(HIDE_COURSE_PREFIX)) {
            var value = localStorage.getItem(key);
            if (value.length == 0) {
                console.warn("Nothing stored for key " + key + ". This is probably a bug");
                continue;
            }

            var linkElement = $("#" + key).parent().find(".block-fcl__list__link,.___block-fcl__list__link");

            if (value == "true") {
                $(linkElement).parent().animate({'opacity':1})
                $(linkElement).parent().attr('visible', true);
            }
            else {
                $(linkElement).parent().animate({'opacity':0.2})
                $(linkElement).parent().attr('visible', false);
            }
        }
        else if (key.startsWith(STORAGE_DESCRIPTION_PREFIX)) {
            var value = localStorage.getItem(key);
            if (value.length == 0) {
                console.warn("Nothing stored for key " + key + ". This is probably a bug");
                continue;
            }

            var linkElement = $("#" + key).parent().find(".block-fcl__list__link");
            linkElement.attr('class', '___block-fcl__list__link');
            linkElement.attr('title', value);
            linkElement.html(value);
        }
    }
}

function reorderCourses() {
    var semesterElements = $(".block-fcl__list");
    semesterElements.each(function (index) {
        var semesterElement = $(semesterElements[index]);
        var sorted = semesterElement.children("ul").children("li").detach().sort(function(elem1, elem2) {
            var visible1 = $(elem1).attr('visible') != "false";
            var visible2 = $(elem2).attr('visible') != "false";

            var text1 = elem1.innerText;
            var text2 = elem2.innerText;

            if (visible1 && !visible2) {
                return -1;
            }

            if (!visible1 && visible2) {
                return 1;
            }

            return (text1 < text2) ? -1 : (text1 > text2) ? 1 : 0;
        });

        semesterElement.append(sorted);
    });

}

onLoad();
