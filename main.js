// Sound manager - PROPER mobile fix
const Sound = (() => {
  let audioContext = null;
  let unlocked = false;

  function unlock() {
    if (unlocked) return;

    // Create AudioContext on first interaction (required for iOS)
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume AudioContext (iOS requirement)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const a = document.getElementById("sound-unlock");
    if (!a) {
      unlocked = true;
      return;
    }

    // iOS-safe unlock: muted + play inside a real gesture
    a.muted = true;
    a.currentTime = 0;

    const p = a.play();
    if (p) {
      p.then(() => {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
        unlocked = true;
      }).catch(() => {
        a.muted = false;
        unlocked = true;
      });
    } else {
      a.pause();
      a.currentTime = 0;
      a.muted = false;
      unlocked = true;
    }
  }

  function play(id, volume = 1) {
    // Don't even try if not unlocked
    if (!unlocked) {
      console.log('Sound not unlocked yet');
      return;
    }

    const a = document.getElementById(id);
    if (!a) {
      console.log('Audio element not found:', id);
      return;
    }

    a.pause();
    a.currentTime = 0;
    a.volume = volume;

    const promise = a.play();
    if (promise !== undefined) {
      promise.catch((error) => {
        console.log('Play failed:', id, error);
      });
    }
  }

  function stop(id) {
    const a = document.getElementById(id);
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }

  function stopAll() {
    document.querySelectorAll("audio").forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
  }

  return { unlock, play, stop, stopAll };
})();

// CRITICAL: Unlock on ANY user interaction
const unlockOnInteraction = () => {
  Sound.unlock();
};

// Listen to ALL possible interaction events
document.addEventListener("touchstart", unlockOnInteraction, { once: true, passive: true });
document.addEventListener("touchend", unlockOnInteraction, { once: true, passive: true });
document.addEventListener("click", unlockOnInteraction, { once: true });
document.addEventListener("pointerdown", unlockOnInteraction, { once: true });

/* Get and display custom name */
const params = new URLSearchParams(window.location.search);
const recipientName = params.get("name");

if (recipientName) {
  document.querySelectorAll(".name-text")
    .forEach(el => el.textContent = recipientName + ",");
}

