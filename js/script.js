var time, date;
var months = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];

function createRandomDate() {
  date = new Date();
  date.setDate(date.getDate()-(Math.floor(Math.random() * 10) + 1));
  date.setHours(date.getHours()-(Math.floor(Math.random() * 10) + 1));
  date.setMinutes(date.getMinutes()-(Math.floor(Math.random() * 50) + 1));
  date.setSeconds(date.getSeconds()-(Math.floor(Math.random() * 50) + 1));
  time = date.toTimeString().split(' ')[0];
  var month = months[date.getMonth() - 1];
  date = date.getDate() + ". " + month.toLowerCase() + " " + date.getFullYear() + " " + time;
}

function createDate() {
    var date = new Date();
    time = date.toTimeString().split(' ')[0];
    var month = months[date.getMonth() - 1];
    return date.getDate() + ". " + month.toLowerCase() + " " + date.getFullYear() + " " + time;
}

function updateTable() {
    $("#reports tbody tr:visible").css("background", "#FFF");
    $("#reports tbody tr:visible").filter(":odd").css("background", "rgba(109, 167, 180, 0.2)");
}

//My constructor and object
function Report(obj) {
    Object.assign(this, obj);
    if(obj.date == null) {
        createRandomDate();
    }

    $("#reports tbody").append(
        $("<tr />").append(
            $("<td />").text(this.issue)
        ).append(
            $("<td />").text(this.importance)
        ).append(
            $("<td />").text(this.location)
        ).append(
            $("<td />").text(this.description)
        ).append(
            $("<td />").text((obj.date == null) ? date : obj.date)
        )
    );
}

//Create an overkill observer, which monitors for changes in the table, then we update the table afterwards. Overkill? Yes.
//Do we like repeating ourselves? No.
var observe = function(){
    var observer = new MutationObserver(function(mutations, observer) {
        observer.disconnect();
        updateTable();
        observe();
    });
    observer.observe(document.querySelector('#reports tbody'), { 
        childList: true, 
        attributes: true, 
        subtree: true 
    });
}

$(function() {
    try {
        observe();
    } catch(err) {
        console.log(err);
    }

    //Create a few reports
    new Report({
        "issue": "Udskiftning", 
        "importance": "Vigtig", 
        "location": "SH-A1.19B", 
        "description": "En sikring er gået så alt strømmen er gået i lokalet"
    });
    new Report({
        "issue": "Reparation", 
        "importance": "Vigtig", 
        "location": "Kantine", 
        "description": "2 maskiner er gået i stykker"
    });
    new Report({
        "issue": "Rengøring", 
        "importance": "Normal", 
        "location": "Toilet 3", 
        "description": "Toiletterne lugter"
    });

    //Create new reports grabbed from the localStorage
    try {
        var reports = JSON.parse(localStorage.getItem("reports"));
        for(i = 0; i < reports.length; i++) {
            new Report(JSON.parse(reports[i]));
        }
        if(localStorage.getItem("reports") == "[]" || localStorage.getItem("reports") == undefined) {
            $("#clearLocalStorage").attr("disabled", true);
        } else {
            $("#clearLocalStorage").attr("disabled", false);
        }
    } catch(err) {
        console.log(err);
    }

    //Stores all the elements' default values, so we can reset them later!
    $("input, textarea").each(function() {
        $(this).attr("data-restore", $(this).val());
    });

    //Create the table tr selection (background change and marking button as enabled)
    $("table tr:not(:first)").on("click", function(e) {
        if(!e.ctrlKey) {
            $(".selected").not(this).removeClass("selected");
        }

        $(this).toggleClass("selected");
        $("#remove").attr("disabled", !$(this).hasClass("selected"));
    });

    //Remove selected element and disable the button
    $("#remove").on("click", function() {
        $(".selected").remove();
        $(this).attr("disabled", true);

    });

    //Searching through the table's data and filtering out the results
    $("#search").keyup(function() {
        var text = this.value.toLowerCase();
        $("table tr:not(:first)").each(function() {
            var elementId = $(this).find("td").text().toLowerCase();
            if(elementId.indexOf(text) !== -1) {
                $(this).toggle(true);
            } else {
                $(this).toggle(false);
            }
        });
    });

    //When checkbox has been changed, go filter through the table's content, depending on which checkbox(es) has been checked
    $("input:checkbox").change(function () {
        var show = true;
        $("tr:not(:first)").hide();
        $("input:checkbox").each(function () {
            if (this.checked) {
                show = false;
                if($(this).hasClass("chk_issue")) {
                    $("td:first-child:contains(" + $(this).val() + ")").parent("tr").show();
                } else if($(this).hasClass("chk_importance")) {
                    $("td:nth-child(2):contains(" + $(this).val() + ")").parent("tr").show();
                }
            }
        });
        if(show){
            $("tr:not(:first)").show();
        }
    });

    //Create a new report from the data
    $("#add").on("click", function(e) {
        var issue = $("#issue").val();
        var importance = $("#importance").val();
        var location = $("#location").val();
        var description = $("#description").val();

        //Sets localStorage content to be a new report object
        var reports = JSON.parse(localStorage.getItem("reports")) || [];
        var report = new Report({"issue": issue, "importance": importance, "location": location, "description": description, "date": createDate()});
        reports.push(JSON.stringify(report));
        localStorage.setItem("reports", JSON.stringify(reports));

        if(location != "" || description != "") {
            if(confirm("Du er ved at oprette en " + importance.toLowerCase() + " rapport. Er du sikker?")) {
                $(".output").text("");
                $("#output").show();
                $(".output").append($("<span />").addClass("outputText").text(issue)).append($("<span />").addClass("outputText").text(importance)).append($("<span />").addClass("outputText").text(location)).append($("<span />").addClass("outputText").text(date + " " + time)).append($("<span />").addClass("outputText").text(description));
                $("input, textarea").each(function() {
                    $(this).val($(this).attr("data-restore"));
                });
                $("select").prop('selectedIndex', 0);
                return false;
            } else {
                return false;
            }
        }
    });

    //Make the button enabled or disabled depending on the value of the location and description input fields
    $("#location, #description").on("keyup", function() {
        $("#add").attr("disabled", $("#location").val() == "" || $("#description").val() == "");
    });

    //Clear localStorage
    $("#clearLocalStorage").on("click", function() {
        localStorage.setItem("reports", JSON.stringify([]));
        console.log(localStorage.getItem("reports"));
        $(this).attr("disabled", true);
    });

    $("#date").text(createDate());
});
