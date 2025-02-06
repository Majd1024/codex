// List of emoji quizzes with answers
const emojiList = [
    { emojis: "😡 + 🐦", answer: "Angry Bird" },
    { emojis: "🥵 + 🍫", answer: "Hot Chocolate" },
    { emojis: "⛏️ + 🔳", answer: "Minecraft" },
    { emojis: "👨🏻‍🦱 + 📕", answer: "Facebook" },
    { emojis: "🦇 + 🧔🏻‍♂️", answer: "Batman" },
    { emojis: "🎬 + 🍿", answer: "Movie Night" }
  ];
  
  let currentEmojiIndex = 0;
  let correctAnswers = 0;
  
  function showEmoji() {
    const emojiContainer = document.getElementById("emoji-container");
    emojiContainer.textContent = emojiList[currentEmojiIndex].emojis;
  }
  
  function submitAnswer() {
    const userInput = document.getElementById("user-input").value.trim().toLowerCase();
    const result = document.getElementById("result");
  
    if (userInput === emojiList[currentEmojiIndex].answer.toLowerCase()) {
      correctAnswers++;
      result.textContent = "Correct! 🎉";
      result.classList.add("correct");
      result.classList.remove("wrong");
    } else {
      correctAnswers = Math.max(0, correctAnswers - 1); 
      result.textContent = "Wrong! 😅 You lost 1 point.";
      result.classList.add("wrong");
      result.classList.remove("correct");
    }
  
    currentEmojiIndex++;
  
    if (currentEmojiIndex < emojiList.length) {
      showEmoji();
    } else {
      document.getElementById("final-message").textContent = `Game Over! You won ${correctAnswers}/${emojiList.length}! 🎉`;
      document.getElementById("user-input").disabled = true; 
    }
  
    document.getElementById("user-input").value = "";
  }
  
  showEmoji();
  