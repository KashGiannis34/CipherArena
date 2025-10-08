# Codebusters practice - API version for SvelteKit integration
import random
import time
import json
import sys

# Common keywords for Nihilist/Polybius squares (~100 words), all lowercase
NIHILIST_KEYWORDS = [
    "cipher", "decode", "encode", "secret", "keyword", "matrix", "alpha", "bravo",
    "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliet",
    "kilo", "lima", "mike", "november", "oscar", "papa", "quebec", "romeo",
    "sierra", "tango", "uniform", "victor", "whiskey", "xray", "yankee", "zulu",
    "puzzle", "logic", "number", "letter", "random", "pattern", "signal", "vector",
    "crypto", "shadow", "agent", "bond", "riddle", "secretive", "covert", "stealth",
    "answer", "question", "reason", "method", "search", "finder", "solver", "detect",
    "matrixkey", "permute", "square", "cipherkey", "classic", "simple", "garden",
    "ocean", "forest", "mountain", "river", "valley", "desert", "island", "harbor",
    "castle", "bridge", "anchor", "beacon", "compass", "orbit", "stellar", "nebula",
    "comet", "meteor", "planet", "saturn", "mercury", "venus", "earth", "mars",
    "jupiter", "uranus", "neptune", "pluto", "silver", "golden", "cobalt", "carbon",
    "oxygen", "nitrogen", "helium", "argon"
]

def generate_two_digit_multiplication():
    """Generate a 2-digit multiplication problem"""
    a = int(random.random() * 16) + 10
    b = int(random.random() * 21) + 5
    return {
        "type": "two_digit_multiplication",
        "problem": f"{a} * {b}",
        "question": f"What is ({a} * {b}) mod 26?",
        "answer": a * b,
        "answer_mod_26": (a * b) % 26,
        "a": a,
        "b": b
    }

def check_two_digit_multiplication(a, b, user_answer):
    """Check answer for 2-digit multiplication"""
    try:
        user_answer_int = int(user_answer)
        correct_answer_1 = str(a * b)+" mod 26"
        correct_answer_2 = (a * b) % 26

        return {
            "correct": user_answer_int == correct_answer_2,
            "user_answer": user_answer,
            "correct_answer": correct_answer_1,
            "correct_answer_mod_26": correct_answer_2
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }

def generate_letter_to_value():
    """Generate a letter to value conversion problem"""
    number = int(random.random() * 26) + 65
    letter = chr(number)
    return {
        "type": "letter_to_value",
        "problem": letter,
        "question": f"What is the value of {letter}?",
        "answer": number - 65,
        "letter": letter
    }

def check_letter_to_value(letter, user_answer):
    """Check answer for letter to value conversion"""
    try:
        user_answer_int = int(user_answer)
        correct_answer = ord(letter.upper()) - 65
        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }

def generate_three_digit_subtraction():
    """Generate a 3-digit subtraction problem"""
    a = int(random.random() * 625) + 1
    b = int(random.random() * 625) + 1
    return {
        "type": "three_digit_subtraction",
        "problem": f"{a} - {b}",
        "question": f"What is {a} - {b}?",
        "answer": a - b,
        "a": a,
        "b": b
    }

def check_three_digit_subtraction(a, b, user_answer):
    """Check answer for 3-digit subtraction"""
    try:
        user_answer_int = int(user_answer)
        correct_answer = a - b
        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }

def generate_shift_letter():
    """Generate a letter shift problem"""
    number = int(random.random() * 26) + 65
    letter = chr(number)
    shift = int(random.random() * 26) + 1
    answer = chr(((number - 65 + shift) % 26) + 65)
    return {
        "type": "shift_letter",
        "problem": f"Shift {letter} by {shift}",
        "question": f"What is the letter when {letter} is shifted {shift} times?",
        "answer": answer,
        "letter": letter,
        "shift": shift
    }