/* Start game */
document.getElementById("start-bake").addEventListener("click", function () {
  Sound.unlock();
  document.getElementById("screen-intro").classList.remove("active");
  document.getElementById("screen-game").classList.add("active");
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
  overlap: 0.75,

  
  ondrop: function (event) {
    if (event.relatedTarget.id === 'inventory-dough') {
      document.getElementById('inventory-dough').classList.add('hidden')
      document.getElementById('pie-dough').classList.remove('hidden')
      // Use setTimeout to ensure sound plays after drop completes
      setTimeout(() => Sound.play('sound-crust', 1), 0);
    }
    if (event.relatedTarget.id === 'inventory-strawberry') {
      document.getElementById('inventory-strawberry').classList.add('hidden')
      document.getElementById('pie-jam').classList.remove('hidden')
      setTimeout(() => Sound.play('sound-strawberries', 0.1), 0);
      if (!document.getElementById('pie-butter-no-jam').classList.contains('hidden')){
        document.getElementById('pie-butter').classList.remove('hidden')
      }
      if (!document.getElementById('pie-sugar-no-jam').classList.contains('hidden')){
        document.getElementById('pie-sugar').classList.remove('hidden')
      }
    }
    if (event.relatedTarget.id === 'inventory-butter') {
      document.getElementById('inventory-butter').classList.add('hidden')
      setTimeout(() => Sound.play('sound-butter', 0.5), 0);
      if (document.getElementById('pie-jam').classList.contains('hidden')) {
         document.getElementById('pie-butter-no-jam').classList.remove('hidden')
      } else {
        document.getElementById('pie-butter').classList.remove('hidden')
      }   
    }
    if (event.relatedTarget.id === 'inventory-sugar') {
    document.getElementById('inventory-sugar').classList.add('hidden')
    setTimeout(() => Sound.play('sound-sugar', 0.6), 0);
      if (document.getElementById('pie-jam').classList.contains('hidden')) {
          document.getElementById('pie-sugar-no-jam').classList.remove('hidden')
      } else {
        document.getElementById('pie-sugar').classList.remove('hidden')
      }   
    }
    if (event.relatedTarget.id === 'inventory-crust') {
      document.getElementById('inventory-crust').classList.add('hidden')
      document.getElementById('pie-crust').classList.remove('hidden')
      setTimeout(() => Sound.play('sound-crust'), 0);
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

/* Bake */
document.getElementById("bake-in-oven").addEventListener("click", function () {
  document.getElementById("pie-oven-container").classList.remove("hidden");
  document.getElementById("pie-oven-container").classList.add("slide");
  Sound.play('sound-oven-slide-in', .1);
  document.getElementById("bake-in-oven").classList.add("hidden");
  document.getElementById("oven-filled").style.opacity = "1";
  document.getElementById("timer-hand").style.transform = "rotate(360deg)";
  setTimeout(() => {
    Sound.play('sound-timer', 1);
  }, 2000);  
  setTimeout(() => {
    document.getElementById("pie-baked").classList.remove("hidden");
    document.getElementById("pie-oven-container").style.opacity = "0";
  }, 4500); 
  setTimeout(() => {
    document.getElementById("screen-question").classList.add("active");
  }, 6000); 
  setTimeout(() => {
    document.getElementById("screen-question").classList.add("slide");
    Sound.play('sound-screen-slide', 1);
   }, 6100); 
  setTimeout(() => {
      Sound.play('sound-success', 1);
   }, 6500);
  setTimeout(() => {
    document.getElementById("screen-game").classList.remove("active");
   }, 9000); 
});

/*end screen*/
document.querySelectorAll(".decision").forEach(btn => {
  btn.addEventListener("click", function () {
    document.getElementById("screen-end").classList.add("active");
    setTimeout(() => {
      document.getElementById("screen-end").classList.add("slide");
      Sound.play('sound-screen-slide', 1);
    }, 100);
    setTimeout(() => {
      document.getElementById("screen-question").classList.remove("active", "slide");
    }, 3000);
  });
});

const screenEnd = document.getElementById("screen-end");

document.getElementById("yes").addEventListener("click", () => {
  screenEnd.dataset.state = "accepted";
  setTimeout(() => {
    Sound.play('sound-fun', 0.4);
  }, 2000);
});

document.getElementById("no").addEventListener("click", () => {
  screenEnd.dataset.state = "rejected";
  setTimeout(() => {
    Sound.play('sound-stab-cat', .5);
    document.getElementById("cat-sad").classList.add("grow");
  }, 2000);
});


/* RESET GAME */

function resetGame() {

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active", "slide"));
  document.getElementById("screen-intro").classList.add("active");

  const screenEnd = document.getElementById("screen-end");
  delete screenEnd.dataset.state;
  screenEnd.classList.remove("slide");       


  document.getElementById("cat-sad").classList.remove("grow");
  void document.getElementById("cat-sad").offsetWidth;

  document.getElementById("screen-question").classList.remove("slide");

  document.getElementById("inventory-slots-container").classList.remove("slide");
  document.getElementById("inventory").classList.remove("slide");
  document.getElementById("bake-in-oven").classList.add("hidden");

  const ovenContainer = document.getElementById("pie-oven-container");
  ovenContainer.classList.add("hidden");
  ovenContainer.classList.remove("slide");
  ovenContainer.style.opacity = "";

  document.getElementById("oven-filled").style.opacity = "0";

  const timerHand = document.getElementById("timer-hand");
  timerHand.style.transform = "rotate(0deg)";

  const showOnly = ["pie-empty"];
  const pieIds = [
    "pie-crust","pie-baked","pie-sugar","pie-butter","pie-jam",
    "pie-sugar-no-jam","pie-butter-no-jam","pie-dough","pie-empty"
  ];
  pieIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (showOnly.includes(id)) el.classList.remove("hidden");
    else el.classList.add("hidden");
  });

  document.querySelectorAll(".inventory-item").forEach(item => {
    item.classList.remove("hidden");
    item.style.transform = "translate(0px, 0px)";
    item.removeAttribute("data-x");
    item.removeAttribute("data-y");
  });

  window.scrollTo(0, 0);
}

document.querySelectorAll(".replay").forEach(item => {
  item.addEventListener("click", () => {
    document.getElementById("sound-fun").pause();
    document.getElementById("sound-fun").currentTime = 0;
    resetGame();
  });
});

/* SHARE SCREEN */
document.getElementById("share").addEventListener("click", function (){
  document.getElementById("screen-share").classList.add("active");
  setTimeout(() => {
    document.getElementById("screen-share").classList.add("slide");
   }, 100);

  setTimeout(() => {
    document.getElementById("screen-end").classList.remove("active", "slide");
  }, 3000);
});

const btn = document.getElementById("copy-link");

btn.addEventListener("click", () => {
  const name = document.getElementById("name-input").value.trim();
  const baseUrl = "https://abimakesthings.github.io/valentines/";
  const shareUrl = name
    ? `${baseUrl}?name=${encodeURIComponent(name)}`
    : baseUrl;

  navigator.clipboard.writeText(shareUrl).then(() => {
    btn.classList.add("copied");
    setTimeout(() => {
      btn.classList.remove("copied");
    }, 2000);
  });
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  Sound.play("sound-button-click", 0.3);
});