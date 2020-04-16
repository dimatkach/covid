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

   next(config) {
     var step = 1.0 / config.duration;

     var ni = config.r0 * step * this.susceptible * this.infected / config.population;
     var nb = ni * config.hospitalizations / 100;

     var nd = ni * config.fatality / 100;

     var used_beds = this.required_beds(config) * (1-step);
     var need_beds = ni * config.hospitalizations / 100;
     var loosers = need_beds + used_beds - config.capacity;

     var new_dead = this.infected * step * config.fatality / 100 + Math.max(0, loosers);
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
      return this.history.map( function (state, index) { return { t: index, y: state.infected } });
   }

   graph(label, from) {
     var cfg = graphConfig()
     cfg.data.labels = this.history.map((v,k) => k).slice(from);
     cfg.data.datasets.push(ds("Infections", colors.red, this.infections().slice(from)));
     return cfg;
   }
}

var colors = {
 red: "rgb(255, 99, 132)",
 orange: "rgb(255, 159, 64)",
 yellow: "rgb(255, 205, 86)",
 green: "rgb(75, 192, 192)",
 blue: "rgb(54, 162, 235)",
 purple: "rgb(153, 102, 255)",
 grey: "rgb(201, 203, 207)"
}

function ds(label, color, data) {
  return {
    label: label,
    backgroundColor: color,
    borderColor: color,
    fill: false,
    data: data
  }
}


function graphConfig() {
  return {
    type: 'line',
    data: {
     datasets: []
    },
    options: {
      responsive: true,
      title: {
        display: true
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      xAxes: [{
        distribution: 'series',
        offset: true,
        ticks: {
          major: {
            enabled: true,
            fontStyle: 'bold'
          },
          source: 'data',
          autoSkip: true,
          autoSkipPadding: 75,
          maxRotation: 0,
          sampleSize: 100
        }
    }]
  }
 }

}
