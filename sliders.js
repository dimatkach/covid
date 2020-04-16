class Element {
  constructor(tag, parent, attrs) {
     this.it = document.createElement(tag);
     this.setAttributes(attrs);
     if (typeof parent === 'string') {
       this.parent = document.getElementById(parent);
     } else {
       this.parent = parent;
     }
     this.parent.appendChild(this.it);
  }

  setAttr(key, value) {
    this.it.setAttribute(key, value);
  }

  attr(key) {
   return this.it.getAttribute(key);
  }

  setAttributes(attrs) {
    for(var key in attrs) {
      this.setAttr(key, attrs[key]);
    }
  }
}

class Slider extends Element {
   constructor(parent, id, label, value, min, max, step) {
     super("div", parent, {id: id + "_container", class: "slidercontainer"});

     this.parent = this.it;
     new Element("dev", this.parent, {id: id + "_label", class: "label"}).it.innerHTML=label;

     this.value = new Element("div", this.parent, {id: id + "_value", class: "value"}).it;
     this.value.innerHTML = value;

     this.it = new Element(
      "input",
      this.parent,
      {
         id: id,
         type: "range",
         class: "slider",
         min : min,
         max: max,
         value: value,
         step: step || 1
      }
    ).it;
     var self = this;
     this.it.oninput = function() { self.value.innerHTML = this.value; }
   }
}
