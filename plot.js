function initChart(selector, data) {

   function formatValue(y) {
      if (y >= 1) return y.toFixed(2) + "M";
      return (y*1000).toFixed(2) + "K";
   }

   if (! $('#tooltip').length ) {
     $("<div id='tooltip'></div>").css({
		  	position: "absolute",
		  	display: "none",
		  	border: "1px solid #fdd",
		  	padding: "2px",
		  	"background-color": "#fee",
		  	opacity: 0.80
		  }).appendTo("body");

      $(selector).bind("plothover", function(event, pos, item) {
        if (!pos.x || !pos.y) {
			   	return;
			  }

		    if (item) {
				  	var x = item.datapoint[0],
				      	y = item.datapoint[1];

					  $("#tooltip").html("Day: " + x + " <br/> " + item.series.label + ": "+ formatValue(y))
						  .css({top: item.pageY+5, left: item.pageX+5})
						  .fadeIn(200);
				  } else {
			  		$("#tooltip").stop().hide();
				  }
      });

      $(selector).bind("plothovercleanup", function (event, pos, item) {
				$("#tooltip").hide();
		  });
    }

    return $.plot(selector, data || [], {
      series: {
				lines: {
					show: true
				},
				points: {
					show: true
				}
			},
			grid: {
				hoverable: true,
				clickable: true
			},
/*
      xaxis: {
        min: null,
        max: null
      },
			yaxis: {
				min: 0,
				max: 330
			},
*/
			zoom: {
				interactive: false
			},
			pan: {
				interactive: true,
				enableTouch: true
			}
    });
}

