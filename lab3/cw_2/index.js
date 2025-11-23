function generatePassword() {
    const min_length = parseInt(document.getElementById("minLength").value);
    const max_length = parseInt(document.getElementById("maxLength").value);
    const upper_chars = document.getElementById("upperChars").checked;
    const special_chars = document.getElementById("specialChars").checked;

    let chars = "aąbcćdeęfghijklmnoópqrsśtuwxyz0123456789";

    if (upper_chars) {
        chars += "AĄBCĆDEĘFGHIJKLMNOÓPQRSŚTUWXYZ";
    }
    if (special_chars) {
        chars += "!@#$%^&*()_+-=[]{}|;:',.<>/?";
    }

    const length = Math.floor(Math.random() * (max_length - min_length + 1)) + min_length;
    let password = "";

    for (let i=0; i< length; i++) {
        let index = Math.floor(Math.random() * chars.length);
        password += chars[index];
    }

    return password;
}

document.getElementById("generate").addEventListener("click", () => {
    const password = generatePassword();
    alert("Wygenerowano hasło: " + password);
});