def check_shift_letter(letter, shift, user_answer):
    """Check answer for letter shift"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            raise ValueError("Answer must be a non-empty string")
        number = ord(letter.upper())
        correct_answer = chr(((number - 65 + shift) % 26) + 65)
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_shift_word():
    """Generate a word shift problem"""
    length = int(random.random() * 4) + 4
    word = ""
    for n in range(length):
        number = int(random.random() * 26) + 65
        word += chr(number)
    shift = int(random.random() * 26) + 1
    answer = ""
    for n in range(length):
        answer += chr(((ord(word[n]) - 65 + shift) % 26) + 65)
    return {
        "type": "shift_word",
        "problem": f"Shift {word} by {shift}",
        "question": f"What is the word when {word} is shifted {shift} times?",
        "answer": answer,
        "word": word,
        "shift": shift,
        "length": length
    }

def check_shift_word(word, shift, user_answer):
    """Check answer for word shift"""
    try:
        if not isinstance(user_answer, str):
            raise ValueError("Answer must be a string")
        correct_answer = ""
        for char in word:
            correct_answer += chr(((ord(char) - 65 + shift) % 26) + 65)
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_inverse_matrix():
    """Generate an inverse matrix problem"""
    key = []
    for n in range(4):
        key.append(int(random.random() * 26) + 1)
    det = (key[0] * key[3] - key[1] * key[2]) % 26
    while det % 2 == 0 or det % 13 == 0:
        key.clear()
        for n in range(4):
            key.append(int(random.random() * 26) + 1)
        det = (key[0] * key[3] - key[1] * key[2]) % 26

    # Calculate inverse
    for n in range(1, 26):
        if (n * det) % 26 == 1:
            det = n
            break

    inverse = [key[3], -key[1], -key[2], key[0]]
    for n in range(4):
        inverse[n] *= det
        inverse[n] %= 26

    return {
        "type": "inverse_matrix",
        "problem": f"Matrix: [[{key[0]}, {key[1]}], [{key[2]}, {key[3]}]]",
        "question": "What is the inverse key of this matrix?",
        "matrix": key,
        "answer": inverse,
        "matrix_display": f"{key[0]}\t{key[1]}\n{key[2]}\t{key[3]}"
    }

def check_inverse_matrix(matrix, user_answer):
    """Check answer for inverse matrix"""
    try:
        if not isinstance(user_answer, list) or len(user_answer) != 4:
            raise ValueError("Answer must be a list of 4 numbers")

        # Validate all elements are integers
        user_answer = [int(x) for x in user_answer]

        key = matrix.copy()
        det = (key[0] * key[3] - key[1] * key[2]) % 26

        for n in range(1, 26):
            if (n * det) % 26 == 1:
                det = n
                break

        inverse = [key[3], -key[1], -key[2], key[0]]
        for n in range(4):
            inverse[n] *= det
            inverse[n] %= 26

        return {
            "correct": user_answer == inverse,
            "user_answer": user_answer,
            "correct_answer": inverse
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_mod_26():
    """Generate a mod 26 problem"""
    n = int(random.random() * (625 + 100 + 1)) - 100
    return {
        "type": "mod_26",
        "problem": f"{n} mod 26",
        "question": f"What is {n} mod 26?",
        "answer": n % 26,
        "number": n
    }

def check_mod_26(number, user_answer):
    """Check answer for mod 26"""
    try:
        user_answer_int = int(user_answer)
        correct_answer = number % 26
        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }

def generate_modular_inverse():
    """Generate a modular inverse problem"""
    nums = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]
    inverses = [1, 9, 21, 15, 3, 19, 7, 23, 11, 5, 17, 25]
    n = int(random.random() * 12)
    return {
        "type": "modular_inverse",
        "problem": f"Inverse of {nums[n]} mod 26",
        "question": f"What is the modular inverse of {nums[n]}?",
        "answer": inverses[n],
        "number": nums[n]
    }

def check_modular_inverse(number, user_answer):
    """Check answer for modular inverse"""
    try:
        user_answer_int = int(user_answer)
        nums = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]
        inverses = [1, 9, 21, 15, 3, 19, 7, 23, 11, 5, 17, 25]

        if number in nums:
            correct_answer = inverses[nums.index(number)]
        else:
            return {"error": "Invalid number for modular inverse"}

        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }

def generate_affine_letter():
    """Generate an affine shift problem for one letter"""
    a = int(random.random() * 60) + 1
    b = int(random.random() * 60) + 1
    let = int(random.random() * 26) + 65
    letter = chr(let)
    answer = chr((a * (let - 65) + b) % 26 + 65)
    return {
        "type": "affine_letter",
        "problem": f"Affine: a={a}, b={b}, letter={letter}",
        "question": f"Encode the letter using the affine cipher",
        "answer": answer,
        "a": a,
        "b": b,
        "letter": letter,
        "hint": "Formula: (a × letter + b) mod 26"
    }

def check_affine_letter(a, b, letter, user_answer):
    """Check answer for affine letter shift"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            raise ValueError("Answer must be a non-empty string")
        let = ord(letter.upper())
        correct_answer = chr((a * (let - 65) + b) % 26 + 65)
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_affine_word():
    """Generate an affine shift problem for one word"""
    length = int(random.random() * 4) + 4
    word = ""
    for n in range(length):
        number = int(random.random() * 26) + 65
        word += chr(number)

    a = int(random.random() * 60) + 1
    while a % 2 == 0 or a % 13 == 0:
        a = int(random.random() * 60) + 1

    b = int(random.random() * 60) + 1
    while b % 2 == 0 or b % 13 == 0:
        b = int(random.random() * 60) + 1

    answer = ""
    for n in range(length):
        answer += chr((((ord(word[n]) - 65) * a + b) % 26) + 65)

    return {
        "type": "affine_word",
        "problem": f"Affine: a={a}, b={b}, word={word}",
        "question": f"Encode the word using the affine cipher",
        "answer": answer,
        "a": a,
        "b": b,
        "word": word,
        "length": length,
        "hint": "Formula: (a × letter + b) mod 26"
    }

