
interact('#pie-container').dropzone({
  accept: '#inventory-dough, #inventory-butter, #inventory-strawberry, #inventory-sugar',
  // Require a 75% element overlap for a drop to be possible
  overlap: 0.75,

  ondropactivate: function (event) {
   /* event.target.classList.add('')*/
  },

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