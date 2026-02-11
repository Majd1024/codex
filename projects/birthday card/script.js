      const outside = document.getElementById("outside");
      const confettiContainer = document.getElementById("confetti");
      let confettiShown = false;

      outside.addEventListener("click", () => {
        outside.classList.toggle("open");
        if (!confettiShown && outside.classList.contains("open")) {
          confettiShown = true;
          createConfetti();
        }
      });

      function createConfetti() {
        for (let i = 0; i < 120; i++) {
          const piece = document.createElement("div");
          piece.classList.add("confetti-piece");
          piece.style.left = Math.random() * 100 + "vw";
          piece.style.backgroundColor = `hsl(${
            Math.random() * 360
          }, 100%, 50%)`;
          piece.style.animationDelay = Math.random() * 0.5 + "s";
          piece.style.width = Math.random() * 8 + 4 + "px";
          piece.style.height = Math.random() * 12 + 6 + "px";
          confettiContainer.appendChild(piece);
          setTimeout(() => piece.remove(), 4000);
        }
      }