def check_affine_word(a, b, word, user_answer):
    """Check answer for affine word shift"""
    try:
        if not isinstance(user_answer, str):
            raise ValueError("Answer must be a string")
        correct_answer = ""
        for char in word:
            correct_answer += chr((((ord(char) - 65) * a + b) % 26) + 65)
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_hill_word():
    """Generate a Hill cipher encoding problem"""
    length = int(random.random() * 4) + 4
    word = ""
    for n in range(length):
        number = int(random.random() * 26) + 65
        word += chr(number)

    key = []
    for n in range(4):
        key.append(int(random.random() * 26) + 1)
    det = (key[0] * key[3] - key[1] * key[2]) % 26
    while det % 2 == 0 or det % 13 == 0:
        key.clear()
        for n in range(4):
            key.append(int(random.random() * 26) + 1)
        det = (key[0] * key[3] - key[1] * key[2]) % 26

    answer = ""
    for n in range(length):
        if n == length - 1:
            answer += chr((key[0] * (ord(word[n]) - 65)) % 26 + 65)
        elif n % 2 == 0:
            answer += chr((key[0] * (ord(word[n]) - 65) + key[1] * (ord(word[n + 1]) - 65)) % 26 + 65)
        else:
            answer += chr((key[2] * (ord(word[n - 1]) - 65) + key[3] * (ord(word[n]) - 65)) % 26 + 65)

    return {
        "type": "hill_word",
        "problem": f"Matrix: [[{key[0]}, {key[1]}], [{key[2]}, {key[3]}]], word={word}",
        "question": f"Encode the word {word} using the matrix key",
        "answer": answer,
        "matrix": key,
        "matrix_display": f"{key[0]}\t{key[1]}\n{key[2]}\t{key[3]}",
        "word": word,
        "length": length
    }

