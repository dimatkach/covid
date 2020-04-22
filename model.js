class State {
   constructor(s, i, d) {
     this.susceptible = s;
     this.infected = i;
     this.dead = d;
   }

   new_infections(config) {
      return (config.r0 / config.duration) * this.susceptible * this.infected / config.population;
   }

   required_beds(config) {
      return this.infected * config.hospitalizations / 100;
   }

   data(config, kind, last) {
     if(kind == 'infected') return this.infected;
     if(kind == 'daily') return this.new_infections(config);
     if(kind == 'deaths') return this.new_deaths(config);
     if(kind == 'dead') return this.dead;
     if(kind == 'sick') return this.new_infections(config) + last;

     throw (kind + " unknown");
   }

   new_deaths(config) {
     var capacity = config.capacity * config.population/1000000;
     var ni = this.new_infections(config);
     var used_beds = Math.min(this.required_beds(config) * (1-1/config.duration), capacity);
     var need_beds = ni * config.hospitalizations / 100;
     var loosers = need_beds + used_beds - capacity;

     return (this.infected/config.duration)*config.fatality/100 + Math.max(0, loosers);
   }

   next(config) {
     var step = 1.0 / config.duration;

     var ni = this.new_infections(config);
     var new_dead = this.new_deaths(config);
     var recovered = this.infected * step * (1 - config.fatality / 100);

     return new State(
       this.susceptible - ni,
       this.infected - recovered - new_dead + ni,
       this.dead + new_dead
     )
   }
}

class Generator {
   constructor() {}

   generate(config, days) {
      if (!this.history) {
        var ini = config.initial / 1000000 || 1
        this.history = [new State(config.population - ini, ini, 0)];
      }
      var start = this.history.length - 1;
      for (const day of Array(days || 180).keys()) {
        this.history.push(this.history[day + start].next(config));
      }
      return this;
   }

   infections() {
      return this.history.map( function (state, index) { return { x: index, y: state.infected } });
   }

   graph(label, from) {
     var cfg = graphConfig()
     cfg.data.push(ds("Infections", colors.red, this.infections().slice(from)));
     return cfg;
   }
}

var colors = {
 red: "#FF6347",
 orange: "#FF9F40",
 yellow: "#FFCD56",
 green: "#4BC0C0",
 blue: "#36A2EB",
 purple: "#9966FF",
 grey: "#C9CBCF"
}

function ds(label, color, data) {
  return {
    type: 'line',
    showInLegend: true,
    name: label,
    color: color,
    //markerType: "square",
    //xValueFormatString: "DD MMM, YYYY",
    //yValueFormatString: "#,##0K",
    dataPoints: data
  }
}


function graphConfig() {
	return {
    animationEnabled: true,
	  theme: "light2",
		title:{ text: "Infected" },
		axisX:{
		// valueFormatString: "DD MMM"
		},
    axisY: {
    title: "Infected",
			 suffix: "M",
			 //minimum: 30
		},
    toolTip:{
      shared:true
	  },
    legend:{
      cursor:"pointer",
			verticalAlign: "bottom",
			horizontalAlign: "left",
			dockInsidePlotArea: true,
			//itemclick: toogleDataSeries
		},
    data: []
	};
}
