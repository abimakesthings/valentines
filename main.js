/* Get and display custom name */
const params = new URLSearchParams(window.location.search);
const recipientName = params.get("name");

if (recipientName) {
  document.getElementById("name-text").textContent = recipientName + ",";
}

/* Start game */
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("start-bake").addEventListener("click", function () {
    document.getElementById("screen-intro").classList.remove("active");
    document.getElementById("screen-game").classList.add("active");
  });
});

/* Check if all ingredients have been used*/
function allSlotsHidden(i) {
  return [...document.querySelectorAll(`#inventory-slots-${i} .inventory-item`)]
    .every(el => el.classList.contains("hidden"));
}

function checkSlideInventory() {
  if (allSlotsHidden(1)) {
    document.getElementById("inventory-slots-container").classList.add("slide");
  }
  if (allSlotsHidden(2)) {
    document.getElementById("inventory").classList.add("slide");
     setTimeout(() => { document.getElementById("bake-in-oven").classList.remove("hidden");}, 300);
  }
}


/* Game drag and drop behavior */

interact('#pie-container').dropzone({
  accept: '#inventory-dough, #inventory-butter, #inventory-strawberry, #inventory-sugar, #inventory-crust',
  // Require a 75% element overlap for a drop to be possible
  overlap: 0.75,

  
  ondrop: function (event) {
    if (event.relatedTarget.id === 'inventory-dough') {
      document.getElementById('inventory-dough').classList.add('hidden')
      document.getElementById('pie-dough').classList.remove('hidden')
    }
    if (event.relatedTarget.id === 'inventory-strawberry') {
      document.getElementById('inventory-strawberry').classList.add('hidden')
      document.getElementById('pie-jam').classList.remove('hidden')
      if (!document.getElementById('pie-butter-no-jam').classList.contains('hidden')){
        document.getElementById('pie-butter').classList.remove('hidden')
      }
      if (!document.getElementById('pie-sugar-no-jam').classList.contains('hidden')){
        document.getElementById('pie-sugar').classList.remove('hidden')
      }
    }
    if (event.relatedTarget.id === 'inventory-butter') {
      document.getElementById('inventory-butter').classList.add('hidden')

      if (document.getElementById('pie-jam').classList.contains('hidden')) {
         document.getElementById('pie-butter-no-jam').classList.remove('hidden')
      } else {
        document.getElementById('pie-butter').classList.remove('hidden')
      }   
    }
    if (event.relatedTarget.id === 'inventory-sugar') {
    document.getElementById('inventory-sugar').classList.add('hidden')

      if (document.getElementById('pie-jam').classList.contains('hidden')) {
          document.getElementById('pie-sugar-no-jam').classList.remove('hidden')
      } else {
        document.getElementById('pie-sugar').classList.remove('hidden')
      }   
    }
    if (event.relatedTarget.id === 'inventory-crust') {
      document.getElementById('inventory-crust').classList.add('hidden')
      document.getElementById('pie-crust').classList.remove('hidden')
    }
    checkSlideInventory();
  }
})

interact('.inventory-item')
  .draggable({
    inertia: true,
    autoScroll: true,
    listeners: {
      move: dragMoveListener, 
      end (event) {
      if (!event.dropzone) {
        resetPosition(event.target)
      }
    }
    },
  })

function dragMoveListener (event) {
  const target = event.target
  const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
  target.style.transform = `translate(${x}px, ${y}px)`
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

function resetPosition(el) {
  el.style.transform = 'translate(0px, 0px)'
  el.removeAttribute('data-x')
  el.removeAttribute('data-y')
}