def check_hill_word(matrix, word, user_answer):
    """Check answer for Hill cipher encoding"""
    try:
        if not isinstance(user_answer, str):
            raise ValueError("Answer must be a string")
        key = matrix
        length = len(word)
        correct_answer = ""
        for n in range(length):
            if n == length - 1:
                correct_answer += chr((key[0] * (ord(word[n]) - 65)) % 26 + 65)
            elif n % 2 == 0:
                correct_answer += chr((key[0] * (ord(word[n]) - 65) + key[1] * (ord(word[n + 1]) - 65)) % 26 + 65)
            else:
                correct_answer += chr((key[2] * (ord(word[n - 1]) - 65) + key[3] * (ord(word[n]) - 65)) % 26 + 65)

        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_baconian():
    """Generate a Baconian cipher problem"""
    temp = bin(int(random.random() * 24))
    temp = temp[2:]
    char = ""
    n1 = chr(int(random.random() * 93) + 33)
    n2 = chr(int(random.random() * 93) + 33)

    for n in range(5 - len(temp)):
        char += "0"
    char += temp

    weird = ""
    for letter in char:
        if letter == "0":
            weird += n1
        else:
            weird += n2

    codes = {
        "00000": "a",
        "00001": "b",
        "00010": "c",
        "00011": "d",
        "00100": "e",
        "00101": "f",
        "00110": "g",
        "00111": "h",
        "01000": "i,j",
        "01001": "k",
        "01010": "l",
        "01011": "m",
        "01100": "n",
        "01101": "o",
        "01110": "p",
        "01111": "q",
        "10000": "r",
        "10001": "s",
        "10010": "t",
        "10011": "u,v",
        "10100": "w",
        "10101": "x",
        "10110": "y",
        "10111": "z",
    }

    return {
        "type": "baconian",
        "problem": weird,
        "question": f"What is the character for {weird}?",
        "answer": codes[char],
        "encoding": weird,
        "binary": char,
        "char_0": n1,
        "char_1": n2,
        "legend": f"{n1} is 0, {n2} is 1"
    }

