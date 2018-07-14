addEventListener('keypress', function (event) {
    if (event.keyCode == 13) {
        event.preventDefault();
    }
});

setInterval(function () {
    $.ajax({
        type: "get",
        url: "/dashboard/api",
        success: function (data) {
            $("#valuation").text("$" + data.valuation);
            $("#newWorth").text("$" + data.netWorth);
            $("#balance").text("$" + data.balance);

            $("tbody > tr").each(function () {

                var holdings = data.coinHoldings;
                for (var i in holdings) {
                    if (holdings[i].FROMSYMBOL == $(this).attr("id")) {
                        $(this).children(':nth-child(2)').text("$" + holdings[i].MKTCAP);

                        if($(this).children(':nth-child(3)').text().slice(1,)<holdings[i].PRICE){
                            $(this).children(':nth-child(3)').text("$" + holdings[i].PRICE);
                            $(this).children(':nth-child(3)').css("background-color", "#4dffb8");
                        }
                        else if($(this).children(':nth-child(3)').text().slice(1,)>holdings[i].PRICE){
                            $(this).children(':nth-child(3)').text("$" + holdings[i].PRICE);
                            $(this).children(':nth-child(3)').css("background-color", "#ff6666");
                        }
                        else{
                            $(this).children(':nth-child(3)').text("$" + holdings[i].PRICE);
                            $(this).children(':nth-child(3)').css("background-color", "#f1f8ff")
                        }
                        
                        $(this).children(':nth-child(4)').text(holdings[i].qty);
                        break;
                    }
                }
            });

        }
    });
}, 3000);

let sub;
let removeRows = [];
function inputQuant() {
    let userInput = document.getElementsByTagName("input");
    let max = document.querySelectorAll('.value_before_input');
    let testCoins = [];
    sub = undefined;
    let data = {};
    removebut();
    for (let i = 0; i < userInput.length; i++) {
        let v = userInput[i].value;

        if (v === '') continue;
        if (isNaN(v)) {
            document.getElementById("modal").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'+'Input is not a number. Please check';
            return;
        }
        v = parseFloat(v);
        if (v < 0) {
            document.getElementById("modal").innerHTML ='&nbsp;&nbsp;&nbsp;&nbsp;'+ 'Input is cannot be negitave. Please check';
            return;
        }
        let m = parseFloat(max[i].innerHTML);
        if (v > m) {
            document.getElementById("modal").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'+'Input exceeds your holding amount. Please check';
            return;
        }
        if (v == m) {
            let rid = max[i].parentElement.id;
            removeRows.push(rid);
        }
        data[max[i].parentElement.id] = v;
    }

    if (Object.keys(data).length == 0) {
        document.getElementById("modal").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'+'You did not sell anything';
        return;
    }

    $.ajax({
        type: "POST",
        url: "/selltest",
        data: data,
        success: function (res) {
            if (res.success) {
               // document.getElementById("modal").innerHTML = "You are trying to sell these coins: " + JSON.stringify(data);
               $('#modal').remove();
               $('<div id="modal"></div>').insertAfter(document.getElementsByClassName("modal-header"));
               $.each(data, function (key, value) {
                         $('#modal').append('<div>' + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Coin: " + " " + key + ", Quantity : " + value + '</div>');
               });

                if (!document.getElementById("confirmButton")) {
                    $('<button type="button" id="confirmButton" onclick="submitform();" data-dismiss="modal" class="btn btn-primary">Confirm</button>').appendTo(document.getElementById("modal-buttons"));
                    console.log("success");
                }

                sub = data;
            }
            if (res.error) {
                document.getElementById("modal").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'+"Not enough coins or Dont try to crash the server";
            }
        },
        error: function (xhr, text, error) {
            document.getElementById("modal").innerHTML = '&nbsp;&nbsp;&nbsp;'+"Enter valid Qunatity";
        }
    });

}


function submitform() {
    console.log(sub);
    for (let i of removeRows) {
        $("#" + i).remove();
    }
    $.ajax({
        type: "POST",
        url: "/sell",
        data: sub,
        success: function (res) {
            sub = undefined;
            document.getElementById("modal").innerHTML = "Thank you for selling"
        },
        error: function (xhr, text, error) {
            document.getElementById("modal").innerHTML = 'Error: ' + error;
        }
    });
}
function removebut() {
    $('#confirmButton').remove();
}