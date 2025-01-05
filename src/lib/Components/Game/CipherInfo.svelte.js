const cText = "vfn bfioevf vefiog bfijobrfio b 567 vfojfirb ifonbgr fewpgrfsn.";
export const info = $state({
    cipherText: cText,
    cipherTextTrim: cText.split(" ").join(""),
    letterInputs: initLetterInputs(),
    letterFocus: initLetterFocus(),
    inputs: []
});

function initLetterInputs() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letterInputs = {};
    alphabet.split('').forEach(letter => {
        if (!(letter in letterInputs)) {
            letterInputs[letter] = ''; // Initialize each letter with an empty string
        }
    });
    return letterInputs;
}

function initLetterFocus() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letterFocus = {};
    alphabet.split('').forEach(letter => {
        if (!(letter in letterFocus)) {
            letterFocus[letter] = false;
        }
    });
    return letterFocus;
}