def check_baconian(binary, user_answer):
    """Check answer for Baconian cipher"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            raise ValueError("Answer must be a non-empty string")

        codes = {
            "00000": "a", "00001": "b", "00010": "c", "00011": "d",
            "00100": "e", "00101": "f", "00110": "g", "00111": "h",
            "01000": "i,j", "01001": "k", "01010": "l", "01011": "m",
            "01100": "n", "01101": "o", "01110": "p", "01111": "q",
            "10000": "r", "10001": "s", "10010": "t", "10011": "u,v",
            "10100": "w", "10101": "x", "10110": "y", "10111": "z",
        }

        correct_answer = codes.get(binary, "")
        user_lower = user_answer.lower()

        # Check if user answer matches any valid option
        correct = user_lower in correct_answer.split(',')

        return {
            "correct": correct,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_binary_to_decimal():
    """Generate a binary to decimal conversion problem"""
    r34 = int(random.random() * 24)
    keys = ["00000", "00001", "00010", "00011", "00100", "00101", "00110", "00111",
            "01000", "01001", "01010", "01011", "01100", "01101", "01110", "01111",
            "10000", "10001", "10010", "10011", "10100", "10101", "10110", "10111"]

    binary = keys[r34]
    answer = str(r34)

    return {
        "type": "binary_to_decimal",
        "problem": binary,
        "question": f"What is the decimal value for {binary}?",
        "answer": answer,
        "binary": binary,
        "decimal": r34
    }

def check_binary_to_decimal(binary, user_answer):
    """Check answer for binary to decimal conversion"""
    try:
        user_answer_str = str(user_answer)
        correct_answer = str(int(binary, 2))
        return {
            "correct": user_answer_str == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_remainder_cheese(show_decimal=True):
    """Generate a remainder cheese problem (mod 26 with decimal hint)"""
    n = int(random.random() * (625 + 100 + 1)) - 100
    decimal_value = n / 26.0

    return {
        "type": "remainder_cheese",
        "problem": f"{n} mod 26",
        "question": f"What is {n} mod 26?" + (f" ({n}/26 = {decimal_value})" if show_decimal else ""),
        "answer": n % 26,
        "number": n,
        "decimal": decimal_value,
        "answer_letter": chr((n % 26) + 65)
    }

def check_remainder_cheese(number, user_answer):
    """Check answer for remainder cheese"""
    try:
        correct_answer = number % 26

        # Accept both numeric and letter answers
        if isinstance(user_answer, str) and not user_answer.isnumeric():
            if len(user_answer) == 0:
                raise ValueError("Answer cannot be empty")
            user_value = ord(user_answer.upper()[0]) - 65
            correct = user_value == correct_answer
        else:
            user_answer_int = int(user_answer)
            correct = user_answer_int == correct_answer

        return {
            "correct": correct,
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "correct_answer_letter": chr(correct_answer + 65)
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_memorize_decimals(decimals=-1):
    """Generate a memorize mod 26 decimals problem"""
    n = int(random.random() * 25) + 1
    decimal_value = n / 26.0
    index = str(decimal_value).index('.')

    if decimals == -1:
        str_n = str(decimal_value)
    else:
        str_n = str(decimal_value)[0:index + decimals + 1]

    # Generate reference table
    reference = []
    for num in range(1, 26):
        idx = str(num / 26.0).index('.')
        reference.append({
            "number": num,
            "decimal": str(num / 26.0)[0:idx + 3]
        })

    return {
        "type": "memorize_decimals",
        "problem": str_n,
        "question": f"What is the mod 26 remainder for {str_n}?",
        "answer": n % 26,
        "decimal": str_n,
        "answer_letter": chr((n % 26) + 65),
        "reference_table": reference
    }

def check_memorize_decimals(decimal_str, user_answer):
    """Check answer for memorize decimals"""
    try:
        # Try to reverse engineer the number from decimal
        # This is approximate but works for the range 1-25
        n = None
        for num in range(1, 26):
            if decimal_str in str(num / 26.0):
                n = num
                break

        if n is None:
            return {"error": "Could not determine number from decimal"}

        correct_answer = n % 26

        # Accept both numeric and letter answers
        if isinstance(user_answer, str) and not user_answer.isnumeric():
            if len(user_answer) == 0:
                raise ValueError("Answer cannot be empty")
            user_value = ord(user_answer.upper()[0]) - 65
            correct = user_value == correct_answer
        else:
            user_answer_int = int(user_answer)
            correct = user_answer_int == correct_answer

        return {
            "correct": correct,
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "correct_answer_letter": chr(correct_answer + 65)
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_atbash_letter():
    """Generate an Atbash cipher letter problem"""
    number = int(random.random() * 26) + 65
    letter = chr(number)
    # Atbash: A->Z, B->Y, C->X, etc. Formula: 25 - (letter - 65)
    answer = chr(90 - (number - 65))
    return {
        "type": "atbash_letter",
        "problem": f"Atbash: {letter}",
        "question": f"What is the Atbash cipher of the letter {letter}?",
        "answer": answer,
        "letter": letter,
        "hint": "Atbash reverses the alphabet: A↔Z, B↔Y, C↔X..."
    }

def check_atbash_letter(letter, user_answer):
    """Check answer for Atbash letter cipher"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            return {"error": "Invalid input: answer must be a letter", "correct": False, "user_answer": user_answer}
        number = ord(letter.upper())
        correct_answer = chr(90 - (number - 65))
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_atbash_word():
    """Generate an Atbash cipher word problem"""
    length = int(random.random() * 4) + 4
    word = ""
    for n in range(length):
        number = int(random.random() * 26) + 65
        word += chr(number)

    answer = ""
    for char in word:
        number = ord(char)
        answer += chr(90 - (number - 65))

    return {
        "type": "atbash_word",
        "problem": f"Atbash: {word}",
        "question": f"What is the Atbash cipher of the word {word}?",
        "answer": answer,
        "word": word,
        "length": length,
        "hint": "Atbash reverses the alphabet: A↔Z, B↔Y, C↔X..."
    }

