function checkAnswer(answer) {
    const result = document.getElementById('quizResult');
    if(answer === 'yes') {
        result.textContent = "Świetnie! Wierzymy, że Warriors wygrają!";
    } else {
        result.textContent = "Nie martw się, każdy mecz to szansa!";
    }
}