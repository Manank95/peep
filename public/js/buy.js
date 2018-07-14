let data = {};
addEventListener('keypress', function (event) {
    if (event.keyCode == 13) {
        event.preventDefault();
    }
});

setInterval(function () {
    $.ajax({
        type: "get",
        url: "/buy/api",
        success: function (data) {

            $("tbody > tr").each(function () {

                var holdings = data.coinHoldingsBuy;
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
                        break;
                    }
                }
            });

        }
    });
}, 10000);

let sub;
function buyCheck() {
    let amount = document.querySelectorAll(".buyamount");
    let cost = 0;
    let userInput = document.getElementsByTagName("input");
    //console.log(userInput);
    sub = undefined;
    
    let popupText = {};
    data = {};
    removebut();

    for (let i = 0; i < amount.length; i++) {
        let v = amount[i].value;
        data[amount[i].id] = v;
        if (v === '') continue;
        if (isNaN(v)) {
            document.getElementById("modal").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'+'Input is not a number. Please check again';
            event.preventDefault();
            return;
        }
        v = parseFloat(v);
        if (v < 0) {
            document.getElementById("modal").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'+'Input cannot be negative. Please check again';
            event.preventDefault();
            return;
        }
        popupText[amount[i].id] = v;
    }
 
    if (Object.keys(popupText).length == 0) {
        document.getElementById("modal").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'+'You did not sell anything';
        return;
    }

    $.ajax({
        type: "POST",
        url: "/buytest",
        data: data,
        success: function (res) {

          $('#modal').remove();
          $('<div id="modal"></div>').insertAfter(document.getElementsByClassName("modal-header"));
            // document.getElementById("modal").innerHTML = "You are trying to buy these coins: " + JSON.stringify(data);
            $.each(popupText, function (key, value) {
                    $('#modal').append('<div>' + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Coin: " + " " + key + ", Quantity : " + value + '</div>');
            });
            if (!document.getElementById("confirmButton")) {
                $('<button type="button" id="confirmButton" onclick="confbuy()" data-dismiss="modal" class="btn btn-primary">Confirm</button>').appendTo(document.getElementById("modal-buttons"));        
            }
            sub = data;
        },
        error: function (xhr, text, error) {
            removebut();
            document.getElementById("modal").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'+ "Enter valid Quantity";
        }
    });

  
}

function confbuy(){
    $.ajax({
        type: "POST",
        url: "/buy",
        data: data,
        success: function (res) {
            // document.getElementById("modal").innerHTML = "You are trying to buy these coins: " + JSON.stringify(data);
            sub = undefined;
            document.getElementById("modal").innerHTML = "";
        },
        error: function (xhr, text, error) {
            document.getElementById("modal").innerHTML = "Internal error.";
        }
    });
}
function removebut() {
    $('#confirmButton').remove();
}