def check_atbash_word(word, user_answer):
    """Check answer for Atbash word cipher"""
    try:
        if not isinstance(user_answer, str):
            return {"error": "Invalid input: answer must be a word", "correct": False, "user_answer": user_answer}
        correct_answer = ""
        for char in word:
            number = ord(char.upper())
            correct_answer += chr(90 - (number - 65))
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def _normalize_keyword(keyword: str) -> str:
    # Uppercase, remove non A-Z, map J->I, and de-duplicate preserving order
    seen = set()
    cleaned = []
    for ch in keyword.upper():
        if 'A' <= ch <= 'Z':
            if ch == 'J':
                ch = 'I'
            if ch not in seen:
                seen.add(ch)
                cleaned.append(ch)
    return "".join(cleaned)

def generate_nihilist_table(keyword=None):
    """Generate a Nihilist substitution table (5x5 Polybius square) using a keyword.
    Keyword letters (deduped, J→I) fill the square first, followed by remaining alphabet in order.
    Returns the 5x5 table (list of 5 lists, each of length 5).
    """
    # Alphabet without J (J merged with I)
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"

    if not keyword:
        keyword = random.choice(NIHILIST_KEYWORDS)
    norm_key = _normalize_keyword(keyword)

    # Build sequence: keyword then remaining alphabet in order
    used = set(norm_key)
    remainder = [ch for ch in alphabet if ch not in used]
    sequence = list(norm_key) + remainder

    # Create 5x5 table from sequence
    table = [sequence[i*5:(i+1)*5] for i in range(5)]
    return table

def nihilist_table_to_display(table):
    """Convert nihilist table to display string"""
    display = "   1  2  3  4  5\n"
    for idx, row in enumerate(table):
        display += f"{idx+1}  " + "  ".join(row) + "\n"
    return display.rstrip()

def nihilist_encode_letter(table, letter):
    """Encode a letter using nihilist table, returns row+col as two-digit number"""
    letter = letter.upper()
    if letter == 'J':
        letter = 'I'  # J is combined with I

    for row_idx, row in enumerate(table):
        if letter in row:
            col_idx = row.index(letter)
            return (row_idx + 1) * 10 + (col_idx + 1)
    return None

def nihilist_decode_number(table, number):
    """Decode a two-digit number using nihilist table"""
    row = (number // 10) - 1
    col = (number % 10) - 1
    if 0 <= row < 5 and 0 <= col < 5:
        return table[row][col]
    return None

def generate_nihilist_encode():
    """Generate a nihilist encoding problem (letter to number)"""
    # Choose a random keyword and build the table
    keyword = random.choice(NIHILIST_KEYWORDS)
    table = generate_nihilist_table(keyword)

    # Pick a random letter
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"
    letter = alphabet[int(random.random() * len(alphabet))]

    answer = nihilist_encode_letter(table, letter)

    return {
        "type": "nihilist_encode",
        "problem": f"Nihilist encode: {letter}",
        "question": f"Using the Nihilist table below, what number does the letter {letter} encode to?",
        "answer": answer,
        "letter": letter,
        "table": table,
        "table_display": nihilist_table_to_display(table),
        "hint": "Find the letter in the table. The answer is: (row number)(column number)",
        "keyword": keyword.upper(),
        "legend": f"Keyword: {keyword.upper()} (I/J combined)"
    }

def check_nihilist_encode(table, letter, user_answer):
    """Check answer for nihilist encoding"""
    try:
        user_answer_int = int(user_answer)
        correct_answer = nihilist_encode_letter(table, letter)
        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a two-digit number",
            "correct": False,
            "user_answer": user_answer
        }

def generate_nihilist_decode():
    """Generate a nihilist decoding problem (number to letter)"""
    # Choose a random keyword and build the table
    keyword = random.choice(NIHILIST_KEYWORDS)
    table = generate_nihilist_table(keyword)

    # Generate valid row and column (1-5)
    row = int(random.random() * 5) + 1
    col = int(random.random() * 5) + 1
    number = row * 10 + col

    answer = nihilist_decode_number(table, number)

    return {
        "type": "nihilist_decode",
        "problem": f"Nihilist decode: {number}",
        "question": f"Using the Nihilist table below, what letter does the number {number} decode to?",
        "answer": answer,
        "number": number,
        "table": table,
        "table_display": nihilist_table_to_display(table),
        "hint": "First digit is row, second digit is column",
        "keyword": keyword.upper(),
        "legend": f"Keyword: {keyword.upper()} (I/J combined)"
    }

