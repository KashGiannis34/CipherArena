# Codebusters practice - API version for SvelteKit integration
import random
import time
import json
import sys

def generate_two_digit_multiplication():
    """Generate a 2-digit multiplication problem"""
    a = int(random.random() * 16) + 10
    b = int(random.random() * 21) + 5
    return {
        "type": "two_digit_multiplication",
        "problem": f"{a} * {b}",
        "question": f"What is {a} * {b}?",
        "answer": a * b,
        "answer_mod_26": (a * b) % 26,
        "a": a,
        "b": b
    }

def check_two_digit_multiplication(a, b, user_answer):
    """Check answer for 2-digit multiplication"""
    try:
        user_answer_int = int(user_answer)
        correct_answer = (a * b) % 26
        return {
            "correct": user_answer_int % 26 == correct_answer,
            "user_answer": user_answer,
            "correct_answer": a * b,
            "correct_answer_mod_26": correct_answer
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
        "question": f"Find encoded letter in affine for {letter}",
        "answer": answer,
        "a": a,
        "b": b,
        "letter": letter
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
        "question": f"Find encoded word in affine for {word}",
        "answer": answer,
        "a": a,
        "b": b,
        "word": word,
        "length": length
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
            else:
                result = {"error": "Invalid problem type"}

            print(json.dumps(result))

        else:
            print(json.dumps({"error": "Invalid command. Use 'generate' or 'check'"}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
