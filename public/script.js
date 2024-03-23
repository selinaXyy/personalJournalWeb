$(document).ready(function() {

    if (!sessionStorage.getItem("visited")){
        $("#mainHeading").hide();   
        $("#addIcon").hide();   
        $(".journals").hide();
    
        $("#mainHeading").fadeIn(1000,function(){

            setTimeout(function(){
                $("#mainHeading").slideUp(1500, function(){
                    $("#addIcon").fadeIn(500,function(){
                        setTimeout(function(){
                            $(".journals").fadeIn(500);
                        },300);
                    });
                });
            },1500);

        });

        sessionStorage.setItem("visited","true");
    }
    else{
        $("#mainHeading").hide();
        $("#addIcon").show(300,function(){
            $(".journals").show();
        });
    }
});