def check_nihilist_decode(table, number, user_answer):
    """Check answer for nihilist decoding"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            return {"error": "Invalid input: answer must be a letter", "correct": False, "user_answer": user_answer}
        correct_answer = nihilist_decode_number(table, number)
        return {
            "correct": user_answer.upper() == correct_answer.upper(),
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

def generate_nihilist_keyword_decode():
    """Generate Nihilist decode given a ciphertext NUMBER and a keyword letter (decode = ciphertext - keyword).
    We generate by choosing a plaintext letter P and a keyword letter K, then set C = num(P) + num(K).
    """
    # Choose a random keyword and build the table
    keyword = random.choice(NIHILIST_KEYWORDS)
    table = generate_nihilist_table(keyword)

    # Pick a plaintext letter and a keyword letter from table
    p_r = int(random.random() * 5) + 1
    p_c = int(random.random() * 5) + 1
    plaintext_letter = table[p_r - 1][p_c - 1]

    k_r = int(random.random() * 5) + 1
    k_c = int(random.random() * 5) + 1
    keyword_letter = table[k_r - 1][k_c - 1]

    # Encode both to numbers (rowcol) and make ciphertext number via addition
    p_num = p_r * 10 + p_c
    k_num = k_r * 10 + k_c
    ciphertext_number = p_num + k_num  # range 22..110

    return {
        "type": "nihilist_keyword_decode",
        "problem": f"Nihilist decode with key: cipher {ciphertext_number}, key {keyword_letter}",
        "question": f"Using the Nihilist table below and keyword letter {keyword_letter}, decode the ciphertext number {ciphertext_number}.",
        "answer": plaintext_letter,
        "ciphertext_number": ciphertext_number,
        "keyword_letter": keyword_letter,
        "table": table,
        "table_display": nihilist_table_to_display(table),
        "hint": "Find the number for the keyword letter using the table. Subtract that from the ciphertext number. The answer is the letter at the row and column of the result.",
        "keyword": keyword.upper(),
        "legend": f"Keyword: {keyword.upper()} (I/J combined)"
    }

def check_nihilist_keyword_decode(table, ciphertext_number, keyword_letter, user_answer):
    """Check Nihilist decode with keyword letter where plaintext = ciphertext_number - num(keyword_letter)."""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            return {"error": "Invalid input: answer must be a letter", "correct": False, "user_answer": user_answer}

        # keyword number from table
        k_num = nihilist_encode_letter(table, keyword_letter)
        if k_num is None:
            return {"error": "Invalid keyword letter for table", "correct": False, "user_answer": user_answer}

        # subtract as ordinary numbers
        p_num = int(ciphertext_number) - k_num
        if p_num < 11 or p_num > 55:
            return {"error": "Resulting pair is out of range", "correct": False, "user_answer": user_answer}
        p_r, p_c = p_num // 10, p_num % 10
        if not (1 <= p_r <= 5 and 1 <= p_c <= 5):
            return {"error": "Invalid row/col after subtraction", "correct": False, "user_answer": user_answer}
        correct_answer = table[p_r - 1][p_c - 1]
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except Exception as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }

# Main function to handle command line arguments
def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified"}))
        return

    command = sys.argv[1]
    random.seed(time.time())

    try:
        if command == "generate":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "No problem type specified"}))
                return

            problem_type = int(sys.argv[2])

            if problem_type == 1:
                result = generate_two_digit_multiplication()
            elif problem_type == 2:
                result = generate_letter_to_value()
            elif problem_type == 3:
                result = generate_three_digit_subtraction()
            elif problem_type == 4:
                result = generate_shift_letter()
            elif problem_type == 5:
                result = generate_shift_word()
            elif problem_type == 6:
                result = generate_inverse_matrix()
            elif problem_type == 7:
                result = generate_mod_26()
            elif problem_type == 8:
                result = generate_modular_inverse()
            elif problem_type == 9:
                result = generate_affine_letter()
            elif problem_type == 10:
                result = generate_affine_word()
            elif problem_type == 11:
                result = generate_hill_word()
            elif problem_type == 12:
                result = generate_baconian()
            elif problem_type == 13:
                result = generate_binary_to_decimal()
            elif problem_type == 14:
                result = generate_remainder_cheese()
            elif problem_type == 15:
                decimals = int(sys.argv[3]) if len(sys.argv) > 3 else -1
                result = generate_memorize_decimals(decimals)
            elif problem_type == 16:
                result = generate_atbash_letter()
            elif problem_type == 17:
                result = generate_atbash_word()
            elif problem_type == 18:
                result = generate_nihilist_encode()
            elif problem_type == 19:
                result = generate_nihilist_decode()
            elif problem_type == 20:
                result = generate_nihilist_keyword_decode()
            else:
                result = {"error": "Invalid problem type"}

            print(json.dumps(result))

        elif command == "check":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "No problem type specified"}))
                return

            problem_type = int(sys.argv[2])

            # Parse the problem data and user answer from subsequent arguments
            # Expected format: check <type> <json_problem_data> <user_answer>
            if len(sys.argv) < 5:
                print(json.dumps({"error": "Missing problem data or user answer"}))
                return

            problem_data = json.loads(sys.argv[3])
            user_answer = sys.argv[4]

            if problem_type == 1:
                result = check_two_digit_multiplication(problem_data['a'], problem_data['b'], user_answer)
            elif problem_type == 2:
                result = check_letter_to_value(problem_data['letter'], user_answer)
            elif problem_type == 3:
                result = check_three_digit_subtraction(problem_data['a'], problem_data['b'], user_answer)
            elif problem_type == 4:
                result = check_shift_letter(problem_data['letter'], problem_data['shift'], user_answer)
            elif problem_type == 5:
                result = check_shift_word(problem_data['word'], problem_data['shift'], user_answer)
            elif problem_type == 6:
                result = check_inverse_matrix(problem_data['matrix'], json.loads(user_answer))
            elif problem_type == 7:
                result = check_mod_26(problem_data['number'], user_answer)
            elif problem_type == 8:
                result = check_modular_inverse(problem_data['number'], user_answer)
            elif problem_type == 9:
                result = check_affine_letter(problem_data['a'], problem_data['b'], problem_data['letter'], user_answer)
            elif problem_type == 10:
                result = check_affine_word(problem_data['a'], problem_data['b'], problem_data['word'], user_answer)
            elif problem_type == 11:
                result = check_hill_word(problem_data['matrix'], problem_data['word'], user_answer)
            elif problem_type == 12:
                result = check_baconian(problem_data['binary'], user_answer)
            elif problem_type == 13:
                result = check_binary_to_decimal(problem_data['binary'], user_answer)
            elif problem_type == 14:
                result = check_remainder_cheese(problem_data['number'], user_answer)
            elif problem_type == 15:
                result = check_memorize_decimals(problem_data['decimal'], user_answer)
            elif problem_type == 16:
                result = check_atbash_letter(problem_data['letter'], user_answer)
            elif problem_type == 17:
                result = check_atbash_word(problem_data['word'], user_answer)
            elif problem_type == 18:
                result = check_nihilist_encode(problem_data['table'], problem_data['letter'], user_answer)
            elif problem_type == 19:
                result = check_nihilist_decode(problem_data['table'], problem_data['number'], user_answer)
            elif problem_type == 20:
                result = check_nihilist_keyword_decode(problem_data['table'], problem_data['ciphertext_letter'], problem_data['keyword_letter'], user_answer)
            else:
                result = {"error": "Invalid problem type"}

            print(json.dumps(result))

        else:
            print(json.dumps({"error": "Invalid command. Use 'generate' or 'check'"}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
